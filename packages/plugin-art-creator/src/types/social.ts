// Re-export all types from social/index.ts
export * from './social/index.js';

export interface Style {
  id?: string;
  name: string;
  creator: string;
  parameters: Record<string, any>;
  version: number;
  created: Date;
  modified: Date;
  isPublic: boolean;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  reputation: number;
  createdStyles: string[];
  collaborations: string[];
}

export enum FeedbackScore {
  POOR = 1,
  FAIR = 2,
  GOOD = 3,
  EXCELLENT = 4,
  OUTSTANDING = 5
}

export interface StyleMetrics {
  views: number;
  imports: number;
  avgScore: number;
  trending: boolean;
  lastUpdated: Date;
} 