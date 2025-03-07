import { AIService } from './index.js';

interface StyleApproach {
  description: string;
  elements: string[];
  techniques: string[];
  themes: string[];
  compositionalRules: string[];
}

const STYLE_APPROACHES: Record<string, StyleApproach> = {
  beeple: {
    description: "Dystopian maximalist style with hyper-detailed technological elements",
    elements: [
      "monumental structures",
      "dystopian landscapes",
      "corporate symbols",
      "technological decay",
      "political commentary",
      "pop culture references"
    ],
    techniques: [
      "extreme perspective",
      "volumetric lighting",
      "photorealistic rendering",
      "atmospheric effects",
      "cinematic composition"
    ],
    themes: [
      "technological dystopia",
      "corporate dominance",
      "environmental collapse",
      "digital culture",
      "political satire"
    ],
    compositionalRules: [
      "use monumental scale",
      "create depth through atmospheric perspective",
      "incorporate multiple light sources",
      "add small human elements for scale",
      "include recognizable symbols or logos"
    ]
  },
  xcopy: {
    description: "Glitch art style with dark themes and crypto-punk aesthetic",
    elements: [
      "glitch patterns",
      "skull motifs",
      "corrupted imagery",
      "crypto symbols",
      "digital artifacts",
      "minimal elements"
    ],
    techniques: [
      "pixel sorting",
      "data moshing",
      "scan lines",
      "high contrast",
      "digital distortion"
    ],
    themes: [
      "digital decay",
      "crypto culture",
      "existential dread",
      "technological anxiety",
      "digital mortality"
    ],
    compositionalRules: [
      "use stark contrasts",
      "incorporate glitch elements",
      "maintain minimal composition",
      "focus on single strong subject",
      "add digital noise and artifacts"
    ]
  },
  cherniak: {
    description: "Generative art style with mathematical precision and geometric elements",
    elements: [
      "geometric shapes",
      "wrapped strings",
      "mathematical curves",
      "perfect circles",
      "algorithmic patterns",
      "systematic grids"
    ],
    techniques: [
      "vector precision",
      "mathematical algorithms",
      "systematic variation",
      "geometric harmony",
      "controlled randomness"
    ],
    themes: [
      "mathematical beauty",
      "algorithmic complexity",
      "geometric abstraction",
      "systematic order",
      "computational art"
    ],
    compositionalRules: [
      "maintain geometric precision",
      "use systematic spacing",
      "incorporate mathematical ratios",
      "create balanced tension",
      "follow algorithmic rules"
    ]
  }
};

export class IdeatorAgent {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  async generateIdeasWithApproach(
    concept: string,
    options: {
      style?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<{
    ideas: string[];
    approach: StyleApproach;
    process: string;
  }> {
    try {
      // Get the selected style or default to Cherniak
      const selectedStyle = options.style?.toLowerCase() || 'cherniak';
      const styleApproach = STYLE_APPROACHES[selectedStyle] || STYLE_APPROACHES.cherniak;

      // Generate ideas using style-specific approach
      const response = await this.aiService.getCompletion({
        messages: [
          {
            role: 'system',
            content: `You are an expert art director specializing in ${selectedStyle}'s style. 
            Use the following style approach:
            ${JSON.stringify(styleApproach, null, 2)}
            
            Generate creative ideas that incorporate these style elements, techniques, and themes while following the compositional rules.`
          },
          {
            role: 'user',
            content: `Generate 3-5 unique artistic ideas for the concept: "${concept}"`
          }
        ],
        temperature: options.temperature || 0.8,
        maxTokens: options.maxTokens || 1000
      });

      // Process the response
      const ideas = this.extractIdeasFromResponse(response.content || '');
      const process = this.extractProcessFromResponse(response.content || '');

      return {
        ideas,
        approach: styleApproach,
        process
      };
    } catch (error) {
      console.error(`Error generating ideas: ${error}`);
      return {
        ideas: [],
        approach: STYLE_APPROACHES.cherniak,
        process: ''
      };
    }
  }

  private extractIdeasFromResponse(response: string): string[] {
    // Extract numbered or bulleted ideas from the response
    const ideaRegex = /(?:\d+[\)\.:]|\-|\*)\s*([^\n]+)/g;
    const matches = [...response.matchAll(ideaRegex)];
    return matches.map(match => match[1].trim());
  }

  private extractProcessFromResponse(response: string): string {
    // Extract any text after "Process:" or "Creative Process:"
    const processMatch = response.match(/(?:Creative\s*)?Process:([^]*?)(?=\d+[\)\.:]|\-|\*|$)/i);
    return processMatch ? processMatch[1].trim() : '';
  }
} 