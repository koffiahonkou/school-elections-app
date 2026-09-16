import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db, FIREBASE_PROJECT_ID, FIRESTORE_DB_ID } from './firebase';
import { Ballot, Voter } from '../types';

export { FIREBASE_PROJECT_ID, FIRESTORE_DB_ID };

export interface AgentObserverRecord {
  id: string;
  agentName: string;
  representedCandidate: string;
  role: 'Candidate Agent' | 'Independent Observer' | 'Electoral Commission Monitor';
  status: 'online' | 'observing' | 'offline';
  lastHeartbeat: string;
  station: string;
  notes?: string;
}

export interface VoterTokenRecord {
  id: string;
  voterId: string;
  token: string;
  fullName: string;
  hasVoted: boolean;
  votedAt: string | null;
  status: 'active' | 'used' | 'revoked';
  issuedAt: string;
}

/**
 * Persists an anonymous cast ballot to Firestore.
 * CRITICAL SECRET BALLOT GUARANTEE:
 * Does NOT write studentId, voterId, studentName, or IP address into the ballot document.
 */
export async function saveAnonymousVoteToFirestore(ballot: Ballot): Promise<boolean> {
  try {
    const ballotRef = doc(db, 'votes', ballot.id);
    const votePayload = {
      id: ballot.id,
      choices: ballot.choices || {},
      submittedAt: ballot.submittedAt || new Date().toISOString(),
      isPractice: !!ballot.isPractice,
      evidenceHash: ballot.evidenceHash || null,
      clientTimestamp: Date.now(),
    };

    await setDoc(ballotRef, votePayload);
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to save anonymous vote to Firestore:', error);
    return false;
  }
}

/**
 * Updates a voter's token in Firestore to mark them as having cast their ballot.
 */
export async function markVoterTokenUsedInFirestore(
  voterId: string,
  votedAt?: string
): Promise<boolean> {
  try {
    const cleanId = voterId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
    const tokenRef = doc(db, 'voter_tokens', `token-${cleanId}`);
    const snap = await getDoc(tokenRef);

    const updateData = {
      hasVoted: true,
      votedAt: votedAt || new Date().toISOString(),
      status: 'used',
    };

    if (snap.exists()) {
      await updateDoc(tokenRef, updateData);
    } else {
      await setDoc(tokenRef, {
        id: `token-${cleanId}`,
        voterId: voterId.trim().toUpperCase(),
        token: 'AUTO-SECURED',
        fullName: 'Registered Student',
        ...updateData,
        issuedAt: new Date().toISOString(),
      });
    }
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to update voter token in Firestore:', error);
    return false;
  }
}

/**
 * Syncs the entire voter roster into Firestore voter_tokens collection.
 */
export async function syncVoterRosterToFirestoreTokens(voters: Voter[]): Promise<{
  success: boolean;
  count: number;
}> {
  try {
    // Write in batches of up to 400 documents
    const batchSize = 400;
    let processed = 0;

    for (let i = 0; i < voters.length; i += batchSize) {
      const chunk = voters.slice(i, i + batchSize);
      const batch = writeBatch(db);

      for (const voter of chunk) {
        const cleanId = voter.voterId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
        const tokenRef = doc(db, 'voter_tokens', `token-${cleanId}`);
        batch.set(
          tokenRef,
          {
            id: `token-${cleanId}`,
            voterId: voter.voterId.trim().toUpperCase(),
            token: voter.pin || 'N/A',
            fullName: voter.fullName,
            hasVoted: !!voter.hasVoted,
            votedAt: voter.votedAt || null,
            status: voter.hasVoted ? 'used' : 'active',
            issuedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      await batch.commit();
      processed += chunk.length;
    }

    return { success: true, count: processed };
  } catch (error) {
    console.error('[Firebase] Failed to batch sync voter tokens to Firestore:', error);
    return { success: false, count: 0 };
  }
}

/**
 * Real-time listener on the Firestore 'votes' collection.
 * Triggers callback immediately on subscription and whenever a new anonymous vote is deposited.
 */
export function subscribeToAnonymousVotes(
  onVotesUpdate: (ballots: Ballot[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const votesQuery = query(collection(db, 'votes'), orderBy('submittedAt', 'asc'));
    return onSnapshot(
      votesQuery,
      (snapshot) => {
        const ballots: Ballot[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          ballots.push({
            id: data.id || docSnap.id,
            choices: data.choices || {},
            submittedAt: data.submittedAt || new Date().toISOString(),
            isPractice: !!data.isPractice,
            evidenceHash: data.evidenceHash || undefined,
          });
        });
        onVotesUpdate(ballots);
      },
      (err) => {
        console.warn('[Firebase] Firestore votes real-time listener error:', err);
        onError?.(err);
      }
    );
  } catch (err: any) {
    console.error('[Firebase] Error setting up votes listener:', err);
    onError?.(err);
    return () => {};
  }
}

/**
 * Real-time listener on the Firestore 'voter_tokens' collection.
 */
export function subscribeToVoterTokens(
  onTokensUpdate: (tokens: VoterTokenRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const tokensQuery = query(collection(db, 'voter_tokens'));
    return onSnapshot(
      tokensQuery,
      (snapshot) => {
        const tokens: VoterTokenRecord[] = [];
        snapshot.forEach((docSnap) => {
          tokens.push(docSnap.data() as VoterTokenRecord);
        });
        onTokensUpdate(tokens);
      },
      (err) => {
        console.warn('[Firebase] Firestore voter tokens listener error:', err);
        onError?.(err);
      }
    );
  } catch (err: any) {
    console.error('[Firebase] Error setting up voter tokens listener:', err);
    onError?.(err);
    return () => {};
  }
}

/**
 * Real-time listener on the Firestore 'agent_monitoring' collection.
 */
export function subscribeToAgentMonitoring(
  onAgentsUpdate: (agents: AgentObserverRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const agentsQuery = query(collection(db, 'agent_monitoring'));
    return onSnapshot(
      agentsQuery,
      (snapshot) => {
        const agents: AgentObserverRecord[] = [];
        snapshot.forEach((docSnap) => {
          agents.push(docSnap.data() as AgentObserverRecord);
        });
        onAgentsUpdate(agents);
      },
      (err) => {
        console.warn('[Firebase] Firestore agent monitoring listener error:', err);
        onError?.(err);
      }
    );
  } catch (err: any) {
    console.error('[Firebase] Error setting up agent monitoring listener:', err);
    onError?.(err);
    return () => {};
  }
}

/**
 * Registers or sends a heartbeat ping for a live observer / candidate agent.
 */
export async function registerOrPingAgent(agent: AgentObserverRecord): Promise<boolean> {
  try {
    const agentRef = doc(db, 'agent_monitoring', agent.id);
    await setDoc(agentRef, {
      ...agent,
      lastHeartbeat: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('[Firebase] Failed to register or ping agent:', error);
    return false;
  }
}

/**
 * Completely purges all votes, voter tokens, and agent monitoring telemetry from Firestore
 * to make room for a completely fresh selection setup.
 */
export async function clearAllFirestoreElectionData(): Promise<{ success: boolean; error?: string }> {
  try {
    const collectionsToClear = ['votes', 'voter_tokens', 'agent_monitoring'];
    for (const collName of collectionsToClear) {
      const snap = await getDocs(collection(db, collName));
      if (!snap.empty) {
        const docs = snap.docs;
        for (let i = 0; i < docs.length; i += 400) {
          const batch = writeBatch(db);
          const chunk = docs.slice(i, i + 400);
          chunk.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      }
    }
    return { success: true };
  } catch (error: any) {
    console.error('[Firebase] Failed to clear Firestore election data:', error);
    return { success: false, error: error?.message || String(error) };
  }
}

