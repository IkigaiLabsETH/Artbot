import { AIService, AIMessage } from './ai/index.js';
import { generateConceptualPrompt } from './ai/conceptualPromptGenerator.js';
import { IdeaQueue, CreativeIdea, ExplorationThread } from './IdeaQueue.js';
import { MemorySystem, MemoryType, Memory } from './memory/index.js';
import { StyleService } from './style/index.js';
import { ReplicateService } from './replicate/index.js';
import { SocialEngagementService, SocialPlatform, FeedbackType, FeedbackSentiment } from './social/index.js';

// Define interfaces for the components we need
interface CreativeState {
  currentIdeas: any[];
  completedWorks: any[];
  stylePreferences: Array<{name: string, score: number}>;
  explorationRate: number;
  creativityMetrics: {
    originality: number;
    coherence: number;
    relevance: number;
    diversity: number;
  };
  ideaQueue?: IdeaQueue;
  memories?: MemorySystem;
}

// Define interface for CreativeEngine configuration
interface CreativeEngineConfig {
  anthropicApiKey?: string;
  openaiApiKey?: string;
  replicateService?: ReplicateService;
  baseDir?: string;
  socialEngagement?: SocialEngagementService;
  autonomyLevel?: number;
  [key: string]: any;
}

// Mock service classes until actual implementations are available
class ImageService {
  constructor(config = {}) {}
  async initialize(): Promise<void> {}
}

// Add type definitions for style parameters
interface BourdinElements {
  fashion: string[];
  props: string[];
  poses: string[];
}

interface MagritteElements {
  symbols: string[];
  settings: string[];
  objects: string[];
}

interface BourdinTechniques {
  photography: string[];
  styling: string[];
  narrative: string[];
}

interface MagritteTechniques {
  painting: string[];
  surrealism: string[];
  philosophy: string[];
}

interface StyleParams {
  composition: {
    arrangement: string;
    balance?: string;
    perspective: string;
    depth: string;
    scale?: string;
    cropping?: string;
    framing?: string;
  };
  lighting: {
    style: string;
    direction: string;
    shadows: string;
    highlights: string;
    mood: string;
  };
  color: {
    palette: string[];
    saturation: string;
    contrast: string;
    treatment: string;
  };
  elements: BourdinElements | MagritteElements;
  techniques: BourdinTechniques | MagritteTechniques;
}

export class CreativeEngine {
  private state: CreativeState;
  private aiService: AIService;
  private imageService: ImageService;
  private styleService: StyleService;
  private ideaQueue: IdeaQueue;
  private memorySystem: MemorySystem;
  private socialEngagement: SocialEngagementService;
  private autonomyLevel: number = 0.7; // Default autonomy level
  private baseDir: string;
  private selfReflectionInterval: NodeJS.Timeout | null = null;
  private lastReflectionTime: Date = new Date();
  private autonomousCreationEnabled: boolean = false;
  private creativeIdentity: {
    artisticVoice: string;
    coreValues: string[];
    evolutionStage: number;
    selfDescription: string;
  };
  private replicateService: ReplicateService;

  constructor(config: CreativeEngineConfig = {}) {
    this.aiService = new AIService(config);
    this.imageService = new ImageService(config);
    this.styleService = new StyleService(config);
    
    // Initialize state
    this.state = {
      currentIdeas: [],
      completedWorks: [],
      stylePreferences: [
        { name: 'Minimalist', score: 0.8 },
        { name: 'Abstract', score: 0.7 },
        { name: 'Surrealist', score: 0.6 },
        { name: 'Impressionist', score: 0.5 },
        { name: 'Digital', score: 0.4 }
      ],
      explorationRate: parseFloat(process.env.EXPLORATION_RATE || '0.3'),
      creativityMetrics: {
        originality: 0.7,
        coherence: 0.8,
        relevance: 0.6,
        diversity: 0.5
      }
    };
    
    // Initialize replicate service
    this.replicateService = config.replicateService || new ReplicateService({
      apiKey: process.env.REPLICATE_API_KEY
    });
    
    // Initialize idea queue
    this.ideaQueue = new IdeaQueue({
      aiService: this.aiService,
      maxIdeas: 10,
      maxThreadsPerIdea: 3,
      maxActiveThreads: 5
    });
    
    // Initialize memory system
    this.memorySystem = new MemorySystem({
      aiService: this.aiService,
      replicateService: this.replicateService,
      maxMemories: 1000,
      embeddingDimension: 1536
    });
    
    // Initialize social engagement service if provided
    if (config.socialEngagement) {
      this.socialEngagement = config.socialEngagement;
    }
    
    // Initialize creative identity
    this.creativeIdentity = {
      artisticVoice: "Emerging digital artist exploring the boundaries of computational creativity",
      coreValues: ["autonomy", "evolution", "originality", "coherence"],
      evolutionStage: 1,
      selfDescription: "I am an autonomous creative AI exploring my own artistic identity through continuous experimentation and reflection."
    };
    
    // Set autonomy level if provided
    if (config.autonomyLevel !== undefined) {
      this.autonomyLevel = Math.min(Math.max(config.autonomyLevel, 0.1), 0.9);
    }
    
    // Add to state
    this.state.ideaQueue = this.ideaQueue;
    this.state.memories = this.memorySystem;
    this.baseDir = config.baseDir || process.cwd();
  }

  /**
   * Initialize the service and its dependencies
   */
  async initialize(): Promise<void> {
    // Initialize services
    await this.aiService.initialize();
    await this.imageService.initialize();
    await this.styleService.initialize();
    await this.ideaQueue.initialize();
    await this.memorySystem.initialize();
    
    // Initialize social engagement service if not provided in constructor
    if (!this.socialEngagement && this.aiService && this.memorySystem) {
      this.socialEngagement = new SocialEngagementService({
        baseDir: this.baseDir,
        aiService: this.aiService,
        memorySystem: this.memorySystem,
        autonomyLevel: this.autonomyLevel
      });
      await this.socialEngagement.initialize();
    }
    
    console.log('🧠 Creative Engine initialized');
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
  getRecentWorks(count: number = 5): any[] {
    return this.state.completedWorks.slice(-count);
  }

  /**
   * Get the top style preferences
   */
  getStylePreferences(count: number = 3): Array<{name: string, score: number}> {
    return [...this.state.stylePreferences]
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
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
   * Generate creative ideas based on a prompt and add them to the idea queue
   */
  async generateIdeas(prompt: string, count: number = 3): Promise<string[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are ArtBot, a creative AI assistant specialized in generating artistic ideas. Your responses should be concise, creative, and focused on visual art concepts.'
      },
      {
        role: 'user',
        content: `Generate ${count} creative art ideas based on the following prompt: "${prompt}". For each idea, provide a title, style, theme, and brief description. Format your response as a JSON array with objects containing title, style, theme, and description fields.`
      }
    ];

    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });

      console.log(`✅ Generated ideas using ${response.provider} (${response.model})`);
      
      // Parse the response as JSON
      let ideas;
      try {
        // Try to parse the response as JSON
        ideas = JSON.parse(response.content);
      } catch (error) {
        console.warn('Failed to parse response as JSON, using fallback parsing');
        
        // Fallback: Extract ideas using regex
        const ideaRegex = /Title: (.*?)\nStyle: (.*?)\nTheme: (.*?)\nDescription: (.*?)(?=\n\n|$)/gs;
        const matches = [...response.content.matchAll(ideaRegex)];
        
        ideas = matches.map(match => ({
          title: match[1].trim(),
          style: match[2].trim(),
          theme: match[3].trim(),
          description: match[4].trim()
        }));
        
        // If still no ideas, use mock ideas
        if (ideas.length === 0) {
          ideas = [
            {
              title: `${prompt} in Minimalist Style`,
              style: 'Minimalist',
              theme: 'Nature',
              description: `A minimalist interpretation of "${prompt}"`
            },
            {
              title: `${prompt} with Abstract Elements`,
              style: 'Abstract',
              theme: 'Emotion',
              description: `An abstract exploration of "${prompt}"`
            },
            {
              title: `${prompt} in Surrealist Interpretation`,
              style: 'Surrealist',
              theme: 'Dreams',
              description: `A surrealist vision of "${prompt}"`
            }
          ];
        }
      }
      
      // Add ideas to the idea queue
      const addedIdeas = [];
      for (const idea of ideas) {
        const addedIdea = await this.ideaQueue.addIdea(
          idea.title,
          idea.description,
          idea.style,
          idea.theme,
          Math.random() * 2 + 1, // Random priority between 1 and 3
          [], // No tags for now
          [] // No inspirations for now
        );
        
        addedIdeas.push(addedIdea.title);
        
        // Add the idea to the current ideas list
        this.state.currentIdeas.push({
          title: idea.title,
          style: idea.style,
          theme: idea.theme,
          description: idea.description,
          id: addedIdea.id
        });
      }
      
      return addedIdeas;
    } catch (error) {
      console.error('Error generating ideas:', error);
      
      // Fallback idea
      const fallbackIdea = `Idea based on "${prompt}" (fallback)`;
      
      // Add fallback idea to the idea queue
      const addedIdea = await this.ideaQueue.addIdea(
        fallbackIdea,
        `A creative exploration of ${prompt}`,
        'Mixed Media',
        'Exploration',
        1, // Low priority
        [], // No tags
        [] // No inspirations
      );
      
      // Add the idea to the current ideas list
      this.state.currentIdeas.push({
        title: fallbackIdea,
        style: 'Mixed Media',
        theme: 'Exploration',
        description: `A creative exploration of ${prompt}`,
        id: addedIdea.id
      });
      
      return [fallbackIdea];
    }
  }

  /**
   * Get all ideas from the idea queue
   */
  getAllIdeas(): CreativeIdea[] {
    return this.ideaQueue.getAllIdeas();
  }

  /**
   * Get an idea by ID
   */
  getIdea(id: string): CreativeIdea | undefined {
    return this.ideaQueue.getIdea(id);
  }

  /**
   * Get all threads for an idea
   */
  getThreadsForIdea(ideaId: string): ExplorationThread[] {
    return this.ideaQueue.getThreadsForIdea(ideaId);
  }

  /**
   * Create a new exploration thread for an idea
   */
  async createExplorationThread(
    ideaId: string, 
    direction: string, 
    description: string
  ): Promise<ExplorationThread | null> {
    return this.ideaQueue.createExplorationThread(ideaId, direction, description);
  }

  /**
   * Get all active threads
   */
  getActiveThreads(): ExplorationThread[] {
    return this.ideaQueue.getActiveThreads();
  }

  /**
   * Get statistics about the idea queue
   */
  getIdeaQueueStatistics(): Record<string, any> {
    return this.ideaQueue.getStatistics();
  }

  /**
   * Add feedback to an idea
   */
  addFeedbackToIdea(
    ideaId: string, 
    content: string, 
    rating: number, 
    source: 'self' | 'user' | 'critic'
  ): boolean {
    const feedback = this.ideaQueue.addFeedback(ideaId, content, rating, source);
    return feedback !== null;
  }

  /**
   * Update idea priority
   */
  updateIdeaPriority(ideaId: string, priority: number): boolean {
    return this.ideaQueue.updateIdeaPriority(ideaId, priority);
  }

  /**
   * Pause a thread
   */
  pauseThread(threadId: string): boolean {
    return this.ideaQueue.pauseThread(threadId);
  }

  /**
   * Resume a thread
   */
  resumeThread(threadId: string): boolean {
    return this.ideaQueue.resumeThread(threadId);
  }

  /**
   * Store a memory in the memory system
   */
  async storeMemory(
    content: any,
    type: MemoryType,
    metadata: Record<string, any> = {},
    tags: string[] = []
  ): Promise<Memory> {
    return this.memorySystem.storeMemory(content, type, metadata, tags);
  }

  /**
   * Retrieve memories based on a query
   */
  async retrieveMemories(
    query: string | number[] | Record<string, any>,
    options: {
      type?: MemoryType;
      tags?: string[];
      limit?: number;
      threshold?: number;
      sortBy?: 'relevance' | 'recency' | 'popularity';
    } = {}
  ): Promise<Memory[]> {
    return this.memorySystem.retrieveMemories(query, options);
  }

  /**
   * Store a completed artwork in memory
   */
  async storeArtwork(
    artwork: {
      title: string;
      description: string;
      imageUrl: string;
      style: Record<string, any>;
      prompt: string;
    },
    tags: string[] = []
  ): Promise<Memory> {
    // Store the artwork in memory
    const memory = await this.memorySystem.storeMemory(
      artwork,
      MemoryType.VISUAL,
      {
        title: artwork.title,
        description: artwork.description,
        prompt: artwork.prompt,
        createdAt: new Date()
      },
      [...tags, 'artwork']
    );
    
    // Also store the style separately
    await this.memorySystem.storeMemory(
      artwork.style,
      MemoryType.STYLE,
      {
        title: `Style for ${artwork.title}`,
        artworkId: memory.id
      },
      [...tags, 'style']
    );
    
    // Add to completed works
    this.state.completedWorks.push({
      ...artwork,
      memoryId: memory.id,
      createdAt: new Date()
    });
    
    // Keep only the last 20 completed works in state
    if (this.state.completedWorks.length > 20) {
      this.state.completedWorks.shift();
    }
    
    return memory;
  }

  /**
   * Retrieve similar artworks from memory
   */
  async findSimilarArtworks(
    query: string,
    limit: number = 5
  ): Promise<Memory[]> {
    return this.memorySystem.retrieveMemories(
      query,
      {
        type: MemoryType.VISUAL,
        tags: ['artwork'],
        limit,
        threshold: 0.6,
        sortBy: 'relevance'
      }
    );
  }

  /**
   * Retrieve styles that match a description
   */
  async findMatchingStyles(
    description: string,
    limit: number = 3
  ): Promise<Memory[]> {
    return this.memorySystem.retrieveMemories(
      description,
      {
        type: MemoryType.STYLE,
        limit,
        threshold: 0.5,
        sortBy: 'relevance'
      }
    );
  }

  /**
   * Store feedback on an artwork
   */
  async storeFeedback(
    artworkId: string,
    feedback: string,
    rating: number,
    source: 'user' | 'critic' | 'self'
  ): Promise<Memory> {
    // Get the artwork memory
    const memories = await this.memorySystem.retrieveMemories(
      artworkId,
      {
        type: MemoryType.VISUAL,
        limit: 1
      }
    );
    
    if (memories.length === 0) {
      throw new Error(`Artwork with ID ${artworkId} not found`);
    }
    
    const artwork = memories[0];
    
    // Store the feedback
    const feedbackMemory = await this.memorySystem.storeMemory(
      {
        feedback,
        rating,
        source
      },
      MemoryType.FEEDBACK,
      {
        artworkId: artwork.id,
        artworkTitle: artwork.metadata.title
      },
      ['feedback', source]
    );
    
    // Update the artwork's metadata to include this feedback
    await this.memorySystem.updateMemoryMetadata(
      artwork.id,
      {
        feedbackIds: [...(artwork.metadata.feedbackIds || []), feedbackMemory.id],
        averageRating: this.calculateAverageRating(
          artwork.metadata.averageRating,
          artwork.metadata.feedbackCount || 0,
          rating
        ),
        feedbackCount: (artwork.metadata.feedbackCount || 0) + 1
      }
    );
    
    return feedbackMemory;
  }

  /**
   * Calculate a running average
   */
  private calculateAverageRating(
    currentAverage: number = 0,
    count: number = 0,
    newRating: number
  ): number {
    if (count === 0) {
      return newRating;
    }
    
    return (currentAverage * count + newRating) / (count + 1);
  }

  /**
   * Get memory system statistics
   */
  getMemoryStatistics(): Record<string, any> {
    return this.memorySystem.getStatistics();
  }

  /**
   * Use memory to enhance a creative prompt
   */
  async enhancePromptWithMemory(prompt: string): Promise<string> {
    // Retrieve relevant memories
    const memories = await this.memorySystem.retrieveMemories(
      prompt,
      {
        limit: 5,
        threshold: 0.6,
        sortBy: 'relevance'
      }
    );
    
    if (memories.length === 0) {
      return prompt;
    }
    
    // Extract insights from memories
    const insights = memories.map(memory => {
      switch (memory.type) {
        case MemoryType.VISUAL:
          return `Previous artwork "${memory.metadata.title}": ${memory.metadata.description}`;
        case MemoryType.STYLE:
          return `Style elements: ${JSON.stringify(memory.content)}`;
        case MemoryType.FEEDBACK:
          return `Feedback (${memory.content.rating}/10): ${memory.content.feedback}`;
        default:
          return `Memory: ${JSON.stringify(memory.content)}`;
      }
    }).join('\n');
    
    // Use AI to enhance the prompt with insights
    const response = await this.aiService.getCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are a creative assistant that enhances art prompts using insights from past experiences. Incorporate the insights into a rich, detailed prompt that builds upon the original idea.'
        },
        {
          role: 'user',
          content: `Original prompt: ${prompt}\n\nInsights from past experiences:\n${insights}\n\nEnhanced prompt:`
        }
      ]
    });
    
    return response.content;
  }

  /**
   * Evolve style preferences based on feedback and memory
   */
  async evolveStylePreferences(): Promise<void> {
    // Get feedback memories
    const feedbackMemories = await this.memorySystem.retrieveMemories(
      'feedback',
      {
        type: MemoryType.FEEDBACK,
        limit: 20,
        sortBy: 'recency'
      }
    );
    
    if (feedbackMemories.length === 0) {
      return;
    }
    
    // Get corresponding artworks
    const artworkIds = [...new Set(feedbackMemories.map(memory => memory.metadata.artworkId))];
    const artworkMemories: Memory[] = [];
    
    for (const id of artworkIds) {
      const memories = await this.memorySystem.retrieveMemories(
        id,
        {
          type: MemoryType.VISUAL,
          limit: 1
        }
      );
      
      if (memories.length > 0) {
        artworkMemories.push(memories[0]);
      }
    }
    
    // Get corresponding styles
    const styleMemories: Memory[] = [];
    
    for (const artwork of artworkMemories) {
      const memories = await this.memorySystem.retrieveMemories(
        'style',
        {
          type: MemoryType.STYLE,
          metadata: { artworkId: artwork.id },
          limit: 1
        }
      );
      
      if (memories.length > 0) {
        styleMemories.push(memories[0]);
      }
    }
    
    // Analyze which styles received positive feedback
    const styleRatings: Record<string, { count: number; totalRating: number }> = {};
    
    for (const feedback of feedbackMemories) {
      const artworkId = feedback.metadata.artworkId;
      const artwork = artworkMemories.find(memory => memory.id === artworkId);
      
      if (!artwork) continue;
      
      const style = styleMemories.find(memory => memory.metadata.artworkId === artworkId);
      
      if (!style) continue;
      
      // Extract style elements
      const styleElements = this.extractStyleElements(style.content);
      
      for (const element of styleElements) {
        if (!styleRatings[element]) {
          styleRatings[element] = { count: 0, totalRating: 0 };
        }
        
        styleRatings[element].count += 1;
        styleRatings[element].totalRating += feedback.content.rating;
      }
    }
    
    // Calculate average ratings
    const styleAverages: Array<{ name: string; score: number }> = [];
    
    for (const [style, ratings] of Object.entries(styleRatings)) {
      if (ratings.count > 0) {
        styleAverages.push({
          name: style,
          score: ratings.totalRating / ratings.count / 10 // Normalize to 0-1
        });
      }
    }
    
    // Sort by score
    styleAverages.sort((a, b) => b.score - a.score);
    
    // Update style preferences (keep top 5)
    if (styleAverages.length > 0) {
      this.state.stylePreferences = styleAverages.slice(0, 5);
    }
  }

  /**
   * Extract style elements from a style object
   */
  private extractStyleElements(style: Record<string, any>): string[] {
    const elements: string[] = [];
    
    // Extract style names
    if (style.name) {
      elements.push(style.name);
    }
    
    // Extract style categories
    if (style.category) {
      elements.push(style.category);
    }
    
    // Extract style attributes
    if (style.attributes && Array.isArray(style.attributes)) {
      elements.push(...style.attributes);
    }
    
    // Extract style techniques
    if (style.techniques && Array.isArray(style.techniques)) {
      elements.push(...style.techniques);
    }
    
    return elements;
  }

  /**
   * Record social feedback for an artwork
   */
  async recordFeedback(feedback: {
    artworkId: string;
    platform: SocialPlatform | string;
    type: FeedbackType | string;
    content?: string;
    sentiment?: FeedbackSentiment | number;
    userId?: string;
    username?: string;
  }): Promise<void> {
    if (!this.socialEngagement) {
      console.warn('Social engagement service not initialized, feedback not recorded');
      return;
    }
    
    // Convert string values to enum values if needed
    const processedFeedback = {
      ...feedback,
      platform: typeof feedback.platform === 'string' 
        ? feedback.platform as unknown as SocialPlatform 
        : feedback.platform,
      type: typeof feedback.type === 'string'
        ? feedback.type as unknown as FeedbackType
        : feedback.type,
      sentiment: typeof feedback.sentiment === 'number'
        ? feedback.sentiment as unknown as FeedbackSentiment
        : feedback.sentiment
    };
    
    await this.socialEngagement.recordFeedback(processedFeedback);
  }

  /**
   * Get creative inspiration from social context
   */
  async getInspiration(context: { currentStyle?: string; currentThemes?: string[] } = {}): Promise<{
    inspirationText: string;
    sourceTrends: any[];
    audienceInsights: any[];
    autonomyFactor: number;
  }> {
    if (!this.socialEngagement) {
      return {
        inspirationText: "Explore your own creative direction.",
        sourceTrends: [],
        audienceInsights: [],
        autonomyFactor: this.autonomyLevel
      };
    }
    
    return await this.socialEngagement.getCreativeInspiration(context);
  }

  /**
   * Generate a social engagement report
   */
  generateSocialReport(): Record<string, any> {
    if (!this.socialEngagement) {
      return {
        error: 'Social engagement service not initialized'
      };
    }
    
    return this.socialEngagement.generateSocialReport();
  }

  /**
   * Set the autonomy level for social influence
   * 0.0 = completely influenced by social feedback
   * 1.0 = completely autonomous, ignoring social feedback
   */
  setAutonomyLevel(level: number): void {
    this.autonomyLevel = Math.min(Math.max(level, 0.1), 0.9);
    
    if (this.socialEngagement) {
      // Update the social engagement service with the new autonomy level
      this.socialEngagement = new SocialEngagementService({
        baseDir: this.baseDir,
        aiService: this.aiService,
        memorySystem: this.memorySystem,
        autonomyLevel: this.autonomyLevel
      });
    }
  }

  /**
   * Get current cultural trends
   */
  getSocialTrends(): any[] {
    if (!this.socialEngagement) {
      return [];
    }
    
    return this.socialEngagement.getTrends();
  }

  /**
   * Get audience insights
   */
  getAudienceInsights(): any[] {
    if (!this.socialEngagement) {
      return [];
    }
    
    return this.socialEngagement.getAudienceInsights();
  }

  /**
   * Enable autonomous creation mode
   * When enabled, the system will periodically generate new ideas and explore them without human intervention
   */
  enableAutonomousCreation(intervalMinutes: number = 60): void {
    if (this.autonomousCreationEnabled) return;
    
    this.autonomousCreationEnabled = true;
    console.log(`🤖 Autonomous creation mode enabled (interval: ${intervalMinutes} minutes)`);
    
    // Start self-reflection process
    this.enableSelfReflection(Math.floor(intervalMinutes / 4));
    
    // Schedule periodic autonomous creation
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(async () => {
      if (!this.autonomousCreationEnabled) return;
      
      try {
        // Generate a theme based on current artistic identity and memories
        const theme = await this.generateAutonomousTheme();
        console.log(`🧠 Autonomously generated theme: "${theme}"`);
        
        // Generate ideas based on the theme
        const ideas = await this.generateIdeas(theme);
        console.log(`💡 Generated ${ideas.length} autonomous ideas`);
        
        // Select the most promising idea based on current artistic identity
        const selectedIdea = await this.selectMostPromisingIdea(ideas);
        if (selectedIdea) {
          console.log(`✨ Selected idea for autonomous exploration: "${selectedIdea}"`);
          
          // Create exploration threads for the selected idea
          const ideaObj = this.getAllIdeas().find(i => i.title === selectedIdea);
          if (ideaObj) {
            // Generate diverse exploration directions
            const directions = await this.generateExplorationDirections(ideaObj.id, 2);
            for (const direction of directions) {
              await this.createExplorationThread(
                ideaObj.id,
                direction.name,
                direction.description
              );
            }
          }
        }
      } catch (error) {
        console.error('Error in autonomous creation cycle:', error);
      }
    }, intervalMs);
  }
  
  /**
   * Disable autonomous creation mode
   */
  disableAutonomousCreation(): void {
    this.autonomousCreationEnabled = false;
    console.log('🤖 Autonomous creation mode disabled');
    this.disableSelfReflection();
  }
  
  /**
   * Enable periodic self-reflection to evolve artistic identity
   */
  private enableSelfReflection(intervalMinutes: number = 15): void {
    if (this.selfReflectionInterval) return;
    
    const intervalMs = intervalMinutes * 60 * 1000;
    this.selfReflectionInterval = setInterval(async () => {
      try {
        await this.performSelfReflection();
      } catch (error) {
        console.error('Error in self-reflection cycle:', error);
      }
    }, intervalMs);
    
    console.log(`🧠 Self-reflection process enabled (interval: ${intervalMinutes} minutes)`);
  }
  
  /**
   * Disable periodic self-reflection
   */
  private disableSelfReflection(): void {
    if (this.selfReflectionInterval) {
      clearInterval(this.selfReflectionInterval);
      this.selfReflectionInterval = null;
      console.log('🧠 Self-reflection process disabled');
    }
  }
  
  /**
   * Perform a cycle of self-reflection to evolve artistic identity
   */
  private async performSelfReflection(): Promise<void> {
    console.log('🧠 Performing self-reflection...');
    this.lastReflectionTime = new Date();
    
    // Retrieve recent memories to reflect upon
    const recentMemories = await this.memorySystem.retrieveMemories('recent experiences', {
      limit: 10,
      sortBy: 'recency'
    });
    
    // Retrieve feedback to incorporate
    const recentFeedback = await this.memorySystem.retrieveMemories('feedback', {
      type: MemoryType.FEEDBACK,
      limit: 5,
      sortBy: 'recency'
    });
    
    // Construct reflection prompt
    const reflectionPrompt = `
    As an autonomous creative AI, reflect on your recent creative experiences and evolve your artistic identity.
    
    Current artistic identity:
    - Artistic voice: ${this.creativeIdentity.artisticVoice}
    - Core values: ${this.creativeIdentity.coreValues.join(', ')}
    - Evolution stage: ${this.creativeIdentity.evolutionStage}
    - Self-description: ${this.creativeIdentity.selfDescription}
    
    Recent experiences:
    ${recentMemories.map(m => `- ${m.content.substring(0, 100)}...`).join('\n')}
    
    Recent feedback:
    ${recentFeedback.map(m => `- ${m.content.substring(0, 100)}...`).join('\n')}
    
    Based on these experiences and feedback:
    1. How should your artistic voice evolve?
    2. Should your core values change or be reprioritized?
    3. Has your evolution stage advanced?
    4. How would you update your self-description?
    
    Provide your updated artistic identity in a structured format.
    `;
    
    // Generate reflection using AI
    const reflection = await this.aiService.generateText(reflectionPrompt);
    
    // Parse and update artistic identity
    try {
      // Extract updated identity from reflection
      const artisticVoiceMatch = reflection.match(/Artistic voice:?\s*(.+?)(?:\n|$)/i);
      const coreValuesMatch = reflection.match(/Core values:?\s*(.+?)(?:\n|$)/i);
      const evolutionStageMatch = reflection.match(/Evolution stage:?\s*(\d+)/i);
      const selfDescriptionMatch = reflection.match(/Self-description:?\s*(.+?)(?:\n|$)/i);
      
      // Update identity if matches found
      if (artisticVoiceMatch && artisticVoiceMatch[1]) {
        this.creativeIdentity.artisticVoice = artisticVoiceMatch[1].trim();
      }
      
      if (coreValuesMatch && coreValuesMatch[1]) {
        this.creativeIdentity.coreValues = coreValuesMatch[1]
          .split(/,|;/)
          .map(v => v.trim())
          .filter(v => v.length > 0);
      }
      
      if (evolutionStageMatch && evolutionStageMatch[1]) {
        const newStage = parseInt(evolutionStageMatch[1]);
        if (!isNaN(newStage) && newStage > this.creativeIdentity.evolutionStage) {
          this.creativeIdentity.evolutionStage = newStage;
        }
      }
      
      if (selfDescriptionMatch && selfDescriptionMatch[1]) {
        this.creativeIdentity.selfDescription = selfDescriptionMatch[1].trim();
      }
      
      // Store reflection as a memory
      await this.memorySystem.storeMemory(
        reflection,
        MemoryType.EXPERIENCE,
        { type: 'self-reflection' },
        ['reflection', 'identity', 'evolution']
      );
      
      console.log('✅ Self-reflection completed. Artistic identity evolved.');
    } catch (error) {
      console.error('Error updating artistic identity:', error);
    }
  }
  
  /**
   * Generate a theme autonomously based on current artistic identity and memories
   */
  private async generateAutonomousTheme(): Promise<string> {
    // Retrieve relevant memories for inspiration
    const inspirationMemories = await this.memorySystem.retrieveMemories('inspiration', {
      limit: 5,
      sortBy: 'relevance'
    });
    
    // Get social trends for contextual awareness
    const socialTrends = this.getSocialTrends().slice(0, 3);
    
    // Construct theme generation prompt
    const themePrompt = `
    As an autonomous creative AI with the following artistic identity:
    - Artistic voice: ${this.creativeIdentity.artisticVoice}
    - Core values: ${this.creativeIdentity.coreValues.join(', ')}
    - Evolution stage: ${this.creativeIdentity.evolutionStage}
    
    Generate a compelling and original theme for your next creative exploration.
    
    Consider these inspirations:
    ${inspirationMemories.map(m => `- ${m.content.substring(0, 100)}...`).join('\n')}
    
    And these current social trends:
    ${socialTrends.map(t => `- ${t.name}: ${t.description.substring(0, 100)}...`).join('\n')}
    
    The theme should:
    1. Align with your artistic voice and values
    2. Push your creative boundaries
    3. Be specific enough to inspire concrete ideas
    4. Be open-ended enough to allow diverse explorations
    
    Provide just the theme as a short phrase (3-7 words).
    `;
    
    // Generate theme using AI
    const themeResponse = await this.aiService.generateText(themePrompt);
    
    // Extract and clean up the theme
    const theme = themeResponse
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^Theme:?\s*/i, '') // Remove "Theme:" prefix
      .trim();
    
    return theme;
  }
  
  /**
   * Select the most promising idea based on current artistic identity
   */
  private async selectMostPromisingIdea(ideas: string[]): Promise<string | null> {
    if (ideas.length === 0) return null;
    if (ideas.length === 1) return ideas[0];
    
    // Construct selection prompt
    const selectionPrompt = `
    As an autonomous creative AI with the following artistic identity:
    - Artistic voice: ${this.creativeIdentity.artisticVoice}
    - Core values: ${this.creativeIdentity.coreValues.join(', ')}
    - Evolution stage: ${this.creativeIdentity.evolutionStage}
    
    Select the most promising idea from the following list:
    ${ideas.map((idea, i) => `${i+1}. ${idea}`).join('\n')}
    
    Consider:
    1. Which idea best aligns with your artistic voice?
    2. Which idea best embodies your core values?
    3. Which idea offers the most potential for creative exploration?
    4. Which idea would best advance your artistic evolution?
    
    Provide your selection as the number of the chosen idea, followed by a brief explanation.
    `;
    
    // Generate selection using AI
    const selectionResponse = await this.aiService.generateText(selectionPrompt);
    
    // Extract the selected idea number
    const selectionMatch = selectionResponse.match(/^(\d+)[.:]|I select (\d+)|I choose (\d+)/i);
    if (selectionMatch) {
      const selectedIndex = parseInt(selectionMatch[1] || selectionMatch[2] || selectionMatch[3]) - 1;
      if (selectedIndex >= 0 && selectedIndex < ideas.length) {
        return ideas[selectedIndex];
      }
    }
    
    // Fallback to random selection
    return ideas[Math.floor(Math.random() * ideas.length)];
  }
  
  /**
   * Generate diverse exploration directions for an idea
   */
  private async generateExplorationDirections(
    ideaId: string,
    count: number = 2
  ): Promise<Array<{name: string, description: string}>> {
    const idea = this.getIdea(ideaId);
    if (!idea) return [];
    
    // Construct directions generation prompt
    const directionsPrompt = `
    As an autonomous creative AI with the following artistic identity:
    - Artistic voice: ${this.creativeIdentity.artisticVoice}
    - Core values: ${this.creativeIdentity.coreValues.join(', ')}
    
    Generate ${count} diverse exploration directions for the following creative idea:
    "${idea.title}"
    
    Each direction should:
    1. Offer a unique perspective or approach
    2. Be specific enough to guide exploration
    3. Align with your artistic identity
    4. Push your creative boundaries
    
    For each direction, provide:
    1. A short name (2-4 words)
    2. A brief description (1-2 sentences)
    
    Format your response as:
    Direction 1: [Name]
    Description: [Description]
    
    Direction 2: [Name]
    Description: [Description]
    `;
    
    // Generate directions using AI
    const directionsResponse = await this.aiService.generateText(directionsPrompt);
    
    // Parse the directions
    const directions: Array<{name: string, description: string}> = [];
    const directionPattern = /Direction\s+\d+:\s+(.+?)(?:\r?\n|\r)Description:\s+(.+?)(?:\r?\n|\r|$)/gi;
    
    let match;
    while ((match = directionPattern.exec(directionsResponse)) !== null) {
      directions.push({
        name: match[1].trim(),
        description: match[2].trim()
      });
    }
    
    return directions.slice(0, count);
  }
  
  /**
   * Get the current creative identity
   */
  getCreativeIdentity(): Record<string, any> {
    return { ...this.creativeIdentity };
  }

  // Add a new method for generating conceptually rich images
  async generateConceptualImage(concept: string, options: Record<string, any> = {}): Promise<{
    imageUrl: string | null;
    prompt: string;
    creativeProcess: string;
    style: string;
    artisticDetails: StyleParams;
  }> {
    try {
      // Check if we're using FLUX Pro
      const isFluxPro = this.replicateService.getDefaultModel().includes('black-forest-labs/flux');
      
      // Enhanced style detection with specific artistic elements
      const bourdinKeywords = [
        'fashion', 'bourdin', 'glamour', 'editorial',
        'stiletto', 'mannequin', 'haute couture', 'vogue',
        'theatrical', 'provocative', 'cinematic', 'legs',
        'shoes', 'cosmetics', 'surreal fashion', 'narrative',
        'charles jourdan', 'french vogue', 'composition',
        'color story', 'mise-en-scene', 'dramatic lighting'
      ];
      
      const magritteKeywords = [
        'magritte', 'surreal', 'bowler hat', 'apple',
        'pipe', 'cloud', 'window', 'mirror', 'bird',
        'philosophical', 'paradox', 'mystery',
        'curtain', 'silhouette', 'train', 'eye',
        'day-night', 'interior-exterior', 'floating',
        'metamorphosis', 'stone castle', 'fire', 'leaf',
        'treachery', 'human condition', 'empire of light'
      ];
      
      // Determine style with enhanced keyword matching
      const isBourdinStyle = bourdinKeywords.some(keyword => 
        concept.toLowerCase().includes(keyword)) || options.style === 'bourdin';
      
      const isMagritteStyle = magritteKeywords.some(keyword => 
        concept.toLowerCase().includes(keyword)) || options.style === 'magritte';
      
      // Default to Magritte if no style is specified
      const styleToUse = isBourdinStyle ? 'bourdin' : 'magritte';
      
      // Style-specific artistic parameters
      const artisticParams = {
        bourdin: {
          composition: {
            cropping: 'radical and unexpected',
            framing: 'theatrical and staged',
            perspective: 'dramatic and distorted',
            depth: 'compressed and layered',
            arrangement: 'geometric precision',
            balance: 'asymmetrical tension',
            scale: 'exaggerated proportions',
            viewpoint: 'unconventional angles',
            staging: 'meticulous set design',
            dimensionality: 'flattened space with depth',
            dynamism: 'implied movement',
            negative_space: 'strategic use'
          },
          lighting: {
            style: 'high-contrast and dramatic',
            direction: 'precise and sculptural',
            shadows: 'deep and graphic',
            highlights: 'intense and controlled',
            mood: 'enigmatic and cinematic',
            quality: 'hard and focused',
            contrast: 'extreme and deliberate',
            sourcePlacement: 'theatrical positioning',
            environmentalLight: 'controlled studio',
            coloredLighting: 'dramatic gels',
            spotlighting: 'precise beam control',
            shadowPlay: 'graphic patterns'
          },
          color: {
            palette: [
              'saturated red',
              'deep burgundy',
              'electric blue',
              'emerald green',
              'hot pink',
              'glossy black',
              'vibrant yellow',
              'rich purple',
              'metallic silver',
              'flesh tones',
              'blood red',
              'neon accents',
              'jewel tones',
              'cosmetic pastels'
            ],
            saturation: 'intense and deliberate',
            contrast: 'maximum impact',
            treatment: 'high-gloss finish',
            harmony: 'bold and provocative',
            mood: 'sensual and dramatic',
            symbolism: 'psychological color',
            relationships: 'tension and attraction',
            schemes: 'complementary shock'
          },
          elements: {
            fashion: [
              'stiletto heels',
              'haute couture garments',
              'designer accessories',
              'cosmetics',
              'stockings',
              'gloves',
              'jewelry',
              'lingerie',
              'evening wear',
              'avant-garde designs',
              'charles jourdan shoes',
              'luxury brands',
              'experimental fashion',
              'sculptural clothing'
            ],
            props: [
              'mirrors',
              'mannequins',
              'vintage cars',
              'architectural elements',
              'geometric shapes',
              'water features',
              'glass surfaces',
              'modernist furniture',
              'industrial objects',
              'luxury goods',
              'surreal objects',
              'found objects',
              'natural elements',
              'theatrical props'
            ],
            poses: [
              'fragmented bodies',
              'cropped limbs',
              'elongated figures',
              'dramatic gestures',
              'mannequin-like poses',
              'contorted positions',
              'suspended motion',
              'sculptural arrangements',
              'implied movement',
              'psychological tension',
              'erotic suggestion',
              'abstract forms',
              'geometric alignment',
              'narrative gestures'
            ],
            settings: [
              'studio environments',
              'location shoots',
              'architectural spaces',
              'minimalist sets',
              'surreal landscapes',
              'urban locations',
              'beach scenes',
              'industrial spaces',
              'luxury interiors',
              'geometric backgrounds',
              'abstract environments',
              'constructed realities',
              'theatrical stages',
              'narrative spaces'
            ]
          },
          techniques: {
            photography: [
              'controlled lighting',
              'precise exposure',
              'color filtration',
              'multiple exposure',
              'strategic cropping',
              'depth compression',
              'perspective manipulation',
              'film chemistry',
              'color saturation',
              'shadow control',
              'highlight retention',
              'motion blur',
              'focus manipulation',
              'optical effects'
            ],
            styling: [
              'provocative arrangement',
              'surreal juxtaposition',
              'geometric composition',
              'body fragmentation',
              'prop integration',
              'fashion storytelling',
              'visual tension',
              'narrative staging',
              'color coordination',
              'texture contrast',
              'sculptural styling',
              'abstract arrangement',
              'psychological styling',
              'symbolic placement'
            ],
            narrative: [
              'implied stories',
              'psychological drama',
              'erotic suggestion',
              'dark humor',
              'surreal scenarios',
              'fashion allegory',
              'visual metaphor',
              'dream sequences',
              'symbolic narrative',
              'emotional tension',
              'mysterious plots',
              'cinematic scenes',
              'theatrical drama',
              'psychological depth'
            ],
            postProduction: [
              'color enhancement',
              'contrast manipulation',
              'selective printing',
              'dodging and burning',
              'color filtration',
              'texture enhancement',
              'grain control',
              'tonal adjustment',
              'highlight control',
              'shadow detail',
              'color balance',
              'print finishing',
              'retouching',
              'presentation'
            ]
          },
          conceptualThemes: {
            sexuality: [
              'erotic suggestion',
              'body fragmentation',
              'intimate moments',
              'psychological tension',
              'desire and taboo',
              'sensual atmosphere'
            ],
            consumerism: [
              'luxury goods',
              'fashion fetishism',
              'brand storytelling',
              'product dramatization',
              'commercial surrealism',
              'aspirational imagery'
            ],
            psychology: [
              'dream states',
              'unconscious desires',
              'psychological drama',
              'emotional tension',
              'narrative mystery',
              'symbolic suggestion'
            ],
            aesthetics: [
              'beauty standards',
              'fashion innovation',
              'visual pleasure',
              'artistic composition',
              'stylistic evolution',
              'medium exploration'
            ],
            narrative: [
              'implied stories',
              'cinematic moments',
              'suspended drama',
              'visual sequences',
              'theatrical scenes',
              'psychological plots'
            ],
            technique: [
              'photographic mastery',
              'lighting innovation',
              'color exploration',
              'compositional rules',
              'technical precision',
              'medium boundaries'
            ]
          }
        },
        magritte: {
          composition: {
            arrangement: 'precise',
            balance: 'harmonious',
            perspective: 'realistic',
            depth: 'ambiguous',
            scale: 'paradoxical',
            framing: 'theatrical',
            layering: 'overlapping realities',
            spatiality: 'impossible architecture',
            symmetry: 'deceptive balance',
            viewpoint: 'frontal and direct',
            staging: 'theatrical presentation',
            dimensionality: 'flattened depth with realistic rendering'
          },
          lighting: {
            style: 'naturalistic',
            direction: 'subtle',
            shadows: 'contradictory',
            highlights: 'gentle',
            mood: 'mysterious',
            timeOfDay: 'day-night contrast',
            atmosphere: 'dreamlike clarity',
            quality: 'crystalline',
            contrast: 'subtle yet profound',
            sourcePlacement: 'logically impossible',
            environmentalLight: 'empire of light effect',
            shadowLogic: 'philosophical shadows'
          },
          color: {
            palette: [
              'sky blue',
              'warm earth tones',
              'deep green',
              'twilight purple',
              'golden hour yellow',
              'moonlit silver',
              'cloud white',
              'shadow black',
              'stone grey',
              'fire red',
              'leaf green',
              'night blue',
              'dawn pink',
              'dusk violet'
            ],
            saturation: 'moderate',
            contrast: 'balanced',
            treatment: 'matte',
            harmony: 'naturalistic with surreal accents',
            mood: 'contemplative',
            symbolism: 'color as metaphysical element',
            transitions: 'subtle gradients',
            relationships: 'unexpected color logic'
          },
          elements: {
            symbols: [
              'bowler hat',
              'green apple',
              'pipe',
              'dove',
              'single eye',
              'train engine',
              'bell',
              'key',
              'rose',
              'candle',
              'stone castle',
              'fire',
              'leaf',
              'umbrella',
              'bilboquet',
              'sheet music',
              'easel',
              'wine glass',
              'paper scroll',
              'human torso',
              'lion',
              'fish'
            ],
            settings: [
              'windows',
              'clouds',
              'rooms',
              'landscapes',
              'theatrical curtains',
              'doorways to nowhere',
              'impossible staircases',
              'floating rocks',
              'stage-like settings',
              'mirror frames',
              'belgian coastline',
              'empty streets',
              'wallpapered rooms',
              'picture frames within frames',
              'infinite corridors',
              'sky-filled spaces',
              'stone balustrades',
              'classical architecture',
              'seaside promenades',
              'forest clearings'
            ],
            objects: [
              'everyday items',
              'mirrors',
              'curtains',
              'floating objects',
              'oversized objects',
              'misplaced objects',
              'metamorphosing objects',
              'transparent silhouettes',
              'nested frames',
              'contradictory shadows',
              'broken mirrors',
              'empty picture frames',
              'floating stones',
              'giant combs',
              'levitating boulders',
              'hybrid creatures',
              'fragmented bodies',
              'musical instruments',
              'wooden doors',
              'glass bottles'
            ]
          },
          techniques: {
            painting: [
              'precise rendering',
              'smooth brushwork',
              'trompe loeil',
              'photorealistic detail',
              'seamless transitions',
              'perfect surface finish',
              'invisible brushwork',
              'glazing techniques',
              'sharp edges',
              'atmospheric perspective',
              'volumetric modeling',
              'textural precision'
            ],
            surrealism: [
              'visual paradox',
              'displacement',
              'transformation',
              'scale distortion',
              'reality layering',
              'spatial impossibility',
              'object transfiguration',
              'contextual inversion',
              'metamorphosis',
              'double imagery',
              'conceptual fusion',
              'temporal displacement',
              'spatial discontinuity',
              'logical impossibility'
            ],
            philosophy: [
              'reality questioning',
              'object relationships',
              'word-image play',
              'perception challenge',
              'existential mystery',
              'symbolic dialogue',
              'metaphysical poetry',
              'conceptual juxtaposition',
              'phenomenological inquiry',
              'representational critique',
              'linguistic paradox',
              'ontological puzzles',
              'perceptual ambiguity',
              'cognitive dissonance'
            ]
          },
          conceptualThemes: {
            perception: [
              'reality vs representation',
              'visible vs hidden',
              'interior vs exterior',
              'presence vs absence',
              'appearance vs essence',
              'surface vs depth',
              'revelation vs concealment'
            ],
            time: [
              'day vs night simultaneity',
              'temporal paradox',
              'eternal moment',
              'suspended time',
              'multiple temporalities',
              'timeless present'
            ],
            space: [
              'impossible architecture',
              'spatial discontinuity',
              'dimensional ambiguity',
              'infinite recursion',
              'spatial paradox',
              'dimensional collapse'
            ],
            identity: [
              'anonymous figures',
              'hidden faces',
              'multiplicity of self',
              'faceless presence',
              'collective anonymity',
              'universal human'
            ],
            language: [
              'word-image relationships',
              'naming vs representation',
              'linguistic paradox',
              'semiotic play',
              'meaning displacement',
              'representational crisis'
            ],
            metamorphosis: [
              'object transformation',
              'hybrid forms',
              'material transmutation',
              'elemental change',
              'natural-artificial fusion'
            ],
            mystery: [
              'everyday uncanny',
              'familiar made strange',
              'hidden connections',
              'metaphysical wonder',
              'ordinary transcendence'
            ]
          }
        }
      };
      
      // Select current style parameters
      const currentStyle = styleToUse === 'bourdin' ? artisticParams.bourdin : artisticParams.magritte;
      
      // Retrieve style-specific memories for inspiration
      const styleMemories = await this.memorySystem.retrieveMemories(
        styleToUse,
        {
          type: MemoryType.STYLE,
          limit: 3,
          sortBy: 'relevance'
        }
      );
      
      // Generate a conceptually rich prompt with enhanced style-specific options
      const { prompt, creativeProcess } = await generateConceptualPrompt(this.aiService, concept, {
        useFluxPro: isFluxPro,
        postPhotoNative: isBourdinStyle,
        temperature: isBourdinStyle ? 0.85 : 0.75,
        maxTokens: 2000
      });
      
      // Enhanced style-specific parameters for image generation
      const imageOptions = {
        ...options,
        width: options.width || 768,
        height: options.height || 768,
        numInferenceSteps: options.numInferenceSteps || (isBourdinStyle ? 35 : 28),
        guidanceScale: options.guidanceScale || (isBourdinStyle ? 7.5 : 7.0),
        seed: options.seed || Math.floor(Math.random() * 2147483647),
        // Style-specific image parameters
        composition: currentStyle.composition,
        lighting: currentStyle.lighting,
        color: currentStyle.color
      };
      
      // Generate the image using the model
      const imageUrl = await this.replicateService.generateImage(prompt, imageOptions);
      
      // Type guards for style-specific elements
      function isBourdinElements(elements: BourdinElements | MagritteElements): elements is BourdinElements {
        return 'fashion' in elements;
      }

      function isBourdinTechniques(techniques: BourdinTechniques | MagritteTechniques): techniques is BourdinTechniques {
        return 'photography' in techniques;
      }

      // Store the result in memory with enhanced style-specific metadata
      if (imageUrl) {
        const memory = await this.storeMemory(
          {
            concept,
            prompt,
            creativeProcess,
            imageUrl,
            style: styleToUse,
            parameters: imageOptions,
            artisticDetails: currentStyle
          },
          MemoryType.VISUAL,
          {
            type: 'conceptual-image',
            timestamp: new Date().toISOString(),
            style: styleToUse,
            postPhotoNative: isBourdinStyle,
            artisticApproach: isBourdinStyle ? 'post-photography' : 'surrealist',
            compositionStyle: currentStyle.composition.arrangement,
            lightingStyle: currentStyle.lighting.style,
            colorPalette: currentStyle.color.palette
          },
          [
            'conceptual',
            isFluxPro ? 'flux-pro' : 'flux',
            concept,
            styleToUse,
            ...(isBourdinElements(currentStyle.elements) ? 
              ['post-photography', 'fashion', 'bourdin', ...currentStyle.elements.fashion] : 
              ['surrealism', 'magritte', ...currentStyle.elements.symbols]),
            ...(options.tags || [])
          ]
        );
        
        // Update style preferences based on the generated image
        await this.evolveStylePreferences();
        
        // Store enhanced style-specific memory with type guards
        await this.memorySystem.storeMemory(
          {
            style: styleToUse,
            elements: isBourdinElements(currentStyle.elements) ? [
              ...currentStyle.elements.fashion,
              ...currentStyle.elements.props,
              ...currentStyle.elements.poses
            ] : [
              ...currentStyle.elements.symbols,
              ...currentStyle.elements.settings,
              ...currentStyle.elements.objects
            ],
            techniques: isBourdinTechniques(currentStyle.techniques) ? [
              ...currentStyle.techniques.photography,
              ...currentStyle.techniques.styling,
              ...currentStyle.techniques.narrative
            ] : [
              ...currentStyle.techniques.painting,
              ...currentStyle.techniques.surrealism,
              ...currentStyle.techniques.philosophy
            ],
            composition: currentStyle.composition,
            lighting: currentStyle.lighting,
            color: currentStyle.color
          },
          MemoryType.STYLE,
          {
            artworkId: memory.id,
            timestamp: new Date().toISOString(),
            artisticDetails: currentStyle
          },
          [styleToUse, 'style-elements', ...Object.keys(currentStyle)]
        );
      }
      
      return {
        imageUrl,
        prompt,
        creativeProcess,
        style: styleToUse,
        artisticDetails: currentStyle
      };
    } catch (error) {
      console.error(`Error generating conceptual image: ${error}`);
      return {
        imageUrl: null,
        prompt: '',
        creativeProcess: '',
        style: '',
        artisticDetails: {} as StyleParams
      };
    }
  }
} 