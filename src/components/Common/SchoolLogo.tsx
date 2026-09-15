import React, { useState } from 'react';
import { GraduationCap, Shield, Award } from 'lucide-react';

interface SchoolLogoProps {
  logoUrl?: string | null;
  schoolName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rounded' | 'circle' | 'shield';
  showPlaceholderBadge?: boolean;
  className?: string;
  isPrint?: boolean;
}

/**
 * Extract clean, balanced initials for a school name
 * e.g., "Accra Academy Senior High School" -> "AAS"
 * "Lincoln High School" -> "LHS"
 */
function getSchoolInitials(name?: string): string {
  if (!name || !name.trim()) return 'SCH';
  const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const words = clean.split(/\s+/).filter(Boolean);
  
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  
  // Pick significant words (skipping minor stop words if length > 3)
  const stopWords = new Set(['of', 'and', 'the', 'for', 'in', 'at']);
  const filtered = words.filter((w) => !stopWords.has(w.toLowerCase()));
  const targetWords = filtered.length > 0 ? filtered : words;
  
  if (targetWords.length >= 3) {
    return (targetWords[0][0] + targetWords[1][0] + targetWords[2][0]).toUpperCase();
  }
  return targetWords.map((w) => w[0]).join('').slice(0, 3).toUpperCase();
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  logoUrl,
  schoolName = 'School',
  size = 'md',
  shape = 'rounded',
  showPlaceholderBadge = false,
  className = '',
  isPrint = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getSchoolInitials(schoolName);

  // Size definitions
  const sizeMap = {
    xs: {
      container: 'w-6 h-6 text-3xs',
      iconSize: 'w-3 h-3',
      initialsSize: 'text-3xs tracking-tighter',
      badgeText: 'text-4xs',
    },
    sm: {
      container: 'w-8 h-8 text-2xs',
      iconSize: 'w-4 h-4',
      initialsSize: 'text-2xs font-black tracking-tight',
      badgeText: 'text-3xs',
    },
    md: {
      container: 'w-11 h-11 text-xs',
      iconSize: 'w-5 h-5',
      initialsSize: 'text-xs font-black tracking-wide',
      badgeText: 'text-3xs',
    },
    lg: {
      container: 'w-16 h-16 text-sm',
      iconSize: 'w-8 h-8',
      initialsSize: 'text-sm font-black tracking-widest',
      badgeText: 'text-2xs',
    },
    xl: {
      container: 'w-24 h-24 text-base',
      iconSize: 'w-10 h-10',
      initialsSize: 'text-lg font-black tracking-widest',
      badgeText: 'text-xs',
    },
  }[size];

  const shapeClass = {
    circle: 'rounded-full',
    rounded: size === 'xl' ? 'rounded-3xl' : size === 'lg' ? 'rounded-2xl' : 'rounded-xl',
    shield: 'rounded-t-2xl rounded-b-3xl',
  }[shape];

  const hasValidImage = !!logoUrl && !imageError;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center shrink-0 ${className}`}>
      <div
        id="school-logo-container"
        className={`relative overflow-hidden flex items-center justify-center transition-all ${sizeMap.container} ${shapeClass} ${
          isPrint
            ? 'border-2 border-black bg-slate-100 text-black'
            : hasValidImage
            ? 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs'
            : 'border-2 border-dashed border-indigo-300/90 dark:border-indigo-700/80 bg-linear-to-br from-indigo-50/90 via-slate-50 to-indigo-100/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600'
        }`}
        title={hasValidImage ? `${schoolName} Logo` : `${schoolName} Logo Placeholder`}
        aria-label={hasValidImage ? `${schoolName} Logo` : `${schoolName} Logo Placeholder`}
      >
        {hasValidImage ? (
          <img
            src={logoUrl!}
            alt={`${schoolName} Logo`}
            className="w-full h-full object-contain p-1"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Collegiate / Scholastic Vector Logo Placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center p-1 select-none text-center">
            {/* Academic Crest Vector Graphic */}
            <div className="relative flex items-center justify-center">
              {size === 'xl' || size === 'lg' ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center mb-0.5">
                    <Shield className={`${sizeMap.iconSize} opacity-90 text-indigo-600 dark:text-indigo-400`} />
                    <GraduationCap
                      className="w-3.5 h-3.5 absolute -top-1.5 text-indigo-800 dark:text-indigo-200"
                    />
                  </div>
                  <span className={`font-mono font-black ${sizeMap.initialsSize} text-indigo-950 dark:text-indigo-100 leading-tight`}>
                    {initials}
                  </span>
                  <div className="flex items-center gap-0.5 mt-0.5 opacity-60">
                    <span className="w-1 h-0.5 bg-indigo-500 rounded-full" />
                    <Award className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="w-1 h-0.5 bg-indigo-500 rounded-full" />
                  </div>
                </div>
              ) : size === 'md' ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className={`font-mono font-black ${sizeMap.initialsSize} text-indigo-900 dark:text-indigo-200 leading-none mt-0.5`}>
                    {initials}
                  </span>
                </div>
              ) : (
                /* Compact xs/sm */
                <span className={`font-mono font-black ${sizeMap.initialsSize} text-indigo-900 dark:text-indigo-200 leading-none`}>
                  {initials}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Optional "School Logo" / "Placeholder" caption badge */}
      {showPlaceholderBadge && !hasValidImage && (
        <span
          id="school-logo-placeholder-tag"
          className={`mt-1 font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 ${sizeMap.badgeText} select-none whitespace-nowrap`}
        >
          Logo Placeholder
        </span>
      )}
    </div>
  );
};
