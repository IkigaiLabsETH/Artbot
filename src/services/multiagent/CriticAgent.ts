import { BaseAgent, AgentRole, AgentMessage } from './index.js';
import { AIService, AIMessage } from '../ai/index.js';

// Critic agent is responsible for evaluating and providing feedback on artwork
export class CriticAgent extends BaseAgent {
  constructor(aiService: AIService) {
    super(AgentRole.CRITIC, aiService);
    this.state.context = {
      currentTask: null,
      evaluationHistory: [],
      evaluationCriteria: {
        aesthetics: { weight: 0.25, description: 'Visual appeal and beauty' },
        originality: { weight: 0.2, description: 'Uniqueness and novelty' },
        coherence: { weight: 0.15, description: 'Internal consistency and harmony' },
        technique: { weight: 0.15, description: 'Skill and execution' },
        impact: { weight: 0.25, description: 'Emotional and intellectual effect' }
      }
    };
  }

  async initialize(): Promise<void> {
    await super.initialize();
    // Critic-specific initialization
  }

  async process(message: AgentMessage): Promise<AgentMessage | null> {
    // Add message to memory
    this.addToMemory(message);
    
    // Update state based on message
    this.state.status = 'working';
    
    try {
      switch (message.type) {
        case 'request':
          return await this.handleRequest(message);
        case 'response':
          return await this.handleResponse(message);
        case 'update':
          return await this.handleUpdate(message);
        case 'feedback':
          return await this.handleFeedback(message);
        default:
          return null;
      }
    } finally {
      this.state.status = 'idle';
    }
  }
  
  private async handleRequest(message: AgentMessage): Promise<AgentMessage | null> {
    const { content } = message;
    
    // Handle task assignment
    if (content.action === 'assign_task' && content.targetRole === AgentRole.CRITIC) {
      const task = content.task;
      
      // Store the task
      this.state.context.currentTask = task;
      
      // Evaluate the artwork
      const evaluation = await this.evaluateArtwork(task, content.project);
      
      // Store evaluation
      this.state.context.evaluationHistory.push({
        taskId: task.id,
        projectId: content.project.id,
        evaluation,
        timestamp: new Date()
      });
      
      // Complete the task
      return this.createMessage(
        message.fromAgent,
        {
          action: 'task_completed',
          taskId: task.id,
          result: evaluation
        },
        'response'
      );
    }
    
    return null;
  }
  
  private async handleResponse(message: AgentMessage): Promise<AgentMessage | null> {
    // Handle responses to our requests
    return null;
  }
  
  private async handleUpdate(message: AgentMessage): Promise<AgentMessage | null> {
    // Handle updates from other agents
    return null;
  }
  
  private async handleFeedback(message: AgentMessage): Promise<AgentMessage | null> {
    // Handle feedback on our evaluations
    return null;
  }
  
  private async evaluateArtwork(task: any, project: any): Promise<any> {
    // Extract artwork from the task
    const artwork = task.artwork || {};
    
    // Use AI service to evaluate the artwork
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Critic agent in a multi-agent art creation system. Your role is to provide thoughtful, constructive evaluation of artwork based on multiple criteria.
        
        Evaluation criteria:
        ${Object.entries(this.state.context.evaluationCriteria).map(([key, value]: [string, any]) => 
          `- ${key} (weight: ${value.weight}): ${value.description}`
        ).join('\n')}`
      },
      {
        role: 'user',
        content: `Evaluate the following artwork:
        
        Project: ${project.title} - ${project.description}
        
        Artwork:
        Title: ${artwork.title || 'Untitled'}
        Description: ${artwork.description || 'No description provided'}
        Style: ${artwork.style ? JSON.stringify(artwork.style, null, 2) : 'No style information'}
        
        Provide a detailed evaluation covering:
        1. Strengths
        2. Areas for improvement
        3. Numerical scores (1-10) for each criterion
        4. Overall score (weighted average)
        5. Specific recommendations for enhancement
        
        Format your evaluation as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.4 // Lower temperature for more consistent evaluations
      });
      
      // Parse the response to extract evaluation
      // In a real implementation, we would parse the JSON response
      // For now, we'll return a mock evaluation
      
      return {
        strengths: [
          "Strong visual coherence between elements",
          "Effective use of color palette",
          "Compelling emotional impact",
          "Innovative combination of styles"
        ],
        areasForImprovement: [
          "Composition could be more dynamic",
          "Some elements lack detail",
          "Background elements compete with focal point",
          "Limited depth perception"
        ],
        scores: {
          aesthetics: 8.5,
          originality: 7.8,
          coherence: 8.2,
          technique: 7.5,
          impact: 8.7
        },
        overallScore: 8.2, // Weighted average
        recommendations: [
          "Increase contrast between foreground and background",
          "Add subtle details to main elements",
          "Experiment with asymmetrical composition",
          "Consider adding depth through layering",
          "Refine color transitions for smoother gradients"
        ],
        analysisNotes: "The artwork successfully captures the intended emotional tone while maintaining visual coherence. The style implementation is particularly effective, though technical execution could be refined in certain areas."
      };
    } catch (error) {
      console.error('Error evaluating artwork:', error);
      return {
        strengths: ["Basic composition is sound"],
        areasForImprovement: ["Technical issues prevented full evaluation"],
        scores: {
          aesthetics: 5,
          originality: 5,
          coherence: 5,
          technique: 5,
          impact: 5
        },
        overallScore: 5,
        recommendations: ["Address technical issues and resubmit for evaluation"],
        analysisNotes: "Unable to complete full evaluation due to technical issues."
      };
    }
  }
  
  private calculateWeightedScore(scores: Record<string, number>): number {
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const [criterion, score] of Object.entries(scores)) {
      const weight = this.state.context.evaluationCriteria[criterion]?.weight || 0;
      weightedSum += score * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
} 