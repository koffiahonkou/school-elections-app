import React from 'react';
import boothBgImage from '../../assets/images/booth_bg_civic_1789503078689.jpg';
import { ShieldCheck, Lock, Vote } from 'lucide-react';

interface BoothBackgroundProps {
  children: React.ReactNode;
  variant?: 'login' | 'ballot' | 'confirmation';
}

export const BoothBackground: React.FC<BoothBackgroundProps> = ({ children, variant = 'login' }) => {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* 1. Real Architectural Civic Hall Background Image */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={boothBgImage}
          alt="Civic Voting Pavilion Architecture"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transform-gpu transition-transform duration-1000 ease-out filter blur-[1.5px] opacity-15 dark:opacity-10 mix-blend-overlay dark:mix-blend-luminosity"
        />

        {/* Dynamic Gradient Overlays for Readability & Depth */}
        <div className="absolute inset-0 bg-radial from-transparent via-slate-50/70 to-slate-100/90 dark:from-transparent dark:via-slate-950/80 dark:to-slate-950" />
        <div className="absolute inset-0 bg-linear-to-b from-amber-500/5 via-transparent to-slate-900/10 dark:from-amber-400/5 dark:via-transparent dark:to-slate-950/80" />
      </div>

      {/* 2. Civic Security & Guilloche Pattern SVG Design (Official Ballot Watermarks) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 dark:opacity-25 select-none overflow-hidden">
        {/* Geometric fine-line democratic grid pattern */}
        <svg
          className="absolute w-full h-full text-slate-400/30 dark:text-slate-600/20"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern id="booth-fine-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.75"
                strokeDasharray="2 4"
              />
              <circle cx="24" cy="24" r="1.5" fill="currentColor" opacity="0.4" />
            </pattern>
            {/* Guilloche / rosette wave lines in top corners */}
            <pattern id="guilloche-waves" width="120" height="120" patternUnits="userSpaceOnUse">
              <path
                d="M0,60 C30,20 90,100 120,60 C150,20 210,100 240,60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                opacity="0.35"
              />
              <path
                d="M0,70 C30,30 90,110 120,70 C150,30 210,110 240,70"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.25"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#booth-fine-grid)" />
          <rect width="100%" height="100%" fill="url(#guilloche-waves)" opacity="0.6" />
        </svg>

        {/* Ambient Warm Golden & Azure Radiance Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-400/15 dark:bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] rounded-full bg-emerald-500/10 dark:bg-emerald-600/5 blur-3xl pointer-events-none" />

        {/* Watermark Civic Badges in Bottom Corners */}
        <div className="absolute bottom-6 left-6 hidden md:flex items-center gap-2 text-slate-400/80 dark:text-slate-600 text-xs font-semibold tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4 text-emerald-600/70 dark:text-emerald-500/50" />
          <span>Official Ballot Station • Encrypted Channel</span>
        </div>
        <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 text-slate-400/80 dark:text-slate-600 text-xs font-semibold tracking-wider uppercase">
          <Lock className="w-3.5 h-3.5 text-amber-600/70 dark:text-amber-500/50" />
          <span>Zero-Knowledge Confidentiality</span>
        </div>
      </div>

      {/* 3. Foreground Interactive Content with Relative Stacking */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
