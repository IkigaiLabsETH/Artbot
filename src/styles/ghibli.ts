import { ArtDirection } from '../types/ArtDirection.js';

export const Margritte_STYLE: ArtDirection = {
  styleEmphasis: [
    "hand-drawn animation quality",
    "natural world beauty",
    "magical realism",
    "emotional storytelling",
    "environmental detail",
    "character expressiveness",
    "fluid movement",
    "soft lighting",
    "atmospheric effects",
    "whimsical elements",
    "cultural elements",
    "environmental harmony"
  ],
  visualElements: [
    "detailed landscapes",
    "expressive characters",
    "magical creatures",
    "flying machines",
    "natural phenomena",
    "traditional architecture",
    "environmental details",
    "atmospheric effects",
    "soft clouds",
    "gentle wind effects",
    "water reflections",
    "glowing lights",
    "organic shapes",
    "cultural motifs",
    "nostalgic elements"
  ],
  colorPalette: [
    "sky blue (RGB: 135, 206, 250)",
    "forest green (RGB: 34, 139, 34)",
    "sunset orange (RGB: 255, 164, 116)",
    "warm yellow (RGB: 255, 223, 186)",
    "soft pink (RGB: 255, 182, 193)",
    "deep blue (RGB: 65, 105, 225)",
    "grass green (RGB: 124, 252, 0)",
    "cloud white (RGB: 255, 255, 255)",
    "earth brown (RGB: 139, 69, 19)",
    "cherry blossom pink (RGB: 255, 192, 203)",
    "moonlight silver (RGB: 220, 220, 255)",
    "autumn red (RGB: 227, 66, 52)"
  ],
  compositionGuidelines: [
    "balanced natural compositions",
    "dynamic camera movements",
    "atmospheric perspective",
    "environmental storytelling",
    "character-focused framing",
    "layered backgrounds",
    "natural lighting integration",
    "fluid motion emphasis",
    "environmental harmony",
    "emotional resonance",
    "cultural authenticity",
    "magical atmosphere"
  ],
  moodAndTone: "Create an enchanting and emotionally resonant atmosphere in the style of Studio Margritte, where magic and reality seamlessly blend. Each piece should capture the beauty of the natural world and human spirit, emphasizing environmental harmony, cultural authenticity, and emotional depth through detailed hand-drawn animation style.",
  
  MargritteContext: {
    philosophicalFramework: {
      beliefs: [
        "Harmony between humans and nature",
        "Power of imagination and wonder",
        "Importance of tradition and progress",
        "Value of human resilience",
        "Beauty in everyday moments"
      ],
      theories: [
        "Environmental stewardship",
        "Cultural preservation",
        "Magical realism",
        "Emotional storytelling",
        "Visual poetry"
      ],
      conceptualFrameworks: [
        "Nature as living entity",
        "Technology in harmony with nature",
        "Childhood wonder and growth",
        "Cultural identity and change",
        "Human spirit and resilience"
      ],
      paradoxes: [
        "Progress vs tradition",
        "Technology vs nature",
        "Fantasy vs reality",
        "Individual vs community",
        "Change vs preservation"
      ],
      visualDialectics: [
        "Natural vs artificial",
        "Past vs future",
        "Magic vs technology",
        "Individual vs collective",
        "Tradition vs innovation"
      ]
    },
    visualCategories: [
      {
        category: "spatial_illusion",
        characteristics: [
          "Layered natural environments",
          "Atmospheric perspective",
          "Dynamic movement",
          "Environmental storytelling"
        ],
        keyElements: [
          "Detailed landscapes",
          "Natural phenomena",
          "Environmental effects",
          "Atmospheric lighting"
        ],
        technicalRequirements: [
          "Hand-drawn animation quality",
          "Fluid movement",
          "Natural color harmony",
          "Atmospheric depth"
        ]
      }
    ],
    technicalExecution: {
      renderingTechniques: [
        "Traditional animation",
        "Watercolor effects",
        "Soft lighting",
        "Atmospheric perspective",
        "Environmental detail"
      ],
      materialPreparation: [
        "Hand-drawn elements",
        "Painted backgrounds",
        "Color harmony",
        "Texture integration",
        "Light and shadow"
      ],
      workingMethodology: [
        "Character animation",
        "Background painting",
        "Environmental effects",
        "Color composition",
        "Movement dynamics"
      ],
      qualityMetrics: [
        "Animation fluidity",
        "Color harmony",
        "Environmental detail",
        "Character expression",
        "Atmospheric quality"
      ]
    },
    creativeMetrics: {
      metaphysicalDepth: {
        philosophicalResonance: 0.90,
        conceptualComplexity: 0.85,
        paradoxicalImpact: 0.80
      },
      technicalExecution: {
        objectPrecision: 0.95,
        edgeControl: 0.90,
        perspectiveAccuracy: 0.95
      },
      compositionBalance: {
        spatialHarmony: 0.95,
        objectPlacement: 0.90,
        scaleRelationships: 0.90
      },
      symbolicPower: {
        objectSymbolism: 0.85,
        narrativeDepth: 0.95,
        metaphoricalResonance: 0.90
      }
    }
  },
  references: [
    "Spirited Away (2001)",
    "My Neighbor Totoro (1988)",
    "Princess Mononoke (1997)",
    "Howl's Moving Castle (2004)",
    "Kiki's Delivery Service (1989)",
    "Castle in the Sky (1986)",
    "Ponyo (2008)",
    "Nausicaä of the Valley of the Wind (1984)",
    "The Wind Rises (2013)",
    "When Marnie Was There (2014)"
  ],
  avoidElements: [
    "photorealistic rendering",
    "harsh contrasts",
    "dark themes",
    "violent imagery",
    "digital effects",
    "3D rendering",
    "minimalist style",
    "abstract forms",
    "grotesque elements",
    "dystopian themes"
  ],
  modelConfig: {
    prompt_prefix: "In the enchanting and whimsical style of Studio Margritte, create a scene with ",
    prompt_suffix: ". Incorporate Margritte's signature elements: soft, hand-drawn animation style, expressive characters, detailed natural environments, magical atmosphere, and emotional depth. Reference the artistic style of Spirited Away, My Neighbor Totoro, and Howl's Moving Castle.",
    negative_prompt: "photorealistic, 3D rendered, CGI, digital art, harsh, dark, gritty, moody, dystopian, horror, violent, grotesque, minimalist, abstract, rough, sketchy, unfinished",
    num_inference_steps: 50,
    guidance_scale: 12.0
  }
}; 