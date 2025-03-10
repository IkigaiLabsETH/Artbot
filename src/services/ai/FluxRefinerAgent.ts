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
}

const STYLE_REFINEMENT_CONFIGS: Record<string, RefinementConfig> = {
  beeple: {
    prompt_prefix: "Enhance in Beeple's signature style with ",
    prompt_suffix: ". Maximize detail and dystopian atmosphere while maintaining photorealistic quality.",
    refinement_steps: 3,
    style_parameters: {
      detail_level: 0.9,
      atmosphere: 0.85,
      scale: "monumental",
      lighting: "dramatic",
      texture: "hyper-detailed"
    },
    quality_checks: [
      "Verify monumental scale",
      "Check atmospheric perspective",
      "Ensure technological details",
      "Validate lighting drama",
      "Confirm dystopian elements"
    ],
    style_elements: [
      "volumetric lighting",
      "atmospheric haze",
      "technological details",
      "dystopian elements",
      "cinematic composition"
    ]
  },
  xcopy: {
    prompt_prefix: "Refine in XCOPY's distinctive style with ",
    prompt_suffix: ". Enhance glitch effects and dark atmosphere while maintaining minimal composition.",
    refinement_steps: 2,
    style_parameters: {
      glitch_intensity: 0.8,
      contrast: 0.9,
      noise: "digital",
      composition: "minimal",
      mood: "dark"
    },
    quality_checks: [
      "Verify glitch effects",
      "Check contrast levels",
      "Ensure minimal composition",
      "Validate dark atmosphere",
      "Confirm digital artifacts"
    ],
    style_elements: [
      "glitch patterns",
      "high contrast",
      "digital artifacts",
      "minimal elements",
      "dark mood"
    ]
  },
  cherniak: {
    prompt_prefix: "Enhance in Cherniak's algorithmic style with ",
    prompt_suffix: ". Maximize geometric precision and systematic variation while maintaining mathematical harmony.",
    refinement_steps: 4,
    style_parameters: {
      precision: 0.95,
      geometry: "exact",
      variation: "systematic",
      balance: "mathematical",
      complexity: "controlled"
    },
    quality_checks: [
      "Verify geometric precision",
      "Check mathematical ratios",
      "Ensure systematic variation",
      "Validate compositional balance",
      "Confirm algorithmic patterns"
    ],
    style_elements: [
      "geometric forms",
      "mathematical curves",
      "systematic patterns",
      "precise spacing",
      "algorithmic variation"
    ]
  },
  belgian_surrealism: {
    prompt_prefix: "Refine in Belgian Surrealist style with ",
    prompt_suffix: ". Emphasize dream-like imagery, symbolic depth, and unexpected juxtapositions.",
    refinement_steps: 3,
    style_parameters: {
      surrealism_level: 0.9,
      symbolism: 0.85,
      juxtaposition: "unexpected",
      atmosphere: "dream-like",
      clarity: "symbolic"
    },
    quality_checks: [
      "Verify dream-like atmosphere",
      "Check symbolic clarity",
      "Ensure unexpected juxtapositions",
      "Validate surrealist narrative",
      "Confirm visual coherence"
    ],
    style_elements: [
      "floating objects",
      "symbolic imagery",
      "unexpected scale",
      "dream-like settings",
      "visual paradoxes"
    ]
  }
};

export class FluxRefinerAgent {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  async refineArtworkWithStyle(
    prompt: string,
    options: {
      style?: string;
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
      // Get style configuration
      const selectedStyle = options.style?.toLowerCase() || 'cherniak';
      const styleConfig = STYLE_REFINEMENT_CONFIGS[selectedStyle] || STYLE_REFINEMENT_CONFIGS.cherniak;

      // Generate refinement steps
      const response = await this.aiService.getCompletion({
        messages: [
          {
            role: 'system',
            content: `You are an expert art refiner specializing in ${selectedStyle}'s style.
            Use the following refinement configuration:
            ${JSON.stringify(styleConfig, null, 2)}
            
            Generate specific refinement steps that enhance the artwork according to these style parameters and quality checks.`
          },
          {
            role: 'user',
            content: `Refine the following artwork prompt in ${selectedStyle}'s style:
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
      const refinedPrompt = this.buildRefinedPrompt(prompt, styleConfig, refinementSteps);

      return {
        refinedPrompt,
        refinementSteps,
        qualityChecks: styleConfig.quality_checks
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