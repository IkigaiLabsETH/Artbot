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
        width: 768,
        height: 768,
        numInferenceSteps: 28,
        guidanceScale: 3,
        outputFormat: "png"
      },
      examplePrompts: [
        {
          prompt: "Two distinct streams of text-covered surfaces meeting and interweaving, creating new symbols at their intersection, handprints visible beneath the transformation.",
          process: "I imagined a tide of language pouring over humanity, each word a fragment of forgotten histories clawing its way into relevance. the hands seemed to rise not in hope, but in desperation, as if trying to pull down the weight of their own erasure. it felt like watching a crowd beg to be remembered by the very thing that consumed them."
        },
        {
          prompt: "Corrupted family photograph with digital artifacts, fragments of code visible through torn pixels, half-formed faces emerging from static, timestamp errors overlaying personal moments.",
          process: "Family portraits always felt like a strange ritual to me, a way to preserve stories even as the people in them slipped into myth. here, the glitch insists on memory's fragility—pink streaks eating away at faces like a digital wildfire. it's an act of rebellion and an act of erasure. i wondered if this was her revenge for being seen too much or not enough."
        }
      ]
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
        content: `Task accepted. I'll refine the artwork using the FLUX cinematic model.`,
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
      
      // Generate a detailed prompt based on the project and style
      const promptResponse = await this.aiService.getCompletion({
        model: 'claude-3-sonnet-20240229',
        messages: [
          {
            role: 'system',
            content: `You are an expert art director who creates conceptually rich, evocative prompts for AI image generation that specifically emulate René Magritte's oil painting style.

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
      
      // Add painting-specific keywords if they're not already present
      const paintingKeywords = ['oil painting', 'traditional art', 'canvas texture', 'visible brushstrokes', 'painterly style', 'non-photorealistic'];
      let keywordsToAdd = paintingKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
      
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