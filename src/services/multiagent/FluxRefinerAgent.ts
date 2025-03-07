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
        // Magritte-style examples
        {
          prompt: "IKIGAI Extreme close-up portrait in pure Magritte style: bear's face fills 95% of frame, metaphysical gaze with philosophical depth, crystalline clarity in execution, mysterious atmospheric depth behind eyes, perfect symmetrical composition, surrealist undertones in lighting, ultra-sharp facial features rendered with Magritte's precision, deep Magritte blue background (RGB: 28, 45, 83), pristine technical execution, oil painting quality with photorealistic detail, conceptual depth through visual paradox, 4k.",
          process: "Drawing directly from Magritte's philosophical approach to portraiture, I focused on creating a metaphysical presence through the bear's direct gaze. The extreme close-up format and crystalline clarity echo Magritte's precision, while the mysterious atmospheric depth creates that signature sense of philosophical questioning. Every element is rendered with his characteristic pristine technique, creating a portrait that exists in that liminal space between reality and surrealism that Magritte mastered."
        },
        {
          prompt: "IKIGAI Magritte-inspired bear portrait with hipster elements: vintage round glasses floating impossibly yet precisely rendered, eyes positioned exactly on upper third line with metaphysical intensity, face mathematically centered with philosophical weight, surrealist play of scale in accessories, crystal-clear fur detail meeting dreamlike atmosphere, perfect edge definition throughout, Magritte's signature color palette, oil painting aesthetics with photorealistic precision, 4k.",
          process: "I approached this piece by merging Magritte's precise technical execution with his love of philosophical paradox. The floating glasses create that signature Magritte tension between the real and the surreal, while the mathematical precision in the composition reflects his meticulous approach. The modern accessories are treated with his characteristic attention to surface quality and light, making them feel as if they've always existed in his universe."
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
          "metaphysical questioning through visual paradox",
          "surrealist juxtaposition of ordinary objects",
          "dreamlike clarity and pristine execution",
          "philosophical contemplation through imagery",
          "clean lines and perfect technical execution",
          "mysterious atmospheric depth",
          "conceptual depth with visual simplicity",
          "poetic surrealism in everyday objects",
          "symbolic resonance in ordinary items",
          "extreme close-up portrait technique",
          "absolute photorealistic detail in facial features",
          "perfectly smooth surface quality",
          "razor-sharp eye definition",
          "masterful fur rendering with Magritte-like precision",
          "precise architectural observation",
          "dramatic natural lighting",
          "psychological atmosphere",
          "urban solitude",
          "geometric simplification",
          "contemplative mood",
          "modern isolation",
          "stark contrasts",
          "emotional distance",
          "realistic detail"
        ],
        visualElements: [
          "surreal play of scale and proportion",
          "perfect balance of reality and dream",
          "mysterious atmospheric depth",
          "crystal-clear rendering of textures",
          "metaphysical window effect",
          "extreme macro close-up of bear face",
          "eyes and nose composition with Magritte-like presence",
          "face fills 95% of frame like a Magritte object",
          "perfect square 1:1 ratio crop",
          "ultra-sharp facial features in Magritte style",
          "large windows with dramatic light",
          "empty urban spaces",
          "geometric architectural forms",
          "stark shadows",
          "solitary figures or objects",
          "precise perspective",
          "minimalist interiors",
          "urban architecture",
          "morning or late afternoon light",
          "contemplative spaces"
        ],
        colorPalette: [
          "deep Magritte blue (RGB: 28, 45, 83)",
          "surrealist sky blue (RGB: 163, 193, 227)",
          "metaphysical grey (RGB: 128, 128, 128)",
          "bear fur brown (RGB: 89, 61, 43)",
          "eye highlight white (RGB: 245, 245, 245)",
          "iris detail brown (RGB: 75, 54, 33)",
          "philosophical black (RGB: 0, 0, 0)",
          "contemplative shadow (RGB: 40, 40, 40)",
          "mysterious highlight (RGB: 220, 220, 220)",
          "morning light yellow (RGB: 255, 236, 179)",
          "urban shadow blue (RGB: 68, 85, 102)",
          "architectural grey (RGB: 128, 128, 128)",
          "warm sunlight (RGB: 255, 214, 170)",
          "cool shadow (RGB: 87, 96, 111)",
          "muted wall tone (RGB: 230, 230, 230)",
          "psychological brown (RGB: 101, 67, 33)",
          "urban brick red (RGB: 165, 42, 42)"
        ],
        compositionGuidelines: [
          "perfect central positioning like Magritte's objects",
          "mysterious depth through precise placement",
          "metaphysical balance in frame",
          "surreal scale relationships",
          "philosophical use of negative space",
          "face must fill 95% of frame width",
          "eyes positioned exactly on upper third line",
          "nose perfectly centered on vertical axis",
          "absolute symmetrical balance",
          "perfect square 1:1 aspect ratio",
          "dramatic diagonal light placement",
          "geometric architectural framing",
          "precise perspective lines",
          "psychological use of empty space",
          "stark shadow patterns",
          "contemplative distance",
          "urban architectural elements",
          "minimalist interior arrangement",
          "natural light emphasis",
          "solitary object placement"
        ],
        moodAndTone: "Create scenes that embody Hopper's exploration of urban solitude and modern isolation. The execution must demonstrate his characteristic precise observation and psychological depth. Every element should contribute to a sense of contemplative stillness, with dramatic natural light creating emotional resonance. The architectural elements should be rendered with geometric clarity while maintaining psychological tension.",
        references: [
          "Magritte's 'The Son of Man' (1964) - for mysterious presence",
          "Magritte's 'The False Mirror' (1929) - for eye treatment",
          "Magritte's 'The Listening Room' (1952) - for scale and presence",
          "Magritte's 'The Blank Signature' (1965) - for technical execution",
          "Magritte's 'The Central Story' (1928) - for compositional balance",
          "Magritte's 'The Glass Key' (1959) - for surface treatment",
          "Hopper's 'Nighthawks' (1942) - for urban solitude and artificial light",
          "Hopper's 'Early Sunday Morning' (1930) - for architectural geometry",
          "Hopper's 'Morning Sun' (1952) - for dramatic natural light",
          "Hopper's 'Rooms by the Sea' (1951) - for psychological space",
          "Hopper's 'Office in a Small City' (1953) - for urban isolation"
        ],
        avoidElements: [
          "impressionistic brushwork",
          "expressionistic distortion",
          "loose or sketchy rendering",
          "textural experimentation",
          "abstract elements",
          "gestural marks",
          "anything below nose level",
          "anything above forehead",
          "three-quarter views",
          "profile angles",
          "tilted head poses",
          "looking away poses",
          "multiple light sources",
          "complex shadows",
          "atmospheric effects",
          "pattern elements",
          "decorative flourishes",
          "random elements",
          "busy scenes",
          "crowded compositions",
          "excessive detail",
          "romantic atmosphere",
          "expressionistic distortion",
          "decorative elements",
          "complex patterns",
          "chaotic arrangements",
          "fantasy elements",
          "sentimental mood"
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

  async refineArtworkWithFlux(project: any, style: any): Promise<any> {
    console.log(`Refining artwork with FLUX for project: ${project.title}`);
    console.log(`Output directory: ${this.outputDir}`);
    
    try {
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
              `You are an expert art director who creates conceptually rich, evocative prompts for AI image generation that specifically emulate post-photography high-fashion surrealism inspired by Guy Bourdin and Helmut Newton.

Your prompts should be layered with meaning, metaphor, and visual complexity - not just describing what something looks like, but what it means and how it feels. They should emphasize high-contrast colors, bold compositions, theatrical lighting, and the distinctive glossy, polished aesthetic of post-photography.

For the FLUX model, include the trigger word "IKIGAI" at the beginning of the prompt, and incorporate keywords like "high-fashion surrealism", "cinematic drama", "bold styling", "hyper-stylized", and "4k" for better quality.

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
1. Has rich visual details that evoke high-fashion surrealism
2. Incorporates bold styling and provocative elements
3. Suggests cinematic drama and narrative tension
4. Emphasizes hyper-stylized compositions and exaggerated contrast
5. Includes technical elements that enhance the glossy, polished aesthetic

Also provide a brief "Creative Process" explanation that reveals the thinking behind the prompt - the meaning, inspiration, or conceptual framework.`
              :
              // Magritte-style system prompt
              `You are an expert art director who creates conceptually rich, evocative prompts for AI image generation that specifically emulate René Magritte's oil painting style.

Your prompts should be layered with meaning, metaphor, and visual complexity - not just describing what something looks like, but what it means and how it feels. They should emphasize traditional oil painting techniques, visible brushstrokes, canvas texture, and the distinctive painterly quality of Magritte's work.

For the FLUX model, include the trigger word "IKIGAI" at the beginning of the prompt, and incorporate keywords like "oil painting", "traditional art", "canvas texture", "visible brushstrokes", and "painterly style" for better quality.

Here are the key elements to emphasize in your prompts:
1. Oil painting techniques and textures
2. Canvas-like qualities and traditional art materials
3. Visible brushwork and painterly effects
4. Non-photorealistic rendering
5. Magritte's distinctive color palette and composition style

Create a prompt that:
1. Has rich visual details and textures reminiscent of oil paintings
2. Incorporates conceptual depth and metaphorical elements typical of Magritte
3. Suggests the philosophical undertones present in Magritte's work
4. Emphasizes traditional painting aesthetics rather than photorealism
5. Includes technical elements that enhance the painterly quality (brushstrokes, canvas texture, etc.)

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
        ['high-fashion surrealism', 'cinematic drama', 'bold styling', 'hyper-stylized', 'exaggerated contrast', '4k'] :
        ['oil painting', 'traditional art', 'canvas texture', 'visible brushstrokes', 'painterly style', 'non-photorealistic'];
      
      let keywordsToAdd = styleKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
      
      if (keywordsToAdd.length > 0) {
        detailedPrompt = `${detailedPrompt}, ${keywordsToAdd.join(', ')}`;
      }
      
      console.log(`Generated prompt: ${detailedPrompt}`);
      
      // Save the prompt and creative process to a file
      const baseFilename = project.outputFilename || `flux-${project.title.replace(/\s+/g, '-').toLowerCase()}`;
      const promptFilename = `${baseFilename}-prompt.txt`;
      const promptFilePath = path.join(this.outputDir, promptFilename);
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
      await this.downloadImage(imageUrl, outputImagePath);
      console.log(`Image downloaded to: ${outputImagePath}`);
      
      // Save metadata about the generation
      const metadata = {
        project,
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