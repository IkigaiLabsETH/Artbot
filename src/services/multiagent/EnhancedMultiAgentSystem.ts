import { v4 as uuidv4 } from 'uuid';
import { MultiAgentSystem, Agent, AgentRole, AgentMessage, AgentState } from './index.js';
import { AIService } from '../ai/index.js';
import { MemorySystem, MemoryType, Memory } from '../memory/index.js';
import { StyleService } from '../style/index.js';
import { ReplicateService } from '../replicate/index.js';
import { SocialEngagementService } from '../social/index.js';

/**
 * Interface for collaboration patterns between agents
 */
export enum CollaborationPattern {
  SEQUENTIAL = 'sequential',  // Agents work in a predefined sequence
  PARALLEL = 'parallel',      // Agents work simultaneously on different aspects
  ITERATIVE = 'iterative',    // Agents refine work through multiple iterations
  FEEDBACK = 'feedback',      // Agents provide feedback to each other
  CONSENSUS = 'consensus',    // Agents must reach agreement on decisions
  SPECIALIZATION = 'specialization', // Agents focus on their specialized areas
  EMERGENT = 'emergent'       // Collaboration pattern emerges dynamically
}

/**
 * Interface for collaboration session
 */
export interface CollaborationSession {
  id: string;
  title: string;
  description: string;
  pattern: CollaborationPattern;
  participants: AgentRole[];
  status: 'planning' | 'in-progress' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  artifacts: Array<{
    id: string;
    type: string;
    content: any;
    creator: AgentRole;
    timestamp: Date;
  }>;
  sharedContext: Record<string, any>;
  history: AgentMessage[];
  metrics: {
    messageCount: number;
    iterationCount: number;
    consensusRate: number;
    contributionBalance: Record<AgentRole, number>;
    collaborationScore: number;
  };
}

/**
 * Interface for agent feedback
 */
export interface AgentFeedback {
  id: string;
  fromAgent: AgentRole;
  toAgent: AgentRole;
  content: string;
  rating: number; // 1-10
  suggestions: string[];
  timestamp: Date;
}

/**
 * Enhanced multi-agent system with sophisticated collaboration capabilities
 */
export class EnhancedMultiAgentSystem extends MultiAgentSystem {
  private memorySystem: MemorySystem;
  private styleService: StyleService;
  private replicateService: ReplicateService;
  private socialService: SocialEngagementService;
  private collaborationSessions: Map<string, CollaborationSession> = new Map();
  private agentFeedback: AgentFeedback[] = [];
  private collaborationPatterns: Map<string, CollaborationPattern> = new Map();
  private sharedKnowledgeBase: Record<string, any> = {};
  private agentSpecializations: Map<AgentRole, string[]> = new Map();
  private agentPerformanceMetrics: Map<AgentRole, {
    taskCompletionRate: number;
    responseTime: number;
    feedbackScore: number;
    innovationScore: number;
  }> = new Map();

  constructor(config: {
    aiService?: AIService;
    memorySystem?: MemorySystem;
    styleService?: StyleService;
    replicateService?: ReplicateService;
    socialService?: SocialEngagementService;
  } = {}) {
    super({ aiService: config.aiService });
    
    // Initialize services
    this.memorySystem = config.memorySystem || new MemorySystem();
    this.styleService = config.styleService || new StyleService();
    this.replicateService = config.replicateService || new ReplicateService();
    this.socialService = config.socialService || new SocialEngagementService();
    
    // Initialize agent specializations
    this.initializeAgentSpecializations();
  }

  async initialize(): Promise<void> {
    await super.initialize();
    await this.memorySystem.initialize();
    await this.styleService.initialize();
    await this.replicateService.initialize();
    
    // Load previous collaboration patterns from memory
    await this.loadCollaborationPatternsFromMemory();
  }

  /**
   * Create a new collaboration session between agents
   */
  async createCollaborationSession(
    title: string,
    description: string,
    pattern: CollaborationPattern,
    participants: AgentRole[]
  ): Promise<CollaborationSession> {
    const session: CollaborationSession = {
      id: uuidv4(),
      title,
      description,
      pattern,
      participants,
      status: 'planning',
      startTime: new Date(),
      artifacts: [],
      sharedContext: {},
      history: [],
      metrics: {
        messageCount: 0,
        iterationCount: 0,
        consensusRate: 0,
        contributionBalance: this.initializeContributionBalance(participants),
        collaborationScore: 0
      }
    };
    
    this.collaborationSessions.set(session.id, session);
    
    // Store session in memory system
    await this.memorySystem.storeMemory(
      session,
      MemoryType.EXPERIENCE,
      { type: 'collaboration_session' },
      ['collaboration', pattern, ...participants]
    );
    
    // Notify participating agents
    await this.notifySessionParticipants(session);
    
    return session;
  }

  /**
   * Add an artifact to a collaboration session
   */
  async addSessionArtifact(
    sessionId: string,
    artifactType: string,
    content: any,
    creator: AgentRole
  ): Promise<void> {
    const session = this.collaborationSessions.get(sessionId);
    if (!session) {
      throw new Error(`Collaboration session ${sessionId} not found`);
    }
    
    const artifact = {
      id: uuidv4(),
      type: artifactType,
      content,
      creator,
      timestamp: new Date()
    };
    
    session.artifacts.push(artifact);
    
    // Update contribution balance
    session.metrics.contributionBalance[creator]++;
    
    // Store artifact in memory system
    await this.memorySystem.storeMemory(
      artifact,
      MemoryType.EXPERIENCE,
      { 
        type: 'collaboration_artifact',
        sessionId,
        creator
      },
      ['artifact', artifactType, creator]
    );
  }

  /**
   * Record feedback between agents
   */
  async recordAgentFeedback(
    fromAgent: AgentRole,
    toAgent: AgentRole,
    content: string,
    rating: number,
    suggestions: string[]
  ): Promise<AgentFeedback> {
    const feedback: AgentFeedback = {
      id: uuidv4(),
      fromAgent,
      toAgent,
      content,
      rating,
      suggestions,
      timestamp: new Date()
    };
    
    this.agentFeedback.push(feedback);
    
    // Update agent performance metrics
    const metrics = this.agentPerformanceMetrics.get(toAgent) || {
      taskCompletionRate: 0,
      responseTime: 0,
      feedbackScore: 0,
      innovationScore: 0
    };
    
    // Update feedback score (weighted average)
    metrics.feedbackScore = (metrics.feedbackScore * 0.7) + (rating / 10 * 0.3);
    this.agentPerformanceMetrics.set(toAgent, metrics);
    
    // Store feedback in memory system
    await this.memorySystem.storeMemory(
      feedback,
      MemoryType.FEEDBACK,
      { 
        type: 'agent_feedback',
        fromAgent,
        toAgent
      },
      ['feedback', fromAgent, toAgent]
    );
    
    return feedback;
  }

  /**
   * Get collaboration recommendations for a specific task
   */
  async getCollaborationRecommendations(
    task: string,
    context: Record<string, any>
  ): Promise<{
    pattern: CollaborationPattern;
    participants: AgentRole[];
    rationale: string;
  }> {
    // Retrieve relevant memories
    const memories = await this.memorySystem.retrieveMemories(
      task,
      {
        type: MemoryType.EXPERIENCE,
        tags: ['collaboration'],
        limit: 5
      }
    );
    
    // Analyze past collaboration patterns
    const patternCounts: Record<CollaborationPattern, number> = {
      [CollaborationPattern.SEQUENTIAL]: 0,
      [CollaborationPattern.PARALLEL]: 0,
      [CollaborationPattern.ITERATIVE]: 0,
      [CollaborationPattern.FEEDBACK]: 0,
      [CollaborationPattern.CONSENSUS]: 0,
      [CollaborationPattern.SPECIALIZATION]: 0,
      [CollaborationPattern.EMERGENT]: 0
    };
    
    memories.forEach(memory => {
      const session = memory.content as CollaborationSession;
      patternCounts[session.pattern]++;
    });
    
    // Determine best pattern based on past success
    let bestPattern = CollaborationPattern.SEQUENTIAL;
    let maxCount = 0;
    
    Object.entries(patternCounts).forEach(([pattern, count]) => {
      if (count > maxCount) {
        maxCount = count;
        bestPattern = pattern as CollaborationPattern;
      }
    });
    
    // Determine participants based on task requirements and agent specializations
    const participants: AgentRole[] = [];
    
    // Always include director
    participants.push(AgentRole.DIRECTOR);
    
    // Add other agents based on task requirements
    if (task.includes('idea') || task.includes('concept')) {
      participants.push(AgentRole.IDEATOR);
    }
    
    if (task.includes('style') || task.includes('visual')) {
      participants.push(AgentRole.STYLIST);
    }
    
    if (task.includes('refine') || task.includes('improve')) {
      participants.push(AgentRole.REFINER);
    }
    
    if (task.includes('evaluate') || task.includes('critique')) {
      participants.push(AgentRole.CRITIC);
    }
    
    // Ensure we have at least 2 participants
    if (participants.length < 2) {
      participants.push(AgentRole.IDEATOR);
    }
    
    // Generate rationale using AI
    const rationale = await this.generateCollaborationRationale(
      bestPattern,
      participants,
      task,
      context
    );
    
    return {
      pattern: bestPattern,
      participants,
      rationale
    };
  }

  /**
   * Share knowledge between agents
   */
  async shareKnowledge(
    fromAgent: AgentRole,
    toAgents: AgentRole[],
    knowledge: Record<string, any>,
    importance: number // 1-10
  ): Promise<void> {
    // Add knowledge to shared knowledge base
    const knowledgeId = uuidv4();
    this.sharedKnowledgeBase[knowledgeId] = {
      ...knowledge,
      source: fromAgent,
      timestamp: new Date(),
      importance
    };
    
    // Create knowledge sharing message
    const message: AgentMessage = {
      id: uuidv4(),
      fromAgent: fromAgent.toString(),
      toAgent: null, // broadcast
      content: {
        action: 'share_knowledge',
        knowledge,
        importance
      },
      timestamp: new Date(),
      type: 'update'
    };
    
    // Send message to specified agents or broadcast if toAgents is empty
    if (toAgents.length === 0) {
      await this.sendMessage(message);
    } else {
      for (const agent of toAgents) {
        const targetMessage = {
          ...message,
          toAgent: agent.toString()
        };
        await this.sendMessage(targetMessage);
      }
    }
    
    // Store knowledge in memory system
    await this.memorySystem.storeMemory(
      knowledge,
      MemoryType.EXPERIENCE,
      { 
        type: 'shared_knowledge',
        source: fromAgent,
        importance
      },
      ['knowledge', fromAgent, ...Object.keys(knowledge)]
    );
  }

  /**
   * Get the current system metrics
   */
  getCollaborationMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {
      activeSessions: 0,
      completedSessions: 0,
      averageCollaborationScore: 0,
      patternEffectiveness: {},
      agentPerformance: {}
    };
    
    // Count sessions by status
    this.collaborationSessions.forEach(session => {
      if (session.status === 'in-progress') {
        metrics.activeSessions++;
      } else if (session.status === 'completed') {
        metrics.completedSessions++;
      }
    });
    
    // Calculate average collaboration score
    let totalScore = 0;
    let completedCount = 0;
    
    this.collaborationSessions.forEach(session => {
      if (session.status === 'completed') {
        totalScore += session.metrics.collaborationScore;
        completedCount++;
      }
    });
    
    metrics.averageCollaborationScore = completedCount > 0 ? totalScore / completedCount : 0;
    
    // Calculate pattern effectiveness
    const patternScores: Record<CollaborationPattern, number[]> = {
      [CollaborationPattern.SEQUENTIAL]: [],
      [CollaborationPattern.PARALLEL]: [],
      [CollaborationPattern.ITERATIVE]: [],
      [CollaborationPattern.FEEDBACK]: [],
      [CollaborationPattern.CONSENSUS]: [],
      [CollaborationPattern.SPECIALIZATION]: [],
      [CollaborationPattern.EMERGENT]: []
    };
    
    this.collaborationSessions.forEach(session => {
      if (session.status === 'completed') {
        patternScores[session.pattern].push(session.metrics.collaborationScore);
      }
    });
    
    Object.entries(patternScores).forEach(([pattern, scores]) => {
      const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
      metrics.patternEffectiveness[pattern] = {
        averageScore: average,
        usageCount: scores.length
      };
    });
    
    // Add agent performance metrics
    this.agentPerformanceMetrics.forEach((perfMetrics, role) => {
      metrics.agentPerformance[role] = perfMetrics;
    });
    
    return metrics;
  }

  /**
   * Private helper methods
   */
  
  private initializeAgentSpecializations(): void {
    this.agentSpecializations.set(AgentRole.DIRECTOR, ['coordination', 'planning', 'management']);
    this.agentSpecializations.set(AgentRole.IDEATOR, ['ideation', 'creativity', 'conceptualization']);
    this.agentSpecializations.set(AgentRole.STYLIST, ['style', 'aesthetics', 'visual design']);
    this.agentSpecializations.set(AgentRole.REFINER, ['refinement', 'improvement', 'detail']);
    this.agentSpecializations.set(AgentRole.CRITIC, ['evaluation', 'critique', 'analysis']);
  }

  private initializeContributionBalance(participants: AgentRole[]): Record<AgentRole, number> {
    const balance: Record<AgentRole, number> = {} as Record<AgentRole, number>;
    participants.forEach(role => {
      balance[role] = 0;
    });
    return balance;
  }

  private async notifySessionParticipants(session: CollaborationSession): Promise<void> {
    const message: AgentMessage = {
      id: uuidv4(),
      fromAgent: 'system',
      toAgent: null, // broadcast
      content: {
        action: 'collaboration_session_created',
        session: {
          id: session.id,
          title: session.title,
          description: session.description,
          pattern: session.pattern,
          participants: session.participants
        }
      },
      timestamp: new Date(),
      type: 'update'
    };
    
    await this.sendMessage(message);
  }

  private async loadCollaborationPatternsFromMemory(): Promise<void> {
    const memories = await this.memorySystem.retrieveMemories(
      'collaboration_pattern',
      {
        type: MemoryType.EXPERIENCE,
        tags: ['collaboration_pattern'],
        limit: 20
      }
    );
    
    memories.forEach(memory => {
      const pattern = memory.content;
      this.collaborationPatterns.set(pattern.id, pattern.type);
    });
  }

  private async generateCollaborationRationale(
    pattern: CollaborationPattern,
    participants: AgentRole[],
    task: string,
    context: Record<string, any>
  ): Promise<string> {
    const prompt = `
      Task: ${task}
      
      Context: ${JSON.stringify(context)}
      
      Recommended Collaboration Pattern: ${pattern}
      
      Participating Agents: ${participants.join(', ')}
      
      Please provide a rationale for why this collaboration pattern and these participants 
      are well-suited for the given task. Explain the benefits of this approach and how 
      the agents will work together effectively.
    `;
    
    // Access the protected aiService from the parent class
    const aiService = new AIService();
    await aiService.initialize();
    
    try {
      const response = await aiService.generateText(prompt);
      return response || "No rationale available";
    } catch (error) {
      console.error("Error generating collaboration rationale:", error);
      return "Could not generate rationale due to an error.";
    }
  }
} 