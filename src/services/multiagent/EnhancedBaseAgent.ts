import { v4 as uuidv4 } from 'uuid';
import { BaseAgent, AgentRole, AgentMessage, AgentState } from './index.js';
import { AIService } from '../ai/index.js';
import { MemorySystem, MemoryType } from '../memory/index.js';
import { CollaborationPattern } from './EnhancedMultiAgentSystem.js';

/**
 * Enhanced agent state interface with collaboration capabilities
 */
export interface EnhancedAgentState extends AgentState {
  collaborationSessions: string[];
  specializations: string[];
  performanceMetrics: {
    taskCompletionRate: number;
    responseTime: number;
    feedbackScore: number;
    innovationScore: number;
  };
  knowledgeBase: Record<string, any>;
  preferences: {
    collaborationPatterns: Record<CollaborationPattern, number>;
    preferredCollaborators: Record<AgentRole, number>;
  };
}

/**
 * Enhanced base agent with collaboration capabilities
 */
export abstract class EnhancedBaseAgent extends BaseAgent {
  protected memorySystem: MemorySystem;
  protected enhancedState: EnhancedAgentState;
  
  constructor(role: AgentRole, aiService: AIService, memorySystem: MemorySystem) {
    super(role, aiService);
    this.memorySystem = memorySystem;
    
    // Initialize enhanced state
    this.enhancedState = {
      ...this.state,
      collaborationSessions: [],
      specializations: this.getDefaultSpecializations(),
      performanceMetrics: {
        taskCompletionRate: 0.8,
        responseTime: 0.7,
        feedbackScore: 0.5,
        innovationScore: 0.6
      },
      knowledgeBase: {},
      preferences: {
        collaborationPatterns: this.initializeCollaborationPreferences(),
        preferredCollaborators: this.initializeCollaboratorPreferences()
      }
    };
    
    // Replace the original state with the enhanced state
    this.state = this.enhancedState;
  }
  
  async initialize(): Promise<void> {
    await super.initialize();
    
    // Load agent memories
    await this.loadAgentMemories();
  }
  
  /**
   * Process a message with enhanced collaboration capabilities
   */
  async process(message: AgentMessage): Promise<AgentMessage | null> {
    // Record start time for response time tracking
    const startTime = Date.now();
    
    // Add message to memory
    this.addToMemory(message);
    
    // Store message in memory system
    await this.storeMessageInMemory(message);
    
    // Update state based on message
    this.state.status = 'working';
    
    let response: AgentMessage | null = null;
    
    try {
      // Handle collaboration-specific messages
      if (this.isCollaborationMessage(message)) {
        response = await this.handleCollaborationMessage(message);
      } else {
        // Handle regular messages based on type
        switch (message.type) {
          case 'request':
            response = await this.handleRequest(message);
            break;
          case 'response':
            response = await this.handleResponse(message);
            break;
          case 'update':
            response = await this.handleUpdate(message);
            break;
          case 'feedback':
            response = await this.handleFeedback(message);
            break;
          default:
            response = null;
        }
      }
      
      // Update task completion rate if this was a task
      if (message.content?.action === 'assign_task' && response) {
        this.updateTaskCompletionMetric(true);
      }
      
      // Update response time metric
      this.updateResponseTimeMetric(Date.now() - startTime);
      
      return response;
    } catch (error) {
      console.error(`Error processing message in ${this.role} agent:`, error);
      
      // Update task completion rate for failure
      if (message.content?.action === 'assign_task') {
        this.updateTaskCompletionMetric(false);
      }
      
      return null;
    } finally {
      this.state.status = 'idle';
    }
  }
  
  /**
   * Handle collaboration-specific messages
   */
  protected async handleCollaborationMessage(message: AgentMessage): Promise<AgentMessage | null> {
    const { content } = message;
    
    switch (content.action) {
      case 'collaboration_session_created':
        return await this.handleCollaborationSessionCreated(message);
        
      case 'share_knowledge':
        return await this.handleKnowledgeSharing(message);
        
      case 'request_feedback':
        return await this.handleFeedbackRequest(message);
        
      case 'consensus_vote':
        return await this.handleConsensusVote(message);
        
      default:
        return null;
    }
  }
  
  /**
   * Handle collaboration session creation
   */
  protected async handleCollaborationSessionCreated(message: AgentMessage): Promise<AgentMessage | null> {
    const { content } = message;
    const session = content.session;
    
    // Check if this agent is a participant
    if (session.participants.includes(this.role)) {
      // Add session to agent's active sessions
      this.enhancedState.collaborationSessions.push(session.id);
      
      // Acknowledge participation
      return this.createMessage(
        'system',
        {
          action: 'acknowledge_collaboration',
          sessionId: session.id,
          message: `${this.role} is ready to collaborate on "${session.title}"`
        },
        'response'
      );
    }
    
    return null;
  }
  
  /**
   * Handle knowledge sharing
   */
  protected async handleKnowledgeSharing(message: AgentMessage): Promise<AgentMessage | null> {
    const { content } = message;
    const knowledge = content.knowledge;
    const importance = content.importance;
    
    // Add knowledge to agent's knowledge base
    const knowledgeId = uuidv4();
    this.enhancedState.knowledgeBase[knowledgeId] = {
      ...knowledge,
      source: message.fromAgent,
      timestamp: new Date(),
      importance
    };
    
    // Store in memory system
    await this.memorySystem.storeMemory(
      knowledge,
      MemoryType.EXPERIENCE,
      { 
        type: 'shared_knowledge',
        source: message.fromAgent,
        importance
      },
      ['knowledge', message.fromAgent, ...Object.keys(knowledge)]
    );
    
    // Acknowledge receipt
    return this.createMessage(
      message.fromAgent,
      {
        action: 'acknowledge_knowledge',
        knowledgeId,
        message: `${this.role} has received and integrated the shared knowledge`
      },
      'response'
    );
  }
  
  /**
   * Handle feedback request
   */
  protected async handleFeedbackRequest(message: AgentMessage): Promise<AgentMessage | null> {
    const { content } = message;
    const artifactId = content.artifactId;
    const artifactType = content.artifactType;
    const artifactContent = content.artifactContent;
    
    // Generate feedback based on agent's specialization
    const feedback = await this.generateFeedback(artifactType, artifactContent);
    
    // Return feedback
    return this.createMessage(
      message.fromAgent,
      {
        action: 'provide_feedback',
        artifactId,
        feedback: {
          content: feedback.content,
          rating: feedback.rating,
          suggestions: feedback.suggestions
        }
      },
      'feedback'
    );
  }
  
  /**
   * Handle consensus vote
   */
  protected async handleConsensusVote(message: AgentMessage): Promise<AgentMessage | null> {
    const { content } = message;
    const proposalId = content.proposalId;
    const proposalContent = content.proposalContent;
    
    // Evaluate proposal based on agent's specialization
    const evaluation = await this.evaluateProposal(proposalContent);
    
    // Return vote
    return this.createMessage(
      message.fromAgent,
      {
        action: 'consensus_vote_response',
        proposalId,
        vote: evaluation.vote,
        rationale: evaluation.rationale
      },
      'response'
    );
  }
  
  /**
   * Abstract methods to be implemented by specific agent types
   */
  protected abstract handleRequest(message: AgentMessage): Promise<AgentMessage | null>;
  protected abstract handleResponse(message: AgentMessage): Promise<AgentMessage | null>;
  protected abstract handleUpdate(message: AgentMessage): Promise<AgentMessage | null>;
  protected abstract handleFeedback(message: AgentMessage): Promise<AgentMessage | null>;
  
  /**
   * Helper methods
   */
  
  /**
   * Check if a message is collaboration-related
   */
  private isCollaborationMessage(message: AgentMessage): boolean {
    const collaborationActions = [
      'collaboration_session_created',
      'share_knowledge',
      'request_feedback',
      'consensus_vote'
    ];
    
    return message.content && 
           message.content.action && 
           collaborationActions.includes(message.content.action);
  }
  
  /**
   * Get default specializations based on agent role
   */
  private getDefaultSpecializations(): string[] {
    switch (this.role) {
      case AgentRole.DIRECTOR:
        return ['coordination', 'planning', 'management'];
      case AgentRole.IDEATOR:
        return ['ideation', 'creativity', 'conceptualization'];
      case AgentRole.STYLIST:
        return ['style', 'aesthetics', 'visual design'];
      case AgentRole.REFINER:
        return ['refinement', 'improvement', 'detail'];
      case AgentRole.CRITIC:
        return ['evaluation', 'critique', 'analysis'];
      default:
        return ['general'];
    }
  }
  
  /**
   * Initialize collaboration pattern preferences
   */
  private initializeCollaborationPreferences(): Record<CollaborationPattern, number> {
    // Default preferences based on agent role
    const preferences: Record<CollaborationPattern, number> = {
      sequential: 0.5,
      parallel: 0.5,
      iterative: 0.5,
      feedback: 0.5,
      consensus: 0.5,
      specialization: 0.5,
      emergent: 0.5
    };
    
    // Adjust based on role
    switch (this.role) {
      case AgentRole.DIRECTOR:
        preferences.sequential = 0.8;
        preferences.consensus = 0.7;
        break;
      case AgentRole.IDEATOR:
        preferences.parallel = 0.8;
        preferences.emergent = 0.7;
        break;
      case AgentRole.STYLIST:
        preferences.specialization = 0.8;
        preferences.iterative = 0.7;
        break;
      case AgentRole.REFINER:
        preferences.iterative = 0.8;
        preferences.feedback = 0.7;
        break;
      case AgentRole.CRITIC:
        preferences.feedback = 0.8;
        preferences.consensus = 0.7;
        break;
    }
    
    return preferences;
  }
  
  /**
   * Initialize collaborator preferences
   */
  private initializeCollaboratorPreferences(): Record<AgentRole, number> {
    // Default preferences
    const preferences: Record<AgentRole, number> = {
      [AgentRole.DIRECTOR]: 0.5,
      [AgentRole.IDEATOR]: 0.5,
      [AgentRole.STYLIST]: 0.5,
      [AgentRole.REFINER]: 0.5,
      [AgentRole.CRITIC]: 0.5
    };
    
    // Adjust based on natural collaborations
    switch (this.role) {
      case AgentRole.DIRECTOR:
        preferences[AgentRole.IDEATOR] = 0.7;
        break;
      case AgentRole.IDEATOR:
        preferences[AgentRole.STYLIST] = 0.7;
        break;
      case AgentRole.STYLIST:
        preferences[AgentRole.REFINER] = 0.7;
        break;
      case AgentRole.REFINER:
        preferences[AgentRole.CRITIC] = 0.7;
        break;
      case AgentRole.CRITIC:
        preferences[AgentRole.DIRECTOR] = 0.7;
        break;
    }
    
    return preferences;
  }
  
  /**
   * Store message in memory system
   */
  private async storeMessageInMemory(message: AgentMessage): Promise<void> {
    await this.memorySystem.storeMemory(
      message,
      MemoryType.EXPERIENCE,
      { 
        type: 'agent_message',
        fromAgent: message.fromAgent,
        toAgent: message.toAgent
      },
      ['message', message.type, message.fromAgent]
    );
  }
  
  /**
   * Load agent memories from memory system
   */
  private async loadAgentMemories(): Promise<void> {
    // Load knowledge
    const knowledgeMemories = await this.memorySystem.retrieveMemories(
      this.role.toString(),
      {
        type: MemoryType.EXPERIENCE,
        tags: ['knowledge'],
        limit: 20
      }
    );
    
    knowledgeMemories.forEach(memory => {
      const knowledgeId = uuidv4();
      this.enhancedState.knowledgeBase[knowledgeId] = {
        ...memory.content,
        source: memory.metadata.source,
        timestamp: memory.createdAt,
        importance: memory.metadata.importance || 5
      };
    });
    
    // Load collaboration preferences
    const collaborationMemories = await this.memorySystem.retrieveMemories(
      this.role.toString(),
      {
        type: MemoryType.EXPERIENCE,
        tags: ['collaboration'],
        limit: 10
      }
    );
    
    collaborationMemories.forEach(memory => {
      if (memory.metadata.type === 'collaboration_preference') {
        const pattern = memory.metadata.pattern;
        const preference = memory.content.preference;
        
        if (pattern && preference) {
          this.enhancedState.preferences.collaborationPatterns[pattern] = preference;
        }
      }
    });
  }
  
  /**
   * Update task completion metric
   */
  private updateTaskCompletionMetric(success: boolean): void {
    const currentRate = this.enhancedState.performanceMetrics.taskCompletionRate;
    
    // Weighted update (70% previous, 30% new result)
    this.enhancedState.performanceMetrics.taskCompletionRate = 
      (currentRate * 0.7) + (success ? 0.3 : 0);
  }
  
  /**
   * Update response time metric
   */
  private updateResponseTimeMetric(responseTimeMs: number): void {
    // Convert to a 0-1 score (lower is better)
    // Assuming 5000ms (5s) is a good response time
    const responseScore = Math.max(0, Math.min(1, 5000 / (responseTimeMs + 1000)));
    
    const currentScore = this.enhancedState.performanceMetrics.responseTime;
    
    // Weighted update (80% previous, 20% new result)
    this.enhancedState.performanceMetrics.responseTime = 
      (currentScore * 0.8) + (responseScore * 0.2);
  }
  
  /**
   * Generate feedback for an artifact
   */
  private async generateFeedback(artifactType: string, artifactContent: any): Promise<{
    content: string;
    rating: number;
    suggestions: string[];
  }> {
    // Default feedback
    const defaultFeedback = {
      content: `${this.role} has reviewed the ${artifactType}.`,
      rating: 7,
      suggestions: [`Consider refining the ${artifactType} further.`]
    };
    
    try {
      // Generate feedback prompt based on agent role and artifact type
      const prompt = `
        As a ${this.role} specialized in ${this.enhancedState.specializations.join(', ')},
        please provide feedback on the following ${artifactType}:
        
        ${JSON.stringify(artifactContent)}
        
        Provide:
        1. Detailed feedback
        2. A rating from 1-10
        3. Three specific suggestions for improvement
      `;
      
      // Use AI service to generate feedback
      const aiService = new AIService();
      await aiService.initialize();
      
      const response = await aiService.generateText(prompt);
      
      if (!response) {
        return defaultFeedback;
      }
      
      // Parse the response (simplified)
      const lines = response.split('\n');
      const content = lines.slice(0, 3).join(' ').trim();
      
      // Extract rating (look for numbers 1-10)
      const ratingMatch = response.match(/rating:?\s*(\d+)/i) || response.match(/(\d+)\s*\/\s*10/);
      const rating = ratingMatch ? Math.min(10, Math.max(1, parseInt(ratingMatch[1]))) : 7;
      
      // Extract suggestions
      const suggestions: string[] = [];
      let inSuggestions = false;
      
      for (const line of lines) {
        if (line.toLowerCase().includes('suggestion') || line.match(/^\d+\./)) {
          inSuggestions = true;
          const suggestion = line.replace(/^\d+\.|\*|suggestion\s*\d*:?/i, '').trim();
          if (suggestion) {
            suggestions.push(suggestion);
          }
        } else if (inSuggestions && line.trim() && !line.toLowerCase().includes('rating')) {
          suggestions.push(line.trim());
        }
      }
      
      return {
        content: content || defaultFeedback.content,
        rating,
        suggestions: suggestions.length > 0 ? suggestions.slice(0, 3) : defaultFeedback.suggestions
      };
    } catch (error) {
      console.error(`Error generating feedback in ${this.role} agent:`, error);
      return defaultFeedback;
    }
  }
  
  /**
   * Evaluate a proposal for consensus voting
   */
  private async evaluateProposal(proposalContent: any): Promise<{
    vote: 'approve' | 'reject' | 'abstain';
    rationale: string;
  }> {
    // Default evaluation
    const defaultEvaluation = {
      vote: 'abstain' as 'approve' | 'reject' | 'abstain',
      rationale: `${this.role} has insufficient information to evaluate this proposal.`
    };
    
    try {
      // Generate evaluation prompt based on agent role
      const prompt = `
        As a ${this.role} specialized in ${this.enhancedState.specializations.join(', ')},
        please evaluate the following proposal:
        
        ${JSON.stringify(proposalContent)}
        
        Should this proposal be approved, rejected, or should you abstain from voting?
        Provide your vote (approve/reject/abstain) and a detailed rationale.
      `;
      
      // Use AI service to generate evaluation
      const aiService = new AIService();
      await aiService.initialize();
      
      const response = await aiService.generateText(prompt);
      
      if (!response) {
        return defaultEvaluation;
      }
      
      // Parse the response to extract vote and rationale
      let vote: 'approve' | 'reject' | 'abstain' = 'abstain';
      
      if (response.toLowerCase().includes('approve')) {
        vote = 'approve';
      } else if (response.toLowerCase().includes('reject')) {
        vote = 'reject';
      }
      
      // Extract rationale (everything after the vote)
      const rationale = response.replace(/approve|reject|abstain/i, '').trim();
      
      return {
        vote,
        rationale: rationale || defaultEvaluation.rationale
      };
    } catch (error) {
      console.error(`Error evaluating proposal in ${this.role} agent:`, error);
      return defaultEvaluation;
    }
  }
} 