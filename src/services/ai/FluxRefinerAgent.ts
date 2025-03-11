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

const MAGRITTE_REFINEMENT_CONFIG: RefinementConfig = {
  prompt_prefix: "IKIGAI Enhance in Magritte's meticulous oil painting style with ",
  prompt_suffix: ". Maximize philosophical depth and surreal juxtapositions while maintaining traditional oil painting quality. Render with absolute precision and pristine surface quality.",
  refinement_steps: 5,
  style_parameters: {
    oil_painting_quality: 0.98,
    surrealism_level: 0.95,
    philosophical_depth: 0.92,
    edge_precision: "crystalline",
    surface_finish: "pristine matte",
    lighting: "sourceless perfection",
    composition: "mathematical balance",
    detail_level: "museum quality",
    texture: "perfectly smooth",
    brushwork: "invisible",
    varnish: "traditional matte"
  },
  quality_checks: [
    "Verify flawless oil painting technique",
    "Check crystalline edge precision",
    "Ensure profound philosophical depth",
    "Validate surreal juxtapositions",
    "Confirm pristine matte surface",
    "Check mathematical composition",
    "Validate invisible brushwork",
    "Ensure perfect light modeling",
    "Confirm traditional varnish quality",
    "Verify philosophical paradox",
    "Check surreal scale relationships"
  ],
  style_elements: [
    "flawless oil paint application",
    "perfect matte finish",
    "crystalline detail rendering",
    "sourceless illumination",
    "impossible arrangements",
    "philosophical paradoxes",
    "mathematical precision",
    "surreal scale relationships",
    "metaphysical staging",
    "traditional glazing effects",
    "perfect color transitions"
  ],
  color_palette: [
    "sky blue (RGB: 135, 206, 235)",
    "deep shadow grey (RGB: 128, 128, 128)",
    "pure white (RGB: 255, 255, 255)",
    "philosophical black (RGB: 0, 0, 0)",
    "mystery green (RGB: 0, 100, 0)",
    "warm brown (RGB: 139, 69, 19)",
    "deep blue (RGB: 0, 0, 139)"
  ],
  composition_rules: [
    "Perfect central positioning",
    "Mysterious depth through precise placement",
    "Metaphysical balance of elements",
    "Surreal scale relationships",
    "Philosophical object placement",
    "Subject must fill 60-80% of frame",
    "Elements positioned for maximum impact",
    "Absolute symmetrical balance",
    "Perfect square 1:1 aspect ratio",
    "Stark shadow patterns"
  ],
  technical_requirements: [
    "Absolutely flat, shadowless surfaces",
    "Complete elimination of brushwork",
    "Surgical precision in details",
    "Perfect sourceless illumination",
    "Crystal-clear edge definition",
    "Pure, unmodulated color fields",
    "Complete texture elimination",
    "Perfect paint layering",
    "Traditional varnish finish",
    "Museum-quality execution"
  ]
};

export class FluxRefinerAgent {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  async refineArtworkInMagritteStyle(
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
            content: `You are an expert art refiner specializing in Magritte's surrealist style.
            Use the following refinement configuration:
            ${JSON.stringify(MAGRITTE_REFINEMENT_CONFIG, null, 2)}
            
            Generate specific refinement steps that enhance the artwork according to these style parameters and quality checks.`
          },
          {
            role: 'user',
            content: `Refine the following artwork prompt in Magritte's style:
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
      const refinedPrompt = this.buildRefinedPrompt(prompt, MAGRITTE_REFINEMENT_CONFIG, refinementSteps);

      return {
        refinedPrompt,
        refinementSteps,
        qualityChecks: MAGRITTE_REFINEMENT_CONFIG.quality_checks
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