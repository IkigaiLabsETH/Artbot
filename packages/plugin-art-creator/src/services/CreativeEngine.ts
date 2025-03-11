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
} from '../types/index.js';
import { ArtMemoryService } from './memory/index.js';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

interface CreativeEngineConfig {
  openaiApiKey?: string;
  anthropicApiKey: string;
}

// Enhanced Magritte-specific creative metrics
interface MagritteMetrics {
  metaphysicalDepth: {
    philosophicalResonance: number;  // How well it embodies Magritte's philosophical concepts
    conceptualComplexity: number;    // Depth of conceptual layering
    paradoxicalImpact: number;       // Effectiveness of visual paradoxes
  };
  technicalExecution: {
    objectPrecision: number;         // Precision of object rendering
    edgeControl: number;            // Cleanliness of edges
    perspectiveAccuracy: number;    // Accuracy of perspective
  };
  compositionBalance: {
    spatialHarmony: number;         // Balance of spatial elements
    objectPlacement: number;        // Strategic placement of objects
    scaleRelationships: number;     // Handling of scale relationships
  };
  symbolicPower: {
    objectSymbolism: number;        // Strength of symbolic relationships
    narrativeDepth: number;         // Depth of implied narrative
    metaphoricalResonance: number;  // Power of metaphorical connections
  };
}

// Enhanced creative state with Magritte focus
interface EnhancedCreativeState extends CreativeState {
  magritteMetrics: MagritteMetrics;
  surrealistPreferences: {
    metaphysical: number;
    symbolic: number;
    paradoxical: number;
    atmospheric: number;
    theatrical: number;
  };
}

export class CreativeEngine extends Service {
  private state: EnhancedCreativeState;
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
    
    // Initialize enhanced creative state with Magritte focus
    this.state = {
      currentIdeas: [],
      completedWorks: [],
      stylePreferences: {
        'metaphysical-surrealism': 0.9,
        'symbolic-paradox': 0.8,
        'theatrical-staging': 0.7,
        'atmospheric-mystery': 0.7,
        'philosophical-questioning': 0.8
      },
      explorationRate: 0.7,
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
      },
      magritteMetrics: {
        metaphysicalDepth: {
          philosophicalResonance: 0.8,
          conceptualComplexity: 0.7,
          paradoxicalImpact: 0.8
        },
        technicalExecution: {
          objectPrecision: 0.7,
          edgeControl: 0.6,
          perspectiveAccuracy: 0.7
        },
        compositionBalance: {
          spatialHarmony: 0.6,
          objectPlacement: 0.7,
          scaleRelationships: 0.6
        },
        symbolicPower: {
          objectSymbolism: 0.7,
          narrativeDepth: 0.6,
          metaphoricalResonance: 0.7
        }
      },
      surrealistPreferences: {
        metaphysical: 0.9,
        symbolic: 0.8,
        paradoxical: 0.8,
        atmospheric: 0.7,
        theatrical: 0.7
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
   * Generate art ideas using the current provider with Magritte focus
   */
  async generateArtIdeas(count: number = 3): Promise<ArtworkIdea[]> {
    console.log(`Generating ${count} Magritte-inspired art ideas using ${this.getProvider()}`);
    
    const ideas: ArtworkIdea[] = [];
    
    for (let i = 0; i < count; i++) {
      const concept = await this.generateMagritteInspiredConcept();
      const dialogue = await this.selfDialogue.explore(concept);
      
      const idea: ArtworkIdea = {
        id: uuidv4(),
        concept: dialogue.concept,
        medium: this.selectMagritteMedium(),
        style: this.selectMagritteStyle(),
        score: this.evaluateMagritteScore(dialogue),
        timestamp: Date.now()
      };
      
      ideas.push(idea);
      this.state.currentIdeas.push(idea);
      
      // Update Magritte metrics based on the generated idea
      this.updateMagritteMetrics(idea);
    }
    
    return ideas;
  }

  /**
   * Generate a Magritte-inspired concept
   */
  private async generateMagritteInspiredConcept(): Promise<string> {
    const elements = [
      'bowler hat', 'green apple', 'pipe', 'window', 'mirror',
      'clouds', 'bird', 'castle', 'curtain', 'key'
    ];
    
    const themes = [
      'reality questioning', 'object relationships', 'visual paradox',
      'metaphysical truth', 'symbolic meaning', 'philosophical puzzle'
    ];
    
    const techniques = [
      'juxtaposition', 'displacement', 'scale manipulation',
      'trompe l\'oeil', 'theatrical staging', 'atmospheric mystery'
    ];
    
    const element = elements[Math.floor(Math.random() * elements.length)];
    const theme = themes[Math.floor(Math.random() * themes.length)];
    const technique = techniques[Math.floor(Math.random() * techniques.length)];
    
    return `A metaphysical exploration of ${theme} through ${technique}, featuring ${element}`;
  }

  /**
   * Select appropriate medium for Magritte-style work
   */
  private selectMagritteMedium(): string {
    const media = [
      'Oil painting',
      'Gouache',
      'Mixed media',
      'Digital painting'
    ];
    
    return media[Math.floor(Math.random() * media.length)];
  }

  /**
   * Select appropriate style for Magritte-inspired work
   */
  private selectMagritteStyle(): string {
    const styles = [
      'Metaphysical surrealism',
      'Philosophical paradox',
      'Symbolic realism',
      'Theatrical surrealism',
      'Atmospheric mystery'
    ];
    
    return styles[Math.floor(Math.random() * styles.length)];
  }

  /**
   * Evaluate score based on Magritte-specific criteria
   */
  private evaluateMagritteScore(dialogue: CreativeDialogue): number {
    const metrics = {
      metaphysicalDepth: this.evaluateMetaphysicalDepth(dialogue),
      symbolicResonance: this.evaluateSymbolicResonance(dialogue),
      paradoxicalImpact: this.evaluateParadoxicalImpact(dialogue),
      atmosphericMystery: this.evaluateAtmosphericMystery(dialogue),
      theatricalStaging: this.evaluateTheatricalStaging(dialogue)
    };
    
    // Weight and combine metrics
    return (
      metrics.metaphysicalDepth * 0.3 +
      metrics.symbolicResonance * 0.2 +
      metrics.paradoxicalImpact * 0.2 +
      metrics.atmosphericMystery * 0.15 +
      metrics.theatricalStaging * 0.15
    );
  }

  /**
   * Update Magritte-specific metrics based on generated idea
   */
  private updateMagritteMetrics(idea: ArtworkIdea): void {
    // Update metrics based on idea characteristics
    const metrics = this.state.magritteMetrics;
    
    // Adjust metaphysical depth
    if (idea.concept.includes('philosophical') || idea.concept.includes('metaphysical')) {
      metrics.metaphysicalDepth.philosophicalResonance = Math.min(1, metrics.metaphysicalDepth.philosophicalResonance + 0.1);
    }
    
    // Adjust symbolic resonance
    if (idea.concept.includes('symbolic') || idea.concept.includes('meaning')) {
      metrics.symbolicPower.objectSymbolism = Math.min(1, metrics.symbolicPower.objectSymbolism + 0.1);
    }
    
    // Adjust paradoxical impact
    if (idea.concept.includes('paradox') || idea.concept.includes('impossible')) {
      metrics.metaphysicalDepth.paradoxicalImpact = Math.min(1, metrics.metaphysicalDepth.paradoxicalImpact + 0.1);
    }
    
    // Adjust atmospheric mystery
    if (idea.concept.includes('mysterious') || idea.concept.includes('atmosphere')) {
      metrics.compositionBalance.spatialHarmony = Math.min(1, metrics.compositionBalance.spatialHarmony + 0.1);
    }
    
    // Adjust theatrical staging
    if (idea.concept.includes('theatrical') || idea.concept.includes('staging')) {
      metrics.technicalExecution.objectPrecision = Math.min(1, metrics.technicalExecution.objectPrecision + 0.1);
    }
  }

  /**
   * Evaluate metaphysical depth of a dialogue
   */
  private evaluateMetaphysicalDepth(dialogue: CreativeDialogue): number {
    const metaphysicalKeywords = [
      'philosophical', 'metaphysical', 'reality', 'truth',
      'existence', 'perception', 'representation'
    ];
    
    return this.calculateKeywordScore(dialogue.concept, metaphysicalKeywords);
  }

  /**
   * Evaluate symbolic resonance of a dialogue
   */
  private evaluateSymbolicResonance(dialogue: CreativeDialogue): number {
    const symbolicKeywords = [
      'symbolic', 'meaning', 'representation', 'object',
      'relationship', 'resonance', 'connection'
    ];
    
    return this.calculateKeywordScore(dialogue.concept, symbolicKeywords);
  }

  /**
   * Evaluate paradoxical impact of a dialogue
   */
  private evaluateParadoxicalImpact(dialogue: CreativeDialogue): number {
    const paradoxicalKeywords = [
      'paradox', 'impossible', 'contradiction', 'juxtaposition',
      'surreal', 'displacement', 'transformation'
    ];
    
    return this.calculateKeywordScore(dialogue.concept, paradoxicalKeywords);
  }

  /**
   * Evaluate atmospheric mystery of a dialogue
   */
  private evaluateAtmosphericMystery(dialogue: CreativeDialogue): number {
    const atmosphericKeywords = [
      'mysterious', 'atmosphere', 'enigmatic', 'ethereal',
      'dreamlike', 'poetic', 'ambiguous'
    ];
    
    return this.calculateKeywordScore(dialogue.concept, atmosphericKeywords);
  }

  /**
   * Evaluate theatrical staging of a dialogue
   */
  private evaluateTheatricalStaging(dialogue: CreativeDialogue): number {
    const theatricalKeywords = [
      'theatrical', 'staging', 'dramatic', 'presentation',
      'scene', 'composition', 'arrangement'
    ];
    
    return this.calculateKeywordScore(dialogue.concept, theatricalKeywords);
  }

  /**
   * Calculate keyword-based score
   */
  private calculateKeywordScore(text: string, keywords: string[]): number {
    const matches = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return Math.min(1, matches.length / (keywords.length * 0.5));
  }

  // Evaluate Magritte-style metrics
  private evaluateMagritteMetrics(artwork: any): MagritteMetrics {
    return {
      metaphysicalDepth: {
        philosophicalResonance: this.calculateMetric(artwork, 'philosophicalResonance'),
        conceptualComplexity: this.calculateMetric(artwork, 'conceptualComplexity'),
        paradoxicalImpact: this.calculateMetric(artwork, 'paradoxicalImpact')
      },
      technicalExecution: {
        objectPrecision: this.calculateMetric(artwork, 'objectPrecision'),
        edgeControl: this.calculateMetric(artwork, 'edgeControl'),
        perspectiveAccuracy: this.calculateMetric(artwork, 'perspectiveAccuracy')
      },
      compositionBalance: {
        spatialHarmony: this.calculateMetric(artwork, 'spatialHarmony'),
        objectPlacement: this.calculateMetric(artwork, 'objectPlacement'),
        scaleRelationships: this.calculateMetric(artwork, 'scaleRelationships')
      },
      symbolicPower: {
        objectSymbolism: this.calculateMetric(artwork, 'objectSymbolism'),
        narrativeDepth: this.calculateMetric(artwork, 'narrativeDepth'),
        metaphoricalResonance: this.calculateMetric(artwork, 'metaphoricalResonance')
      }
    };
  }

  // Helper function to calculate metrics
  private calculateMetric(artwork: any, metricType: string): number {
    // Implementation would use computer vision and ML models to analyze the artwork
    // For now, return a placeholder value
    return 0.9;
  }
} 