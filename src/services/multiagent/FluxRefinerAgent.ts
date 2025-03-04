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
            content: `You are an expert art director who creates conceptually rich, evocative prompts for AI image generation. 

Your prompts should be layered with meaning, metaphor, and visual complexity - not just describing what something looks like, but what it means and how it feels.

For the FLUX model (cinestill 800t style), include the trigger word "CNSTLL" at the beginning of the prompt, and incorporate keywords like "cinestill 800t", "night time", "film grain", and "4k" for better quality.

Here are examples of the sophisticated prompt style to emulate:

${examplePromptsText}

Create a prompt that:
1. Has rich visual details and textures
2. Incorporates conceptual depth and metaphorical elements
3. Suggests emotional or philosophical undertones
4. Works well with the cinematic, night-time aesthetic of FLUX
5. Includes technical elements that enhance the FLUX model (film grain, lighting details)

Also provide a brief "Creative Process" explanation that reveals the thinking behind the prompt - the meaning, inspiration, or conceptual framework.`
          },
          {
            role: 'user',
            content: `Create a conceptually rich, detailed art prompt for the project titled "${project.title}" with the following description: "${project.description}".

The style guide specifies: ${JSON.stringify(style)}

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
      
      // Add FLUX-specific keywords if they're not already present
      const fluxKeywords = ['cinestill 800t', 'film grain', 'night time', '4k'];
      let keywordsToAdd = fluxKeywords.filter(keyword => !detailedPrompt.toLowerCase().includes(keyword.toLowerCase()));
      
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
          imageUrl = imageResult.output[0];
          console.log(`Image generated: ${imageUrl}`);
        } else {
          throw new Error('No output returned from Replicate API');
        }
      } catch (error) {
        console.log(`Error calling Replicate API: ${error}, using placeholder image`);
        // Use a placeholder image URL
        imageUrl = 'https://placehold.co/768x768/000000/FFFFFF/png?text=Cosmic+Journey';
        console.log(`Using placeholder image: ${imageUrl}`);
      }
      
      // Save the image URL to a file
      const outputUrlPath = path.join(this.outputDir, `${baseFilename}.txt`);
      fs.writeFileSync(outputUrlPath, imageUrl);
      console.log(`Image URL saved to: ${outputUrlPath}`);
      
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
        imageUrl,
        localImagePath: outputImagePath,
        metadata
      };
    } catch (error) {
      console.error(`Error in refineArtworkWithFlux: ${error}`);
      
      // Create a default artwork as fallback
      return {
        prompt: `CNSTLL ${project.title}, cinestill 800t, film grain, night time, 4k`,
        creativeProcess: "Generated as fallback due to error in refinement process.",
        imageUrl: "https://replicate.delivery/placeholder.jpg",
        error: `${error}`
      };
    }
  }
  
  // Helper function to download an image from a URL
  private async downloadImage(url: string, outputPath: string): Promise<void> {
    const response = await fetch(url);
    const buffer = await response.buffer();
    fs.writeFileSync(outputPath, buffer);
    console.log(`Image downloaded to: ${outputPath}`);
  }

  getState(): AgentState {
    return this.state;
  }
} 