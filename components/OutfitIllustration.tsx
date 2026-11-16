import type { DecisionSeverity } from '../types/decision';

export function OutfitIllustration({ severity }: { severity: DecisionSeverity }) {
  const jacket = severity !== 'safe';
  return (
    <svg viewBox="0 0 440 360" fill="none" className="outfit-art" aria-hidden="true">
      <ellipse cx="220" cy="323" rx="105" ry="13" fill="#000" opacity=".16" />
      <circle cx="220" cy="173" r="132" stroke="currentColor" strokeOpacity=".09" />
      <circle cx="220" cy="173" r="157" stroke="currentColor" strokeOpacity=".05" strokeDasharray="3 8" />
      <path d="M105 86h25M117.5 73.5v25M327 268h17M335.5 259.5v17" stroke="currentColor" strokeOpacity=".35" />
      <g transform="rotate(-8 220 185)">
        <path d="m183 77-52 22-38 82 47 23 23-40-5 133h129l-6-133 24 40 45-23-38-82-53-22c-13 15-62 15-76 0Z" fill="#d8dcc9" stroke="#667465" strokeWidth="2" />
        <path d="M183 77c8 32 66 33 76 0" stroke="#84917e" strokeWidth="5" />
        <path d="m164 108-6 190m119-190 10 190M103 179l40 21m157 0 40-21" stroke="#a2ad96" strokeWidth="2" />
        <path d="M174 284h99" stroke="#a2ad96" strokeWidth="2" strokeDasharray="3 4" />
        {jacket && <>
          <path d="m184 69-58 30-37 114 47 16 28-65-9 143 60 6V119l-31-50Z" fill="#657d65" stroke="#304738" strokeWidth="2" />
          <path d="m256 69 58 30 37 114-47 16-28-65 9 143-60 6V119l31-50Z" fill="#566f58" stroke="#304738" strokeWidth="2" />
          <path d="m184 69 32 51-27 38-22-66 17-23Zm72 0-32 51 27 38 22-66-17-23Z" fill="#84977a" stroke="#304738" strokeWidth="2" />
          <path d="M220 121v191m-48-88 27-6m43 0 27 6M96 208l43 15m164 0 41-15" stroke="#b5c3a1" strokeOpacity=".7" strokeWidth="2" />
          <path d="m179 236-2 31 25-3 2-32m33 0 2 32 25 3-2-31" stroke="#304738" strokeWidth="2" />
          <circle cx="230" cy="177" r="2" fill="#d5dfbf" /><circle cx="230" cy="208" r="2" fill="#d5dfbf" /><circle cx="230" cy="239" r="2" fill="#d5dfbf" />
        </>}
      </g>
      <g transform="translate(302 53)"><circle cx="0" cy="0" r="24" fill="#d2e5a4" /><path d="m-9 0 6 6 12-12" stroke="#24332a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></g>
      <path d="M113 269H62m0 0 5-5m-5 5 5 5M326 125h49m0 0-5-5m5 5-5 5" stroke="currentColor" strokeOpacity=".3" strokeLinecap="round" />
    </svg>
  );
}
