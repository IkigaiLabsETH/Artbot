import { ArtDirection } from '../types/ArtDirection.js';

export const Margritte_STYLE: ArtDirection = {
  styleEmphasis: [
    "philosophical surrealism",
    "paradoxical realism",
    "symbolic juxtaposition",
    "mysterious atmosphere",
    "theatrical staging",
    "poetic displacement",
    "dreamlike composition",
    "metaphysical questioning",
    "spatial illusion",
    "precise execution"
  ],
  visualElements: [
    "bowler hats",
    "floating objects",
    "clouded skies",
    "mysterious doorways",
    "impossible windows",
    "billowing curtains",
    "mirror reflections",
    "geometric forms",
    "dramatic shadows",
    "symbolic objects"
  ],
  colorPalette: [
    "belgian sky blue (RGB: 135, 206, 235)",
    "deep twilight (RGB: 47, 79, 79)",
    "dramatic red (RGB: 138, 7, 7)",
    "spiritual yellow (RGB: 255, 223, 0)",
    "metaphysical green (RGB: 126, 186, 86)",
    "mysterious grey (RGB: 200, 200, 200)",
    "pure black (RGB: 28, 28, 28)",
    "pristine white (RGB: 245, 245, 245)",
    "subtle earth tones (RGB: 193, 154, 107)",
    "clear cloud white (RGB: 236, 236, 236)"
  ],
  compositionGuidelines: [
    "perfect central positioning",
    "clean spatial organization",
    "precise object placement",
    "balanced surreal elements",
    "clear figure-ground relationship",
    "metaphysical depth",
    "enigmatic framing",
    "philosophical staging",
    "precise symmetry",
    "contemplative space"
  ],
  moodAndTone: "Create a deeply surreal and metaphysical atmosphere where familiar objects become mysterious through paradoxical placement and symbolic resonance. Each piece should challenge perception through impossible juxtapositions while maintaining pristine technical execution and philosophical depth.",
  
  // Enhanced Margritte-specific Context
  MargritteContext: {
    philosophicalFramework: {
      beliefs: [
        "The treachery of representation",
        "The gap between words and things",
        "The mystery of the ordinary",
        "The questioning of perceived reality",
        "The power of paradox in revealing truth"
      ],
      theories: [
        "Object displacement theory",
        "Visual-linguistic paradox theory",
        "Reality-representation dialectic",
        "Metaphysical window theory",
        "Object-identity dissociation"
      ],
      conceptualFrameworks: [
        "The pipe is not a pipe",
        "The window as metaphysical portal",
        "The bowler hat as anonymity symbol",
        "The apple as obstruction of truth",
        "The bird as transformation symbol"
      ],
      paradoxes: [
        "Image-reality contradiction",
        "Day-night coexistence",
        "Scale-context dissonance",
        "Object-identity confusion",
        "Space-time discontinuity"
      ],
      visualDialectics: [
        "Interior vs. exterior",
        "Presence vs. absence",
        "Reality vs. representation",
        "Visible vs. hidden",
        "Unity vs. fragmentation"
      ]
    },
    visualCategories: [
      {
        category: "object_displacement",
        characteristics: [
          "Objects floating in impossible spaces",
          "Everyday items in surreal contexts",
          "Displacement of familiar elements"
        ],
        keyElements: [
          "Floating rocks",
          "Levitating objects",
          "Misplaced everyday items"
        ],
        technicalRequirements: [
          "Perfect shadow casting",
          "Realistic object rendering",
          "Precise spatial relationships"
        ]
      },
      {
        category: "window_paradox",
        characteristics: [
          "Windows showing impossible views",
          "Recursive window imagery",
          "Interior-exterior confusion"
        ],
        keyElements: [
          "Canvas-within-canvas",
          "Impossible perspectives",
          "Seamless transitions"
        ],
        technicalRequirements: [
          "Perfect perspective matching",
          "Seamless edge integration",
          "Consistent lighting across planes"
        ]
      }
    ],
    technicalExecution: {
      renderingTechniques: [
        "Photorealistic object rendering",
        "Sharp edge definition",
        "Smooth gradients for sky",
        "Perfect shadow casting",
        "Precise perspective manipulation"
      ],
      materialPreparation: [
        "Oil paint with minimal texture",
        "Canvas with smooth preparation",
        "Controlled brushwork for invisibility",
        "Precise underpainting technique",
        "Layered glazing for depth"
      ],
      workingMethodology: [
        "Preliminary sketches for composition",
        "Careful object placement studies",
        "Multiple perspective calculations",
        "Systematic color relationships",
        "Precise edge control"
      ],
      qualityMetrics: [
        "Edge precision",
        "Surface smoothness",
        "Shadow accuracy",
        "Color consistency",
        "Perspective correctness"
      ]
    },
    creativeMetrics: {
      metaphysicalDepth: {
        philosophicalResonance: 0.95,
        conceptualComplexity: 0.90,
        paradoxicalImpact: 0.95
      },
      technicalExecution: {
        objectPrecision: 0.98,
        edgeControl: 0.97,
        perspectiveAccuracy: 0.95
      },
      compositionBalance: {
        spatialHarmony: 0.92,
        objectPlacement: 0.95,
        scaleRelationships: 0.93
      },
      symbolicPower: {
        objectSymbolism: 0.94,
        narrativeDepth: 0.91,
        metaphoricalResonance: 0.93
      }
    }
  },
  
  references: [
    "The Son of Man (1964)",
    "The Treachery of Images (1929)",
    "The Empire of Light (1953-54)",
    "The Human Condition (1933)",
    "Time Transfixed (1938)",
    "The False Mirror (1929)",
    "Personal Values (1952)",
    "Golconda (1953)",
    "The Listening Room (1952)",
    "The Key to Dreams (1930)"
  ],
  avoidElements: [
    "expressionistic effects",
    "loose brushwork",
    "textural experimentation",
    "abstract forms",
    "gestural marks",
    "emotional expression",
    "chaotic composition",
    "random elements",
    "aggressive distortion",
    "messy technique"
  ],
  modelConfig: {
    prompt_prefix: "In the precise surrealist style of Studio Margritte, create a metaphysical scene with ",
    prompt_suffix: ". Maintain photorealistic execution with perfect shadows and clean edges. Style referencing The Son of Man and The Empire of Light.",
    negative_prompt: "expressionistic, loose, textural, abstract, gestural, emotional, chaotic, random, aggressive, messy, imperfect, rough, visible brushstrokes",
    num_inference_steps: 50,
    guidance_scale: 12.0
  }
}; 