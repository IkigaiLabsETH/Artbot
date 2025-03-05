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
 * Project complexity levels
 */
export enum ProjectComplexity {
  SIMPLE = 'simple',         // Basic projects with minimal requirements
  MODERATE = 'moderate',     // Projects with moderate complexity
  COMPLEX = 'complex',       // Complex projects with multiple requirements
  VERY_COMPLEX = 'very_complex' // Highly complex projects with intricate requirements
}

/**
 * Time constraint levels
 */
export enum TimeConstraint {
  RELAXED = 'relaxed',       // No significant time pressure
  MODERATE = 'moderate',     // Some time pressure but reasonable deadline
  TIGHT = 'tight',           // Significant time pressure with close deadline
  URGENT = 'urgent'          // Extremely urgent with immediate deadline
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
  private collaborationPatternHistory: Map<CollaborationPattern, number[]> = new Map();
  private projectComplexityThresholds = {
    [ProjectComplexity.SIMPLE]: 3,
    [ProjectComplexity.MODERATE]: 5,
    [ProjectComplexity.COMPLEX]: 8,
    [ProjectComplexity.VERY_COMPLEX]: 10
  };

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

  /**
   * Select the optimal collaboration pattern based on project characteristics
   * @param project The project to analyze
   * @returns The selected collaboration pattern
   */
  async selectOptimalCollaborationPattern(project: any): Promise<CollaborationPattern> {
    // Extract project characteristics
    const complexity = this.assessProjectComplexity(project);
    const timeConstraint = this.assessTimeConstraint(project);
    const requiresConsensus = this.projectRequiresConsensus(project);
    const isExperimental = this.isExperimentalProject(project);
    const hasSpecializedRequirements = this.hasSpecializedRequirements(project);
    
    // Calculate pattern scores based on project characteristics
    const patternScores = new Map<CollaborationPattern, number>();
    
    // Sequential: Good for simple projects with relaxed time constraints
    patternScores.set(
      CollaborationPattern.SEQUENTIAL, 
      this.calculateSequentialScore(complexity, timeConstraint)
    );
    
    // Parallel: Good for complex projects with tight time constraints
    patternScores.set(
      CollaborationPattern.PARALLEL, 
      this.calculateParallelScore(complexity, timeConstraint)
    );
    
    // Iterative: Good for complex projects with relaxed time constraints
    patternScores.set(
      CollaborationPattern.ITERATIVE, 
      this.calculateIterativeScore(complexity, timeConstraint)
    );
    
    // Feedback: Good for projects requiring quality and refinement
    patternScores.set(
      CollaborationPattern.FEEDBACK, 
      this.calculateFeedbackScore(complexity, project.qualityFocus || 0.5)
    );
    
    // Consensus: Good for projects requiring agreement among stakeholders
    patternScores.set(
      CollaborationPattern.CONSENSUS, 
      this.calculateConsensusScore(requiresConsensus)
    );
    
    // Specialization: Good for projects with specialized requirements
    patternScores.set(
      CollaborationPattern.SPECIALIZATION, 
      this.calculateSpecializationScore(hasSpecializedRequirements)
    );
    
    // Emergent: Good for experimental projects
    patternScores.set(
      CollaborationPattern.EMERGENT, 
      this.calculateEmergentScore(isExperimental)
    );
    
    // Apply historical performance adjustments
    this.applyHistoricalPerformanceAdjustments(patternScores);
    
    // Select the pattern with the highest score
    let bestPattern = CollaborationPattern.SEQUENTIAL; // Default
    let highestScore = 0;
    
    for (const [pattern, score] of patternScores.entries()) {
      if (score > highestScore) {
        highestScore = score;
        bestPattern = pattern;
      }
    }
    
    console.log(`Selected collaboration pattern: ${bestPattern} (score: ${highestScore.toFixed(2)})`);
    return bestPattern;
  }
  
  /**
   * Assess the complexity of a project
   * @param project The project to assess
   * @returns The project complexity level
   */
  private assessProjectComplexity(project: any): ProjectComplexity {
    // Calculate complexity score based on various factors
    let complexityScore = 0;
    
    // Factor 1: Number of requirements
    if (project.requirements) {
      complexityScore += project.requirements.length * 0.5;
    }
    
    // Factor 2: Description length (as a proxy for complexity)
    if (project.description) {
      complexityScore += Math.min(project.description.length / 100, 5);
    }
    
    // Factor 3: Explicit complexity rating if provided
    if (project.complexity !== undefined) {
      complexityScore += project.complexity;
    }
    
    // Factor 4: Number of stakeholders or constraints
    if (project.stakeholders) {
      complexityScore += project.stakeholders.length * 0.3;
    }
    
    if (project.constraints) {
      complexityScore += project.constraints.length * 0.4;
    }
    
    // Determine complexity level based on score
    if (complexityScore <= this.projectComplexityThresholds[ProjectComplexity.SIMPLE]) {
      return ProjectComplexity.SIMPLE;
    } else if (complexityScore <= this.projectComplexityThresholds[ProjectComplexity.MODERATE]) {
      return ProjectComplexity.MODERATE;
    } else if (complexityScore <= this.projectComplexityThresholds[ProjectComplexity.COMPLEX]) {
      return ProjectComplexity.COMPLEX;
    } else {
      return ProjectComplexity.VERY_COMPLEX;
    }
  }
  
  /**
   * Assess the time constraint of a project
   * @param project The project to assess
   * @returns The time constraint level
   */
  private assessTimeConstraint(project: any): TimeConstraint {
    // If explicitly provided, use that
    if (project.timeConstraint) {
      return project.timeConstraint as TimeConstraint;
    }
    
    // If deadline is provided, calculate based on that
    if (project.deadline) {
      const now = new Date();
      const deadline = new Date(project.deadline);
      const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysUntilDeadline < 1) {
        return TimeConstraint.URGENT;
      } else if (daysUntilDeadline < 3) {
        return TimeConstraint.TIGHT;
      } else if (daysUntilDeadline < 7) {
        return TimeConstraint.MODERATE;
      } else {
        return TimeConstraint.RELAXED;
      }
    }
    
    // Default to moderate if not specified
    return TimeConstraint.MODERATE;
  }
  
  /**
   * Determine if a project requires consensus
   * @param project The project to assess
   * @returns Whether the project requires consensus
   */
  private projectRequiresConsensus(project: any): boolean {
    // Check if explicitly specified
    if (project.requiresConsensus !== undefined) {
      return project.requiresConsensus;
    }
    
    // Check for keywords in description
    if (project.description) {
      const consensusKeywords = ['consensus', 'agreement', 'collaborative decision', 'stakeholder approval', 'team decision'];
      return consensusKeywords.some(keyword => project.description.toLowerCase().includes(keyword));
    }
    
    // Check if multiple stakeholders are involved
    if (project.stakeholders && project.stakeholders.length > 2) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Determine if a project is experimental
   * @param project The project to assess
   * @returns Whether the project is experimental
   */
  private isExperimentalProject(project: any): boolean {
    // Check if explicitly specified
    if (project.isExperimental !== undefined) {
      return project.isExperimental;
    }
    
    // Check for experimental keywords in description
    if (project.description) {
      const experimentalKeywords = ['experimental', 'innovative', 'novel', 'cutting-edge', 'breakthrough', 'unconventional'];
      return experimentalKeywords.some(keyword => project.description.toLowerCase().includes(keyword));
    }
    
    return false;
  }
  
  /**
   * Determine if a project has specialized requirements
   * @param project The project to assess
   * @returns Whether the project has specialized requirements
   */
  private hasSpecializedRequirements(project: any): boolean {
    // Check if explicitly specified
    if (project.hasSpecializedRequirements !== undefined) {
      return project.hasSpecializedRequirements;
    }
    
    // Check for specialized domains in requirements
    const specializedDomains = [
      'technical', 'scientific', 'medical', 'legal', 'financial', 
      'architectural', 'engineering', 'mathematical', 'cultural',
      'historical', 'linguistic', 'psychological', 'philosophical'
    ];
    
    if (project.requirements) {
      for (const requirement of project.requirements) {
        if (specializedDomains.some(domain => requirement.toLowerCase().includes(domain))) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Calculate score for sequential collaboration pattern
   */
  private calculateSequentialScore(complexity: ProjectComplexity, timeConstraint: TimeConstraint): number {
    // Sequential works well for simple projects with relaxed time constraints
    let score = 0;
    
    // Complexity factor: higher for simpler projects
    switch (complexity) {
      case ProjectComplexity.SIMPLE:
        score += 0.9;
        break;
      case ProjectComplexity.MODERATE:
        score += 0.7;
        break;
      case ProjectComplexity.COMPLEX:
        score += 0.4;
        break;
      case ProjectComplexity.VERY_COMPLEX:
        score += 0.2;
        break;
    }
    
    // Time constraint factor: higher for relaxed constraints
    switch (timeConstraint) {
      case TimeConstraint.RELAXED:
        score += 0.9;
        break;
      case TimeConstraint.MODERATE:
        score += 0.7;
        break;
      case TimeConstraint.TIGHT:
        score += 0.4;
        break;
      case TimeConstraint.URGENT:
        score += 0.2;
        break;
    }
    
    return score / 2; // Normalize to 0-1 range
  }
  
  /**
   * Calculate score for parallel collaboration pattern
   */
  private calculateParallelScore(complexity: ProjectComplexity, timeConstraint: TimeConstraint): number {
    // Parallel works well for complex projects with tight time constraints
    let score = 0;
    
    // Complexity factor: higher for complex projects
    switch (complexity) {
      case ProjectComplexity.SIMPLE:
        score += 0.3;
        break;
      case ProjectComplexity.MODERATE:
        score += 0.6;
        break;
      case ProjectComplexity.COMPLEX:
        score += 0.8;
        break;
      case ProjectComplexity.VERY_COMPLEX:
        score += 0.9;
        break;
    }
    
    // Time constraint factor: higher for tight constraints
    switch (timeConstraint) {
      case TimeConstraint.RELAXED:
        score += 0.3;
        break;
      case TimeConstraint.MODERATE:
        score += 0.5;
        break;
      case TimeConstraint.TIGHT:
        score += 0.8;
        break;
      case TimeConstraint.URGENT:
        score += 0.9;
        break;
    }
    
    return score / 2; // Normalize to 0-1 range
  }
  
  /**
   * Calculate score for iterative collaboration pattern
   */
  private calculateIterativeScore(complexity: ProjectComplexity, timeConstraint: TimeConstraint): number {
    // Iterative works well for complex projects with relaxed time constraints
    let score = 0;
    
    // Complexity factor: higher for complex projects
    switch (complexity) {
      case ProjectComplexity.SIMPLE:
        score += 0.3;
        break;
      case ProjectComplexity.MODERATE:
        score += 0.6;
        break;
      case ProjectComplexity.COMPLEX:
        score += 0.9;
        break;
      case ProjectComplexity.VERY_COMPLEX:
        score += 0.8;
        break;
    }
    
    // Time constraint factor: higher for relaxed constraints
    switch (timeConstraint) {
      case TimeConstraint.RELAXED:
        score += 0.9;
        break;
      case TimeConstraint.MODERATE:
        score += 0.7;
        break;
      case TimeConstraint.TIGHT:
        score += 0.4;
        break;
      case TimeConstraint.URGENT:
        score += 0.2;
        break;
    }
    
    return score / 2; // Normalize to 0-1 range
  }
  
  /**
   * Calculate score for feedback collaboration pattern
   */
  private calculateFeedbackScore(complexity: ProjectComplexity, qualityFocus: number): number {
    // Feedback works well for projects with high quality focus
    let score = 0;
    
    // Complexity factor: moderate effect
    switch (complexity) {
      case ProjectComplexity.SIMPLE:
        score += 0.5;
        break;
      case ProjectComplexity.MODERATE:
        score += 0.6;
        break;
      case ProjectComplexity.COMPLEX:
        score += 0.7;
        break;
      case ProjectComplexity.VERY_COMPLEX:
        score += 0.8;
        break;
    }
    
    // Quality focus factor: higher for quality-focused projects
    score += qualityFocus;
    
    return score / 2; // Normalize to 0-1 range
  }
  
  /**
   * Calculate score for consensus collaboration pattern
   */
  private calculateConsensusScore(requiresConsensus: boolean): number {
    // Simple scoring based on whether consensus is required
    return requiresConsensus ? 0.9 : 0.3;
  }
  
  /**
   * Calculate score for specialization collaboration pattern
   */
  private calculateSpecializationScore(hasSpecializedRequirements: boolean): number {
    // Simple scoring based on whether specialized requirements exist
    return hasSpecializedRequirements ? 0.9 : 0.4;
  }
  
  /**
   * Calculate score for emergent collaboration pattern
   */
  private calculateEmergentScore(isExperimental: boolean): number {
    // Simple scoring based on whether the project is experimental
    return isExperimental ? 0.9 : 0.3;
  }
  
  /**
   * Apply adjustments based on historical performance
   * @param patternScores Map of pattern scores to adjust
   */
  private applyHistoricalPerformanceAdjustments(patternScores: Map<CollaborationPattern, number>): void {
    // Adjust scores based on historical performance
    for (const [pattern, score] of patternScores.entries()) {
      const history = this.collaborationPatternHistory.get(pattern);
      
      if (history && history.length > 0) {
        // Calculate average historical performance
        const avgPerformance = history.reduce((sum, val) => sum + val, 0) / history.length;
        
        // Apply adjustment (30% history, 70% current score)
        const adjustedScore = score * 0.7 + avgPerformance * 0.3;
        patternScores.set(pattern, adjustedScore);
      }
    }
  }
  
  /**
   * Record the performance of a collaboration pattern
   * @param pattern The collaboration pattern used
   * @param performanceScore The performance score (0-1)
   */
  recordPatternPerformance(pattern: CollaborationPattern, performanceScore: number): void {
    // Initialize history array if it doesn't exist
    if (!this.collaborationPatternHistory.has(pattern)) {
      this.collaborationPatternHistory.set(pattern, []);
    }
    
    // Add performance score to history
    const history = this.collaborationPatternHistory.get(pattern)!;
    history.push(performanceScore);
    
    // Keep history at a reasonable size
    if (history.length > 10) {
      history.shift(); // Remove oldest entry
    }
  }
  
  /**
   * Create a new collaboration session with the optimal pattern
   * @param project The project for the collaboration
   * @returns The created collaboration session
   */
  async createOptimalCollaborationSession(project: any): Promise<CollaborationSession> {
    // Select the optimal pattern
    const pattern = await this.selectOptimalCollaborationPattern(project);
    
    // Determine participating agents based on pattern
    const participants = this.selectParticipatingAgents(pattern, project);
    
    // Create the session
    const session: CollaborationSession = {
      id: uuidv4(),
      title: project.title || 'Untitled Project',
      description: project.description || '',
      pattern,
      participants,
      status: 'planning',
      startTime: new Date(),
      artifacts: [],
      sharedContext: {
        project,
        currentStage: 'planning',
        stageProgress: 0
      },
      history: [],
      metrics: {
        messageCount: 0,
        iterationCount: 0,
        consensusRate: 0,
        contributionBalance: Object.fromEntries(
          participants.map(role => [role, 0])
        ) as Record<AgentRole, number>,
        collaborationScore: 0
      }
    };
    
    // Store the session
    this.collaborationSessions.set(session.id, session);
    
    return session;
  }
  
  /**
   * Select participating agents based on collaboration pattern and project
   * @param pattern The collaboration pattern
   * @param project The project
   * @returns Array of agent roles to participate
   */
  private selectParticipatingAgents(pattern: CollaborationPattern, project: any): AgentRole[] {
    // Base set of agents that are always included
    const baseAgents = [AgentRole.DIRECTOR];
    
    // Add agents based on pattern
    switch (pattern) {
      case CollaborationPattern.SEQUENTIAL:
        // Sequential pattern uses a standard workflow
        return [...baseAgents, AgentRole.IDEATOR, AgentRole.STYLIST, AgentRole.REFINER, AgentRole.CRITIC];
        
      case CollaborationPattern.PARALLEL:
        // Parallel pattern uses all agents simultaneously
        return [
          ...baseAgents, 
          AgentRole.IDEATOR, 
          AgentRole.STYLIST, 
          AgentRole.REFINER, 
          AgentRole.CRITIC
        ];
        
      case CollaborationPattern.ITERATIVE:
        // Iterative pattern focuses on refinement
        return [
          ...baseAgents, 
          AgentRole.IDEATOR, 
          AgentRole.STYLIST, 
          AgentRole.REFINER, 
          AgentRole.CRITIC
        ];
        
      case CollaborationPattern.FEEDBACK:
        // Feedback pattern emphasizes critic role
        return [
          ...baseAgents, 
          AgentRole.IDEATOR, 
          AgentRole.STYLIST, 
          AgentRole.REFINER, 
          AgentRole.CRITIC
        ];
        
      case CollaborationPattern.CONSENSUS:
        // Consensus pattern includes all agents for decision-making
        return [
          ...baseAgents, 
          AgentRole.IDEATOR, 
          AgentRole.STYLIST, 
          AgentRole.REFINER, 
          AgentRole.CRITIC
        ];
        
      case CollaborationPattern.SPECIALIZATION:
        // Specialization pattern selects agents based on project needs
        const specializedAgents = [...baseAgents];
        
        // Add specialized agents based on project requirements
        if (this.projectNeedsIdeation(project)) {
          specializedAgents.push(AgentRole.IDEATOR);
        }
        
        if (this.projectNeedsStyling(project)) {
          specializedAgents.push(AgentRole.STYLIST);
        }
        
        if (this.projectNeedsRefinement(project)) {
          specializedAgents.push(AgentRole.REFINER);
        }
        
        if (this.projectNeedsCritique(project)) {
          specializedAgents.push(AgentRole.CRITIC);
        }
        
        return specializedAgents;
        
      case CollaborationPattern.EMERGENT:
        // Emergent pattern starts with minimal agents and adds as needed
        return [...baseAgents, AgentRole.IDEATOR];
        
      default:
        // Default to all agents
        return [
          ...baseAgents, 
          AgentRole.IDEATOR, 
          AgentRole.STYLIST, 
          AgentRole.REFINER, 
          AgentRole.CRITIC
        ];
    }
  }
  
  /**
   * Determine if a project needs ideation
   */
  private projectNeedsIdeation(project: any): boolean {
    // Check if concept is already provided
    if (project.concept && project.concept.length > 0) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Determine if a project needs styling
   */
  private projectNeedsStyling(project: any): boolean {
    // Check if style is already fully defined
    if (project.style && project.style.isComplete) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Determine if a project needs refinement
   */
  private projectNeedsRefinement(project: any): boolean {
    // Almost all projects need refinement
    return true;
  }
  
  /**
   * Determine if a project needs critique
   */
  private projectNeedsCritique(project: any): boolean {
    // Check if critique is explicitly disabled
    if (project.skipCritique) {
      return false;
    }
    
    return true;
  }
} 