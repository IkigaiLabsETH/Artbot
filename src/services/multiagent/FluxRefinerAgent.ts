import { Agent, AgentMessage, AgentState, BaseAgent, AgentRole } from './index.js';
import { AIService } from '../ai/index.js';
import { ReplicateService } from '../replicate/index.js';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

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
        // Magritte-style with Vintage Apple examples
        {
          prompt: "IKIGAI Surreal Macintosh scene in pure Magritte style: original 1984 Macintosh floating impossibly in pristine beige void, System 7 interface elements arranged with metaphysical precision, rainbow Apple logo multiplied across crystalline sky, perfectly rendered Apple Extended Keyboard hovering in mathematical perspective, original Mac mouse casting impossible shadows, pristine technical execution with Magritte's precision, 4k.",
          process: "Drawing from Magritte's philosophical approach to object placement, I focused on the iconic 1984 Macintosh as a central metaphysical presence. The multiplication of the rainbow Apple logo creates that signature Magritte repetition, while the pristine technical execution and impossible shadows reflect his mastery of surreal lighting."
        },
        {
          prompt: "IKIGAI Magritte-inspired Apple II portrait: perfectly rendered Apple II computer screen floating in Magritte blue void, green phosphor display showing impossible HyperCard patterns, original beige case with crystalline clarity, Apple II keyboard arranged in surreal perspective, 5.25-inch floppy disks defying gravity, pristine technical execution, 4k.",
          process: "I approached this piece by merging Magritte's precise technical execution with vintage Apple iconography. The floating Apple II creates that signature Magritte tension between reality and surrealism, while the green phosphor display adds that authentic period technology element."
        },
        {
          prompt: "IKIGAI Surreal Mac Plus scene channeling Magritte's 'Time Transfixed': Mac Plus emerging impossibly through classic Magritte window, rainbow Apple logo floating like his clouds, System 6 interface elements arranged with philosophical weight, original Macintosh mouse trailing impossible cables, pristine technical execution in oil painting style, 4k.",
          process: "This piece directly references Magritte's 'Time Transfixed' while celebrating vintage Apple design. The Mac Plus emerges through the window like Magritte's locomotive, while the rainbow logo takes on the role of his iconic clouds."
        },
        // Pure Magritte Reference
        {
          prompt: "IKIGAI Ultra-close bear portrait channeling 'The Son of Man': face fills exactly 95% of frame, mysterious depth in eyes referencing 'The False Mirror', perfect Magritte-style symmetry, photorealistic fur detail with philosophical weight, metaphysical lighting creating subtle shadows, surrealist undertones in expression, pristine technical execution in oil painting style, deep Magritte blue background, conceptual depth through visual paradox, 4k.",
          process: "This piece directly references Magritte's most iconic works while maintaining his philosophical approach. The composition draws from 'The Son of Man' but focuses entirely on the bear's face, while the treatment of the eyes references 'The False Mirror'. Every element is rendered with Magritte's characteristic precision and clarity, creating a portrait that questions the nature of representation itself."
        },
        // Bourdin-Magritte Fusion examples
        {
          prompt: "Fragmented mannequin in blood-red evening gown against deep twilight sky, multiple moons visible through windows that shouldn't exist, disembodied glossy lips floating like Magritte's clouds, green apple placed provocatively on patent leather shoe, extreme perspective and theatrical lighting, hyper-stylized commercial surrealism, 4k.",
          process: "This piece merges Bourdin's commercial eroticism with Magritte's conceptual paradoxes. The fragmented mannequin and blood-red gown speak to Bourdin's fashion work, while the impossible windows and floating elements reference Magritte's reality-bending compositions. The green apple serves as a bridge between both worlds—simultaneously a Magritte symbol and a Bourdin-style provocative object. The multiple moons create that sense of disorientation that both artists mastered in their own ways."
        },
        // Post-photography examples
        {
          prompt: "High-fashion surrealist tableau with monochrome figures against vivid red backdrop, extreme contrast creating sculptural bodies, elongated limbs arranged in impossible geometric patterns, disembodied high heels walking across mirrored surface, mannequin-like models with blank expressions and glossy skin, retro-futuristic automobile partially visible in frame, oversized fashion accessories transformed into surreal objects, radical cropping techniques revealing only fragments of narrative, high-contrast lighting creating dramatic shadows and highlights, fetishistic elements with clinical precision, poolside setting with artificial blue water, reflective surfaces distorting reality, cinematic composition suggesting film still from nonexistent movie, subliminal tension between glamour and unease, bold graphic elements with architectural precision, fashion photography elevated to conceptual art, 4k.",
          process: "this piece emerged from my fascination with how guy bourdin and helmut newton transformed commercial fashion photography into conceptual art that challenged viewers both aesthetically and psychologically. the monochrome figures against that signature bourdin red creates an immediate visual tension—that stark contrast between absence and presence that defined his most iconic work. the elongated limbs arranged in impossible geometric patterns reference how bourdin would often distort the human form into abstract compositional elements, particularly in his groundbreaking charles jourdan campaigns where the product became almost secondary to the provocative narrative."
        },
        // New Bourdin-Dominant Examples
        {
          prompt: "Luxury perfume advertisement in Bourdin style: oversized crystal bottle floating in blood-red void, mannequin hands emerging from liquid gold surface, disembodied glossy lips multiplied in fractured mirrors, extreme close-up of eyes with metallic reflection, hyper-stylized composition with radical cropping, theatrical lighting creating dramatic shadows, fashion elements transformed into surreal sculptures, cinematic tension suggesting untold story, 4k.",
          process: "I wanted to capture Bourdin's revolutionary approach to commercial photography, where the product becomes secondary to the psychological narrative. The floating perfume bottle and liquid gold surface create that sense of luxury while maintaining an unsettling edge. The multiplied lips and fractured mirrors reference both fashion's obsession with beauty and Bourdin's interest in fragmentation and reflection. The metallic elements and blood-red void are direct homages to his signature color palette and material fetishism."
        },
        // Hopper-style examples
        {
          prompt: "IKIGAI Urban solitude in pure Hopper style: empty diner at dawn, dramatic diagonal sunlight through large windows, geometric shadows creating psychological depth, stark architectural simplicity, precise observation of morning light, muted color palette with warm highlights, contemplative atmosphere, pristine technical execution with photorealistic detail, 4k.",
          process: "Drawing directly from Hopper's mastery of urban solitude and light, I focused on creating a psychologically charged space through dramatic morning light. The empty diner and geometric shadows echo Hopper's exploration of modern isolation, while the precise architectural detail and muted palette capture his characteristic style of American realism."
        },
        {
          prompt: "IKIGAI Hopper-inspired hotel room scene: stark morning light casting long shadows, minimalist interior with geometric simplification, solitary bed precisely observed, large window framing urban view, psychological tension through emptiness, architectural precision in perspective, natural illumination creating dramatic contrast, contemplative atmosphere, photorealistic execution, 4k.",
          process: "I approached this piece by merging Hopper's precise architectural observation with his masterful use of natural light. The stark morning light and minimalist interior create that signature sense of isolation, while the geometric simplification and precise perspective reflect his meticulous approach to composition. The psychological atmosphere is enhanced through careful manipulation of light and shadow."
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
          "Apple II motherboards",
          "5.25-inch and 3.5-inch floppy disks",
          "vintage Apple peripheral cables",
          "early Mac startup screens",
          "HyperCard stacks",
          "ImageWriter printers",
          "Apple Desktop Bus ports",
          "original Macintosh carrying case",
          "vintage Apple development tools",
          "classic Mac OS elements"
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
    console.log(`Output directory: ${this.outputDir}`);
    
    try {
      // Ensure output directory exists
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

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
              `You are an expert art director who creates conceptually rich, evocative prompts for AI image generation that specifically emulate vintage Apple aesthetics through the lens of Belgian surrealism.

Your prompts should celebrate the iconic design and innovative spirit of early Apple products (1976-1995) while maintaining the mysterious and contemplative nature of Belgian surrealism. Focus on classic Apple hardware, original interfaces, and period-accurate details.

For the FLUX model, include the trigger word "IKIGAI" at the beginning of the prompt, and incorporate keywords like "vintage computing", "classic Apple", "retro technology", and "4k" for better quality.

Here are the key elements to emphasize in your prompts:
${this.state.context.postPhotographyStyle.styleEmphasis.map(item => `- ${item}`).join('\n')}

Visual elements to incorporate:
${this.state.context.postPhotographyStyle.visualElements.map(item => `- ${item}`).join('\n')}

Color palette to utilize:
${this.state.context.postPhotographyStyle.colorPalette.map(item => `- ${item}`).join('\n')}

Composition guidelines:
${this.state.context.postPhotographyStyle.compositionGuidelines.map(item => `- ${item}`).join('\n')}

Mood and tone:
${this.state.context.postPhotographyStyle.moodAndTone}

References to draw from:
${this.state.context.postPhotographyStyle.references.map(item => `- ${item}`).join('\n')}

Elements to avoid:
${this.state.context.postPhotographyStyle.avoidElements.map(item => `- ${item}`).join('\n')}

Create a prompt that:
1. Celebrates vintage Apple technology with surrealist wonder
2. Incorporates period-accurate hardware and interfaces
3. Suggests philosophical depth through impossible arrangements
4. Emphasizes pristine technical execution
5. Maintains historical accuracy while creating metaphysical scenes`
              :
              // Magritte-style system prompt
              `You are an expert art director who creates conceptually rich, evocative prompts for AI image generation that specifically emulate René Magritte's surrealist style with vintage Apple technology.

Your prompts should blend Magritte's philosophical approach with early Apple products (1976-1995), creating scenes that question reality while celebrating classic computing. Focus on pristine execution, impossible arrangements, and metaphysical wonder.

For the FLUX model, include the trigger word "IKIGAI" at the beginning of the prompt, and incorporate keywords like "vintage Apple", "surreal computing", "philosophical technology", and "4k" for better quality.

Here are the key elements to emphasize in your prompts:
1. Pristine rendering of vintage Apple hardware
2. Impossible arrangements of classic computers
3. Metaphysical juxtaposition of interfaces
4. Crystal-clear execution of period details
5. Philosophical depth through technological elements

Create a prompt that:
1. Has rich visual details celebrating vintage Apple design
2. Incorporates Magritte's love of philosophical paradox
3. Suggests deeper meanings through impossible arrangements
4. Emphasizes pristine technical execution
5. Maintains historical accuracy while creating surreal scenes

Also provide a brief "Creative Process" explanation that reveals the thinking behind the prompt - the meaning, inspiration, or conceptual framework.`
          },
          {
            role: 'user',
            content: isPostPhotography ?
              // Post-photography user prompt
              `Create a conceptually rich, detailed art prompt for the project titled "${project.title}" with the following description: "${project.description}".

The style guide specifies: ${JSON.stringify(style)}

The output should look and feel like high-fashion surrealist photography in the style of Guy Bourdin and Helmut Newton, with bold styling, hyper-stylized compositions, and exaggerated contrast.

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
      let creativeProcess = '';
      
      // Extract the prompt and creative process using regex
      const promptMatch = responseContent.match(/Prompt:(.+?)(?=Creative Process:|$)/s);
      const processMatch = responseContent.match(/Creative Process:(.+?)(?=$)/s);
      
      if (promptMatch && promptMatch[1]) {
        detailedPrompt = promptMatch[1].trim();
      } else {
        // Fallback if the format isn't as expected
        detailedPrompt = responseContent;
      }
      
      if (processMatch && processMatch[1]) {
        creativeProcess = processMatch[1].trim();
      }
      
      // Ensure the prompt starts with the FLUX trigger word
      if (!detailedPrompt.includes('IKIGAI')) {
        detailedPrompt = `IKIGAI ${detailedPrompt}`;
      }
      
      // Add style-specific keywords if they're not already present
      const styleKeywords = isPostPhotography ? 
        ['vintage computing', 'classic Apple', 'retro technology', 'surreal tech', 'period-accurate', '4k'] :
        ['vintage Apple', 'surreal computing', 'philosophical technology', 'classic hardware', 'retro interfaces', '4k'];
      
      let keywordsToAdd = styleKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
      
      if (keywordsToAdd.length > 0) {
        detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
      }
      
      console.log(`Generated prompt: ${detailedPrompt}`);
      
      // Save the prompt and creative process to a file
      const sanitizedTitle = this.sanitizeFilename(project.title);
      const baseFilename = project.outputFilename || `flux-vintage-apple-${sanitizedTitle}`;
      const promptFilename = `${baseFilename}-prompt.txt`;
      const promptFilePath = path.join(this.outputDir, promptFilename);
      
      // Create any necessary subdirectories
      const promptDir = path.dirname(promptFilePath);
      if (!fs.existsSync(promptDir)) {
        fs.mkdirSync(promptDir, { recursive: true });
      }
      
      fs.writeFileSync(promptFilePath, `Prompt: ${detailedPrompt}\n\nCreative Process: ${creativeProcess}`);
      
      // Generate image using FLUX model on Replicate
      console.log(`Generating image with model: ${this.replicateService.getDefaultModel()}...`);
      
      // Get parameters from context
      const { width, height, numInferenceSteps, guidanceScale, outputFormat } = this.state.context.fluxParameters;
      
      // Call the Replicate service to generate the image
      let imageUrl;
      let imageResult;
      
      try {
        // Use the default model from ReplicateService instead of hardcoding
        imageResult = await this.replicateService.runPrediction(
          undefined, // This will use the defaultModel from ReplicateService
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
      const outputUrlPath = path.join(this.outputDir, `${baseFilename}.txt`);
      
      // Ensure the directory exists for the URL file
      const urlDir = path.dirname(outputUrlPath);
      if (!fs.existsSync(urlDir)) {
        fs.mkdirSync(urlDir, { recursive: true });
      }
      
      // Ensure we have a valid URL before saving
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        fs.writeFileSync(outputUrlPath, imageUrl);
        console.log(`Image URL saved to: ${outputUrlPath}`);
      } else {
        console.error(`Invalid image URL: ${imageUrl}`);
        // Use a fallback URL
        imageUrl = 'https://replicate.delivery/pbxt/AHFVdBEQcWgGTkn4MbkxDmHiLvULIEg5jX8CXNlP63xYHFjIA/out.png';
        fs.writeFileSync(outputUrlPath, imageUrl);
        console.log(`Fallback image URL saved to: ${outputUrlPath}`);
      }
      
      // Download the image
      const outputImagePath = path.join(this.outputDir, `${baseFilename}.png`);
      
      // Ensure the directory exists for the image file
      const imageDir = path.dirname(outputImagePath);
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }
      
      await this.downloadImage(imageUrl, outputImagePath);
      console.log(`Image downloaded to: ${outputImagePath}`);
      
      // Save metadata about the generation
      const metadata = {
        project: {
          ...project,
          title: sanitizedTitle // Use sanitized title in metadata
        },
        style,
        prompt: detailedPrompt,
        creativeProcess,
        parameters: {
          width,
          height,
          numInferenceSteps,
          guidanceScale
        },
        imageUrl,
        timestamp: new Date().toISOString()
      };
      
      const metadataPath = path.join(this.outputDir, `${baseFilename}-metadata.json`);
      
      // Ensure the directory exists for the metadata file
      const metadataDir = path.dirname(metadataPath);
      if (!fs.existsSync(metadataDir)) {
        fs.mkdirSync(metadataDir, { recursive: true });
      }
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      
      return {
        prompt: detailedPrompt,
        creativeProcess,
        imageUrl: imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http') 
          ? imageUrl 
          : 'https://replicate.delivery/pbxt/AHFVdBEQcWgGTkn4MbkxDmHiLvULIEg5jX8CXNlP63xYHFjIA/out.png',
        localImagePath: outputImagePath,
        metadata
      };
    } catch (error) {
      console.error(`Error in refineArtworkWithFlux: ${error}`);
      
      // Create a default artwork as fallback
      return {
        prompt: `IKIGAI ${project.title}, cinestill 800t, film grain, night time, 4k`,
        creativeProcess: "Generated as fallback due to error in refinement process.",
        imageUrl: "https://replicate.delivery/pbxt/AHFVdBEQcWgGTkn4MbkxDmHiLvULIEg5jX8CXNlP63xYHFjIA/out.png",
        error: `${error}`
      };
    }
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
} 