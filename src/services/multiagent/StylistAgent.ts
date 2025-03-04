import { BaseAgent, AgentRole, AgentMessage } from './index.js';
import { AIService, AIMessage } from '../ai/index.js';
import { v4 as uuidv4 } from 'uuid';
import { ReferenceImageProvider, ImageMetadata } from './ReferenceImageProvider.js';

// Stylist agent is responsible for developing artistic styles
export class StylistAgent extends BaseAgent {
  private referenceImageProvider: ReferenceImageProvider | null = null;
  
  constructor(aiService: AIService, referenceImageProvider?: ReferenceImageProvider) {
    super(AgentRole.STYLIST, aiService);
    this.referenceImageProvider = referenceImageProvider || null;
    this.state.context = {
      currentTask: null,
      developedStyles: [],
      styleParameters: {
        coherenceWeight: 0.8,
        distinctivenessWeight: 0.7,
        adaptabilityWeight: 0.6
      },
      styleLibrary: [
        { name: 'Minimalist', elements: ['simple shapes', 'limited color palette', 'negative space'] },
        { name: 'Abstract', elements: ['non-representational forms', 'bold colors', 'geometric shapes'] },
        { name: 'Surrealist', elements: ['dreamlike imagery', 'unexpected juxtapositions', 'symbolic elements'] },
        { name: 'Impressionist', elements: ['visible brushstrokes', 'emphasis on light', 'movement'] },
        { name: 'Digital', elements: ['pixel art', 'glitch effects', 'vector graphics'] }
      ]
    };
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    // Initialize reference image provider if available
    if (this.referenceImageProvider) {
      await this.referenceImageProvider.initialize();
      console.log('StylistAgent: Reference image provider initialized');
    }
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
    if (content.action === 'assign_task' && content.targetRole === AgentRole.STYLIST) {
      const task = content.task;
      
      // Store the task
      this.state.context.currentTask = task;
      
      // Develop styles based on the ideas
      const styles = await this.developStyles(task, content.project);
      
      // Store developed styles
      this.state.context.developedStyles = styles;
      
      // Complete the task
      return this.createMessage(
        message.fromAgent,
        {
          action: 'task_completed',
          taskId: task.id,
          result: styles
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
    // Handle feedback on our styles
    return null;
  }
  
  private async developStyles(task: any, project: any): Promise<any[]> {
    // Extract ideas from the task
    const ideas = task.ideas || [];
    
    if (ideas.length === 0) {
      return [this.createDefaultStyle()];
    }
    
    // Get reference images if available
    let referenceImagesPrompt = '';
    
    if (this.referenceImageProvider) {
      // Extract key terms from ideas and project
      const keyTerms = ideas.flatMap((idea: any) => 
        [idea.title, ...(idea.styles || []), ...(idea.elements || [])]
      ).concat([project.title, project.description]);
      
      const combinedText = keyTerms.join(' ');
      
      // Get relevant reference images
      const referenceImages = this.referenceImageProvider.getStyleReferenceImages(combinedText, 3);
      
      if (referenceImages.length > 0) {
        referenceImagesPrompt = `\n\nReference Images for Inspiration:
${referenceImages.map((img, index) => {
  let imgInfo = `Reference ${index + 1}: ${img.title || img.filename}`;
  
  if (img.description) {
    imgInfo += `\nDescription: ${img.description}`;
  }
  
  if (img.style_attributes) {
    const attrs = img.style_attributes;
    imgInfo += '\nStyle Attributes:';
    
    if (attrs.color_palette && attrs.color_palette.length > 0) {
      imgInfo += `\n- Color Palette: ${attrs.color_palette.join(', ')}`;
    }
    
    if (attrs.composition) {
      imgInfo += `\n- Composition: ${attrs.composition}`;
    }
    
    if (attrs.texture) {
      imgInfo += `\n- Texture: ${attrs.texture}`;
    }
    
    if (attrs.mood) {
      imgInfo += `\n- Mood: ${attrs.mood}`;
    }
    
    if (attrs.technique) {
      imgInfo += `\n- Technique: ${attrs.technique}`;
    }
  }
  
  if (img.tags && img.tags.length > 0) {
    imgInfo += `\nTags: ${img.tags.join(', ')}`;
  }
  
  return imgInfo;
}).join('\n\n')}

Use these reference images as inspiration for your style development. Incorporate elements from these references that align with the project requirements and ideas.`;
      }
    }
    
    // Use AI service to develop styles based on the ideas
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Stylist agent in a multi-agent art creation system. Your role is to develop cohesive, distinctive, and adaptable artistic styles based on creative ideas.
        Coherence weight: ${this.state.context.styleParameters.coherenceWeight}
        Distinctiveness weight: ${this.state.context.styleParameters.distinctivenessWeight}
        Adaptability weight: ${this.state.context.styleParameters.adaptabilityWeight}`
      },
      {
        role: 'user',
        content: `Develop 3 unique artistic styles for the following project and ideas:
        
        Project: ${project.title} - ${project.description}
        
        Ideas:
        ${ideas.map((idea: any, index: number) => 
          `${index + 1}. ${idea.title}: ${idea.description}
           Elements: ${idea.elements ? idea.elements.join(', ') : 'None specified'}
           Suggested styles: ${idea.styles ? idea.styles.join(', ') : 'None specified'}`
        ).join('\n\n')}
        ${referenceImagesPrompt}
        
        For each style, provide:
        1. A name
        2. A description
        3. Key visual characteristics
        4. Color palette
        5. Texture and materials
        6. Composition guidelines
        
        Format each style as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      // Parse the response to extract styles
      // In a real implementation, we would parse the JSON response
      // For now, we'll return mock styles based on the ideas
      
      return [
        {
          id: uuidv4(),
          name: "Cosmic Minimalism",
          description: "A clean, minimalist approach with cosmic elements",
          visualCharacteristics: [
            "simple geometric forms",
            "celestial motifs",
            "balanced negative space",
            "subtle gradients"
          ],
          colorPalette: [
            "#0B0E17", // deep space black
            "#1A237E", // deep blue
            "#7986CB", // light blue
            "#FFFFFF", // white
            "#FFD700"  // gold accent
          ],
          texture: "smooth, matte surfaces with occasional metallic accents",
          composition: "centered focal points with radial balance"
        },
        {
          id: uuidv4(),
          name: "Digital Surrealism",
          description: "A blend of digital aesthetics with surrealist concepts",
          visualCharacteristics: [
            "glitch effects",
            "impossible geometries",
            "dreamlike juxtapositions",
            "digital artifacts"
          ],
          colorPalette: [
            "#FF00FF", // magenta
            "#00FFFF", // cyan
            "#121212", // near black
            "#E6E6FA", // lavender
            "#32CD32"  // lime green
          ],
          texture: "pixelated elements with smooth transitions",
          composition: "asymmetrical with unexpected focal points"
        },
        {
          id: uuidv4(),
          name: "Emotional Expressionism",
          description: "An expressive style focused on emotional impact through color and form",
          visualCharacteristics: [
            "bold brushstrokes",
            "expressive color use",
            "abstracted human elements",
            "dynamic movement"
          ],
          colorPalette: [
            "#E63946", // red
            "#F1FAEE", // off-white
            "#A8DADC", // light blue
            "#457B9D", // medium blue
            "#1D3557"  // dark blue
          ],
          texture: "visible brushwork with textured surfaces",
          composition: "dynamic diagonals with emotional rhythm"
        }
      ];
    } catch (error) {
      console.error('Error developing styles:', error);
      return [this.createDefaultStyle()];
    }
  }
  
  private createDefaultStyle(): any {
    return {
      id: uuidv4(),
      name: "Default Style",
      description: "A simple, clean style suitable for various content",
      visualCharacteristics: [
        "clean lines",
        "simple shapes",
        "balanced composition"
      ],
      colorPalette: [
        "#FFFFFF", // white
        "#000000", // black
        "#0077B6", // blue
        "#FFD60A"  // yellow
      ],
      texture: "smooth, flat surfaces",
      composition: "balanced, centered composition"
    };
  }
} 