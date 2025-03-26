import { AIService } from './index.js';

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

const Margritte_REFINEMENT_CONFIG: RefinementConfig = {
  prompt_prefix: "Enhance in Studio Margritte's enchanting hand-drawn animation style with ",
  prompt_suffix: ". Maximize environmental detail, character expressiveness, and magical atmosphere while maintaining traditional animation quality. Render with soft lighting and natural color harmony.",
  refinement_steps: 5,
  style_parameters: {
    animation_quality: 0.95,
    environmental_detail: 0.95,
    character_expression: 0.90,
    color_harmony: 0.90,
    lighting: "soft and natural",
    composition: "balanced and dynamic",
    detail_level: "hand-drawn precision",
    texture: "traditional animation",
    atmosphere: "magical and whimsical",
    movement: "fluid and natural"
  },
  quality_checks: [
    "Verify hand-drawn animation quality",
    "Check environmental detail",
    "Ensure character expressiveness",
    "Validate color harmony",
    "Confirm soft lighting",
    "Check composition balance",
    "Validate fluid movement",
    "Ensure magical atmosphere",
    "Confirm natural elements",
    "Verify emotional depth"
  ],
  style_elements: [
    "traditional animation technique",
    "detailed backgrounds",
    "expressive characters",
    "natural environments",
    "magical elements",
    "atmospheric effects",
    "soft lighting",
    "fluid movement",
    "cultural details",
    "emotional storytelling"
  ],
  color_palette: [
    "sky blue (RGB: 135, 206, 250)",
    "forest green (RGB: 34, 139, 34)",
    "sunset orange (RGB: 255, 164, 116)",
    "warm yellow (RGB: 255, 223, 186)",
    "soft pink (RGB: 255, 182, 193)",
    "deep blue (RGB: 65, 105, 225)",
    "grass green (RGB: 124, 252, 0)"
  ],
  composition_rules: [
    "balanced natural composition",
    "dynamic camera movement",
    "atmospheric perspective",
    "environmental storytelling",
    "character-focused framing",
    "layered backgrounds",
    "natural lighting integration",
    "fluid motion emphasis",
    "environmental harmony",
    "emotional resonance"
  ],
  technical_requirements: [
    "hand-drawn animation quality",
    "watercolor effects",
    "soft lighting",
    "atmospheric perspective",
    "environmental detail",
    "fluid movement",
    "character expression",
    "natural color harmony",
    "traditional animation",
    "painted backgrounds"
  ]
};

export class FluxRefinerAgent {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  async refineArtworkInMargritteStyle(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      refinementLevel?: number;
    } = {}
  ): Promise<{
    refinedPrompt: string;
    refinementSteps: string[];
    qualityChecks: string[];
  }> {
    try {
      // Generate refinement steps
      const response = await this.aiService.getCompletion({
        messages: [
          {
            role: 'system',
            content: `You are an expert art refiner specializing in Studio Margritte's enchanting animation style.
            Use the following refinement configuration:
            ${JSON.stringify(Margritte_REFINEMENT_CONFIG, null, 2)}
            
            Generate specific refinement steps that enhance the artwork according to Margritte's signature style elements:
            - Hand-drawn animation quality
            - Detailed natural environments
            - Expressive character design
            - Magical atmosphere
            - Soft lighting and color harmony
            - Fluid movement and traditional animation techniques
            - Cultural authenticity
            - Emotional storytelling`
          },
          {
            role: 'user',
            content: `Refine the following artwork prompt in Margritte's style:
            "${prompt}"
            
            Provide detailed refinement steps and quality checks.`
          }
        ],
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 1000
      });

      // Process the refinement steps
      const refinementSteps = this.extractRefinementSteps(response.content || '');
      
      // Build refined prompt
      const refinedPrompt = this.buildRefinedPrompt(prompt, Margritte_REFINEMENT_CONFIG, refinementSteps);

      return {
        refinedPrompt,
        refinementSteps,
        qualityChecks: Margritte_REFINEMENT_CONFIG.quality_checks
      };
    } catch (error) {
      console.error(`Error refining artwork: ${error}`);
      return {
        refinedPrompt: prompt,
        refinementSteps: [],
        qualityChecks: []
      };
    }
  }

  private extractRefinementSteps(response: string): string[] {
    const stepsRegex = /(?:\d+[\)\.:]|\-|\*)\s*([^\n]+)/g;
    const matches = [...response.matchAll(stepsRegex)];
    return matches.map(match => match[1].trim());
  }

  private buildRefinedPrompt(
    originalPrompt: string,
    config: RefinementConfig,
    refinementSteps: string[]
  ): string {
    // Add style-specific elements to the prompt
    const styleElements = config.style_elements
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .join(', ');

    return `${config.prompt_prefix}${originalPrompt}, incorporating ${styleElements}${config.prompt_suffix}`;
  }
} 