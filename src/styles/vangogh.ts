import { ArtDirection } from '../types/ArtDirection.js';

export const vangoghStyle: ArtDirection = {
  styleEmphasis: [
    // Van Gogh's Distinctive Style
    "expressive brushwork",
    "bold impasto technique",
    "dynamic swirling patterns",
    "emotional color intensity",
    "rhythmic brush strokes",
    "textural emphasis",
    "dramatic light contrasts",
    "psychological intensity",
    "vibrant color juxtaposition",
    "gestural mark-making",
    "energetic line work",
    "emotional atmosphere",
    "natural form interpretation",
    "spiritual luminosity",
    "passionate expression"
  ],
  visualElements: [
    // Van Gogh's Visual Language
    "swirling brushstrokes",
    "thick paint application",
    "visible brush direction",
    "starry night effects",
    "cypress tree forms",
    "wheat field patterns",
    "sunflower motifs",
    "dramatic skies",
    "textured surfaces",
    "vibrant nature scenes",
    "expressive portraits",
    "dynamic landscapes",
    "emotional still lifes",
    "night cafe scenes",
    "bedroom interiors"
  ],
  colorPalette: [
    // Van Gogh's Vibrant Palette
    "chrome yellow",
    "cobalt blue",
    "emerald green",
    "prussian blue",
    "zinc white",
    "lead white",
    "yellow ochre",
    "viridian green",
    "ultramarine blue",
    "cadmium yellow"
  ],
  compositionGuidelines: [
    // Van Gogh's Compositional Approach
    "dynamic diagonal movement",
    "swirling pattern organization",
    "emotional space treatment",
    "dramatic perspective",
    "rhythmic mark arrangement",
    "energetic composition",
    "bold foreground elements",
    "expressive spatial treatment",
    "natural form emphasis",
    "psychological framing",
    "dramatic viewpoints",
    "intimate scene selection",
    "personal space interpretation",
    "spiritual atmosphere",
    "emotional landscape arrangement"
  ],
  moodAndTone: "Create a passionate Van Gogh-style interpretation that embodies his revolutionary approach to emotional expression through color and brushwork. The execution must demonstrate his characteristic impasto technique and use of bold, vibrant colors. Every element should be treated with his signature expressive brushstrokes, emphasizing movement, emotional intensity, and spiritual connection to nature.",
  references: [
    "Van Gogh's 'The Starry Night' (1889) - for swirling sky treatment",
    "Van Gogh's 'Sunflowers' (1888) - for bold color and brushwork",
    "Van Gogh's 'The Bedroom' (1888) - for interior perspective",
    "Van Gogh's 'Wheat Field with Cypresses' (1889) - for landscape treatment",
    "Van Gogh's 'Self-Portrait' (1889) - for expressive portraiture",
    "Van Gogh's 'Cafe Terrace at Night' (1888) - for night scenes",
    "Van Gogh's 'Irises' (1889) - for natural form treatment",
    "Van Gogh's 'The Yellow House' (1888) - for architectural elements",
    "Van Gogh's 'Almond Blossoms' (1890) - for delicate natural forms",
    "Van Gogh's 'The Night Cafe' (1888) - for interior atmosphere"
  ],
  avoidElements: [
    // Anti-Van Gogh Elements
    "smooth brushwork",
    "photographic realism",
    "precise detail",
    "mechanical technique",
    "flat colors",
    "static composition",
    "academic finish",
    "controlled edges",
    "subtle modeling",
    "careful blending",
    "geometric precision",
    "commercial aesthetic",
    "decorative prettiness",
    "artificial effects",
    "mass production style",
    // Style Elements to Avoid
    "pop art elements",
    "minimalist reduction",
    "conceptual abstraction",
    "digital effects",
    "commercial style",
    // General Elements to Avoid
    "mechanical reproduction",
    "artificial precision",
    "corporate aesthetic",
    "digital manipulation",
    "commercial polish"
  ],
  modelConfig: {
    prompt_prefix: "In the distinctive style of Vincent van Gogh's post-impressionism, with bold impasto technique and emotional expression. Create a passionate interpretation with ",
    prompt_suffix: ". Use Van Gogh's characteristic swirling brushstrokes, vibrant colors, and dynamic energy. Style of The Starry Night and Sunflowers.",
    negative_prompt: "smooth, photorealistic, precise, mechanical, flat, static, controlled, subtle, careful, geometric, commercial, artificial, digital",
    num_inference_steps: 40,
    guidance_scale: 11.0
  },

  // Enhanced Context Awareness
  historicalContext: {
    period: "Post-Impressionist (1886-1890)",
    movement: "Post-Impressionism",
    influences: [
      "Jean-François Millet",
      "Japanese woodblock prints",
      "Impressionist color theory",
      "Dutch Realism",
      "Barbizon school"
    ],
    keyWorks: [
      "The Starry Night (1889)",
      "Sunflowers (1888)",
      "The Potato Eaters (1885)",
      "Cafe Terrace at Night (1888)",
      "The Yellow House (1888)"
    ],
    innovations: [
      "Expressive color use independent of natural appearance",
      "Impasto technique development",
      "Emotional symbolism in landscape",
      "Dynamic brushwork style",
      "Color theory applications"
    ]
  },

  culturalContext: {
    socialInfluences: [
      "Rural peasant life",
      "French cafe culture",
      "Mental health treatment",
      "Religious devotion",
      "Industrial modernization"
    ],
    contemporaryEvents: [
      "Rise of modernism",
      "Industrial revolution impact",
      "Development of synthetic pigments",
      "Growth of commercial art market",
      "Emergence of photography"
    ],
    culturalMovements: [
      "Symbolism",
      "Post-Impressionism",
      "Modern art emergence",
      "Japonisme",
      "Naturalism"
    ],
    geographicalContext: "Southern France, particularly Arles and Saint-Rémy",
    societalImpact: [
      "Redefinition of artistic expression",
      "Influence on modern art movement",
      "Challenge to academic traditions",
      "New perspective on mental health",
      "Validation of emotional intensity in art"
    ]
  },

  technicalContext: {
    materials: [
      "Oil paints",
      "Lead white",
      "Chrome yellow",
      "Prussian blue",
      "Canvas",
      "Coarse brushes"
    ],
    techniques: [
      "Impasto application",
      "Wet-on-wet painting",
      "Directional brushwork",
      "Color juxtaposition",
      "Textural buildup",
      "En plein air painting"
    ],
    workingMethods: [
      "Direct observation",
      "Rapid execution",
      "Multiple versions",
      "Outdoor painting",
      "Night painting",
      "Sketch to painting process"
    ],
    innovations: [
      "Expressive brushwork techniques",
      "Color theory applications",
      "Night scene painting methods",
      "Impasto texture development",
      "Emotional color use"
    ],
    limitations: [
      "Limited financial resources",
      "Mental health challenges",
      "Paint drying time",
      "Weather conditions",
      "Canvas availability"
    ],
    toolsUsed: [
      "Thick bristle brushes",
      "Palette knives",
      "Portable easel",
      "Perspective frame",
      "Charcoal for sketching"
    ]
  },

  philosophicalContext: {
    beliefs: [
      "Art as emotional expression",
      "Nature as spiritual force",
      "Color as symbolic language",
      "Beauty in ordinary subjects",
      "Art's transformative power"
    ],
    theories: [
      "Color symbolism",
      "Emotional resonance",
      "Natural spirituality",
      "Artistic devotion",
      "Creative suffering"
    ],
    manifestos: [
      "Letters to Theo",
      "Personal correspondence",
      "Artistic statements",
      "Theory of color",
      "Views on nature"
    ],
    conceptualFrameworks: [
      "Emotional truth over visual accuracy",
      "Nature as divine expression",
      "Art as spiritual practice",
      "Color as emotional language",
      "Beauty in simplicity"
    ],
    intellectualInfluences: [
      "Jules Michelet",
      "Charles Blanc",
      "Émile Zola",
      "Japanese aesthetics",
      "Christian theology"
    ]
  },

  evolutionaryContext: {
    earlyPeriod: {
      characteristics: [
        "Dark palette",
        "Social realism",
        "Religious themes",
        "Dutch influence",
        "Technical development"
      ],
      influences: [
        "Dutch masters",
        "Rembrandt",
        "Millet",
        "Religious art",
        "Rural life"
      ],
      keyWorks: [
        "The Potato Eaters",
        "Nuenen drawings",
        "Early self-portraits",
        "Church interiors",
        "Peasant studies"
      ]
    },
    maturePeriod: {
      characteristics: [
        "Vibrant color",
        "Expressive brushwork",
        "Japanese influence",
        "Innovative technique",
        "Emotional intensity"
      ],
      innovations: [
        "Color theory application",
        "Brushwork development",
        "Night painting",
        "Symbolic color use",
        "Impasto technique"
      ],
      masterWorks: [
        "The Starry Night",
        "Sunflowers series",
        "Bedroom in Arles",
        "The Yellow House",
        "Self-Portrait with Bandaged Ear"
      ]
    },
    latePeriod: {
      characteristics: [
        "Increased abstraction",
        "Emotional turbulence",
        "Nature focus",
        "Spiritual themes",
        "Technical mastery"
      ],
      developments: [
        "Enhanced color symbolism",
        "Deeper emotional expression",
        "More fluid brushwork",
        "Spiritual intensity",
        "Abstract tendencies"
      ],
      finalWorks: [
        "Wheatfield with Crows",
        "Tree Roots",
        "Auvers Church",
        "Doctor Gachet portraits",
        "Final self-portraits"
      ]
    },
    transitions: [
      {
        from: "Dark Dutch Period",
        to: "Colorful Paris Period",
        catalysts: [
          "Exposure to Impressionism",
          "Meeting Paul Gauguin",
          "Discovery of Japanese prints",
          "Move to Paris",
          "Theoretical studies"
        ],
        significance: "Fundamental shift from dark realism to expressive color use"
      },
      {
        from: "Paris Period",
        to: "Arles Period",
        catalysts: [
          "Southern light",
          "Artistic independence",
          "Mental health",
          "Gauguin collaboration",
          "Artistic maturity"
        ],
        significance: "Development of signature style and most iconic works"
      },
      {
        from: "Arles Period",
        to: "Saint-Rémy Period",
        catalysts: [
          "Mental health crisis",
          "Institutional confinement",
          "Nature focus",
          "Spiritual reflection",
          "Technical mastery"
        ],
        significance: "Deepening of spiritual and emotional expression in work"
      }
    ]
  }
}; 