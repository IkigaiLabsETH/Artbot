import { BaseAgent, AgentRole, AgentMessage } from './index';
import { AIService, AIMessage } from '../ai';
import { v4 as uuidv4 } from 'uuid';

// Refiner agent is responsible for refining and improving artwork
export class RefinerAgent extends BaseAgent {
  constructor(aiService: AIService) {
    super(AgentRole.REFINER, aiService);
    this.state.context = {
      currentTask: null,
      refinementHistory: [],
      refinementParameters: {
        iterationCount: 3,
        refinementStrength: 0.7,
        detailLevel: 0.8,
        preserveStyleWeight: 0.9
      }
    };
  }

  async initialize(): Promise<void> {
    await super.initialize();
    // Refiner-specific initialization
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
    if (content.action === 'assign_task' && content.targetRole === AgentRole.REFINER) {
      const task = content.task;
      
      // Store the task
      this.state.context.currentTask = task;
      
      // Refine the artwork based on the style
      const refinedArtwork = await this.refineArtwork(task, content.project);
      
      // Store refinement
      this.state.context.refinementHistory.push({
        taskId: task.id,
        projectId: content.project.id,
        refinedArtwork,
        timestamp: new Date()
      });
      
      // Complete the task
      return this.createMessage(
        message.fromAgent,
        {
          action: 'task_completed',
          taskId: task.id,
          result: refinedArtwork
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
    // Handle feedback on our refinements
    return null;
  }
  
  private async refineArtwork(task: any, project: any): Promise<any> {
    // Extract style from the task
    const style = task.style || {};
    
    if (!style || Object.keys(style).length === 0) {
      return this.createDefaultArtwork(project);
    }
    
    // Use AI service to refine artwork based on the style
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Refiner agent in a multi-agent art creation system. Your role is to refine and improve artwork based on selected styles.
        
        Refinement parameters:
        - Iteration count: ${this.state.context.refinementParameters.iterationCount}
        - Refinement strength: ${this.state.context.refinementParameters.refinementStrength}
        - Detail level: ${this.state.context.refinementParameters.detailLevel}
        - Preserve style weight: ${this.state.context.refinementParameters.preserveStyleWeight}`
      },
      {
        role: 'user',
        content: `Refine artwork for the following project using the specified style:
        
        Project: ${project.title} - ${project.description}
        
        Style:
        Name: ${style.name || 'Unnamed Style'}
        Description: ${style.description || 'No description provided'}
        Visual characteristics: ${style.visualCharacteristics ? style.visualCharacteristics.join(', ') : 'None specified'}
        Color palette: ${style.colorPalette ? style.colorPalette.join(', ') : 'None specified'}
        Texture: ${style.texture || 'None specified'}
        Composition: ${style.composition || 'None specified'}
        
        Describe the refined artwork in detail, including:
        1. Title
        2. Description
        3. Visual elements
        4. Composition details
        5. Color usage
        6. Texture and materials
        7. Focal points
        8. Emotional impact
        
        Format your description as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.6
      });
      
      // Parse the response to extract refined artwork
      // In a real implementation, we would parse the JSON response
      // For now, we'll return a mock refined artwork based on the style
      
      return {
        id: uuidv4(),
        title: `${style.name} Composition`,
        description: `A refined artwork created in the ${style.name} style, featuring harmonious elements and balanced composition.`,
        visualElements: [
          ...(style.visualCharacteristics || []),
          "refined focal points",
          "balanced negative space",
          "harmonious proportions"
        ],
        composition: {
          structure: style.composition || "Balanced composition",
          focalPoints: ["Primary center-right element", "Secondary top-left element"],
          flow: "Clockwise visual movement",
          balance: "Asymmetrical but weighted"
        },
        colorUsage: {
          palette: style.colorPalette || ["#000000", "#FFFFFF"],
          dominant: style.colorPalette ? style.colorPalette[0] : "#000000",
          accents: style.colorPalette ? style.colorPalette.slice(-2) : ["#FFFFFF"],
          transitions: "Smooth gradients between related hues"
        },
        texture: {
          type: style.texture || "Smooth surface",
          details: "Varied brushwork with textural highlights",
          materials: "Digital medium with simulated physical qualities"
        },
        emotionalImpact: {
          primary: "Contemplative wonder",
          secondary: "Subtle tension",
          notes: "The artwork evokes a sense of discovery through its balanced yet dynamic composition."
        },
        refinementIterations: this.state.context.refinementParameters.iterationCount,
        style: style,
        project: {
          id: project.id,
          title: project.title
        },
        created: new Date()
      };
    } catch (error) {
      console.error('Error refining artwork:', error);
      return this.createDefaultArtwork(project);
    }
  }
  
  private createDefaultArtwork(project: any): any {
    return {
      id: uuidv4(),
      title: `${project.title} Artwork`,
      description: "A simple artwork based on the project requirements.",
      visualElements: [
        "basic shapes",
        "simple composition",
        "limited color palette"
      ],
      composition: {
        structure: "Centered composition",
        focalPoints: ["Central element"],
        flow: "Radial",
        balance: "Symmetrical"
      },
      colorUsage: {
        palette: ["#000000", "#FFFFFF", "#0077B6"],
        dominant: "#FFFFFF",
        accents: ["#0077B6"],
        transitions: "Sharp contrasts"
      },
      texture: {
        type: "Flat",
        details: "Minimal texture",
        materials: "Digital"
      },
      emotionalImpact: {
        primary: "Calm",
        secondary: "Clarity",
        notes: "The artwork conveys a sense of simplicity and clarity."
      },
      refinementIterations: 1,
      style: {
        name: "Default",
        description: "A simple, clean style"
      },
      project: {
        id: project.id,
        title: project.title
      },
      created: new Date()
    };
  }
} 