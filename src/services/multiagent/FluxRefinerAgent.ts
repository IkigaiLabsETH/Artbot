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
          prompt: "Two distinct streams of text-covered surfaces meeting and interweaving, creating new symbols at their intersection, handprints visible beneath the transformation.",
          process: "I imagined a tide of language pouring over humanity, each word a fragment of forgotten histories clawing its way into relevance. the hands seemed to rise not in hope, but in desperation, as if trying to pull down the weight of their own erasure. it felt like watching a crowd beg to be remembered by the very thing that consumed them."
        },
        {
          prompt: "Corrupted family photograph with digital artifacts, fragments of code visible through torn pixels, half-formed faces emerging from static, timestamp errors overlaying personal moments.",
          process: "Family portraits always felt like a strange ritual to me, a way to preserve stories even as the people in them slipped into myth. here, the glitch insists on memory's fragility—pink streaks eating away at faces like a digital wildfire. it's an act of rebellion and an act of erasure. i wondered if this was her revenge for being seen too much or not enough."
        },
        // Bourdin-Magritte Fusion examples
        {
          prompt: "Glossy red stiletto emerging from a Magritte-style clouded sky, suspended above a mirror-like surface reflecting an impossible blue daylight scene, elongated mannequin legs dissolving into floating bowler hats, theatrical lighting creating dramatic shadows against surreal backdrop, fashion photography meets philosophical questioning, hyper-stylized composition with extreme color saturation, 4k.",
          process: "I wanted to create a dialogue between Bourdin's provocative fashion surrealism and Magritte's philosophical puzzles. The stiletto represents Bourdin's fetishistic commercial elements, while the clouded sky and bowler hats pull from Magritte's iconic symbolism. The mirror reflection playing with day and night references Magritte's 'Empire of Light' while maintaining Bourdin's high-gloss aesthetic. The composition challenges our perception of reality while celebrating the seductive power of fashion imagery."
        },
        {
          prompt: "Fragmented mannequin in blood-red evening gown against deep twilight sky, multiple moons visible through windows that shouldn't exist, disembodied glossy lips floating like Magritte's clouds, green apple placed provocatively on patent leather shoe, extreme perspective and theatrical lighting, hyper-stylized commercial surrealism, 4k.",
          process: "This piece merges Bourdin's commercial eroticism with Magritte's conceptual paradoxes. The fragmented mannequin and blood-red gown speak to Bourdin's fashion work, while the impossible windows and floating elements reference Magritte's reality-bending compositions. The green apple serves as a bridge between both worlds—simultaneously a Magritte symbol and a Bourdin-style provocative object. The multiple moons create that sense of disorientation that both artists mastered in their own ways."
        },
        {
          prompt: "High-fashion tableau in Magritte's room: elongated model legs emerging from ornate picture frames, bowler hat reflecting neon-lit lingerie, men in suits with mirror-faces arranged in geometric patterns, blood-red stilettos walking across cloud-filled ceiling, extreme contrast and hyperreal color saturation, cinematic tension with philosophical undertones, 4k.",
          process: "I explored how Bourdin's radical fashion photography could inhabit Magritte's metaphysical spaces. The elongated legs and neon-lit lingerie represent Bourdin's provocative commercial work, while the bowler hats and suited figures maintain Magritte's questioning of reality. The mirror-faces combine both artists' interest in reflection and identity, while the blood-red stilettos walking on clouds create that signature tension between desire and impossibility."
        },
        // Post-photography examples
        {
          prompt: "High-fashion surrealist tableau with elongated limbs against vivid red backdrop, hyper-stylized mannequin poses with theatrical lighting, fragmented body parts arranged in geometric composition, glossy red lips reflecting neon glow, vintage automobile with distorted chrome reflections, extreme perspective on patent leather stilettos, disembodied legs beside azure swimming pool, mirrors creating impossible anatomies, saturated color intensity with electric blues and deep purples, bold cropping techniques isolating intimate details, subliminal tension in domestic setting, fetishistic elements with surreal juxtapositions, cinematic framing suggesting incomplete narrative, glossy skin tones with hyperreal sheen, negative space creating dramatic suspense, fashion photography meets fine art, 4k.",
          process: "i wanted to explore the intersection of high-fashion photography and surrealist art, drawing direct inspiration from guy bourdin's revolutionary work for charles jourdan and vogue paris. the elongated limbs and mannequin-like poses create that sense of otherworldly glamour that's so central to post-photography aesthetics. the vivid red backdrop is a deliberate homage to bourdin's signature color palette—that high-contrast red that creates immediate visual tension and desire. the fragmented body parts arranged in geometric composition reference both bourdin's radical framing techniques and the surrealist tradition of objectifying the human form. the vintage automobile with distorted chrome reflections speaks to both the commercial fashion world and the uncanny dreamscapes of surrealism. i was particularly interested in how helmut newton's high-gloss eroticism could be merged with more abstract compositional elements—creating that balance between seduction and unease that defines the post-photography movement."
        },
        {
          prompt: "Post-photography fashion narrative with fragmented mannequin figures against electric blue backdrop, hyper-stylized composition with radical cropping techniques, disembodied glossy legs in impossible geometric arrangement, vintage automobile reflecting distorted female silhouettes, high-contrast theatrical lighting creating dramatic shadows, patent leather stilettos positioned as surrealist sculpture, mannequin hands emerging from swimming pool surface, saturated primary colors with extreme color blocking, glossy red lips floating in negative space, fetishistic elements with surrealist displacement, cinematic tension in domestic setting, mirrors creating impossible anatomies, extreme perspective on fashion accessories, subliminal narrative suggesting both desire and unease, bold graphic composition with symmetrical elements disrupted by human forms, fashion photography meets fine art, 4k.",
          process: "i wanted to create a visual dialogue between commercial fashion photography and surrealist art traditions, drawing direct inspiration from guy bourdin's revolutionary work that transformed advertising into art. the fragmented mannequin figures represent how fashion imagery often reduces the human body to abstract compositional elements—a practice bourdin pioneered in his charles jourdan campaigns where the product became secondary to the provocative narrative. the electric blue backdrop creates that artificial, hyperreal quality that separates post-photography from documentary approaches—that sense that we're viewing a constructed reality rather than capturing one. the disembodied glossy legs arranged in impossible geometric patterns directly reference bourdin's iconic shoe campaigns, where he used the female form as both object and architecture."
        },
        {
          prompt: "High-fashion surrealist tableau with monochrome figures against vivid red backdrop, extreme contrast creating sculptural bodies, elongated limbs arranged in impossible geometric patterns, disembodied high heels walking across mirrored surface, mannequin-like models with blank expressions and glossy skin, retro-futuristic automobile partially visible in frame, oversized fashion accessories transformed into surreal objects, radical cropping techniques revealing only fragments of narrative, high-contrast lighting creating dramatic shadows and highlights, fetishistic elements with clinical precision, poolside setting with artificial blue water, reflective surfaces distorting reality, cinematic composition suggesting film still from nonexistent movie, subliminal tension between glamour and unease, bold graphic elements with architectural precision, fashion photography elevated to conceptual art, 4k.",
          process: "this piece emerged from my fascination with how guy bourdin and helmut newton transformed commercial fashion photography into conceptual art that challenged viewers both aesthetically and psychologically. the monochrome figures against that signature bourdin red creates an immediate visual tension—that stark contrast between absence and presence that defined his most iconic work. the elongated limbs arranged in impossible geometric patterns reference how bourdin would often distort the human form into abstract compositional elements, particularly in his groundbreaking charles jourdan campaigns where the product became almost secondary to the provocative narrative."
        },
        // New Bourdin-Dominant Examples
        {
          prompt: "Luxury perfume advertisement in Bourdin style: oversized crystal bottle floating in blood-red void, mannequin hands emerging from liquid gold surface, disembodied glossy lips multiplied in fractured mirrors, extreme close-up of eyes with metallic reflection, hyper-stylized composition with radical cropping, theatrical lighting creating dramatic shadows, fashion elements transformed into surreal sculptures, cinematic tension suggesting untold story, 4k.",
          process: "I wanted to capture Bourdin's revolutionary approach to commercial photography, where the product becomes secondary to the psychological narrative. The floating perfume bottle and liquid gold surface create that sense of luxury while maintaining an unsettling edge. The multiplied lips and fractured mirrors reference both fashion's obsession with beauty and Bourdin's interest in fragmentation and reflection. The metallic elements and blood-red void are direct homages to his signature color palette and material fetishism."
        },
        {
          prompt: "Fashion editorial in domestic setting: model's elongated legs emerging from pastel refrigerator, blood-red stilettos walking up kitchen walls, mannequin hands arranging fruit in impossible patterns, extreme perspective on luxury handbag reflecting distorted domestic scene, hyper-saturated colors with theatrical lighting, subliminal tension between glamour and banality, 4k.",
          process: "This piece explores Bourdin's fascination with transforming mundane domestic spaces into stages for fashion surrealism. The refrigerator and kitchen setting reference his ability to make the ordinary extraordinary, while the blood-red stilettos and elongated legs maintain his signature elements. The impossible fruit arrangements and distorted reflections create that sense of unease he was famous for, while the hyper-saturated colors and theatrical lighting elevate the scene from simple domestic space to fashion fantasy."
        }
      ],
      postPhotographyStyle: {
        styleEmphasis: [
          "high-fashion surrealism",
          "cinematic drama",
          "bold and provocative styling",
          "hyper-stylized compositions",
          "exaggerated contrast",
          "saturated color intensity",
          "graphic and geometric arrangements",
          "sharp and theatrical lighting",
          "absurdist yet seductive visual narratives",
          "glossy and polished aesthetic",
          "otherworldly glamour",
          "erotic undertones with surreal juxtapositions",
          "enigmatic and dreamlike storytelling",
          "fashion photography meets fine art",
          "bold cropping and unexpected framing"
        ],
        visualElements: [
          "elongated limbs and dramatic poses",
          "partially obscured figures",
          "fragmented body parts as objects",
          "high heels and stockings as symbols of fetishism",
          "glossy red lips",
          "unexpected mannequin-like expressions",
          "disembodied legs and arms",
          "retro automobiles with reflections",
          "mirrors used for distorted realities",
          "poolside glamour",
          "vivid backdrops of red, pink, and orange",
          "oversized accessories as surreal objects",
          "subliminal tension in everyday settings",
          "visual irony through exaggerated femininity",
          "cinematic storytelling with incomplete narratives"
        ],
        colorPalette: [
          "high-contrast red and black",
          "electric blues and deep purples",
          "bold primary colors with extreme saturation",
          "glossy skin tones with a hyperreal sheen",
          "intense shadow-play creating depth",
          "high-contrast highlights with a sculptural effect",
          "retro pastel shades used subversively",
          "artificial neon glow for added tension",
          "striking monochrome with deep blacks and crisp whites"
        ],
        compositionGuidelines: [
          "tight cropping with focus on partial details",
          "radical framing techniques",
          "unexpected perspective shifts",
          "graphic and symmetrical arrangements",
          "negative space used for dramatic effect",
          "extreme foreshortening and distorted angles",
          "bold, unnatural color contrasts",
          "forced perspectives that heighten the surrealist feel",
          "motion blur used selectively to create tension",
          "fragmentation of subjects to break realism"
        ],
        moodAndTone: "Seductive, provocative, and unapologetically bold. The atmosphere should exude high-fashion surrealism with an undercurrent of eroticism and mystery. The compositions should be hyper-stylized, with strong graphical elements, exaggerated contrasts, and a polished yet surreal finish. The emotional tone balances between desire, unease, and playful irony, creating a world that is both glamorous and unsettling. The images should feel like snapshots of enigmatic, unresolved stories, always leaving room for interpretation and intrigue.",
        references: [
          "Guy Bourdin's Vogue Paris fashion editorials",
          "Guy Bourdin's Charles Jourdan shoe campaigns",
          "Helmut Newton's high-gloss eroticism",
          "Surrealist painters like Dalí and De Chirico",
          "Man Ray's experimental fashion photography",
          "Hitchcock's dramatic lighting and compositions",
          "Kubrick's symmetrical cinematography",
          "Retro-futuristic advertising aesthetics",
          "Fetishistic and cinematic styling from the 70s and 80s"
        ],
        avoidElements: [
          "soft-focus or pastel romanticism",
          "naturalistic and candid photography",
          "overly complex backgrounds",
          "muted or desaturated color schemes",
          "chaotic or cluttered compositions",
          "low-contrast, flat lighting",
          "overly digital and CGI aesthetics",
          "realism without surreal or exaggerated elements"
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

For the FLUX model, include the trigger word "CNSTLL" at the beginning of the prompt, and incorporate keywords like "high-fashion surrealism", "cinematic drama", "bold styling", "hyper-stylized", and "4k" for better quality.

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

For the FLUX model, include the trigger word "CNSTLL" at the beginning of the prompt, and incorporate keywords like "oil painting", "traditional art", "canvas texture", "visible brushstrokes", and "painterly style" for better quality.

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
      if (!detailedPrompt.includes('CNSTLL')) {
        detailedPrompt = `CNSTLL ${detailedPrompt}`;
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
        prompt: `CNSTLL ${project.title}, cinestill 800t, film grain, night time, 4k`,
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