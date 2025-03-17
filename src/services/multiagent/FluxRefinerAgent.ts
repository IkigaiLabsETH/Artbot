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
        {
          prompt: "IKIGAI Pure Magritte oil painting: mysterious window frame rendered in flat, unmodulated paint against twilight sky from 'The Dominion of Light', all reflective surfaces transformed into matte paint. Multiple moons painted as pure circular forms through curtains executed in the style of 'The Human Condition'. Floating bowler hat painted with fluid strokes, every element reduced to pure oil paint forms, maintaining Magritte's perfect flatness and philosophical depth.",
          process: "This piece strictly adheres to Magritte's oil painting technique, deliberately transforming all surfaces into pure painted forms. The window frame is rendered with the same flat, unmodulated approach he used for objects in 'Personal Values', completely avoiding photorealistic effects. Every element is reduced to its essential painted form, using his characteristic technique of pure color fields and perfect flatness."
        },
        {
          prompt: "IKIGAI Magritte-style surrealist scene: perfectly rendered bowler hat floating against cerulean sky, casting impossible shadows on invisible ground. Crystal-clear execution in traditional oil technique, every element painted with absolute flatness. Green apple suspended in perfect stillness, rendered in pure unmodulated paint. Window frame revealing paradoxical night sky in daylight, executed with Magritte's precise technique. No visible brushwork, maintaining pristine surface throughout.",
          process: "Drawing directly from Magritte's masterful technique, this composition focuses on his signature motifs while maintaining perfect technical execution. Each element is rendered with his characteristic flat, unmodulated paint application, creating a scene that questions reality through pristine oil painting technique."
        },
        {
          prompt: "IKIGAI Classic Magritte paradox: stone castle floating impossibly above tranquil sea, rendered in pure oil paint technique referencing 'The Castle of the Pyrenees'. Perfect blue sky with mathematically arranged clouds, each one painted with unmodulated precision. Mysterious door opening to infinite sky, executed in style of 'The Victory'. Giant green apple occupying impossible scale, painted with absolute flatness like 'The Listening Room'. Every element maintaining Magritte's pristine surface quality.",
          process: "This composition combines several of Magritte's most powerful motifs and techniques. The floating castle employs his characteristic treatment of weight and gravity, while the door and apple explore his fascination with scale and spatial relationships. Every element is executed with his signature unmodulated paint application."
        },
        {
          prompt: "IKIGAI Pure Magritte technique: man in bowler hat with dove's face, referencing 'The Central Story'. Pristine blue sky background with mathematically precise clouds inspired by 'The Curse'. Traditional canvas texture visible in large areas, every surface painted with absolute flatness. Perfect shadows suggesting metaphysical depth, maintaining Magritte's signature style throughout. Mirror reflecting impossible scene as in 'Not to be Reproduced'.",
          process: "This piece combines Magritte's most iconic elements with his rigorous painting technique. Each component is executed with the same precise, flat application of paint that characterizes his work, creating a philosophically rich scene through pure painting means."
        },
        {
          prompt: "IKIGAI Magritte spatial paradox: perfectly rendered curtains revealing paradoxical landscape as in 'The Human Condition', painted with absolute flatness. Traditional oil painting approach with no visible brushwork. Room interior transitioning impossibly to exterior sky, executed with unmodulated paint strokes like 'The Domain of Arnheim'. Perfect shadows cast by objects floating in void, maintaining crystal-clear execution throughout. Giant pipe hovering like in 'The Treachery of Images', rendered with pure painted forms.",
          process: "This composition employs Magritte's characteristic painting technique to create a scene of philosophical depth. Each element is rendered with his precise, flat application of paint, avoiding any photographic effects in favor of pure painted forms. The spatial paradoxes reference his exploration of interior and exterior spaces."
        }
      ],
      postPhotographyStyle: {
        styleEmphasis: [
          "precise Magritte-style oil painting",
          "perfect unmodulated paint surfaces",
          "traditional canvas texture",
          "crystal-clear execution",
          "philosophical surrealism",
          "metaphysical depth",
          "pristine technical rendering",
          "absolute flatness in paint",
          "perfect shadow execution",
          "mathematical precision",
          "mysterious atmospheric quality",
          "conceptual paradox",
          "pure painted forms",
          "traditional oil technique",
          "perfect color transitions"
        ],
        visualElements: [
          "floating bowler hats",
          "mysterious windows",
          "paradoxical doors",
          "perfect green apples",
          "pristine blue skies",
          "mathematically precise clouds",
          "impossible shadows",
          "metaphysical curtains",
          "surreal landscapes",
          "floating stones",
          "mysterious birds",
          "perfect mirrors",
          "philosophical pipes",
          "enigmatic figures",
          "traditional frames"
        ],
        colorPalette: [
          "Magritte sky blue (RGB: 135, 206, 235)",
          "deep shadow grey (RGB: 74, 74, 74)",
          "perfect apple green (RGB: 86, 130, 89)",
          "pristine cloud white (RGB: 245, 245, 245)",
          "rich earth brown (RGB: 139, 69, 19)",
          "stone grey (RGB: 128, 128, 128)",
          "deep night blue (RGB: 25, 25, 112)",
          "matte black (RGB: 28, 28, 28)",
          "pure canvas cream (RGB: 255, 253, 208)",
          "shadow blue (RGB: 68, 85, 90)",
          "pale sky (RGB: 176, 196, 222)",
          "deep foliage (RGB: 47, 79, 79)",
          "twilight purple (RGB: 78, 81, 128)",
          "morning grey (RGB: 169, 169, 169)",
          "horizon blue (RGB: 137, 207, 240)"
        ],
        compositionGuidelines: [
          "perfect central positioning",
          "mathematical balance",
          "mysterious depth through precise placement",
          "metaphysical arrangement of elements",
          "surreal scale relationships",
          "philosophical use of space",
          "object must fill 60-80% of frame",
          "precise horizon placement",
          "impossible shadows",
          "absolute symmetrical balance",
          "perfect square 1:1 aspect ratio",
          "traditional painting perspective",
          "pristine geometric arrangement",
          "careful negative space",
          "stark shadow patterns"
        ],
        moodAndTone: "Create scenes that embody the philosophical wonder of Magritte's surrealism through pure oil painting technique. Each piece should celebrate his precise, unmodulated paint application while maintaining the mysterious and contemplative nature of Belgian surrealism. The execution must demonstrate pristine technical precision while suggesting deeper metaphysical meanings through impossible arrangements and juxtapositions.",
        references: [
          "'The Son of Man' - for iconic composition",
          "'The Human Condition' - for paradoxical windows",
          "'The Dominion of Light' - for impossible lighting",
          "'Empire of Light' - for day/night paradox",
          "'The False Mirror' - for scale and mystery",
          "'Golconda' - for repeated elements",
          "'The Castle of the Pyrenees' - for floating objects",
          "'Personal Values' - for scale distortion",
          "'The Treachery of Images' - for philosophical depth",
          "'Time Transfixed' - for impossible locomotion"
        ],
        avoidElements: [
          "visible brushstrokes",
          "expressionist elements",
          "abstract forms",
          "bright unrealistic colors",
          "chaotic compositions",
          "heavy textures",
          "modern references",
          "digital effects",
          "photographic qualities",
          "contemporary objects",
          "non-traditional materials",
          "gestural painting",
          "impasto technique",
          "loose handling",
          "spontaneous effects"
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
    const width = 2048;
    const height = 2048;
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
    const baseFilename = project.outputFilename || `flux-magritte-${project.title.replace(/\s+/g, '-').toLowerCase()}`;
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
      title: `${project.title} - Magritte Surrealism`,
      description: `A surrealist artwork in the style of René Magritte.`,
      prompt: detailedPrompt,
      imageUrl: imageUrl,
      creativeProcess: `Generated using ${model} in the style of Belgian surrealism, following Magritte's philosophical approach.`,
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
    
    // Generate a detailed prompt based on the project and style
    const promptResponse = await this.aiService.getCompletion({
      model: 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: `You are an expert art director who creates conceptually rich, evocative prompts for AI image generation that specifically emulate René Magritte's surrealist style.

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
          content: `Create a conceptually rich, detailed art prompt for the project titled "${project.title}" with the following description: "${project.description}".

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
    const styleKeywords = ['surreal', 'metaphysical', 'philosophical', 'dreamlike', 'mysterious', 'contemplative'];
    
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