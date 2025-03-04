import { BaseAgent, AgentRole, AgentMessage } from './index.js';
import { AIService, AIMessage } from '../ai/index.js';

// Ideator agent is responsible for generating creative ideas
export class IdeatorAgent extends BaseAgent {
  constructor(aiService: AIService) {
    super(AgentRole.IDEATOR, aiService);
    this.state.context = {
      currentTask: null,
      generatedIdeas: [],
      ideationParameters: {
        explorationRate: 0.7,
        diversityWeight: 0.8,
        noveltyThreshold: 0.6
      }
    };
  }

  async initialize(): Promise<void> {
    await super.initialize();
    // Ideator-specific initialization
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
    if (content.action === 'assign_task' && content.targetRole === AgentRole.IDEATOR) {
      const task = content.task;
      
      // Store the task
      this.state.context.currentTask = task;
      
      // Generate ideas based on the task
      const ideas = await this.generateIdeas(task, content.project);
      
      // Store generated ideas
      this.state.context.generatedIdeas = ideas;
      
      // Complete the task
      return this.createMessage(
        message.fromAgent,
        {
          action: 'task_completed',
          taskId: task.id,
          result: ideas
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
    // Handle feedback on our ideas
    return null;
  }
  
  private async generateIdeas(task: any, project: any): Promise<any[]> {
    // Use AI service to generate creative ideas
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent in a multi-agent art creation system. Your role is to generate creative, diverse, and novel ideas based on project requirements. 
        Exploration rate: ${this.state.context.ideationParameters.explorationRate}
        Diversity weight: ${this.state.context.ideationParameters.diversityWeight}
        Novelty threshold: ${this.state.context.ideationParameters.noveltyThreshold}`
      },
      {
        role: 'user',
        content: `Generate 5 creative art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title
        2. A brief description
        3. Key visual elements
        4. Potential styles
        5. Emotional impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });
      
      // Parse the response to extract ideas
      // In a real implementation, we would parse the JSON response
      // For now, we'll return mock ideas
      
      return [
        {
          title: "Cosmic Harmony",
          description: "An abstract representation of universal balance",
          elements: ["celestial bodies", "geometric patterns", "flowing lines"],
          styles: ["abstract", "minimalist", "cosmic"],
          emotionalImpact: "wonder and contemplation"
        },
        {
          title: "Digital Dreamscape",
          description: "A surreal landscape merging natural and digital elements",
          elements: ["fractals", "organic shapes", "digital artifacts"],
          styles: ["surrealism", "digital art", "psychedelic"],
          emotionalImpact: "curiosity and disorientation"
        },
        {
          title: "Ephemeral Echoes",
          description: "Capturing fleeting moments through layered transparency",
          elements: ["transparent layers", "time indicators", "fading forms"],
          styles: ["impressionist", "contemporary", "ethereal"],
          emotionalImpact: "nostalgia and transience"
        },
        {
          title: "Structured Chaos",
          description: "Finding order within apparent randomness",
          elements: ["chaotic patterns", "underlying grid", "emergent forms"],
          styles: ["generative art", "mathematical", "complex"],
          emotionalImpact: "fascination and discovery"
        },
        {
          title: "Emotional Spectrum",
          description: "Visualizing the range of human emotions through color and form",
          elements: ["color gradients", "expressive shapes", "human silhouettes"],
          styles: ["expressionist", "color field", "emotional"],
          emotionalImpact: "empathy and introspection"
        }
      ];
    } catch (error) {
      console.error('Error generating ideas:', error);
      return [
        {
          title: "Fallback Idea",
          description: "A simple concept using basic elements",
          elements: ["simple shapes", "primary colors"],
          styles: ["minimalist"],
          emotionalImpact: "calm"
        }
      ];
    }
  }
} 