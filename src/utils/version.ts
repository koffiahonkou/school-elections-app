// Automatically updated build timestamp to bust any lingering client-side bundle cache
export const APP_BUILD_ID = '2026-09-21-v3-hotfix';

export function checkForAppUpdates() {
  try {
    const storedVersion = localStorage.getItem('school_election_build_version');
    if (storedVersion && storedVersion !== APP_BUILD_ID) {
      console.log(`[VersionCheck] New application version detected (${APP_BUILD_ID} vs ${storedVersion}). Refreshing cached assets...`);
      localStorage.setItem('school_election_build_version', APP_BUILD_ID);
      // If version changed, purge any old service worker caches and refresh
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } else if (!storedVersion) {
      localStorage.setItem('school_election_build_version', APP_BUILD_ID);
    }
  } catch {
    // ignore
  }
}
