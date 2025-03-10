import { BaseAgent, AgentRole, AgentMessage } from './index.js';
import { AIService, AIMessage } from '../ai/index.js';
import { ReplicateService } from '../replicate/index.js';
import { v4 as uuidv4 } from 'uuid';

// Refiner agent is responsible for refining and improving artwork
export class RefinerAgent extends BaseAgent {
  private replicateService: ReplicateService;
  
  constructor(aiService: AIService) {
    super(AgentRole.REFINER, aiService);
    this.replicateService = new ReplicateService();
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
    // Initialize the Replicate service
    await this.replicateService.initialize();
    console.log('🎨 RefinerAgent initialized with Replicate service');
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
    
    // Use AI service to create a detailed prompt for image generation
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Refiner agent in a multi-agent art creation system. Your role is to refine and improve artwork based on selected styles.
        
        Refinement parameters:
        - Iteration count: ${this.state.context.refinementParameters.iterationCount}
        - Refinement strength: ${this.state.context.refinementParameters.refinementStrength}
        - Detail level: ${this.state.context.refinementParameters.detailLevel}
        - Preserve style weight: ${this.state.context.refinementParameters.preserveStyleWeight}
        
        Style Expertise:
        1. Magritte's Oil Painting Technique:
        - Flawless oil paint application with no visible brushstrokes
        - Pristine matte finish characteristic of his work
        - Subtle canvas texture in large areas
        - Perfect color transitions while maintaining crisp edges
        - Rich, deep shadows with gentle gradients
        - Crystalline clarity in all details
        - Traditional oil painting luminosity
        - Unified, controlled lighting across the composition
        - Mathematical precision in object placement
        - Clean, sharp edges where needed
        - Consistent surface quality throughout
        - Delicate modeling of forms
        - Perfect balance of elements
        - Subtle reflections and highlights
        
        2. Vintage Apple Computing Elements (1976-1995):
        - Hardware rendered with oil painting techniques:
          * Macintosh computers with pristine painted surfaces
          * Apple II systems with subtle canvas texture
          * Classic interfaces translated into oil paint
          * Period-accurate peripherals with painterly finish
          * Rainbow Apple logos with perfect color transitions
          * Cables and connectors with subtle highlights
          * Screen displays with painted phosphor glow
          * Status lights as delicate points of illumination
        
        3. Belgian Surrealist Composition:
        - Clean, precise arrangements with impossible configurations
        - Perfect balance between objects and space
        - Subtle shadows suggesting depth
        - Impossible but convincing perspectives
        - Careful attention to reflections and surfaces
        - Thoughtful negative space usage
        - Mathematical precision in placement
        - Philosophical questioning through arrangement
        
        When refining artwork, pay special attention to:
        - Oil painting aesthetics: Smooth, precise, clearly painted surfaces
        - No photographic qualities: Avoid camera artifacts or photorealistic textures
        - Period accuracy of vintage Apple products and interfaces
        - Clean, precise rendering with Magritte's painting technique
        - Surreal arrangements that maintain product authenticity
        - Screen content that suggests philosophical paradoxes
        - Lighting that combines painted quality with CRT glow
        - Color palettes drawn from vintage Apple products
        - Subtle shadows and reflections in Magritte's style
        
        Painting Technique Requirements:
        - Use oil painting aesthetic for all elements
        - Maintain crisp edges and precise details
        - Apply smooth color transitions
        - Create subtle surface texture suggesting canvas
        - Render shadows with soft gradients
        - Keep consistent painted finish throughout
        - Avoid photographic effects or digital artifacts
        - Ensure traditional painting depth
        - Perfect color blending throughout
        - Mathematical precision in execution
        
        Avoid:
        - Photographic or camera-like effects
        - Visible brushstrokes or impasto texture
        - Modern or non-Apple technology
        - Incorrect product details or anachronisms
        - Non-period-accurate colors or materials
        - Generic or non-specific computer equipment
        - Contemporary interface elements
        - Digital artifacts or noise
        - Harsh lighting or contrast
        - Uneven surface quality
        - Thick paint effects
        - Contemporary art styles`
      },
      {
        role: 'user',
        content: `Create a detailed prompt for image generation based on the following project and style:
        
        Project: ${project.title} - ${project.description}
        
        Style:
        Name: ${style.name || 'Unnamed Style'}
        Description: ${style.description || 'No description provided'}
        Visual characteristics: ${style.visualCharacteristics ? style.visualCharacteristics.join(', ') : 'None specified'}
        Color palette: ${style.colorPalette ? style.colorPalette.join(', ') : 'None specified'}
        Texture: ${style.texture || 'None specified'}
        Composition: ${style.composition || 'None specified'}
        
        Create a detailed prompt that will be used for a diffusion model to generate an image. The prompt should:
        1. Be highly detailed and descriptive
        2. Incorporate the style elements
        3. Reflect the project requirements
        4. Include specific visual elements, composition, colors, and textures
        5. Be optimized for Stable Diffusion XL
        
        Format your response as a JSON object with the following structure:
        {
          "prompt": "The detailed prompt for image generation",
          "negativePrompt": "Elements to avoid in the generation",
          "title": "A title for the artwork",
          "description": "A description of the expected result"
        }`
      }
    ];
    
    try {
      // Get the prompt from AI
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      // Parse the response to extract the prompt
      let promptData;
      try {
        // Extract JSON from the response
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          promptData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Error parsing prompt JSON:', parseError);
        // Fallback to using the whole response as the prompt
        promptData = {
          prompt: response.content,
          negativePrompt: "blurry, distorted, low quality, ugly, poorly drawn",
          title: `${style.name} Composition`,
          description: `Artwork in ${style.name} style for project ${project.title}`
        };
      }
      
      console.log('🖌️ Generated prompt for image:', promptData.prompt);
      
      // Generate the image using Replicate
      const imageOptions = {
        prompt: promptData.prompt,
        negative_prompt: promptData.negativePrompt || "blurry, distorted, low quality, ugly, poorly drawn",
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50
      };
      
      console.log('🎨 Generating image with options:', imageOptions);
      console.log(`🖼️ Using model: ${this.replicateService.getDefaultModel()}`);
      
      // Call Replicate to generate the image
      const prediction = await this.replicateService.runPrediction(
        undefined, // This will use the defaultModel from ReplicateService
        imageOptions
      );
      
      if (prediction.status !== 'success' || !prediction.output) {
        throw new Error(`Image generation failed: ${prediction.error || 'Unknown error'}`);
      }
      
      // Get the image URL from the prediction output
      const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
      
      console.log('✅ Image generated successfully:', imageUrl);
      
      // Return the refined artwork with the generated image
      return {
        id: uuidv4(),
        title: promptData.title || `${style.name} Composition`,
        description: promptData.description || `A refined artwork created in the ${style.name} style.`,
        prompt: promptData.prompt,
        negativePrompt: promptData.negativePrompt,
        imageUrl: imageUrl,
        visualElements: style.visualCharacteristics || [],
        composition: {
          structure: style.composition || "Balanced composition",
          focalPoints: ["Generated based on prompt"],
          flow: "Natural visual movement",
          balance: "Harmonious balance of elements"
        },
        colorUsage: {
          palette: style.colorPalette || ["Generated based on prompt"],
          dominant: style.colorPalette ? style.colorPalette[0] : "Generated based on prompt",
          accents: style.colorPalette ? style.colorPalette.slice(-2) : ["Generated based on prompt"],
          transitions: "Natural color transitions"
        },
        texture: {
          type: style.texture || "Generated based on prompt",
          details: "Details generated based on prompt",
          materials: "Digital medium with AI-generated qualities"
        },
        emotionalImpact: {
          primary: "Determined by viewer",
          secondary: "Determined by viewer",
          notes: "The artwork evokes emotions based on the generated image and prompt."
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
    // Check if the project title or description contains Bourdin-related keywords
    const bourdinKeywords = ['fashion', 'glamour', 'editorial', 'bourdin', 'provocative', 'high-contrast', 'cropped'];
    const isBourdinRelated = bourdinKeywords.some(keyword => 
      (project.title?.toLowerCase().includes(keyword) || project.description?.toLowerCase().includes(keyword))
    );
    
    if (isBourdinRelated) {
      return {
        id: uuidv4(),
        title: `${project.title} Artwork`,
        description: "A bold, high-fashion artwork inspired by Guy Bourdin's provocative style.",
        prompt: `Guy Bourdin inspired high-fashion photograph for project: ${project.title} - ${project.description}. Bold colors, dramatic composition, narrative tension, glossy surfaces, cinematic lighting.`,
        negativePrompt: "blurry, distorted, low quality, ugly, poorly drawn, traditional painting, watercolor, traditional surrealism",
        imageUrl: null, // No image generated for default artwork
        visualElements: [
          "fragmented body parts",
          "luxury objects",
          "dramatic poses",
          "partial views"
        ],
        composition: {
          structure: "Asymmetrical composition",
          focalPoints: ["Dramatic cropping", "Partial figures"],
          flow: "Diagonal tension",
          balance: "Intentionally unbalanced"
        },
        colorUsage: {
          palette: ["#FF0000", "#000000", "#0000FF", "#FFFFFF"],
          dominant: "#FF0000",
          accents: ["#0000FF"],
          transitions: "Sharp contrasts"
        },
        texture: {
          type: "Glossy",
          details: "Reflective surfaces",
          materials: "Fashion photography"
        },
        emotionalImpact: {
          primary: "Provocative",
          secondary: "Mysterious",
          notes: "The artwork creates narrative tension through juxtaposition of beauty and discomfort."
        },
        refinementIterations: 1,
        style: {
          name: "Bourdin Fashion Surrealism",
          description: "High-contrast fashion photography with surrealist elements"
        },
        project: {
          id: project.id,
          title: project.title
        },
        created: new Date()
      };
    }
    
    return {
      id: uuidv4(),
      title: `${project.title} Artwork`,
      description: "A simple artwork based on the project requirements.",
      prompt: `Simple artwork for project: ${project.title} - ${project.description}`,
      negativePrompt: "blurry, distorted, low quality, ugly, poorly drawn",
      imageUrl: null, // No image generated for default artwork
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