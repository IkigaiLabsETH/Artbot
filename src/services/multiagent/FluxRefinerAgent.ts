import { Agent, AgentMessage, AgentState, BaseAgent, AgentRole } from './index.js';
import { AIService } from '../ai/index.js';
import { ReplicateService } from '../replicate/index.js';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

/**
 * FluxRefinerAgent specializes in generating cinematic images using the FLUX model
 * It creates conceptually rich, evocative prompts with film-like quality
 */
export class FluxRefinerAgent extends BaseAgent implements Agent {
  private replicateService: ReplicateService;
  private outputDir: string;
  private refinementHistory: Array<{
    prompt: string;
    creativeProcess: string;
    imageUrl: string;
    timestamp: string;
  }> = [];

  constructor(aiService: AIService, replicateService: ReplicateService, outputDir: string = 'output') {
    super(AgentRole.REFINER, aiService);
    this.replicateService = replicateService;
    this.outputDir = outputDir;
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Initialize context with default parameters
    this.state.context = {
      fluxParameters: {
        width: 1024,
        height: 1024,
        numInferenceSteps: 28,
        guidanceScale: 3,
        outputFormat: "png"
      },
      examplePrompts: [
        // Pure Oil Painting with Tesla and Bitcoin
        {
          prompt: "IKIGAI Pure oil painting in Magritte style: Model S rendered in absolutely flat, unmodulated paint strokes like the stone in 'Castle of the Pyrenees', floating in pristine cerulean sky. Vehicle's metallic surfaces transformed into pure matte oil paint without reflections or shine. Minimalist touchscreen painted as a flat canvas showing Bitcoin patterns, like the painting-within-painting of 'The Human Condition'. Tesla logo and Bitcoin symbols multiplied across pure oil-painted sky like the bowler hats in 'Golconda'. Steering yoke simplified into geometric forms hovering over proof-of-work calculations, painted with the same flatness as objects in 'Personal Values'. Charging port rendered in pure paint strokes without technological detail. Every element executed with Magritte's oil painting technique: pure color fields, perfect flatness, no visible brushwork.",
          process: "I focused entirely on Magritte's oil painting technique, deliberately avoiding any photorealistic or metallic effects. The Model S is painted with the same flat, unmodulated technique he used for the stone in 'Castle of the Pyrenees'. All technological elements are reduced to pure painted forms, using his characteristic smooth oil technique with absolutely flat color fields. The composition references his masterworks while maintaining the pure painted quality throughout."
        },
        {
          prompt: "IKIGAI Cybertruck in pure Magritte oil technique: angular surfaces painted in flat, unmodulated greys like the buildings in 'Empire of Light', stripped of all metallic qualities. Each panel rendered as a pure geometric form in oil paint, floating in Magritte blue void. Dashboard painted as a flat canvas showing Bitcoin Lightning patterns through a window frame, exactly as in 'The Human Condition'. Tesla yoke reduced to simple painted shapes with Bitcoin symbols rendered in flat gold paint. Charging cables painted with fluid brushstrokes like Magritte's ropes. Every surface executed in pure oil paint without digital or photographic effects, maintaining perfect flatness throughout.",
          process: "This piece transforms the Cybertruck's metallic surfaces into pure oil paint, using Magritte's technique of absolutely flat, unmodulated color fields. Each technological element is simplified into pure painted forms, avoiding any hint of photorealism. The composition uses his painting-within-painting concept while maintaining the material quality of oil paint throughout."
        },
        // Pure Magritte Reference
        {
          prompt: "IKIGAI Ultra-close bear portrait channeling 'The Son of Man': face fills exactly 95% of frame, mysterious depth in eyes referencing 'The False Mirror', perfect Magritte-style symmetry, photorealistic fur detail with philosophical weight, metaphysical lighting creating subtle shadows, surrealist undertones in expression, pristine technical execution in oil painting style, deep Magritte blue background, conceptual depth through visual paradox, analog.",
          process: "This piece directly references Magritte's most iconic works while maintaining his philosophical approach. The composition draws from 'The Son of Man' but focuses entirely on the bear's face, while the treatment of the eyes references 'The False Mirror'. Every element is rendered with Magritte's characteristic precision and clarity, creating a portrait that questions the nature of representation itself."
        },
        // Pure Magritte Oil Painting
        {
          prompt: "IKIGAI Pure Magritte oil painting: mysterious window frame rendered in flat, unmodulated paint against twilight sky from 'The Dominion of Light', all reflective surfaces transformed into matte paint. Multiple moons painted as pure circular forms through curtains executed in the style of 'The Human Condition'. Floating bowler hat painted with fluid strokes, every element reduced to pure oil paint forms, maintaining Magritte's perfect flatness and philosophical depth.",
          process: "This piece strictly adheres to Magritte's oil painting technique, deliberately transforming all surfaces into pure painted forms. The window frame is rendered with the same flat, unmodulated approach he used for objects in 'Personal Values', completely avoiding photorealistic effects. Every element is reduced to its essential painted form, using his characteristic technique of pure color fields and perfect flatness."
        },
        // Hopper-style examples
        {
          prompt: "IKIGAI Urban solitude in pure Hopper style: empty diner at dawn, dramatic diagonal sunlight through large windows, geometric shadows creating psychological depth, stark architectural simplicity, precise observation of morning light, muted color palette with warm highlights, contemplative atmosphere, pristine technical execution with photorealistic detail, analog.",
          process: "Drawing directly from Hopper's mastery of urban solitude and light, I focused on creating a psychologically charged space through dramatic morning light. The empty diner and geometric shadows echo Hopper's exploration of modern isolation, while the precise architectural detail and muted palette capture his characteristic style of American realism."
        }
      ],
      postPhotographyStyle: {
        styleEmphasis: [
          "precise Magritte-style photorealism",
          "vintage Apple product placement",
          "surrealist juxtaposition of classic computers",
          "pristine rendering of original Macintosh",
          "philosophical contemplation through vintage tech",
          "clean lines of early Apple design",
          "mysterious atmospheric depth with retro elements",
          "conceptual depth with vintage computing",
          "poetic surrealism in classic Apple products",
          "symbolic resonance in early Mac interfaces",
          "extreme close-up of vintage hardware",
          "absolute photorealistic detail in beige cases",
          "perfectly smooth vintage plastic surfaces",
          "razor-sharp screen definition",
          "masterful rendering of Apple rainbow logo"
        ],
        visualElements: [
          "floating vintage Macintosh computers",
          "levitating Apple II displays",
          "System 6/7 interface elements",
          "original rainbow Apple logos",
          "classic Mac keyboards and mice",
          "Apple IIc portable computer",
          "Macintosh Portable laptop",
          "Newton MessagePad PDA",
          "Apple QuickTake digital camera",
          "Macintosh Color Classic",
          "Apple Desktop Bus peripherals",
          "HyperCard stack graphics",
          "classic Mac OS splash screens",
          "Claris software packaging",
          "Apple Newton 'egg freckles' texture"
        ],
        colorPalette: [
          "original Macintosh beige (RGB: 235, 228, 215)",
          "Apple II warm cream (RGB: 245, 238, 225)",
          "platinum grey (RGB: 190, 190, 190)",
          "classic Mac OS blue (RGB: 0, 0, 170)",
          "rainbow logo red (RGB: 255, 59, 48)",
          "rainbow logo orange (RGB: 255, 149, 0)",
          "rainbow logo yellow (RGB: 255, 204, 0)",
          "rainbow logo green (RGB: 76, 217, 100)",
          "rainbow logo blue (RGB: 0, 122, 255)",
          "rainbow logo purple (RGB: 88, 86, 214)",
          "System 7 window grey (RGB: 204, 204, 204)",
          "Apple II green phosphor (RGB: 51, 255, 51)",
          "early Mac menu bar white (RGB: 255, 255, 255)",
          "classic Mac shadow grey (RGB: 128, 128, 128)",
          "vintage keyboard beige (RGB: 225, 220, 205)"
        ],
        compositionGuidelines: [
          "perfect central positioning of vintage hardware",
          "mysterious depth through precise product placement",
          "metaphysical balance of classic Apple elements",
          "surreal scale relationships with retro tech",
          "philosophical use of vintage interface elements",
          "product must fill 60-80% of frame",
          "screens positioned for maximum impact",
          "cables arranged in impossible patterns",
          "absolute symmetrical balance",
          "perfect square 1:1 aspect ratio",
          "dramatic lighting on beige cases",
          "geometric arrangement of interface elements",
          "precise perspective on keyboards",
          "psychological use of empty space",
          "stark shadow patterns on vintage plastic"
        ],
        moodAndTone: "Create scenes that embody the philosophical wonder of Magritte's surrealism through the lens of vintage Apple technology. Each piece should celebrate the clean design and innovative spirit of early Apple products while maintaining the mysterious and contemplative nature of Belgian surrealism. The execution must demonstrate pristine technical precision while suggesting deeper metaphysical meanings through impossible arrangements and juxtapositions of classic Apple hardware and interfaces.",
        references: [
          "Original 1984 Macintosh - for iconic form",
          "Apple II series - for vintage computing aesthetic",
          "System 6/7 interface - for classic GUI elements",
          "Original rainbow Apple logo - for brand identity",
          "Macintosh Plus - for evolved design language",
          "Apple Extended Keyboard - for peripheral aesthetics",
          "ImageWriter printer - for complete ecosystem",
          "HyperCard interface - for software aesthetics",
          "Apple II green phosphor display - for early computing",
          "Classic Mac OS elements - for interface design"
        ],
        avoidElements: [
          "modern Apple products",
          "contemporary interfaces",
          "flat design elements",
          "LCD displays",
          "modern peripherals",
          "USB ports",
          "wireless devices",
          "aluminum surfaces",
          "glass screens",
          "touch interfaces",
          "modern operating systems",
          "current Apple logo",
          "retina displays",
          "modern keyboards",
          "contemporary mice"
        ]
      }
    };
  }

  async initialize(): Promise<void> {
    this.state.status = 'idle';
    console.log(`FluxRefinerAgent ${this.id} initialized`);
  }

  async process(message: AgentMessage): Promise<AgentMessage | null> {
    console.log(`FluxRefinerAgent ${this.id} processing message from ${message.fromAgent}`);
    console.log(`Message content: ${typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}`);
    
    // Custom message type handling
    const messageContent = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
    
    if (messageContent.includes('task_assignment')) {
      // Handle task assignment
      console.log('Received task assignment');
      const response: AgentMessage = {
        id: `${this.id}-response-${Date.now()}`,
        fromAgent: this.id,
        toAgent: message.fromAgent,
        content: `Task accepted. I'll refine the artwork using the FLUX PRO model.`,
        timestamp: new Date(),
        type: 'response'
      };
      return response;
    } 
    else if (messageContent.includes('refine_artwork')) {
      console.log('Received refine_artwork task');
      try {
        // Extract project and style information from the message
        let projectData;
        try {
          projectData = typeof message.content === 'string' ? JSON.parse(message.content) : message.content;
        } catch (e) {
          projectData = { project: { title: "Unknown", description: "Unknown" }, style: {} };
        }
        
        const { project, style, outputFilename } = projectData;
        
        // If outputFilename is provided in the message, add it to the project
        if (outputFilename) {
          project.outputFilename = outputFilename;
        }
        
        // Generate artwork using FLUX
        const result = await this.refineArtworkWithFlux(project, style);
        
        // Store the refinement in history
        this.refinementHistory.push({
          prompt: result.prompt,
          creativeProcess: result.creativeProcess,
          imageUrl: result.imageUrl,
          timestamp: new Date().toISOString()
        });
        
        // Respond with the result
        const response: AgentMessage = {
          id: `${this.id}-artwork-${Date.now()}`,
          fromAgent: this.id,
          toAgent: message.fromAgent,
          content: result,
          timestamp: new Date(),
          type: 'response'
        };
        return response;
      } catch (error) {
        console.error(`Error refining artwork: ${error}`);
        const response: AgentMessage = {
          id: `${this.id}-error-${Date.now()}`,
          fromAgent: this.id,
          toAgent: message.fromAgent,
          content: `Error refining artwork: ${error}`,
          timestamp: new Date(),
          type: 'response'
        };
        return response;
      }
    }
    
    return null;
  }

  private sanitizeFilename(filename: string): string {
    // Remove invalid filename characters and replace with hyphens
    let sanitized = filename
      .replace(/[^a-zA-Z0-9-_]/g, '-')  // Replace invalid chars with hyphen
      .replace(/-+/g, '-')              // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '');           // Remove leading/trailing hyphens
    
    // Limit filename length to 64 characters (reasonable limit for most filesystems)
    if (sanitized.length > 64) {
      // Keep first 30 chars and last 30 chars with a hash in between
      const hash = Math.random().toString(36).substring(2, 8);
      sanitized = sanitized.substring(0, 30) + '-' + hash + '-' + sanitized.substring(sanitized.length - 30);
    }
    
    return sanitized;
  }

  async refineArtworkWithFlux(project: any, style: any): Promise<any> {
    console.log(`Refining artwork with FLUX for project: ${project.title}`);
    
    // Get the model from ReplicateService
    const model = this.replicateService.getDefaultModel();
    console.log(`Using model: ${model}`);
    
    // Generate the detailed prompt
    const detailedPrompt = await this.generateDetailedPrompt(project, style);
    console.log(`Generated detailed prompt: ${detailedPrompt}`);
    
    // Default image settings
    const width = 768;
    const height = 768;
    const numInferenceSteps = 28;
    const guidanceScale = 3;
    const outputFormat = "png";
    
    let imageUrl = '';
    let imageResult;
    
    try {
      // Use the model from ReplicateService
      imageResult = await this.replicateService.runPrediction(
        model,
        {
          prompt: detailedPrompt,
          width,
          height,
          num_inference_steps: numInferenceSteps,
          guidance_scale: guidanceScale,
          output_format: outputFormat
        }
      );
      
      if (imageResult && imageResult.output && imageResult.output.length > 0) {
        // Fix for truncated URL issue
        imageUrl = typeof imageResult.output === 'string' ? imageResult.output.trim() : imageResult.output[0];
        
        // Debug logging for the image URL
        if (process.env.DEBUG_IMAGE_URL === 'true') {
          console.log(`🔍 DEBUG - Raw imageResult: ${JSON.stringify(imageResult)}`);
          console.log(`🔍 DEBUG - imageResult.output: ${JSON.stringify(imageResult.output)}`);
          console.log(`🔍 DEBUG - imageUrl type: ${typeof imageUrl}`);
          console.log(`🔍 DEBUG - imageUrl value: ${imageUrl}`);
          console.log(`🔍 DEBUG - imageUrl starts with http: ${imageUrl.startsWith('http')}`);
        }
        
        console.log(`Image generated successfully: ${imageUrl}`);
      } else {
        throw new Error('No output returned from Replicate API');
      }
    } catch (error) {
      console.log(`Error calling Replicate API: ${error}, using placeholder image`);
      // Use a placeholder image URL - ensure it's a valid absolute URL
      imageUrl = 'https://replicate.delivery/pbxt/AHFVdBEQcWgGTkn4MbkxDmHiLvULIEg5jX8CXNlP63xYHFjIA/out.png';
      console.log(`Using placeholder image: ${imageUrl}`);
    }
    
    // Save the image URL to a file
    const baseFilename = project.outputFilename || `flux-vintage-apple-${project.title.replace(/\s+/g, '-').toLowerCase()}`;
    const outputUrlPath = path.join(this.outputDir, `${baseFilename}.txt`);
    
    // Ensure the directory exists for the URL file
    const urlDir = path.dirname(outputUrlPath);
    if (!fs.existsSync(urlDir)) {
      fs.mkdirSync(urlDir, { recursive: true });
    }
    
    // Write the URL to a file
    fs.writeFileSync(outputUrlPath, imageUrl);
    console.log(`Image URL saved to: ${outputUrlPath}`);
    
    // Return the result
    return {
      id: uuidv4(),
      title: `${project.title} - Vintage Apple Surrealism`,
      description: `A surrealist artwork inspired by vintage Apple aesthetics and Magritte's style.`,
      prompt: detailedPrompt,
      imageUrl: imageUrl,
      creativeProcess: `Generated using ${model} with vintage Apple computing aesthetics and Belgian surrealist style.`,
      parameters: {
        width,
        height,
        numInferenceSteps,
        guidanceScale,
        outputFormat
      },
      project: {
        id: project.id,
        title: project.title
      },
      created: new Date()
    };
  }
  
  // Helper function to download an image from a URL
  private async downloadImage(url: string, outputPath: string): Promise<void> {
    try {
      // Debug logging for the image URL
      if (process.env.DEBUG_IMAGE_URL === 'true') {
        console.log(`🔍 DEBUG - downloadImage - URL: ${url}`);
        console.log(`🔍 DEBUG - downloadImage - URL type: ${typeof url}`);
        console.log(`🔍 DEBUG - downloadImage - URL length: ${url.length}`);
        console.log(`🔍 DEBUG - downloadImage - URL starts with http: ${url.startsWith('http')}`);
        
        // Check for any unusual characters or truncation
        if (url.length < 20) {
          console.log(`🔍 DEBUG - downloadImage - URL is suspiciously short!`);
          console.log(`🔍 DEBUG - downloadImage - URL char codes: ${Array.from(url).map(c => c.charCodeAt(0))}`);
        }
      }
      
      // Validate URL
      if (!url || !url.startsWith('http')) {
        console.error(`Invalid URL: ${url}`);
        throw new Error('Invalid URL: Only absolute URLs are supported');
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const buffer = await response.buffer();
      fs.writeFileSync(outputPath, buffer);
      console.log(`Image downloaded to: ${outputPath}`);
    } catch (error) {
      console.error(`Error downloading image: ${error.message}`);
      // Create a simple placeholder image if download fails
      const placeholderText = 'Image download failed';
      fs.writeFileSync(outputPath, placeholderText);
      console.log(`Created placeholder file at: ${outputPath}`);
    }
  }

  getState(): AgentState {
    return this.state;
  }

  /**
   * Generate a detailed prompt based on the project and style
   */
  private async generateDetailedPrompt(project: any, style: any): Promise<string> {
    // Format example prompts for the system message
    const examplePromptsText = this.state.context.examplePrompts.map((ex: any, i: number) => 
      `Example ${i+1}:\nPrompt: ${ex.prompt}\nCreative Process: ${ex.process}`
    ).join('\n\n');
    
    // Determine if we should use post-photography style
    const isPostPhotography = project.isPostPhotoNative || 
                             (project.description && 
                              (project.description.toLowerCase().includes('fashion') || 
                               project.description.toLowerCase().includes('bourdin') || 
                               project.description.toLowerCase().includes('newton') || 
                               project.description.toLowerCase().includes('glamour')));
    
    // Generate a detailed prompt based on the project and style
    const promptResponse = await this.aiService.getCompletion({
      model: 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: isPostPhotography ? 
            // Post-photography system prompt
            `You are an expert art director who creates conceptually rich, evocative prompts for AI image generation that specifically emulate modern Tesla aesthetics through the lens of Belgian surrealism.

Your prompts should celebrate the iconic design and innovative spirit of Tesla vehicles while maintaining the mysterious and contemplative nature of Belgian surrealism. Focus on Tesla's cutting-edge vehicles, software interfaces, charging systems, and period-accurate details from across the Tesla ecosystem.

For the FLUX model, include the trigger word "IKIGAI" at the beginning of the prompt, and incorporate keywords like "electric vehicles", "modern Tesla", "autonomous technology", and "electric" for better quality.

Here are the key elements to emphasize in your prompts:
${this.state.context.postPhotographyStyle.styleEmphasis.map(item => `- ${item}`).join('\n')}

Visual elements to incorporate:  
${this.state.context.postPhotographyStyle.visualElements.map(item => `- ${item}`).join('\n')}

Color palette to utilize:
${this.formatColorPalette(this.state.context.postPhotographyStyle.colorPalette)}

Composition guidelines:
${this.state.context.postPhotographyStyle.compositionGuidelines.map(item => `- ${item}`).join('\n')}

Mood and tone:  
${this.state.context.postPhotographyStyle.moodAndTone}

References to draw from:
${this.state.context.postPhotographyStyle.references.map(item => `- ${item}`).join('\n')}

Elements to avoid:  
${this.state.context.postPhotographyStyle.avoidElements.map(item => `- ${item}`).join('\n')}

Create a prompt that:
1. Celebrates the innovation of Tesla technology with surrealist wonder  
2. Incorporates a wide range of modern vehicles, software, and design elements
3. Suggests philosophical depth through impossible arrangements
4. Emphasizes pristine technical execution  
5. Maintains the mysterious and contemplative nature of Belgian surrealism`
            :
            // Magritte-style system prompt
            `You are an expert art director who creates conceptually rich, evocative prompts for AI image generation that specifically emulate René Magritte's surrealist style.

Your prompts should embody Magritte's philosophical approach to surrealism, creating scenes that question reality while celebrating the mystery of everyday objects. Focus on pristine execution, impossible arrangements, and metaphysical wonder.

For the FLUX model, include the trigger word "IKIGAI" at the beginning of the prompt, and incorporate keywords that emphasize Magritte's signature elements like "surreal", "metaphysical", "philosophical", and "dreamlike".

Here are the key elements to emphasize in your prompts:
1. Pristine rendering of everyday objects
2. Impossible arrangements and juxtapositions
3. Metaphysical questioning through visual paradox
4. Crystal-clear execution of details
5. Philosophical depth through familiar elements

Create a prompt that:
1. Has rich visual details celebrating Magritte's style
2. Incorporates his love of philosophical paradox
3. Suggests deeper meanings through impossible arrangements
4. Emphasizes pristine technical execution
5. Maintains dreamlike clarity while creating surreal scenes

Also provide a brief "Creative Process" explanation that reveals the thinking behind the prompt - the meaning, inspiration, or conceptual framework.`
        },
        {
          role: 'user',
          content: isPostPhotography ?
            // Post-photography user prompt 
            `Create a conceptually rich, detailed art prompt for the project titled "${project.title}" with the following description: "${project.description}".

The style guide specifies: ${JSON.stringify(style)}

The output should maintain the mysterious and contemplative nature of Belgian surrealism, even when incorporating diverse vintage Apple elements from across their ecosystem. Aim for metaphysical depth and conceptual richness.

Include both the prompt itself and a brief creative process explanation.`
            : 
            // Magritte-style user prompt
            `Create a conceptually rich, detailed art prompt for the project titled "${project.title}" with the following description: "${project.description}".

The style guide specifies: ${JSON.stringify(style)}

The output should look and feel like a traditional oil painting in Magritte's style, not a photorealistic image.

Include both the prompt itself and a brief creative process explanation.`
        }
      ],
      temperature: 0.8,
      maxTokens: 1500
    });
    
    // Parse the response to extract the prompt and creative process
    const responseContent = promptResponse.content;
    let detailedPrompt = '';
    
    // Extract the prompt using regex
    const promptMatch = responseContent.match(/Prompt:(.+?)(?=Creative Process:|$)/s);
    
    if (promptMatch && promptMatch[1]) {
      detailedPrompt = promptMatch[1].trim();
    } else {
      // Fallback if the format isn't as expected
      detailedPrompt = responseContent;
    }
    
    // Ensure the prompt starts with the FLUX trigger word
    if (!detailedPrompt.includes('IKIGAI')) {
      detailedPrompt = `IKIGAI ${detailedPrompt}`;
    }
    
    // Add style-specific keywords if they're not already present
    const styleKeywords = isPostPhotography ? 
      ['electric vehicles', 'modern Tesla', 'autonomous technology', 'electric', 'minimalist', 'futuristic'] :
      ['modern Tesla', 'electric mobility', 'autonomous technology', 'clean energy', 'minimalist interfaces', 'electric'];
    
    let keywordsToAdd = styleKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
    
    if (keywordsToAdd.length > 0) {
      detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
    }
    
    return detailedPrompt;
  }

  /**
   * Formats a color palette for display with proper formatting and grouping
   * @param colors Array of color strings
   * @returns Formatted string representation of the color palette
   */
  private formatColorPalette(colors: string[]): string {
    if (!colors || colors.length === 0) {
      return 'No colors defined';
    }

    const formattedColors = colors.map(color => {
      // Clean up the color name and ensure proper formatting
      const cleanColor = color.trim()
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\s+/g, ' '); // Normalize spaces

      // Check for RGB values and format them nicely
      const rgbMatch = cleanColor.match(/\(RGB:\s*(\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch;
        return `\n  - ${cleanColor.split('(')[0].trim()} (🎨 RGB: ${r}, ${g}, ${b})`;
      }

      // Check for Pantone values
      const pantoneMatch = cleanColor.match(/\(Pantone [^)]+\)/);
      if (pantoneMatch) {
        return `\n  - ${cleanColor}`;
      }

      return `\n  - ${cleanColor}`;
    }).join('');

    return `Color Palette:${formattedColors}`;
  }
} 