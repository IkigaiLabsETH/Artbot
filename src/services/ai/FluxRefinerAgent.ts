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

const STYLE_REFINEMENT_CONFIGS: Record<string, RefinementConfig> = {
  magritte: {
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
      "Verify period-accurate Apple details",
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
      "vintage Apple accuracy",
      "mathematical precision",
      "surreal scale relationships",
      "metaphysical staging",
      "traditional glazing effects",
      "perfect color transitions"
    ],
    color_palette: [
      "Macintosh beige (RGB: 235, 228, 215)",
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
      "Apple II green phosphor (RGB: 51, 255, 51)"
    ],
    composition_rules: [
      "Perfect central positioning of vintage hardware",
      "Mysterious depth through precise product placement",
      "Metaphysical balance of classic Apple elements",
      "Surreal scale relationships with retro tech",
      "Philosophical use of vintage interface elements",
      "Product must fill 60-80% of frame",
      "Screens positioned for maximum impact",
      "Absolute symmetrical balance",
      "Perfect square 1:1 aspect ratio",
      "Stark shadow patterns on vintage plastic"
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
  },
  vintage_computing: {
    prompt_prefix: "IKIGAI Refine with vintage Apple computing elements (1976-1995) in ",
    prompt_suffix: ". Emphasize period-accurate details and surreal technological poetry. Maintain perfect historical accuracy with philosophical depth.",
    refinement_steps: 4,
    style_parameters: {
      historical_accuracy: 0.98,
      surreal_tech: 0.95,
      detail_precision: 0.92,
      composition: "technological poetry",
      finish: "traditional oil",
      hardware_detail: "museum quality",
      interface_accuracy: "perfect",
      cable_rendering: "precise",
      plastic_surface: "pristine",
      screen_glow: "philosophical"
    },
    quality_checks: [
      "Verify period-accurate hardware details",
      "Check interface element authenticity",
      "Ensure surreal technological arrangements",
      "Validate traditional painting technique",
      "Confirm philosophical depth",
      "Verify original Apple colors",
      "Check hardware proportions",
      "Validate screen content accuracy",
      "Ensure cable and port precision",
      "Confirm bezel and button details"
    ],
    style_elements: [
      "original Macintosh beige",
      "rainbow Apple logo",
      "vintage interface elements",
      "period-accurate peripherals",
      "classic Apple II green",
      "System 6/7 interface",
      "original keyboard layout",
      "authentic port arrangement",
      "precise LED indicators",
      "accurate screen phosphor",
      "classic Mac OS elements",
      "period-correct typography"
    ],
    color_palette: [
      "original Macintosh beige (RGB: 235, 228, 215)",
      "Apple II warm cream (RGB: 245, 238, 225)",
      "platinum grey (RGB: 190, 190, 190)",
      "classic Mac OS blue (RGB: 0, 0, 170)",
      "System 7 window grey (RGB: 204, 204, 204)",
      "Apple II green phosphor (RGB: 51, 255, 51)",
      "vintage keyboard beige (RGB: 225, 220, 205)"
    ],
    composition_rules: [
      "Perfect product placement",
      "Historical accuracy in all details",
      "Authentic interface layouts",
      "Period-correct screen content",
      "Precise cable routing",
      "Accurate port placement",
      "Original packaging elements",
      "Authentic accessory arrangement",
      "Correct model-specific details",
      "Era-appropriate environment"
    ],
    technical_requirements: [
      "Perfect historical accuracy",
      "Precise hardware details",
      "Authentic interface elements",
      "Period-correct typography",
      "Accurate color matching",
      "Original logo placement",
      "Correct model features",
      "Authentic materials",
      "Era-specific wear patterns",
      "Original finish quality"
    ]
  },
  belgian_surrealism: {
    prompt_prefix: "IKIGAI Enhance in pure Belgian surrealist style with ",
    prompt_suffix: ". Maximize philosophical questioning and pristine execution. Create profound metaphysical paradoxes.",
    refinement_steps: 5,
    style_parameters: {
      painting_technique: 0.98,
      philosophical_depth: 0.95,
      surreal_logic: 0.92,
      execution: "flawless",
      surface: "perfect matte",
      metaphysical_quality: "profound",
      paradox_level: "sophisticated",
      reality_questioning: "deep",
      symbolic_resonance: "powerful",
      visual_poetry: "sublime"
    },
    quality_checks: [
      "Verify philosophical concept depth",
      "Check painting technique perfection",
      "Ensure surreal logic coherence",
      "Validate surface flawlessness",
      "Confirm visual poetry impact",
      "Verify metaphysical paradox",
      "Check symbolic resonance",
      "Ensure reality questioning",
      "Validate philosophical weight",
      "Confirm surreal narrative"
    ],
    style_elements: [
      "perfect oil technique",
      "philosophical paradox",
      "impossible reality",
      "pristine execution",
      "surreal narrative",
      "metaphysical depth",
      "symbolic resonance",
      "reality questioning",
      "visual poetry",
      "profound meaning",
      "mysterious atmosphere",
      "timeless quality"
    ],
    color_palette: [
      "Magritte sky blue (RGB: 135, 206, 235)",
      "surreal shadow grey (RGB: 128, 128, 128)",
      "metaphysical white (RGB: 255, 255, 255)",
      "philosophical black (RGB: 0, 0, 0)",
      "mystery green (RGB: 0, 100, 0)",
      "paradox brown (RGB: 139, 69, 19)",
      "impossible blue (RGB: 0, 0, 139)"
    ],
    composition_rules: [
      "Perfect philosophical balance",
      "Surreal space relationships",
      "Metaphysical depth arrangement",
      "Reality-questioning framing",
      "Symbolic object placement",
      "Mysterious atmosphere creation",
      "Paradoxical scale relationships",
      "Impossible perspective usage",
      "Profound meaning composition",
      "Timeless scene arrangement"
    ],
    technical_requirements: [
      "Flawless painting execution",
      "Perfect surface quality",
      "Complete reality suspension",
      "Profound philosophical impact",
      "Sophisticated paradox creation",
      "Masterful symbolic usage",
      "Perfect atmospheric control",
      "Complete technical mastery",
      "Absolute visual clarity",
      "Perfect metaphysical staging"
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