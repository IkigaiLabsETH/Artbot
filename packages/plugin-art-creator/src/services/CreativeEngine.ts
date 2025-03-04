import { Service, ServiceType, UUID } from '@elizaos/core';
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
import { ArtMemoryService } from './memory';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

interface CreativeEngineConfig {
  openaiApiKey?: string;
  anthropicApiKey: string;
}

export class CreativeEngine extends Service {
  private state: CreativeState;
  private selfDialogue: SelfDialogue;
  private memorySystem: MemorySystem;
  private artMemoryService: ArtMemoryService | null = null;
  private reflectionEngine: ReflectionEngine;
  private openaiApiKey?: string;
  private anthropicApiKey: string;
  private useOpenAI: boolean;
  private runtime: any;
  
  constructor(config: CreativeEngineConfig, baseDir: string = process.cwd()) {
    super();
    this.openaiApiKey = config.openaiApiKey;
    this.anthropicApiKey = config.anthropicApiKey;
    this.useOpenAI = !!this.openaiApiKey;
    
    this.selfDialogue = new SelfDialogue(this.openaiApiKey, this.anthropicApiKey);
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

  async initialize(runtime: any): Promise<void> {
    this.runtime = runtime;
    
    // Try to use OpenAI if available
    this.useOpenAIIfAvailable();
    
    // Update the SelfDialogue provider
    try {
      this.selfDialogue.setProvider(this.useOpenAI ? 'openai' : 'anthropic');
    } catch (error) {
      console.warn('Failed to set SelfDialogue provider to OpenAI, falling back to Anthropic');
      this.useOpenAI = false;
      this.selfDialogue.setProvider('anthropic');
    }
    
    console.log(`CreativeEngine initialized with provider: ${this.getProvider()}`);
    
    // Initialize the memory system
    await this.memorySystem.initialize();
    await this.reflectionEngine.initialize();
    
    // Initialize the art memory service
    this.artMemoryService = new ArtMemoryService({
      tableName: 'art_memories'
    });
    await this.artMemoryService.initialize(runtime);
    
    // Load completed works from persistent storage
    await this.loadCompletedWorks();
  }

  /**
   * Load completed works from persistent storage
   */
  private async loadCompletedWorks(): Promise<void> {
    if (!this.artMemoryService || !this.runtime) {
      return;
    }
    
    try {
      // Get the current room ID
      const roomId = this.runtime.character?.id || 'default-room' as UUID;
      
      // Load recent artworks
      const artworks = await this.artMemoryService.getRecentArtworks(roomId, 20);
      
      if (artworks && artworks.length > 0) {
        console.log(`Loaded ${artworks.length} artworks from persistent storage`);
        this.state.completedWorks = artworks;
      }
    } catch (error) {
      console.error('Failed to load completed works:', error);
    }
  }

  /**
   * Save an artwork to persistent storage
   */
  async saveArtwork(artwork: ArtworkMemory): Promise<void> {
    if (!this.artMemoryService || !this.runtime) {
      return;
    }
    
    try {
      // Get the current room and user IDs
      const roomId = this.runtime.character?.id || 'default-room' as UUID;
      const userId = this.runtime.agentId || 'default-user' as UUID;
      
      // Store the artwork
      await this.artMemoryService.storeArtwork(artwork, roomId, userId);
      console.log(`Saved artwork ${artwork.id} to persistent storage`);
    } catch (error) {
      console.error('Failed to save artwork:', error);
    }
  }

  /**
   * Find similar artworks based on a concept
   */
  async findSimilarArtworks(concept: string, count: number = 5): Promise<ArtworkMemory[]> {
    if (!this.artMemoryService || !this.runtime) {
      return [];
    }
    
    try {
      // Get the current room and user IDs
      const roomId = this.runtime.character?.id || 'default-room' as UUID;
      const userId = this.runtime.agentId || 'default-user' as UUID;
      
      // Find similar artworks
      return await this.artMemoryService.findSimilarArtworks(concept, roomId, userId, count);
    } catch (error) {
      console.error('Failed to find similar artworks:', error);
      return [];
    }
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
   * Add a completed work to the state
   */
  addCompletedWork(artwork: ArtworkMemory): void {
    this.state.completedWorks.push(artwork);
    
    // Save to persistent storage
    this.saveArtwork(artwork);
    
    // Update style preferences based on the new artwork
    this.updateStylePreferences(artwork.idea.style);
  }

  /**
   * Update style preferences based on a style
   */
  private updateStylePreferences(style: string): void {
    if (!this.state.stylePreferences[style]) {
      this.state.stylePreferences[style] = 0;
    }
    
    this.state.stylePreferences[style] += 1;
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

  /**
   * Get the current API provider being used
   */
  getProvider(): string {
    return this.useOpenAI ? 'openai' : 'anthropic';
  }

  /**
   * Switch to OpenAI if available, otherwise stay with Anthropic
   */
  useOpenAIIfAvailable(): boolean {
    if (this.openaiApiKey) {
      this.useOpenAI = true;
      return true;
    }
    return false;
  }

  /**
   * Switch to Anthropic
   */
  useAnthropic(): void {
    this.useOpenAI = false;
  }

  /**
   * Get the API key for the current provider
   */
  getCurrentApiKey(): string {
    return this.useOpenAI ? this.openaiApiKey! : this.anthropicApiKey;
  }

  /**
   * Generate art ideas using the current provider
   */
  async generateArtIdeas(count: number = 3): Promise<ArtworkIdea[]> {
    console.log(`Generating ${count} art ideas using ${this.getProvider()}`);
    
    const ideas: ArtworkIdea[] = [];
    
    for (let i = 0; i < count; i++) {
      const concept = `Concept ${i + 1}`;
      const dialogue = await this.selfDialogue.explore(concept);
      
      const idea: ArtworkIdea = {
        id: uuidv4(),
        concept: dialogue.concept,
        medium: ['Digital', 'Oil painting', 'Watercolor'][Math.floor(Math.random() * 3)],
        style: ['Abstract', 'Realistic', 'Impressionist'][Math.floor(Math.random() * 3)],
        score: dialogue.confidence,
        timestamp: Date.now()
      };
      
      ideas.push(idea);
      this.state.currentIdeas.push(idea);
    }
    
    return ideas;
  }
} 