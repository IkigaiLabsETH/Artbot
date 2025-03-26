import { Agent, AgentMessage, AgentState, BaseAgent, AgentRole } from '../../types/index.js';
import { AIService } from '../ai/index.js';
import { ReplicateService } from '../replicate/index.js';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface RefinementConfig {
  prompt_prefix: string;
  prompt_suffix: string;
  refinement_steps: number;
  style_parameters: {
    [key: string]: number | string;
  };
  quality_checks: string[];
  style_elements: string[];
  color_palette: string[];
  composition_rules: string[];
  technical_requirements: string[];
}

const magritte_REFINEMENT_CONFIG: RefinementConfig = {
  prompt_prefix: "Create in the surrealist style of René Magritte, with ",
  prompt_suffix: ". Emphasize Magritte's signature elements: perfectly smooth matte finish, crystal clear edge definition, pure unmodulated color fields, and sourceless perfect illumination. Reference the artistic style of 'The Son of Man', 'The Human Condition', and 'The False Mirror'.",
  refinement_steps: 50,
  style_parameters: {
    painting_quality: 0.95,
    edge_definition: 0.95,
    color_fields: 0.90,
    illumination: 0.90,
    lighting: "sourceless and perfect",
    composition: "clean and enigmatic",
    detail_level: "meticulous precision",
    texture: "perfect matte finish",
    atmosphere: "mysterious and contemplative",
    movement: "suspended and still"
  },
  quality_checks: [
    "Verify perfect matte finish",
    "Check crystal clear edge definition",
    "Ensure pure unmodulated color fields",
    "Validate sourceless illumination",
    "Confirm enigmatic composition",
    "Check surrealist juxtaposition",
    "Validate meticulous technique",
    "Ensure philosophical depth",
    "Confirm symbolic elements",
    "Verify visual paradox"
  ],
  style_elements: [
    "Magritte's meticulous painting technique",
    "perfectly smooth surfaces",
    "crystal clear edges",
    "pure color fields",
    "sourceless illumination",
    "surrealist elements",
    "symbolic juxtaposition",
    "philosophical depth",
    "enigmatic composition",
    "visual paradox"
  ],
  color_palette: [
    "Magritte's cerulean blue (RGB: 30, 144, 255)",
    "deep navy blue (RGB: 0, 0, 128)",
    "pure white porcelain (RGB: 245, 245, 245)",
    "dark slate grey (RGB: 47, 79, 79)",
    "deep forest green (RGB: 0, 100, 0)",
    "dark emerald (RGB: 0, 66, 37)",
    "forest green (RGB: 34, 139, 34)",
    "light sky blue (RGB: 135, 206, 235)",
    "light grey (RGB: 211, 211, 211)",
    "light grey (RGB: 224, 224, 224)"
  ],
  composition_rules: [
    "perfect central positioning",
    "mathematical balance",
    "mysterious depth",
    "metaphysical arrangement",
    "surreal scale relationships",
    "philosophical space usage",
    "object must fill 60-80% of frame",
    "precise horizon placement",
    "impossible shadows",
    "absolute symmetrical balance"
  ],
  technical_requirements: [
    "perfect matte finish",
    "crystal clear edges",
    "pure color fields",
    "sourceless illumination",
    "meticulous technique",
    "precise geometric forms",
    "floating elements",
    "dreamlike atmosphere",
    "symbolic elements",
    "visual paradox"
  ]
};

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

  async refineArtworkWithFlux(project: any, options: any = {}): Promise<any> {
    try {
      // Generate refinement steps
      const response = await this.aiService.getCompletion({
        model: 'claude-3-sonnet-20240229',
        messages: [
          {
            role: 'system',
            content: `You are an expert art refiner specializing in René Magritte's surrealist style.
            Use the following refinement configuration:
            ${JSON.stringify(magritte_REFINEMENT_CONFIG, null, 2)}
            
            Generate specific refinement steps that enhance the artwork according to Magritte's signature style elements:
            - Perfect matte finish with crystal clear edges
            - Pure unmodulated color fields
            - Sourceless perfect illumination
            - Surrealist juxtaposition
            - Meticulous painting technique
            - Philosophical depth
            - Symbolic elements`
          },
          {
            role: 'user',
            content: `Refine the following artwork concept in Magritte's style:
            "${project.title}"
            
            Provide detailed refinement steps and quality checks.`
          }
        ],
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 1000
      });

      // Process the refinement steps
      const refinementSteps = this.extractRefinementSteps(response.content || '');
      
      // Build refined prompt with Magritte style emphasis
      const refinedPrompt = this.buildMagritteStyledPrompt(project.title, magritte_REFINEMENT_CONFIG, refinementSteps);

      // Generate the image using the refined prompt
      const result = await this.replicateService.runPrediction(
        this.replicateService.getDefaultModel(),
        {
          prompt: refinedPrompt,
          negative_prompt: "photorealistic, 3D rendered, CGI, digital art, harsh, dark, gritty, moody, dystopian, horror, violent, grotesque, Studio Ghibli, animation, whimsical, cute, fantasy",
          num_inference_steps: 50,
          guidance_scale: 12.0,
          width: 1440,
          height: 1440
        }
      );

      return {
        imageUrl: result.output,
        prompt: refinedPrompt,
        refinementSteps,
        creativeProcess: "Generated using Magritte-style refinement process"
      };
    } catch (error) {
      console.error(`Error refining artwork: ${error}`);
      throw error;
    }
  }

  private extractRefinementSteps(response: string): string[] {
    const stepsRegex = /(?:\d+[\)\.:]|\-|\*)\s*([^\n]+)/g;
    const matches = [...response.matchAll(stepsRegex)];
    return matches.map(match => match[1].trim());
  }

  private buildMagritteStyledPrompt(
    originalPrompt: string,
    config: RefinementConfig,
    refinementSteps: string[]
  ): string {
    // Add Magritte-specific style elements to the prompt
    const styleElements = config.style_elements
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .join(', ');

    // Combine with Magritte-specific atmosphere and technique
    return `${config.prompt_prefix}${originalPrompt}, incorporating ${styleElements}. Create with Magritte's signature elements: perfect matte finish, crystal clear edges, pure color fields, and sourceless illumination${config.prompt_suffix}`;
  }

  async generateDetailedPrompt(project: any, style: any): Promise<string> {
    // Implementation of generateDetailedPrompt
    return `IKIGAI: ${project.title}`;
  }
} 