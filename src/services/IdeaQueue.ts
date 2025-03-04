import { v4 as uuidv4 } from 'uuid';
import { AIService, AIMessage } from './ai/index.js';

/**
 * Represents a creative idea in the queue
 */
export interface CreativeIdea {
  id: string;
  title: string;
  description: string;
  style: string;
  theme: string;
  priority: number;
  status: 'pending' | 'exploring' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
  explorationThreads: ExplorationThread[];
  tags: string[];
  inspirations: string[];
  feedback: Feedback[];
}

/**
 * Represents a thread of exploration for a creative idea
 */
export interface ExplorationThread {
  id: string;
  ideaId: string;
  direction: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  results: ThreadResult[];
}

/**
 * Represents a result from an exploration thread
 */
export interface ThreadResult {
  id: string;
  threadId: string;
  type: 'sketch' | 'concept' | 'style' | 'image';
  content: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

/**
 * Represents feedback on an idea
 */
export interface Feedback {
  id: string;
  content: string;
  rating: number;
  source: 'self' | 'user' | 'critic';
  createdAt: Date;
}

/**
 * Configuration for the IdeaQueue
 */
export interface IdeaQueueConfig {
  maxIdeas?: number;
  maxThreadsPerIdea?: number;
  maxActiveThreads?: number;
  aiService?: AIService;
}

/**
 * IdeaQueue manages a dynamic queue of creative ideas and their exploration threads
 */
export class IdeaQueue {
  private ideas: Map<string, CreativeIdea> = new Map();
  private threads: Map<string, ExplorationThread> = new Map();
  private activeThreads: Set<string> = new Set();
  private aiService: AIService;
  
  private maxIdeas: number;
  private maxThreadsPerIdea: number;
  private maxActiveThreads: number;

  constructor(config: IdeaQueueConfig = {}) {
    this.maxIdeas = config.maxIdeas || 50;
    this.maxThreadsPerIdea = config.maxThreadsPerIdea || 3;
    this.maxActiveThreads = config.maxActiveThreads || 5;
    this.aiService = config.aiService || new AIService();
  }

  /**
   * Initialize the idea queue
   */
  async initialize(): Promise<void> {
    if (!this.aiService) {
      this.aiService = new AIService();
    }
    await this.aiService.initialize();
  }

  /**
   * Add a new idea to the queue
   */
  async addIdea(
    title: string, 
    description: string, 
    style: string, 
    theme: string, 
    priority: number = 1,
    tags: string[] = [],
    inspirations: string[] = []
  ): Promise<CreativeIdea> {
    // Check if we've reached the maximum number of ideas
    if (this.ideas.size >= this.maxIdeas) {
      // Remove the lowest priority idea
      this.removeLowestPriorityIdea();
    }

    const id = uuidv4();
    const now = new Date();
    
    const idea: CreativeIdea = {
      id,
      title,
      description,
      style,
      theme,
      priority,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      explorationThreads: [],
      tags,
      inspirations,
      feedback: []
    };

    this.ideas.set(id, idea);
    
    // Automatically create an initial exploration thread
    await this.createExplorationThread(id, `Initial exploration of "${title}"`, 
      `Standard exploration of the idea: ${description}`);
    
    return idea;
  }

  /**
   * Create a new exploration thread for an idea
   */
  async createExplorationThread(
    ideaId: string, 
    direction: string, 
    description: string
  ): Promise<ExplorationThread | null> {
    const idea = this.ideas.get(ideaId);
    if (!idea) {
      console.error(`Idea with ID ${ideaId} not found`);
      return null;
    }

    // Check if we've reached the maximum number of threads for this idea
    if (idea.explorationThreads.length >= this.maxThreadsPerIdea) {
      console.warn(`Maximum number of threads (${this.maxThreadsPerIdea}) reached for idea ${ideaId}`);
      return null;
    }

    const threadId = uuidv4();
    const now = new Date();
    
    const thread: ExplorationThread = {
      id: threadId,
      ideaId,
      direction,
      description,
      status: 'active',
      progress: 0,
      createdAt: now,
      updatedAt: now,
      results: []
    };

    this.threads.set(threadId, thread);
    
    // Add the thread to the idea's exploration threads
    idea.explorationThreads.push(thread);
    idea.updatedAt = now;
    
    // If we have capacity, activate the thread
    if (this.activeThreads.size < this.maxActiveThreads) {
      this.activeThreads.add(threadId);
      // Start exploring this thread
      this.exploreThread(threadId).catch(err => {
        console.error(`Error exploring thread ${threadId}:`, err);
      });
    }
    
    return thread;
  }

  /**
   * Explore a thread by generating content for it
   */
  async exploreThread(threadId: string): Promise<void> {
    const thread = this.threads.get(threadId);
    if (!thread) {
      console.error(`Thread with ID ${threadId} not found`);
      return;
    }

    const idea = this.ideas.get(thread.ideaId);
    if (!idea) {
      console.error(`Idea with ID ${thread.ideaId} not found`);
      return;
    }

    // Update thread status
    thread.status = 'active';
    thread.updatedAt = new Date();

    try {
      // Generate a concept for this thread
      const conceptResult = await this.generateConcept(thread, idea);
      thread.results.push(conceptResult);
      thread.progress = 0.33;
      thread.updatedAt = new Date();

      // Generate a style for this thread
      const styleResult = await this.generateStyle(thread, idea, conceptResult);
      thread.results.push(styleResult);
      thread.progress = 0.66;
      thread.updatedAt = new Date();

      // In a real implementation, we would generate an image here
      // For now, we'll just create a mock result
      const imageResult: ThreadResult = {
        id: uuidv4(),
        threadId: thread.id,
        type: 'image',
        content: `Mock image URL for ${idea.title} - ${thread.direction}`,
        metadata: {
          width: 1024,
          height: 1024,
          format: 'jpg'
        },
        createdAt: new Date()
      };
      thread.results.push(imageResult);
      
      // Update thread status
      thread.status = 'completed';
      thread.progress = 1.0;
      thread.updatedAt = new Date();
      
      // Remove from active threads
      this.activeThreads.delete(threadId);
      
      // Activate next thread if available
      this.activateNextThread();
      
      console.log(`✅ Completed exploration thread: ${thread.direction}`);
    } catch (error) {
      console.error(`Error exploring thread ${threadId}:`, error);
      thread.status = 'abandoned';
      thread.updatedAt = new Date();
      this.activeThreads.delete(threadId);
      this.activateNextThread();
    }
  }

  /**
   * Generate a concept for a thread
   */
  private async generateConcept(thread: ExplorationThread, idea: CreativeIdea): Promise<ThreadResult> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are ArtBot, a creative AI assistant specialized in generating artistic concepts. Your responses should be concise, creative, and focused on visual art concepts.'
      },
      {
        role: 'user',
        content: `Generate a detailed concept for the following art idea:
        
Title: ${idea.title}
Description: ${idea.description}
Style: ${idea.style}
Theme: ${idea.theme}
Exploration Direction: ${thread.direction}

Your response should be a detailed concept description that can be used to create artwork.`
      }
    ];

    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });

      return {
        id: uuidv4(),
        threadId: thread.id,
        type: 'concept',
        content: response.content,
        metadata: {
          provider: response.provider,
          model: response.model
        },
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error generating concept:', error);
      return {
        id: uuidv4(),
        threadId: thread.id,
        type: 'concept',
        content: `Fallback concept for ${idea.title} - ${thread.direction}`,
        metadata: {
          error: String(error)
        },
        createdAt: new Date()
      };
    }
  }

  /**
   * Generate a style for a thread based on the concept
   */
  private async generateStyle(
    thread: ExplorationThread, 
    idea: CreativeIdea, 
    conceptResult: ThreadResult
  ): Promise<ThreadResult> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are ArtBot, a creative AI assistant specialized in generating artistic styles. Your responses should be concise, creative, and focused on visual art styles.'
      },
      {
        role: 'user',
        content: `Generate a detailed style guide for the following art concept:
        
Title: ${idea.title}
Base Style: ${idea.style}
Concept: ${conceptResult.content}

Your response should include:
1. Color palette
2. Textures and patterns
3. Composition approach
4. Visual references
5. Technical considerations`
      }
    ];

    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });

      return {
        id: uuidv4(),
        threadId: thread.id,
        type: 'style',
        content: response.content,
        metadata: {
          provider: response.provider,
          model: response.model
        },
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error generating style:', error);
      return {
        id: uuidv4(),
        threadId: thread.id,
        type: 'style',
        content: `Fallback style for ${idea.title} - ${thread.direction}`,
        metadata: {
          error: String(error)
        },
        createdAt: new Date()
      };
    }
  }

  /**
   * Activate the next thread in the queue
   */
  private activateNextThread(): void {
    // Find pending threads
    const pendingThreads = Array.from(this.threads.values())
      .filter(t => t.status === 'paused' || (t.status === 'active' && !this.activeThreads.has(t.id)))
      .sort((a, b) => {
        // Sort by idea priority first, then by thread creation date
        const ideaA = this.ideas.get(a.ideaId);
        const ideaB = this.ideas.get(b.ideaId);
        if (!ideaA || !ideaB) return 0;
        
        if (ideaA.priority !== ideaB.priority) {
          return ideaB.priority - ideaA.priority; // Higher priority first
        }
        
        return a.createdAt.getTime() - b.createdAt.getTime(); // Older threads first
      });
    
    if (pendingThreads.length > 0 && this.activeThreads.size < this.maxActiveThreads) {
      const nextThread = pendingThreads[0];
      this.activeThreads.add(nextThread.id);
      this.exploreThread(nextThread.id).catch(err => {
        console.error(`Error exploring thread ${nextThread.id}:`, err);
      });
    }
  }

  /**
   * Remove the lowest priority idea
   */
  private removeLowestPriorityIdea(): void {
    let lowestPriorityIdea: CreativeIdea | null = null;
    
    for (const idea of this.ideas.values()) {
      if (!lowestPriorityIdea || idea.priority < lowestPriorityIdea.priority) {
        lowestPriorityIdea = idea;
      }
    }
    
    if (lowestPriorityIdea) {
      // Remove all threads associated with this idea
      for (const thread of lowestPriorityIdea.explorationThreads) {
        this.threads.delete(thread.id);
        this.activeThreads.delete(thread.id);
      }
      
      // Remove the idea
      this.ideas.delete(lowestPriorityIdea.id);
      console.log(`Removed lowest priority idea: ${lowestPriorityIdea.title}`);
    }
  }

  /**
   * Get all ideas
   */
  getAllIdeas(): CreativeIdea[] {
    return Array.from(this.ideas.values());
  }

  /**
   * Get an idea by ID
   */
  getIdea(id: string): CreativeIdea | undefined {
    return this.ideas.get(id);
  }

  /**
   * Get all threads for an idea
   */
  getThreadsForIdea(ideaId: string): ExplorationThread[] {
    return Array.from(this.threads.values()).filter(t => t.ideaId === ideaId);
  }

  /**
   * Get a thread by ID
   */
  getThread(id: string): ExplorationThread | undefined {
    return this.threads.get(id);
  }

  /**
   * Get all active threads
   */
  getActiveThreads(): ExplorationThread[] {
    return Array.from(this.activeThreads).map(id => this.threads.get(id)).filter(Boolean) as ExplorationThread[];
  }

  /**
   * Add feedback to an idea
   */
  addFeedback(ideaId: string, content: string, rating: number, source: 'self' | 'user' | 'critic'): Feedback | null {
    const idea = this.ideas.get(ideaId);
    if (!idea) {
      console.error(`Idea with ID ${ideaId} not found`);
      return null;
    }

    const feedback: Feedback = {
      id: uuidv4(),
      content,
      rating,
      source,
      createdAt: new Date()
    };

    idea.feedback.push(feedback);
    idea.updatedAt = new Date();

    return feedback;
  }

  /**
   * Update idea priority
   */
  updateIdeaPriority(ideaId: string, priority: number): boolean {
    const idea = this.ideas.get(ideaId);
    if (!idea) {
      console.error(`Idea with ID ${ideaId} not found`);
      return false;
    }

    idea.priority = priority;
    idea.updatedAt = new Date();
    return true;
  }

  /**
   * Pause a thread
   */
  pauseThread(threadId: string): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) {
      console.error(`Thread with ID ${threadId} not found`);
      return false;
    }

    thread.status = 'paused';
    thread.updatedAt = new Date();
    this.activeThreads.delete(threadId);
    this.activateNextThread();
    return true;
  }

  /**
   * Resume a thread
   */
  resumeThread(threadId: string): boolean {
    const thread = this.threads.get(threadId);
    if (!thread) {
      console.error(`Thread with ID ${threadId} not found`);
      return false;
    }

    thread.status = 'active';
    thread.updatedAt = new Date();
    
    if (this.activeThreads.size < this.maxActiveThreads) {
      this.activeThreads.add(threadId);
      this.exploreThread(threadId).catch(err => {
        console.error(`Error exploring thread ${threadId}:`, err);
      });
      return true;
    } else {
      // Thread is marked as active but will be picked up later
      return false;
    }
  }

  /**
   * Get statistics about the idea queue
   */
  getStatistics(): Record<string, any> {
    return {
      totalIdeas: this.ideas.size,
      totalThreads: this.threads.size,
      activeThreads: this.activeThreads.size,
      ideasByStatus: {
        pending: Array.from(this.ideas.values()).filter(i => i.status === 'pending').length,
        exploring: Array.from(this.ideas.values()).filter(i => i.status === 'exploring').length,
        completed: Array.from(this.ideas.values()).filter(i => i.status === 'completed').length,
        abandoned: Array.from(this.ideas.values()).filter(i => i.status === 'abandoned').length
      },
      threadsByStatus: {
        active: Array.from(this.threads.values()).filter(t => t.status === 'active').length,
        paused: Array.from(this.threads.values()).filter(t => t.status === 'paused').length,
        completed: Array.from(this.threads.values()).filter(t => t.status === 'completed').length,
        abandoned: Array.from(this.threads.values()).filter(t => t.status === 'abandoned').length
      }
    };
  }
} 