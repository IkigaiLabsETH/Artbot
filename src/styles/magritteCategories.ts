import { ArtDirection } from '../types/ArtDirection.js';

// Define Margritte-specific category types
export type MargritteCategory = 
  'object_displacement' |
  'window_paradox' |
  'scale_distortion' |
  'time_paradox' |
  'identity_concealment' |
  'word_image_paradox' |
  'metamorphosis' |
  'spatial_illusion' |
  'mirror_paradox' |
  'object_multiplication';

// Define category-specific art directions
export const Margritte_CATEGORIES: Record<MargritteCategory, ArtDirection> = {
  object_displacement: {
    styleEmphasis: [
      "surrealist technique",
      "oil painting quality",
      "philosophical depth",
      "symbolic power",
      "spatial paradox",
      "metaphysical quality",
      "belgian style",
      "academic precision",
      "surrealist atmosphere"
    ],
    visualElements: [
      "floating rocks",
      "levitating objects",
      "suspended everyday items",
      "gravity-defying elements",
      "displaced familiar objects"
    ],
    compositionGuidelines: [
      "precise object placement",
      "perfect shadow casting",
      "spatial tension",
      "balanced displacement",
      "controlled chaos"
    ],
    MargritteContext: {
      philosophicalFramework: {
        beliefs: [
          "Objects have no fixed spatial relationship",
          "Gravity is a perceptual construct",
          "Space is malleable and subjective"
        ],
        theories: [
          "Object displacement theory",
          "Spatial relativity concept",
          "Gravitational paradox theory"
        ],
        conceptualFrameworks: [
          "The floating stone paradigm",
          "Spatial dislocation principle",
          "Object-space relationship"
        ],
        paradoxes: [
          "Gravity vs levitation",
          "Weight vs weightlessness",
          "Stability vs suspension"
        ],
        visualDialectics: [
          "Ground vs air",
          "Weight vs lightness",
          "Stability vs instability"
        ]
      },
      visualCategories: [{
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
      }],
      technicalExecution: {
        renderingTechniques: [
          "Photorealistic object rendering",
          "Sharp edge definition",
          "Perfect shadow casting"
        ],
        materialPreparation: [
          "Smooth surface preparation",
          "Precise underpainting",
          "Controlled brushwork"
        ],
        workingMethodology: [
          "Careful object placement studies",
          "Multiple perspective calculations",
          "Systematic shadow mapping"
        ],
        qualityMetrics: [
          "Shadow accuracy",
          "Object precision",
          "Spatial coherence"
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
    }
  },

  window_paradox: {
    styleEmphasis: [
      "window as portal",
      "reality questioning",
      "seamless transitions",
      "interior-exterior blur",
      "perspective manipulation"
    ],
    visualElements: [
      "windows showing impossible views",
      "recursive window imagery",
      "canvas-within-canvas",
      "seamless transitions",
      "paradoxical perspectives"
    ],
    compositionGuidelines: [
      "perfect perspective matching",
      "seamless edge integration",
      "consistent lighting",
      "reality-bending transitions",
      "frame-within-frame composition"
    ],
    MargritteContext: {
      philosophicalFramework: {
        beliefs: [
          "Windows are portals to other realities",
          "Inside and outside are interchangeable",
          "Reality is frame-dependent"
        ],
        theories: [
          "Window as metaphysical portal",
          "Frame-reality relationship",
          "Perspective paradox theory"
        ],
        conceptualFrameworks: [
          "The window as reality frame",
          "Interior-exterior dialectic",
          "Perspective continuity principle"
        ],
        paradoxes: [
          "Inside vs outside",
          "Real vs represented",
          "Continuous vs discontinuous"
        ],
        visualDialectics: [
          "Interior vs exterior",
          "Frame vs content",
          "Reality vs representation"
        ]
      },
      visualCategories: [{
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
      }],
      technicalExecution: {
        renderingTechniques: [
          "Precise perspective rendering",
          "Seamless edge blending",
          "Perfect lighting integration"
        ],
        materialPreparation: [
          "Smooth surface preparation",
          "Precise underpainting",
          "Controlled glazing"
        ],
        workingMethodology: [
          "Careful perspective studies",
          "Multiple viewpoint integration",
          "Systematic lighting mapping"
        ],
        qualityMetrics: [
          "Perspective accuracy",
          "Edge precision",
          "Lighting consistency"
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
    }
  },

  scale_distortion: {
    styleEmphasis: ["scale manipulation", "size relationships", "proportional distortion"],
    visualElements: ["oversized objects", "miniaturized elements", "scale contrasts"],
    compositionGuidelines: ["dramatic scale differences", "proportional relationships", "size hierarchy"],
    MargritteContext: {
      philosophicalFramework: {
        beliefs: ["Scale is relative", "Size relationships are subjective", "Proportion is malleable"],
        theories: ["Scale relativity theory", "Size perception theory", "Proportional distortion concept"],
        conceptualFrameworks: ["The giant in the room", "Miniature world theory", "Scale hierarchy principle"],
        paradoxes: ["Big vs small", "Giant vs tiny", "Normal vs distorted"],
        visualDialectics: ["Large vs small", "Giant vs miniature", "Normal vs abnormal"]
      },
      visualCategories: [{
        category: "scale_distortion",
        characteristics: ["Dramatic size differences", "Proportional anomalies", "Scale contrasts"],
        keyElements: ["Giant objects", "Tiny elements", "Scale relationships"],
        technicalRequirements: ["Precise scaling", "Proportional accuracy", "Size consistency"]
      }],
      technicalExecution: {
        renderingTechniques: ["Scale precision", "Proportional rendering", "Size relationship handling"],
        materialPreparation: ["Surface preparation", "Scale studies", "Proportional sketches"],
        workingMethodology: ["Scale calculations", "Size relationship studies", "Proportion mapping"],
        qualityMetrics: ["Scale accuracy", "Proportional precision", "Size consistency"]
      },
      creativeMetrics: {
        metaphysicalDepth: {
          philosophicalResonance: 0.9,
          conceptualComplexity: 0.9,
          paradoxicalImpact: 0.9
        },
        technicalExecution: {
          objectPrecision: 0.9,
          edgeControl: 0.9,
          perspectiveAccuracy: 0.9
        },
        compositionBalance: {
          spatialHarmony: 0.9,
          objectPlacement: 0.9,
          scaleRelationships: 0.9
        },
        symbolicPower: {
          objectSymbolism: 0.9,
          narrativeDepth: 0.9,
          metaphoricalResonance: 0.9
        }
      }
    }
  },

  time_paradox: {
    styleEmphasis: ["temporal manipulation", "time distortion", "chronological paradox"],
    visualElements: ["multiple time states", "temporal overlaps", "time-based elements"],
    compositionGuidelines: ["temporal layering", "chronological juxtaposition", "time-space relationships"],
    MargritteContext: {
      philosophicalFramework: {
        beliefs: ["Time is malleable", "Multiple times coexist", "Temporal reality is subjective"],
        theories: ["Temporal overlay theory", "Time manipulation concept", "Chronological paradox theory"],
        conceptualFrameworks: ["The eternal moment", "Time collapse principle", "Temporal multiplicity"],
        paradoxes: ["Past vs present", "Day vs night", "Sequential vs simultaneous"],
        visualDialectics: ["Before vs after", "Now vs then", "Linear vs cyclical"]
      },
      visualCategories: [{
        category: "time_paradox",
        characteristics: ["Temporal anomalies", "Time distortions", "Chronological impossibilities"],
        keyElements: ["Multiple times", "Temporal overlays", "Time distortions"],
        technicalRequirements: ["Temporal consistency", "Time-state rendering", "Chronological clarity"]
      }],
      technicalExecution: {
        renderingTechniques: ["Temporal layering", "Time-state rendering", "Chronological integration"],
        materialPreparation: ["Time studies", "Temporal sketches", "Chronological planning"],
        workingMethodology: ["Time mapping", "Temporal organization", "Chronological structuring"],
        qualityMetrics: ["Temporal clarity", "Time-state precision", "Chronological accuracy"]
      },
      creativeMetrics: {
        metaphysicalDepth: {
          philosophicalResonance: 0.9,
          conceptualComplexity: 0.9,
          paradoxicalImpact: 0.9
        },
        technicalExecution: {
          objectPrecision: 0.9,
          edgeControl: 0.9,
          perspectiveAccuracy: 0.9
        },
        compositionBalance: {
          spatialHarmony: 0.9,
          objectPlacement: 0.9,
          scaleRelationships: 0.9
        },
        symbolicPower: {
          objectSymbolism: 0.9,
          narrativeDepth: 0.9,
          metaphoricalResonance: 0.9
        }
      }
    }
  },

  identity_concealment: {
    styleEmphasis: ["hidden identity", "obscured faces", "anonymous presence"],
    visualElements: ["covered faces", "obscuring objects", "identity masks"],
    compositionGuidelines: ["strategic concealment", "identity hiding", "anonymous positioning"],
    MargritteContext: {
      philosophicalFramework: {
        beliefs: ["Identity is fluid", "Faces can be hidden", "Anonymity has power"],
        theories: ["Identity concealment theory", "Face obscuration concept", "Anonymous presence theory"],
        conceptualFrameworks: ["The hidden face", "Obscured identity principle", "Anonymous presence"],
        paradoxes: ["Visible vs hidden", "Present vs absent", "Known vs unknown"],
        visualDialectics: ["Revealed vs concealed", "Face vs mask", "Identity vs anonymity"]
      },
      visualCategories: [{
        category: "identity_concealment",
        characteristics: ["Hidden faces", "Obscured identities", "Anonymous figures"],
        keyElements: ["Face coverings", "Identity masks", "Obscuring objects"],
        technicalRequirements: ["Precise concealment", "Identity obscuration", "Anonymous presence"]
      }],
      technicalExecution: {
        renderingTechniques: ["Concealment techniques", "Identity obscuration", "Anonymous rendering"],
        materialPreparation: ["Concealment studies", "Identity sketches", "Anonymous presence"],
        workingMethodology: ["Concealment planning", "Identity mapping", "Anonymous positioning"],
        qualityMetrics: ["Concealment precision", "Identity obscuration", "Anonymous presence"]
      },
      creativeMetrics: {
        metaphysicalDepth: {
          philosophicalResonance: 0.9,
          conceptualComplexity: 0.9,
          paradoxicalImpact: 0.9
        },
        technicalExecution: {
          objectPrecision: 0.9,
          edgeControl: 0.9,
          perspectiveAccuracy: 0.9
        },
        compositionBalance: {
          spatialHarmony: 0.9,
          objectPlacement: 0.9,
          scaleRelationships: 0.9
        },
        symbolicPower: {
          objectSymbolism: 0.9,
          narrativeDepth: 0.9,
          metaphoricalResonance: 0.9
        }
      }
    }
  },

  word_image_paradox: {
    styleEmphasis: ["word-image relationships", "linguistic paradox", "textual integration"],
    visualElements: ["text elements", "word-object relationships", "linguistic components"],
    compositionGuidelines: ["text placement", "word-image balance", "linguistic integration"],
    MargritteContext: {
      philosophicalFramework: {
        beliefs: ["Words and images interact", "Language affects perception", "Text creates reality"],
        theories: ["Word-image relationship theory", "Linguistic paradox concept", "Text-reality theory"],
        conceptualFrameworks: ["This is not a pipe", "Word-image dialectic", "Linguistic reality"],
        paradoxes: ["Word vs image", "Text vs reality", "Description vs depiction"],
        visualDialectics: ["Word vs picture", "Text vs image", "Language vs reality"]
      },
      visualCategories: [{
        category: "word_image_paradox",
        characteristics: ["Text-image relationships", "Linguistic paradoxes", "Word-object tensions"],
        keyElements: ["Text elements", "Word-image combinations", "Linguistic components"],
        technicalRequirements: ["Text integration", "Word-image balance", "Linguistic clarity"]
      }],
      technicalExecution: {
        renderingTechniques: ["Text rendering", "Word-image integration", "Linguistic placement"],
        materialPreparation: ["Text studies", "Word-image sketches", "Linguistic planning"],
        workingMethodology: ["Text mapping", "Word-image organization", "Linguistic structuring"],
        qualityMetrics: ["Text clarity", "Word-image balance", "Linguistic precision"]
      },
      creativeMetrics: {
        metaphysicalDepth: {
          philosophicalResonance: 0.9,
          conceptualComplexity: 0.9,
          paradoxicalImpact: 0.9
        },
        technicalExecution: {
          objectPrecision: 0.9,
          edgeControl: 0.9,
          perspectiveAccuracy: 0.9
        },
        compositionBalance: {
          spatialHarmony: 0.9,
          objectPlacement: 0.9,
          scaleRelationships: 0.9
        },
        symbolicPower: {
          objectSymbolism: 0.9,
          narrativeDepth: 0.9,
          metaphoricalResonance: 0.9
        }
      }
    }
  },

  metamorphosis: {
    styleEmphasis: ["transformation", "object mutation", "form evolution"],
    visualElements: ["transforming objects", "mutating forms", "evolutionary elements"],
    compositionGuidelines: ["transformation staging", "metamorphic flow", "evolutionary progression"],
    MargritteContext: {
      philosophicalFramework: {
        beliefs: ["Forms can transform", "Objects evolve", "Matter is fluid"],
        theories: ["Metamorphosis theory", "Form evolution concept", "Transformation principle"],
        conceptualFrameworks: ["The changing form", "Metamorphic evolution", "Transformative state"],
        paradoxes: ["Static vs dynamic", "Fixed vs fluid", "Form vs transformation"],
        visualDialectics: ["Stable vs changing", "Fixed vs fluid", "Being vs becoming"]
      },
      visualCategories: [{
        category: "metamorphosis",
        characteristics: ["Transforming elements", "Evolving forms", "Metamorphic states"],
        keyElements: ["Changing objects", "Evolving forms", "Transformative elements"],
        technicalRequirements: ["Transformation rendering", "Metamorphic precision", "Evolution clarity"]
      }],
      technicalExecution: {
        renderingTechniques: ["Transformation rendering", "Metamorphic techniques", "Evolution visualization"],
        materialPreparation: ["Transformation studies", "Metamorphic sketches", "Evolution planning"],
        workingMethodology: ["Transformation mapping", "Metamorphic organization", "Evolution structuring"],
        qualityMetrics: ["Transformation clarity", "Metamorphic precision", "Evolution accuracy"]
      },
      creativeMetrics: {
        metaphysicalDepth: {
          philosophicalResonance: 0.9,
          conceptualComplexity: 0.9,
          paradoxicalImpact: 0.9
        },
        technicalExecution: {
          objectPrecision: 0.9,
          edgeControl: 0.9,
          perspectiveAccuracy: 0.9
        },
        compositionBalance: {
          spatialHarmony: 0.9,
          objectPlacement: 0.9,
          scaleRelationships: 0.9
        },
        symbolicPower: {
          objectSymbolism: 0.9,
          narrativeDepth: 0.9,
          metaphoricalResonance: 0.9
        }
      }
    }
  },

  spatial_illusion: {
    styleEmphasis: ["spatial manipulation", "perspective illusion", "depth paradox"],
    visualElements: ["impossible spaces", "perspective tricks", "spatial anomalies"],
    compositionGuidelines: ["spatial organization", "perspective manipulation", "depth illusion"],
    MargritteContext: {
      philosophicalFramework: {
        beliefs: ["Space is malleable", "Perspective is subjective", "Depth is illusory"],
        theories: ["Spatial manipulation theory", "Perspective illusion concept", "Depth paradox theory"],
        conceptualFrameworks: ["The impossible space", "Perspective manipulation", "Spatial illusion"],
        paradoxes: ["Near vs far", "Flat vs deep", "Inside vs outside"],
        visualDialectics: ["Space vs plane", "Depth vs surface", "Reality vs illusion"]
      },
      visualCategories: [{
        category: "spatial_illusion",
        characteristics: ["Spatial impossibilities", "Perspective illusions", "Depth paradoxes"],
        keyElements: ["Impossible spaces", "Perspective tricks", "Spatial anomalies"],
        technicalRequirements: ["Spatial precision", "Perspective accuracy", "Depth control"]
      }],
      technicalExecution: {
        renderingTechniques: ["Spatial rendering", "Perspective manipulation", "Depth illusion"],
        materialPreparation: ["Spatial studies", "Perspective sketches", "Depth planning"],
        workingMethodology: ["Spatial mapping", "Perspective organization", "Depth structuring"],
        qualityMetrics: ["Spatial precision", "Perspective accuracy", "Depth clarity"]
      },
      creativeMetrics: {
        metaphysicalDepth: {
          philosophicalResonance: 0.9,
          conceptualComplexity: 0.9,
          paradoxicalImpact: 0.9
        },
        technicalExecution: {
          objectPrecision: 0.9,
          edgeControl: 0.9,
          perspectiveAccuracy: 0.9
        },
        compositionBalance: {
          spatialHarmony: 0.9,
          objectPlacement: 0.9,
          scaleRelationships: 0.9
        },
        symbolicPower: {
          objectSymbolism: 0.9,
          narrativeDepth: 0.9,
          metaphoricalResonance: 0.9
        }
      }
    }
  },

  mirror_paradox: {
    styleEmphasis: ["reflection manipulation", "mirror illusion", "reflection paradox"],
    visualElements: ["impossible reflections", "mirror tricks", "reflection anomalies"],
    compositionGuidelines: ["reflection placement", "mirror manipulation", "reflection illusion"],
    MargritteContext: {
      philosophicalFramework: {
        beliefs: ["Reflections can lie", "Mirrors show other realities", "Images are deceptive"],
        theories: ["Mirror paradox theory", "Reflection manipulation concept", "Image deception theory"],
        conceptualFrameworks: ["The false reflection", "Mirror reality principle", "Reflection paradox"],
        paradoxes: ["Real vs reflected", "Original vs copy", "True vs false"],
        visualDialectics: ["Object vs reflection", "Reality vs image", "Truth vs illusion"]
      },
      visualCategories: [{
        category: "mirror_paradox",
        characteristics: ["Impossible reflections", "Mirror illusions", "Reflection paradoxes"],
        keyElements: ["Mirror surfaces", "Reflection tricks", "Paradoxical images"],
        technicalRequirements: ["Reflection accuracy", "Mirror precision", "Image clarity"]
      }],
      technicalExecution: {
        renderingTechniques: ["Reflection rendering", "Mirror surface treatment", "Image manipulation"],
        materialPreparation: ["Reflection studies", "Mirror sketches", "Image planning"],
        workingMethodology: ["Reflection mapping", "Mirror organization", "Image structuring"],
        qualityMetrics: ["Reflection precision", "Mirror accuracy", "Image clarity"]
      },
      creativeMetrics: {
        metaphysicalDepth: {
          philosophicalResonance: 0.9,
          conceptualComplexity: 0.9,
          paradoxicalImpact: 0.9
        },
        technicalExecution: {
          objectPrecision: 0.9,
          edgeControl: 0.9,
          perspectiveAccuracy: 0.9
        },
        compositionBalance: {
          spatialHarmony: 0.9,
          objectPlacement: 0.9,
          scaleRelationships: 0.9
        },
        symbolicPower: {
          objectSymbolism: 0.9,
          narrativeDepth: 0.9,
          metaphoricalResonance: 0.9
        }
      }
    }
  },

  object_multiplication: {
    styleEmphasis: ["object repetition", "pattern creation", "multiplication effect"],
    visualElements: ["repeated objects", "pattern elements", "multiplied forms"],
    compositionGuidelines: ["repetition placement", "pattern organization", "multiplication balance"],
    MargritteContext: {
      philosophicalFramework: {
        beliefs: ["Objects can multiply", "Patterns have meaning", "Repetition creates reality"],
        theories: ["Object multiplication theory", "Pattern significance concept", "Repetition effect theory"],
        conceptualFrameworks: ["The endless repeat", "Pattern reality principle", "Multiplication meaning"],
        paradoxes: ["One vs many", "Single vs multiple", "Unique vs repeated"],
        visualDialectics: ["Individual vs group", "Single vs multiple", "Unique vs common"]
      },
      visualCategories: [{
        category: "object_multiplication",
        characteristics: ["Repeated elements", "Pattern formations", "Multiplication effects"],
        keyElements: ["Multiplied objects", "Pattern components", "Repeated forms"],
        technicalRequirements: ["Repetition precision", "Pattern accuracy", "Multiplication clarity"]
      }],
      technicalExecution: {
        renderingTechniques: ["Repetition rendering", "Pattern creation", "Multiplication technique"],
        materialPreparation: ["Repetition studies", "Pattern sketches", "Multiplication planning"],
        workingMethodology: ["Repetition mapping", "Pattern organization", "Multiplication structuring"],
        qualityMetrics: ["Repetition precision", "Pattern accuracy", "Multiplication clarity"]
      },
      creativeMetrics: {
        metaphysicalDepth: {
          philosophicalResonance: 0.9,
          conceptualComplexity: 0.9,
          paradoxicalImpact: 0.9
        },
        technicalExecution: {
          objectPrecision: 0.9,
          edgeControl: 0.9,
          perspectiveAccuracy: 0.9
        },
        compositionBalance: {
          spatialHarmony: 0.9,
          objectPlacement: 0.9,
          scaleRelationships: 0.9
        },
        symbolicPower: {
          objectSymbolism: 0.9,
          narrativeDepth: 0.9,
          metaphoricalResonance: 0.9
        }
      }
    }
  }
};

// Helper functions for working with Margritte categories
export function getMargritteCategory(category: MargritteCategory): ArtDirection {
  return Margritte_CATEGORIES[category];
}

export function isMargritteCategory(category: string): category is MargritteCategory {
  return category in Margritte_CATEGORIES;
}

export function getMargritteCategoryList(): MargritteCategory[] {
  return Object.keys(Margritte_CATEGORIES) as MargritteCategory[];
}

export function combineMargritteCategories(categories: MargritteCategory[]): ArtDirection {
  const initialValue: ArtDirection = {
    styleEmphasis: [],
    visualElements: [],
    compositionGuidelines: [],
    MargritteContext: {
      philosophicalFramework: {
        beliefs: [],
        theories: [],
        conceptualFrameworks: [],
        paradoxes: [],
        visualDialectics: []
      },
      visualCategories: [],
      technicalExecution: {
        renderingTechniques: [],
        materialPreparation: [],
        workingMethodology: [],
        qualityMetrics: []
      },
      creativeMetrics: {
        metaphysicalDepth: {
          philosophicalResonance: 0,
          conceptualComplexity: 0,
          paradoxicalImpact: 0
        },
        technicalExecution: {
          objectPrecision: 0,
          edgeControl: 0,
          perspectiveAccuracy: 0
        },
        compositionBalance: {
          spatialHarmony: 0,
          objectPlacement: 0,
          scaleRelationships: 0
        },
        symbolicPower: {
          objectSymbolism: 0,
          narrativeDepth: 0,
          metaphoricalResonance: 0
        }
      }
    }
  };

  return categories.reduce((combined, category) => {
    const categoryConfig = Margritte_CATEGORIES[category];
    return {
      styleEmphasis: [...(combined.styleEmphasis || []), ...(categoryConfig.styleEmphasis || [])],
      visualElements: [...(combined.visualElements || []), ...(categoryConfig.visualElements || [])],
      compositionGuidelines: [...(combined.compositionGuidelines || []), ...(categoryConfig.compositionGuidelines || [])],
      MargritteContext: {
        philosophicalFramework: {
          beliefs: [
            ...(combined.MargritteContext?.philosophicalFramework?.beliefs || []),
            ...(categoryConfig.MargritteContext?.philosophicalFramework?.beliefs || [])
          ],
          theories: [
            ...(combined.MargritteContext?.philosophicalFramework?.theories || []),
            ...(categoryConfig.MargritteContext?.philosophicalFramework?.theories || [])
          ],
          conceptualFrameworks: [
            ...(combined.MargritteContext?.philosophicalFramework?.conceptualFrameworks || []),
            ...(categoryConfig.MargritteContext?.philosophicalFramework?.conceptualFrameworks || [])
          ],
          paradoxes: [
            ...(combined.MargritteContext?.philosophicalFramework?.paradoxes || []),
            ...(categoryConfig.MargritteContext?.philosophicalFramework?.paradoxes || [])
          ],
          visualDialectics: [
            ...(combined.MargritteContext?.philosophicalFramework?.visualDialectics || []),
            ...(categoryConfig.MargritteContext?.philosophicalFramework?.visualDialectics || [])
          ]
        },
        visualCategories: [
          ...(combined.MargritteContext?.visualCategories || []),
          ...(categoryConfig.MargritteContext?.visualCategories || [])
        ],
        technicalExecution: {
          renderingTechniques: [
            ...(combined.MargritteContext?.technicalExecution?.renderingTechniques || []),
            ...(categoryConfig.MargritteContext?.technicalExecution?.renderingTechniques || [])
          ],
          materialPreparation: [
            ...(combined.MargritteContext?.technicalExecution?.materialPreparation || []),
            ...(categoryConfig.MargritteContext?.technicalExecution?.materialPreparation || [])
          ],
          workingMethodology: [
            ...(combined.MargritteContext?.technicalExecution?.workingMethodology || []),
            ...(categoryConfig.MargritteContext?.technicalExecution?.workingMethodology || [])
          ],
          qualityMetrics: [
            ...(combined.MargritteContext?.technicalExecution?.qualityMetrics || []),
            ...(categoryConfig.MargritteContext?.technicalExecution?.qualityMetrics || [])
          ]
        },
        creativeMetrics: combined.MargritteContext.creativeMetrics
      }
    };
  }, initialValue);
} 