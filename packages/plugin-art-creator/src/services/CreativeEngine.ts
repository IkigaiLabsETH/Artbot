import { Service, ServiceType } from '@elizaos/core';
import { 
  ArtworkIdea,
  ArtworkMemory,
  CreativeState,
  MemorySystem,
  ReflectionEngine,
  SelfDialogue,
  Analysis,
  CreativeDialogue
} from '../types/index';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export class CreativeEngine extends Service {
  private state: CreativeState;
  private selfDialogue: SelfDialogue;
  private memorySystem: MemorySystem;
  private reflectionEngine: ReflectionEngine;
  
  constructor(config = {}, baseDir: string = process.cwd()) {
    super();
    this.selfDialogue = new SelfDialogue();
    this.memorySystem = new MemorySystem();
    this.reflectionEngine = new ReflectionEngine();
    
    this.state = {
      currentIdeas: [],
      completedWorks: [],
      stylePreferences: {},
      explorationRate: 0.2,
      autonomyLevel: 0.8,
      creativityMetrics: {
        novelty: 0,
        coherence: 0,
        influence: 0,
        growth: {
          technical: 0,
          conceptual: 0,
          stylistic: 0
        }
      }
    };
  }

  static get serviceType(): ServiceType {
    return ServiceType.TEXT_GENERATION;
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.memorySystem.initialize(),
      this.reflectionEngine.initialize()
    ]);
  }

  /**
   * Get the current creative state
   */
  getState(): CreativeState {
    return this.state;
  }

  /**
   * Get the most recent completed works
   */
  getRecentWorks(count: number = 5): ArtworkMemory[] {
    return this.state.completedWorks.slice(-count);
  }

  /**
   * Get the top style preferences
   */
  getStylePreferences(count: number = 3): string[] {
    return Object.entries(this.state.stylePreferences)
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .slice(0, count)
      .map(([style]) => style);
  }

  /**
   * Get the current exploration rate
   */
  getExplorationRate(): number {
    return this.state.explorationRate;
  }

  /**
   * Set the exploration rate
   */
  setExplorationRate(rate: number): void {
    if (rate < 0 || rate > 1) {
      throw new Error('Exploration rate must be between 0 and 1');
    }
    this.state.explorationRate = rate;
  }
} 