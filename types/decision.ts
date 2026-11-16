import type { DayTimeline } from './weather';

export type DecisionSeverity = 'safe' | 'caution' | 'warning' | 'alert';

export interface DecisionItem {
  category: 'top' | 'outerwear' | 'footwear' | 'umbrella' | 'sweat';
  label: string;
  badge: string;
  verdict: string;
  description: string;
  severity: DecisionSeverity;
}

export interface FullDecisionResult {
  heroSummary: string;
  heroSubtext: string;
  items: DecisionItem[];
  timeline: DayTimeline;
}

export interface UserPreferences {
  temperatureSensitivity: -2 | -1 | 0 | 1 | 2;
  shoePreference: 'default' | 'suede_sensitive';
  sweatTendency: 'normal' | 'sweats_easily';
}
