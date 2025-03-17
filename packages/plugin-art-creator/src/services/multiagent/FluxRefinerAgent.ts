import { Agent, AgentMessage, AgentState, BaseAgent, AgentRole } from '../../types/index.js';
import { AIService } from '../ai/index.js';
import { ReplicateService } from '../replicate/index.js';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FluxRefinerAgent extends BaseAgent implements Agent {
  private replicateService: ReplicateService;
  private outputDir: string;
  private aiService: AIService;

  constructor(aiService: AIService, replicateService: ReplicateService, outputDir: string = 'output') {
    super(AgentRole.REFINER);
    this.aiService = aiService;
    this.replicateService = replicateService;
    this.outputDir = outputDir;
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async initialize(): Promise<void> {
    this.state.status = 'ready';
    console.log(`FluxRefinerAgent ${this.id} initialized`);
  }

  async process(message: AgentMessage): Promise<AgentMessage | null> {
    console.log(`FluxRefinerAgent ${this.id} processing message from ${message.fromAgent}`);
    
    const messageContent = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
    
    if (messageContent.includes('refine_artwork')) {
      try {
        let projectData;
        try {
          projectData = typeof message.content === 'string' ? JSON.parse(message.content) : message.content;
        } catch (e) {
          projectData = { project: { title: "Unknown", description: "Unknown" }, style: {} };
        }
        
        const { project, style } = projectData;
        
        // Generate artwork using FLUX
        const result = await this.refineArtworkWithFlux(project, style);
        
        // Respond with the result
        return {
          id: `${this.id}-artwork-${Date.now()}`,
          fromAgent: this.id,
          toAgent: message.fromAgent,
          content: result,
          timestamp: new Date(),
          type: 'response'
        };
      } catch (error) {
        console.error(`Error refining artwork: ${error}`);
        return {
          id: `${this.id}-error-${Date.now()}`,
          fromAgent: this.id,
          toAgent: message.fromAgent,
          content: `Error refining artwork: ${error}`,
          timestamp: new Date(),
          type: 'error'
        };
      }
    }
    
    return null;
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
    const numInferenceSteps = 200;
    const guidanceScale = 35;
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
          output_format: outputFormat,
          negative_prompt: "low quality, bad anatomy, blurry, pixelated, watermark"
        }
      );
      
      if (imageResult && imageResult.output && imageResult.output.length > 0) {
        imageUrl = typeof imageResult.output === 'string' ? imageResult.output.trim() : imageResult.output[0];
        console.log(`Image generated successfully: ${imageUrl}`);
      } else {
        throw new Error('No output returned from Replicate API');
      }
    } catch (error) {
      console.error(`Error calling Replicate API: ${error}`);
      throw error;
    }

    return {
      id: uuidv4(),
      imageUrl,
      prompt: detailedPrompt,
      parameters: {
        width,
        height,
        numInferenceSteps,
        guidanceScale,
        outputFormat
      }
    };
  }

  async generateDetailedPrompt(project: any, style: any): Promise<string> {
    // Implementation of generateDetailedPrompt
    return `IKIGAI: ${project.title}`;
  }
} 