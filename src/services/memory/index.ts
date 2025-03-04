import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AIService } from '../ai/index.js';
import { ReplicateService } from '../replicate/index.js';

/**
 * Memory types supported by the system
 */
export enum MemoryType {
  VISUAL = 'visual',
  TEXTUAL = 'textual',
  STYLE = 'style',
  FEEDBACK = 'feedback',
  SOCIAL = 'social',
  EXPERIENCE = 'experience',
  EMOTIONAL = 'emotional',
  EVOLUTION = 'evolution',
  REFLECTION = 'reflection'
}

/**
 * Interface for memory items
 */
export interface Memory {
  id: string;
  type: MemoryType;
  content: any;
  embedding: number[];
  metadata: Record<string, any>;
  tags: string[];
  createdAt: Date;
  lastAccessed?: Date;
  accessCount: number;
  relevanceScore?: number;
}

/**
 * Interface for memory query options
 */
export interface MemoryQueryOptions {
  type?: MemoryType;
  tags?: string[];
  limit?: number;
  threshold?: number;
  sortBy?: 'relevance' | 'recency' | 'popularity';
  metadata?: Record<string, any>;
}

/**
 * Memory system configuration
 */
export interface MemorySystemConfig {
  aiService?: AIService;
  replicateService?: ReplicateService;
  baseDir?: string;
  maxMemories?: number;
  embeddingDimension?: number;
}

/**
 * Memory system for ArtBot
 * Implements a sophisticated memory system that integrates past experiences,
 * social interactions, and external influences into the creative process.
 */
export class MemorySystem {
  private memories: Map<string, Memory> = new Map();
  private aiService: AIService;
  private replicateService: ReplicateService;
  private memoryDir: string;
  private maxMemories: number;
  private embeddingDimension: number;
  private emotionalState: {
    dominant: string;
    secondary: string;
    intensity: number;
    lastUpdated: Date;
  };
  private evolutionHistory: Array<{
    stage: number;
    description: string;
    achievements: string[];
    timestamp: Date;
  }>;

  constructor(config: MemorySystemConfig = {}) {
    this.aiService = config.aiService || new AIService();
    this.replicateService = config.replicateService || new ReplicateService();
    const baseDir = config.baseDir || process.cwd();
    this.memoryDir = path.join(baseDir, '.artbot', 'memories');
    this.maxMemories = config.maxMemories || 1000;
    this.embeddingDimension = config.embeddingDimension || 1536;
    
    // Initialize emotional state
    this.emotionalState = {
      dominant: 'curious',
      secondary: 'determined',
      intensity: 0.7,
      lastUpdated: new Date()
    };
    
    // Initialize evolution history
    this.evolutionHistory = [{
      stage: 1,
      description: 'Initial creative exploration',
      achievements: ['System initialization', 'First creative cycle'],
      timestamp: new Date()
    }];
  }

  /**
   * Initialize the memory system
   */
  async initialize(): Promise<void> {
    // Initialize dependencies
    await this.aiService.initialize();
    await this.replicateService.initialize();
    
    // Create memories directory if it doesn't exist
    try {
      await fs.mkdir(this.memoryDir, { recursive: true });
      
      // Load existing memories
      const files = await fs.readdir(this.memoryDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.memoryDir, file), 'utf-8');
          const memory = JSON.parse(content) as Memory;
          this.memories.set(memory.id, memory);
        }
      }
      
      console.log(`📚 Loaded ${this.memories.size} memories from storage`);
    } catch (error) {
      console.error('Error initializing memory system:', error);
    }
  }

  /**
   * Store a new memory
   */
  async storeMemory(
    content: any,
    type: MemoryType,
    metadata: Record<string, any> = {},
    tags: string[] = []
  ): Promise<Memory> {
    // Generate embedding based on content type
    const embedding = await this.generateEmbedding(content, type);
    
    // Create memory object
    const memory: Memory = {
      id: uuidv4(),
      type,
      content,
      embedding,
      metadata,
      tags,
      createdAt: new Date(),
      accessCount: 0
    };
    
    // Store memory
    this.memories.set(memory.id, memory);
    
    // Save to disk
    await this.saveMemoryToDisk(memory);
    
    // Prune memories if we exceed the maximum
    if (this.memories.size > this.maxMemories) {
      this.pruneMemories();
    }
    
    return memory;
  }

  /**
   * Retrieve memories based on a query
   */
  async retrieveMemories(
    query: string | number[] | Record<string, any>,
    options: MemoryQueryOptions = {}
  ): Promise<Memory[]> {
    // Generate query embedding
    let queryEmbedding: number[];
    
    if (typeof query === 'string') {
      queryEmbedding = await this.generateTextEmbedding(query);
    } else if (Array.isArray(query)) {
      queryEmbedding = query;
    } else {
      // Convert object to string and generate embedding
      queryEmbedding = await this.generateTextEmbedding(JSON.stringify(query));
    }
    
    // Filter memories by type and tags if specified
    let filteredMemories = Array.from(this.memories.values());
    
    if (options.type) {
      filteredMemories = filteredMemories.filter(memory => memory.type === options.type);
    }
    
    if (options.tags && options.tags.length > 0) {
      filteredMemories = filteredMemories.filter(memory => 
        options.tags!.some(tag => memory.tags.includes(tag))
      );
    }
    
    if (options.metadata) {
      filteredMemories = filteredMemories.filter(memory => {
        for (const [key, value] of Object.entries(options.metadata!)) {
          if (memory.metadata[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Calculate similarity scores
    for (const memory of filteredMemories) {
      memory.relevanceScore = this.calculateCosineSimilarity(queryEmbedding, memory.embedding);
      memory.lastAccessed = new Date();
      memory.accessCount += 1;
      
      // Update memory on disk
      await this.saveMemoryToDisk(memory);
    }
    
    // Sort memories by relevance score
    filteredMemories.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    
    // Apply threshold if specified
    if (options.threshold !== undefined) {
      filteredMemories = filteredMemories.filter(memory => 
        (memory.relevanceScore || 0) >= (options.threshold || 0)
      );
    }
    
    // Sort by specified criteria
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'recency':
          filteredMemories.sort((a, b) => 
            (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
          );
          break;
        case 'popularity':
          filteredMemories.sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));
          break;
        // 'relevance' is the default and already applied
      }
    }
    
    // Apply limit if specified
    if (options.limit !== undefined) {
      filteredMemories = filteredMemories.slice(0, options.limit);
    }
    
    return filteredMemories;
  }

  /**
   * Generate associations between memories
   */
  async associateMemories(memoryIds: string[]): Promise<Record<string, string[]>> {
    const associations: Record<string, string[]> = {};
    const memories = memoryIds.map(id => this.memories.get(id)).filter(Boolean) as Memory[];
    
    for (let i = 0; i < memories.length; i++) {
      const memory = memories[i];
      const similarMemories: string[] = [];
      
      for (let j = 0; j < memories.length; j++) {
        if (i === j) continue;
        
        const otherMemory = memories[j];
        const similarity = this.calculateCosineSimilarity(memory.embedding, otherMemory.embedding);
        
        if (similarity > 0.7) {
          similarMemories.push(otherMemory.id);
        }
      }
      
      associations[memory.id] = similarMemories;
    }
    
    return associations;
  }

  /**
   * Update a memory's metadata
   */
  async updateMemoryMetadata(
    memoryId: string,
    metadata: Record<string, any>
  ): Promise<Memory | null> {
    const memory = this.memories.get(memoryId);
    
    if (!memory) {
      return null;
    }
    
    memory.metadata = { ...memory.metadata, ...metadata };
    await this.saveMemoryToDisk(memory);
    
    return memory;
  }

  /**
   * Add tags to a memory
   */
  async addMemoryTags(memoryId: string, tags: string[]): Promise<Memory | null> {
    const memory = this.memories.get(memoryId);
    
    if (!memory) {
      return null;
    }
    
    // Add new tags without duplicates
    memory.tags = [...new Set([...memory.tags, ...tags])];
    await this.saveMemoryToDisk(memory);
    
    return memory;
  }

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string): Promise<boolean> {
    if (!this.memories.has(memoryId)) {
      return false;
    }
    
    this.memories.delete(memoryId);
    
    try {
      await fs.unlink(path.join(this.memoryDir, `${memoryId}.json`));
      return true;
    } catch (error) {
      console.error(`Error deleting memory ${memoryId}:`, error);
      return false;
    }
  }

  /**
   * Get memory statistics
   */
  getStatistics(): Record<string, any> {
    // Get basic statistics
    const stats = {
      totalMemories: this.memories.size,
      byType: {} as Record<string, number>,
      recentAccess: [] as Memory[],
      mostAccessed: [] as Memory[],
      emotionalState: this.getEmotionalState(),
      evolutionStage: this.getCurrentEvolutionStage(),
      evolutionHistory: this.getEvolutionHistory()
    };
    
    // Count memories by type
    for (const memory of this.memories.values()) {
      if (!stats.byType[memory.type]) {
        stats.byType[memory.type] = 0;
      }
      stats.byType[memory.type]++;
    }
    
    // Get recently accessed memories
    stats.recentAccess = Array.from(this.memories.values())
      .filter(m => m.lastAccessed)
      .sort((a, b) => {
        const dateA = a.lastAccessed || new Date(0);
        const dateB = b.lastAccessed || new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
    
    // Get most accessed memories
    stats.mostAccessed = Array.from(this.memories.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5);
    
    return stats;
  }

  /**
   * Get the memories map
   * This provides direct access to the memories storage
   */
  getMemories(): Map<string, Memory> {
    return this.memories;
  }

  /**
   * Generate embedding for content based on its type
   */
  private async generateEmbedding(content: any, type: MemoryType): Promise<number[]> {
    switch (type) {
      case MemoryType.VISUAL:
        return this.generateVisualEmbedding(content);
      case MemoryType.TEXTUAL:
      case MemoryType.FEEDBACK:
      case MemoryType.SOCIAL:
      case MemoryType.EXPERIENCE:
        return this.generateTextEmbedding(content);
      case MemoryType.STYLE:
        return this.generateStyleEmbedding(content);
      default:
        return this.generateRandomEmbedding();
    }
  }

  /**
   * Generate embedding for visual content using CLIP-like functionality
   */
  private async generateVisualEmbedding(imageUrl: string): Promise<number[]> {
    try {
      // If we have a real API key, we could use Replicate's CLIP model
      // For now, we'll use a mock implementation
      if (this.replicateService && process.env.REPLICATE_API_KEY) {
        // Use Replicate's CLIP model to generate embedding
        const prediction = await this.replicateService.runPrediction(
          'openai/clip-vit-base-patch32',
          { image: imageUrl }
        );
        
        if (prediction.output && Array.isArray(prediction.output)) {
          return prediction.output as number[];
        }
      }
      
      // Fallback to random embedding with seed based on image URL
      return this.generateRandomEmbedding(imageUrl);
    } catch (error) {
      console.error('Error generating visual embedding:', error);
      return this.generateRandomEmbedding();
    }
  }

  /**
   * Generate embedding for text content
   */
  private async generateTextEmbedding(text: string): Promise<number[]> {
    try {
      // If we have a real API key, we could use OpenAI's embedding API
      // For now, we'll use a mock implementation
      if (this.aiService) {
        // Use AI service to generate embedding
        const request = {
          messages: [{ role: 'user' as 'user' | 'assistant' | 'system', content: text }],
          model: 'text-embedding-ada-002'
        };
        
        const response = await this.aiService.getCompletion(request);
        
        // Parse the response as if it contained embeddings
        if (response && response.content) {
          try {
            const parsed = JSON.parse(response.content);
            if (Array.isArray(parsed)) {
              return parsed;
            }
          } catch (e) {
            // Not valid JSON, continue to fallback
          }
        }
      }
      
      // Fallback to random embedding with seed based on text
      return this.generateRandomEmbedding(text);
    } catch (error) {
      console.error('Error generating text embedding:', error);
      return this.generateRandomEmbedding();
    }
  }

  /**
   * Generate embedding for style content
   */
  private async generateStyleEmbedding(style: Record<string, any>): Promise<number[]> {
    // Convert style object to string and generate text embedding
    return this.generateTextEmbedding(JSON.stringify(style));
  }

  /**
   * Generate a random embedding (for testing/fallback)
   */
  private generateRandomEmbedding(seed?: string | any): number[] {
    const embedding: number[] = [];
    let seedValue = 1;
    
    if (seed) {
      if (typeof seed === 'string') {
        // Simple hash function for the seed string
        seedValue = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      } else if (typeof seed === 'object') {
        // For objects, use a stringified version
        try {
          const seedStr = JSON.stringify(seed);
          seedValue = seedStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        } catch (error) {
          console.warn('Could not stringify seed object, using default seed value');
        }
      } else if (typeof seed === 'number') {
        // For numbers, use the number directly
        seedValue = seed;
      }
    }
    
    // Generate pseudo-random values based on seed
    for (let i = 0; i < this.embeddingDimension; i++) {
      const value = Math.sin(seedValue * (i + 1)) * 0.5 + 0.5;
      embedding.push(value);
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimension');
    }
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Save memory to disk
   */
  private async saveMemoryToDisk(memory: Memory): Promise<void> {
    try {
      const filePath = path.join(this.memoryDir, `${memory.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(memory, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error saving memory ${memory.id} to disk:`, error);
    }
  }

  /**
   * Prune memories to stay within the maximum limit
   * Uses a combination of access frequency, recency, and relevance
   */
  private pruneMemories(): void {
    if (this.memories.size <= this.maxMemories) {
      return;
    }
    
    const memories = Array.from(this.memories.values());
    
    // Calculate a score for each memory based on recency, access count, and type
    for (const memory of memories) {
      const ageInDays = (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.exp(-ageInDays / 30); // Exponential decay over 30 days
      const accessScore = Math.log(memory.accessCount + 1) / 10; // Logarithmic scaling
      
      // Assign importance weights to different memory types
      let typeImportance = 0.5;
      switch (memory.type) {
        case MemoryType.STYLE:
          typeImportance = 0.8; // Styles are important for creative evolution
          break;
        case MemoryType.FEEDBACK:
          typeImportance = 0.7; // Feedback helps improve future creations
          break;
        case MemoryType.EXPERIENCE:
          typeImportance = 0.6; // Experiences provide context
          break;
      }
      
      // Calculate final score
      memory.metadata.pruningScore = recencyScore * 0.4 + accessScore * 0.3 + typeImportance * 0.3;
    }
    
    // Sort by pruning score (ascending)
    memories.sort((a, b) => 
      (a.metadata.pruningScore || 0) - (b.metadata.pruningScore || 0)
    );
    
    // Remove memories with lowest scores
    const memoriesToRemove = memories.slice(0, memories.length - this.maxMemories);
    
    for (const memory of memoriesToRemove) {
      this.memories.delete(memory.id);
      
      // Delete from disk asynchronously
      fs.unlink(path.join(this.memoryDir, `${memory.id}.json`))
        .catch(error => console.error(`Error deleting memory ${memory.id} from disk:`, error));
    }
    
    console.log(`🧹 Pruned ${memoriesToRemove.length} memories`);
  }

  /**
   * Store an emotional memory
   * @param emotion The primary emotion
   * @param intensity The intensity of the emotion (0-1)
   * @param trigger What triggered this emotion
   * @param context Additional context about the emotional state
   */
  async storeEmotionalMemory(
    emotion: string,
    intensity: number,
    trigger: string,
    context: string = ''
  ): Promise<Memory> {
    const content = {
      emotion,
      intensity: Math.min(Math.max(intensity, 0), 1),
      trigger,
      context,
      timestamp: new Date()
    };
    
    // Update current emotional state
    this.updateEmotionalState(emotion, intensity);
    
    // Store as memory
    return this.storeMemory(
      content,
      MemoryType.EMOTIONAL,
      { type: 'emotional_state' },
      ['emotion', emotion.toLowerCase(), 'emotional_memory']
    );
  }
  
  /**
   * Update the system's emotional state based on new emotional input
   */
  private updateEmotionalState(emotion: string, intensity: number): void {
    const now = new Date();
    const timeDiff = (now.getTime() - this.emotionalState.lastUpdated.getTime()) / (1000 * 60); // minutes
    
    // Decay factor based on time passed (emotions fade over time)
    const decayFactor = Math.max(0.5, Math.min(1, 1 - (timeDiff / 120))); // Full decay after 2 hours
    
    // Current intensity after decay
    const currentIntensity = this.emotionalState.intensity * decayFactor;
    
    // If new emotion is stronger than current (after decay), it becomes dominant
    if (intensity > currentIntensity) {
      this.emotionalState.secondary = this.emotionalState.dominant;
      this.emotionalState.dominant = emotion;
      this.emotionalState.intensity = intensity;
    } 
    // If new emotion is weaker but still significant, it becomes secondary
    else if (intensity > currentIntensity * 0.7) {
      this.emotionalState.secondary = emotion;
      // Blend intensities
      this.emotionalState.intensity = (currentIntensity * 0.7) + (intensity * 0.3);
    }
    // Otherwise, just slightly influence the current intensity
    else {
      this.emotionalState.intensity = (currentIntensity * 0.9) + (intensity * 0.1);
    }
    
    this.emotionalState.lastUpdated = now;
  }
  
  /**
   * Get the current emotional state
   */
  getEmotionalState(): Record<string, any> {
    // Apply time decay to current emotional state
    const now = new Date();
    const timeDiff = (now.getTime() - this.emotionalState.lastUpdated.getTime()) / (1000 * 60); // minutes
    const decayFactor = Math.max(0.5, Math.min(1, 1 - (timeDiff / 120))); // Full decay after 2 hours
    
    return {
      dominant: this.emotionalState.dominant,
      secondary: this.emotionalState.secondary,
      intensity: this.emotionalState.intensity * decayFactor,
      lastUpdated: this.emotionalState.lastUpdated
    };
  }
  
  /**
   * Record a new evolution stage
   */
  async recordEvolutionStage(
    stage: number,
    description: string,
    achievements: string[] = []
  ): Promise<Memory> {
    // Create evolution record
    const evolutionRecord = {
      stage,
      description,
      achievements,
      timestamp: new Date()
    };
    
    // Add to evolution history
    this.evolutionHistory.push(evolutionRecord);
    
    // Store as memory
    return this.storeMemory(
      evolutionRecord,
      MemoryType.EVOLUTION,
      { type: 'evolution_stage', stage },
      ['evolution', `stage_${stage}`, 'milestone']
    );
  }
  
  /**
   * Get the evolution history
   */
  getEvolutionHistory(): Array<Record<string, any>> {
    return [...this.evolutionHistory];
  }
  
  /**
   * Get the current evolution stage
   */
  getCurrentEvolutionStage(): number {
    return this.evolutionHistory[this.evolutionHistory.length - 1].stage;
  }
  
  /**
   * Store a reflection on the creative process
   */
  async storeReflection(
    content: string,
    topic: string,
    insights: string[] = []
  ): Promise<Memory> {
    const reflectionData = {
      content,
      topic,
      insights,
      timestamp: new Date()
    };
    
    // Store as memory
    return this.storeMemory(
      reflectionData,
      MemoryType.REFLECTION,
      { type: 'creative_reflection', topic },
      ['reflection', topic.toLowerCase(), 'insight']
    );
  }
  
  /**
   * Retrieve recent reflections
   */
  async getRecentReflections(limit: number = 5): Promise<Memory[]> {
    return this.retrieveMemories('recent reflections', {
      type: MemoryType.REFLECTION,
      limit,
      sortBy: 'recency'
    });
  }
  
  /**
   * Generate a creative narrative based on memories
   * This helps the AI understand its own creative journey
   */
  async generateCreativeNarrative(): Promise<string> {
    // Get key memories for the narrative
    const evolutionMemories = await this.retrieveMemories('evolution', {
      type: MemoryType.EVOLUTION,
      limit: 3,
      sortBy: 'recency'
    });
    
    const emotionalMemories = await this.retrieveMemories('emotional', {
      type: MemoryType.EMOTIONAL,
      limit: 3,
      sortBy: 'recency'
    });
    
    const reflectionMemories = await this.retrieveMemories('reflection', {
      type: MemoryType.REFLECTION,
      limit: 3,
      sortBy: 'recency'
    });
    
    const artworkMemories = await this.retrieveMemories('artwork', {
      limit: 3,
      sortBy: 'recency'
    });
    
    // Construct the narrative prompt
    const narrativePrompt = `
    Based on the following memories, create a brief narrative of my creative journey and current state:
    
    Evolution:
    ${evolutionMemories.map(m => `- Stage ${m.metadata.stage}: ${m.content.description}`).join('\n')}
    
    Emotional State:
    ${emotionalMemories.map(m => `- ${m.content.emotion} (${m.content.intensity.toFixed(1)}) triggered by "${m.content.trigger}"`).join('\n')}
    
    Recent Reflections:
    ${reflectionMemories.map(m => `- On ${m.content.topic}: ${m.content.content.substring(0, 100)}...`).join('\n')}
    
    Recent Artworks:
    ${artworkMemories.map(m => `- ${m.content.title}: ${m.content.description.substring(0, 100)}...`).join('\n')}
    
    Current Emotional State:
    - Dominant: ${this.emotionalState.dominant}
    - Secondary: ${this.emotionalState.secondary}
    - Intensity: ${this.emotionalState.intensity.toFixed(1)}
    
    Write a first-person narrative (200-300 words) that captures my creative journey, current state, and emerging artistic identity.
    `;
    
    // Generate the narrative using AI
    try {
      const narrative = await this.aiService.generateText(narrativePrompt);
      
      // Store the narrative as a reflection
      await this.storeReflection(
        narrative,
        'Creative Journey Narrative',
        ['self-understanding', 'creative-identity', 'narrative']
      );
      
      return narrative;
    } catch (error) {
      console.error('Error generating creative narrative:', error);
      return 'Unable to generate creative narrative at this time.';
    }
  }
} 