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
  private openaiApiKey?: string;
  private anthropicApiKey: string;
  private useOpenAI: boolean;

  constructor(openaiApiKey?: string, anthropicApiKey?: string) {
    this.openaiApiKey = openaiApiKey;
    this.anthropicApiKey = anthropicApiKey || '';
    this.useOpenAI = !!this.openaiApiKey;
  }

  setProvider(provider: 'openai' | 'anthropic') {
    if (provider === 'openai' && !this.openaiApiKey) {
      throw new Error('OpenAI API key is not available');
    }
    this.useOpenAI = provider === 'openai';
  }

  async explore(concept: string): Promise<CreativeDialogue> {
    console.log(`Using ${this.useOpenAI ? 'OpenAI' : 'Anthropic'} for creative dialogue`);
    
    // This would be implemented with actual API calls in a real implementation
    return {
      concept,
      reasoning: [`Exploring the concept of ${concept}`],
      confidence: 0.8,
      explorationPaths: [`${concept} in abstract form`, `${concept} with emotional depth`],
      memoryReferences: []
    };
  }
}

export class MemorySystem {
  async initialize(): Promise<void> {
    console.log('Memory system initialized');
  }
  
  async store(memory: Memory): Promise<void> {
    console.log('Storing memory:', memory.type);
  }
  
  async retrieve(query: MemoryQuery): Promise<any[]> {
    console.log('Retrieving memories with query:', query);
    return [];
  }
}

export class ReflectionEngine {
  async initialize(): Promise<void> {
    console.log('Reflection engine initialized');
  }
  
  async analyzeCreation(artwork: any): Promise<Analysis> {
    console.log('Analyzing artwork');
    return {
      metrics: {
        novelty: 0.7,
        coherence: 0.8,
        technicalFeasibility: 0.9,
        conceptualDepth: 0.6
      },
      evolutionaryImpact: {
        novelty: 0.7,
        coherence: 0.8,
        influence: 0.5,
        growth: {
          technical: 0.6,
          conceptual: 0.7,
          stylistic: 0.8
        }
      },
      conceptualLinks: ['nature', 'technology', 'humanity']
    };
  }
}

export interface CreativeDialogue {
  concept: string;
  reasoning: string[];
  confidence: number;
  explorationPaths: string[];
  memoryReferences: string[];
}

export * from './social/index.js'; 