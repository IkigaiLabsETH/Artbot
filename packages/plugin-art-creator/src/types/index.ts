export interface ArtworkIdea {
  id: string;
  concept: string;
  medium: string;
  style: string;
  score: number;
  timestamp: number;
  reflection?: Analysis;
}

export interface ArtworkMemory {
  id: string;
  imageUrl: string;
  idea: ArtworkIdea;
  feedback: ArtworkFeedback[];
  created: number;
}

export interface ArtworkFeedback {
  source: string;
  sentiment: number;
  comment: string;
  timestamp: number;
}

export interface CreativeState {
  currentIdeas: ArtworkIdea[];
  completedWorks: ArtworkMemory[];
  stylePreferences: {
    [key: string]: number;
  };
  explorationRate: number;
  autonomyLevel: number;
  creativityMetrics: EvolutionMetrics;
}

export interface EvolutionMetrics {
  novelty: number;        // [0-1] Uniqueness in artistic space
  coherence: number;      // [0-1] Internal consistency
  influence: number;      // [0-1] Impact on artistic community
  growth: {
    technical: number;    // Technical skill development
    conceptual: number;   // Conceptual understanding
    stylistic: number;    // Style refinement
  };
}

export interface Analysis {
  metrics: {
    novelty: number;
    coherence: number;
    technicalFeasibility: number;
    conceptualDepth: number;
  };
  evolutionaryImpact: EvolutionMetrics;
  conceptualLinks: string[];
}

export interface Memory {
  type: 'idea' | 'reflection' | 'inspiration';
  content: any;
  associations: string[];
}

export interface MemoryQuery {
  type: string;
  limit: number;
  sortBy: string;
}

export class SelfDialogue {
  async explore(concept: string): Promise<CreativeDialogue> {
    // Implementation
    return {} as CreativeDialogue;
  }
}

export class MemorySystem {
  async initialize(): Promise<void> {}
  async store(memory: Memory): Promise<void> {}
  async retrieve(query: MemoryQuery): Promise<any[]> {
    return [];
  }
}

export class ReflectionEngine {
  async initialize(): Promise<void> {}
  async analyzeCreation(artwork: any): Promise<Analysis> {
    return {} as Analysis;
  }
}

export interface CreativeDialogue {
  concept: string;
  reasoning: string[];
  confidence: number;
  explorationPaths: string[];
  memoryReferences: string[];
}

export * from './social'; 