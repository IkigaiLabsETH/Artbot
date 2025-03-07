import { ConceptCategory } from './conceptGenerator.js';
import { AIService } from './index.js';

interface StyleConfig {
  prompt_prefix: string;
  prompt_suffix: string;
  negative_prompt: string;
  num_inference_steps: number;
  guidance_scale: number;
  style_emphasis: {
    [key: string]: number;
  };
}

interface StyleElements {
  surreal_objects?: string[];
  visual_paradoxes?: string[];
  visual_elements?: string[];
  composition_elements?: string[];
}

// Add new interfaces for different style configurations
interface BeepleElements {
  dystopian_scenes: string[];
  tech_elements: string[];
  political_elements: string[];
  pop_culture: string[];
}

interface XCopyElements {
  glitch_effects: string[];
  crypto_elements: string[];
  dark_themes: string[];
  digital_artifacts: string[];
}

interface CherniakElements {
  geometric_forms: string[];
  algorithmic_patterns: string[];
  mathematical_elements: string[];
  generative_structures: string[];
}

// Add Hopper interface
interface HopperElements {
  urban_scenes: string[];
  lighting_elements: string[];
  architectural_elements: string[];
  psychological_elements: string[];
}

// Add interfaces for all artists
interface PicassoElements {
  cubist_forms: string[];
  geometric_elements: string[];
  abstract_figures: string[];
  color_elements: string[];
}

interface WarholdElements {
  pop_culture: string[];
  repetition_elements: string[];
  color_schemes: string[];
  commercial_elements: string[];
}

interface VanGoghElements {
  brushwork_elements: string[];
  color_elements: string[];
  natural_elements: string[];
  emotional_elements: string[];
}

interface MondrianElements {
  geometric_elements: string[];
  color_blocks: string[];
  compositional_elements: string[];
  abstract_elements: string[];
}

interface RothkoElements {
  color_fields: string[];
  atmospheric_elements: string[];
  compositional_elements: string[];
  emotional_elements: string[];
}

interface KandinskyElements {
  abstract_forms: string[];
  musical_elements: string[];
  geometric_shapes: string[];
  color_harmonies: string[];
}

// Add interfaces for remaining artists
interface MalevichElements {
  suprematist_forms: string[];
  geometric_elements: string[];
  spatial_elements: string[];
  color_elements: string[];
}

interface PopovaElements {
  constructivist_forms: string[];
  spatial_elements: string[];
  color_elements: string[];
  dynamic_elements: string[];
}

interface CartierBressonElements {
  decisive_moments: string[];
  composition_elements: string[];
  street_elements: string[];
  timing_elements: string[];
}

interface ArbusElements {
  portrait_elements: string[];
  psychological_elements: string[];
  social_elements: string[];
  compositional_elements: string[];
}

interface AvedonElements {
  portrait_style: string[];
  fashion_elements: string[];
  lighting_elements: string[];
  psychological_elements: string[];
}

interface EgglestonElements {
  color_elements: string[];
  composition_elements: string[];
  everyday_elements: string[];
  americana_elements: string[];
}

interface LeibovitzElements {
  portrait_elements: string[];
  lighting_elements: string[];
  conceptual_elements: string[];
  dramatic_elements: string[];
}

// Add interfaces at the top of the file with other interfaces
interface CooperGorferElements {
  narrative_elements: string[];
  composition_elements: string[];
  cultural_elements: string[];
  atmospheric_elements: string[];
}

interface VonWongElements {
  epic_elements: string[];
  environmental_elements: string[];
  production_elements: string[];
  impact_elements: string[];
}

interface BourdinElements {
  fashion_elements: string[];
  color_elements: string[];
  narrative_elements: string[];
  surreal_elements: string[];
}

// Style configurations for different artists
const STYLE_CONFIGS: { [key: string]: StyleConfig } = {
  beeple: {
    prompt_prefix: "In Beeple's distinctive dystopian digital art style, with monumental scale and technological decay. Create a hyper-detailed interpretation with ",
    prompt_suffix: ". Use Beeple's characteristic sci-fi elements, pop culture references, and maximalist composition. Style of Everydays series.",
    negative_prompt: "minimal, traditional, natural, historical, subtle, pastoral, romantic, abstract, vintage, painterly, delicate, classical, organic, conventional",
    num_inference_steps: 50,
    guidance_scale: 12.0,
    style_emphasis: {
      dystopian_influence: 0.8,
      tech_elements: 0.7,
      political_commentary: 0.6,
      pop_culture: 0.5
    }
  },
  xcopy: {
    prompt_prefix: "In XCOPY's distinctive glitch art style, with dark surrealism and crypto punk aesthetic. Create a stark, corrupted interpretation with ",
    prompt_suffix: ". Use XCOPY's characteristic glitch effects, death motifs, and minimal composition. Style of Right-click and Save As guy.",
    negative_prompt: "realistic, natural, smooth, peaceful, traditional, clean, organic, decorative, photorealistic, gentle, soft, harmonious, balanced, conventional",
    num_inference_steps: 45,
    guidance_scale: 13.0,
    style_emphasis: {
      glitch_art: 0.9,
      crypto_punk: 0.8,
      dark_surrealism: 0.7,
      digital_decay: 0.6
    }
  },
  cherniak: {
    prompt_prefix: "In Dmitri Cherniak's distinctive generative art style, with mathematical precision and algorithmic patterns. Create a systematic interpretation with ",
    prompt_suffix: ". Use Cherniak's characteristic geometric elements, wrapped strings, and minimal composition. Style of Ringers series.",
    negative_prompt: "organic, hand-drawn, textural, natural, expressive, emotional, random, decorative, figurative, painterly, loose, undefined, arbitrary, uncontrolled",
    num_inference_steps: 40,
    guidance_scale: 11.5,
    style_emphasis: {
      generative_algorithms: 0.9,
      mathematical_precision: 0.8,
      geometric_minimalism: 0.7,
      systematic_variation: 0.6
    }
  },
  hopper: {
    prompt_prefix: "In Edward Hopper's distinctive American realist style, with dramatic light and shadow and urban solitude. Create a contemplative interpretation with ",
    prompt_suffix: ". Use Hopper's characteristic architectural geometry, psychological atmosphere, and precise observation. Style of Nighthawks and Early Sunday Morning.",
    negative_prompt: "busy, crowded, chaotic, abstract, expressionist, decorative, romantic, sentimental, impressionist, loose, emotional, dramatic, fantasy, surreal",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      psychological_realism: 0.9,
      urban_solitude: 0.8,
      dramatic_lighting: 0.8,
      architectural_geometry: 0.7,
      emotional_isolation: 0.7
    }
  },
  picasso: {
    prompt_prefix: "In Picasso's distinctive cubist style, with geometric fragmentation and multiple perspectives. Create a bold interpretation with ",
    prompt_suffix: ". Use Picasso's characteristic angular forms, overlapping planes, and revolutionary composition. Style of Les Demoiselles d'Avignon and Guernica.",
    negative_prompt: "realistic, traditional, photographic, conventional, decorative, naturalistic, symmetrical, perspective-correct, detailed, smooth",
    num_inference_steps: 45,
    guidance_scale: 12.0,
    style_emphasis: {
      cubist_fragmentation: 0.9,
      geometric_abstraction: 0.8,
      multiple_perspectives: 0.8,
      bold_composition: 0.7
    }
  },
  warhol: {
    prompt_prefix: "In Andy Warhol's iconic pop art style, with bold colors and commercial imagery. Create a contemporary interpretation with ",
    prompt_suffix: ". Use Warhol's characteristic repetition, screen-print aesthetic, and vibrant color palette. Style of Campbell's Soup Cans and Marilyn Diptych.",
    negative_prompt: "subtle, painterly, traditional, natural, muted, complex, detailed, realistic, organic, classical",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      pop_art_aesthetic: 0.9,
      commercial_imagery: 0.8,
      bold_colors: 0.8,
      repetition: 0.7
    }
  },
  vangogh: {
    prompt_prefix: "In Van Gogh's expressive post-impressionist style, with dynamic brushwork and emotional intensity. Create a passionate interpretation with ",
    prompt_suffix: ". Use Van Gogh's characteristic impasto technique, swirling patterns, and vibrant colors. Style of Starry Night and Sunflowers.",
    negative_prompt: "smooth, realistic, precise, controlled, photographic, flat, minimal, geometric, digital, clean",
    num_inference_steps: 45,
    guidance_scale: 12.0,
    style_emphasis: {
      expressive_brushwork: 0.9,
      emotional_intensity: 0.8,
      vibrant_color: 0.8,
      swirling_patterns: 0.7
    }
  },
  mondrian: {
    prompt_prefix: "In Mondrian's neo-plastic style, with pure geometric abstraction and primary colors. Create a balanced interpretation with ",
    prompt_suffix: ". Use Mondrian's characteristic grid structure, primary color blocks, and mathematical harmony. Style of Composition with Red, Blue, and Yellow.",
    negative_prompt: "organic, curved, natural, decorative, complex, detailed, representational, textured, chaotic, diagonal",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      geometric_purity: 0.9,
      primary_colors: 0.8,
      grid_composition: 0.8,
      balanced_asymmetry: 0.7
    }
  },
  rothko: {
    prompt_prefix: "In Rothko's color field style, with luminous rectangular forms and spiritual depth. Create a meditative interpretation with ",
    prompt_suffix: ". Use Rothko's characteristic floating rectangles, subtle color transitions, and emotional resonance. Style of Orange and Yellow.",
    negative_prompt: "detailed, representational, linear, geometric, sharp, busy, illustrative, narrative, decorative, patterned",
    num_inference_steps: 45,
    guidance_scale: 12.0,
    style_emphasis: {
      color_field: 0.9,
      luminous_quality: 0.8,
      spiritual_depth: 0.8,
      emotional_impact: 0.7
    }
  },
  kandinsky: {
    prompt_prefix: "In Kandinsky's abstract expressionist style, with musical rhythm and spiritual geometry. Create a dynamic interpretation with ",
    prompt_suffix: ". Use Kandinsky's characteristic geometric forms, vibrant colors, and musical composition. Style of Composition VIII.",
    negative_prompt: "representational, realistic, static, muted, figurative, traditional, symmetrical, photographic, literal, narrative",
    num_inference_steps: 45,
    guidance_scale: 12.0,
    style_emphasis: {
      musical_rhythm: 0.9,
      spiritual_geometry: 0.8,
      dynamic_composition: 0.8,
      color_harmony: 0.7
    }
  },
  malevich: {
    prompt_prefix: "In Malevich's suprematist style, with pure geometric abstraction and cosmic space. Create a revolutionary interpretation with ",
    prompt_suffix: ". Use Malevich's characteristic floating forms, dynamic composition, and spiritual geometry. Style of Black Square and White on White.",
    negative_prompt: "representational, decorative, natural, organic, traditional, realistic, narrative, detailed, textured, conventional",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      suprematist_purity: 0.9,
      geometric_abstraction: 0.8,
      cosmic_space: 0.8,
      revolutionary_form: 0.7
    }
  },
  popova: {
    prompt_prefix: "In Popova's constructivist style, with dynamic spatial organization and architectural rhythm. Create a revolutionary interpretation with ",
    prompt_suffix: ". Use Popova's characteristic geometric forms, spatial force lines, and revolutionary composition. Style of Space Force Construction.",
    negative_prompt: "decorative, naturalistic, traditional, passive, static, organic, representational, ornamental, conventional, narrative",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      constructivist_form: 0.9,
      spatial_dynamics: 0.8,
      revolutionary_design: 0.8,
      architectural_rhythm: 0.7
    }
  },
  cartierbresson: {
    prompt_prefix: "In Cartier-Bresson's decisive moment style, with perfect timing and geometric precision. Create a spontaneous interpretation with ",
    prompt_suffix: ". Use Cartier-Bresson's characteristic geometric composition, street photography aesthetic, and decisive moment timing. Style of Behind the Gare Saint-Lazare.",
    negative_prompt: "posed, artificial, staged, manipulated, digital, processed, filtered, contrived, forced, unnatural",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      decisive_moment: 0.9,
      geometric_composition: 0.8,
      street_photography: 0.8,
      spontaneous_timing: 0.7
    }
  },
  arbus: {
    prompt_prefix: "In Diane Arbus's distinctive documentary style, with psychological intensity and social observation. Create a revealing interpretation with ",
    prompt_suffix: ". Use Arbus's characteristic direct gaze, social marginality, and square format composition. Style of Identical Twins and Jewish Giant.",
    negative_prompt: "glamorous, superficial, conventional, posed, artificial, flattering, decorative, sentimental, romantic, idealized",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      psychological_depth: 0.9,
      social_documentation: 0.8,
      direct_confrontation: 0.8,
      square_composition: 0.7
    }
  },
  avedon: {
    prompt_prefix: "In Richard Avedon's stark portrait style, with minimalist white backgrounds and psychological intensity. Create a revealing interpretation with ",
    prompt_suffix: ". Use Avedon's characteristic stark lighting, minimalist composition, and psychological depth. Style of In the American West.",
    negative_prompt: "cluttered, decorative, environmental, soft, romantic, painterly, atmospheric, busy, complex, ornate",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      stark_minimalism: 0.9,
      psychological_intensity: 0.8,
      sharp_detail: 0.8,
      white_background: 0.7
    }
  },
  eggleston: {
    prompt_prefix: "In William Eggleston's pioneering color style, with democratic vision and everyday beauty. Create a compelling interpretation with ",
    prompt_suffix: ". Use Eggleston's characteristic saturated color, democratic subject matter, and precise composition. Style of The Red Ceiling and Memphis.",
    negative_prompt: "black and white, monochrome, staged, artificial, dramatic, theatrical, posed, contrived, forced, unnatural",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      democratic_vision: 0.9,
      color_intensity: 0.8,
      everyday_beauty: 0.8,
      precise_composition: 0.7
    }
  },
  leibovitz: {
    prompt_prefix: "In Annie Leibovitz's dramatic portrait style, with theatrical lighting and conceptual narrative. Create a powerful interpretation with ",
    prompt_suffix: ". Use Leibovitz's characteristic dramatic lighting, environmental context, and narrative depth. Style of Vanity Fair portraits.",
    negative_prompt: "candid, snapshot, casual, unplanned, spontaneous, documentary, unposed, natural, simple, understated",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      dramatic_lighting: 0.9,
      conceptual_narrative: 0.8,
      environmental_context: 0.8,
      theatrical_staging: 0.7
    }
  },
  coopergorfer: {
    prompt_prefix: "In Cooper & Gorfer's dreamlike narrative style, with layered compositions and cultural storytelling. Create an ethereal interpretation with ",
    prompt_suffix: ". Use Cooper & Gorfer's characteristic layered imagery, cultural elements, and dreamlike atmosphere. Style of Between These Folded Walls, Utopia.",
    negative_prompt: "documentary, realistic, straightforward, unprocessed, literal, simple, stark, harsh, mundane",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      layered_composition: 0.9,
      cultural_narrative: 0.8,
      dreamlike_quality: 0.8,
      ethereal_atmosphere: 0.7
    }
  },
  vonwong: {
    prompt_prefix: "In Benjamin Von Wong's epic environmental style, with dramatic staging and social impact. Create a powerful interpretation with ",
    prompt_suffix: ". Use Von Wong's characteristic epic scale, environmental message, and dramatic lighting. Style of his environmental activism work.",
    negative_prompt: "simple, understated, casual, candid, natural, unstaged, ordinary, mundane, subtle",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      epic_scale: 0.9,
      environmental_message: 0.8,
      dramatic_staging: 0.8,
      social_impact: 0.7
    }
  },
  bourdin: {
    prompt_prefix: "In Guy Bourdin's surreal fashion style, with bold color and psychological tension. Create a provocative interpretation with ",
    prompt_suffix: ". Use Bourdin's characteristic saturated color, narrative mystery, and psychological edge. Style of his Vogue and Charles Jourdan work.",
    negative_prompt: "natural, documentary, candid, realistic, straightforward, conventional, traditional, expected",
    num_inference_steps: 40,
    guidance_scale: 11.0,
    style_emphasis: {
      surreal_composition: 0.9,
      bold_color: 0.8,
      psychological_tension: 0.8,
      narrative_mystery: 0.7
    }
  }
};

// Add style-specific elements
const BEEPLE_ELEMENTS: BeepleElements = {
  dystopian_scenes: [
    "massive corporate structures",
    "post-apocalyptic landscapes",
    "technological ruins",
    "dystopian cityscapes",
    "monumental scale architecture",
    "environmental destruction",
    "futuristic wastelands"
  ],
  tech_elements: [
    "giant robots",
    "holographic displays",
    "digital artifacts",
    "mechanical beings",
    "technological debris",
    "glowing elements",
    "cyber-organic fusion"
  ],
  political_elements: [
    "corporate logos",
    "political figures",
    "social commentary",
    "dystopian symbolism",
    "power structures",
    "institutional critique"
  ],
  pop_culture: [
    "meme references",
    "iconic characters",
    "brand integration",
    "cultural symbols",
    "viral moments",
    "internet culture"
  ]
};

const XCOPY_ELEMENTS: XCopyElements = {
  glitch_effects: [
    "digital corruption",
    "pixel sorting",
    "scan lines",
    "static noise",
    "visual artifacts",
    "data moshing",
    "signal interference"
  ],
  crypto_elements: [
    "blockchain aesthetics",
    "NFT culture",
    "digital ownership",
    "crypto symbolism",
    "web3 references",
    "digital scarcity"
  ],
  dark_themes: [
    "skull motifs",
    "death symbols",
    "existential dread",
    "psychological horror",
    "digital decay",
    "memento mori"
  ],
  digital_artifacts: [
    "harsh contrasts",
    "glitch patterns",
    "corrupted imagery",
    "digital noise",
    "distorted elements",
    "broken pixels"
  ]
};

const CHERNIAK_ELEMENTS: CherniakElements = {
  geometric_forms: [
    "wrapped strings",
    "geometric pegs",
    "perfect circles",
    "clean lines",
    "mathematical curves",
    "precise intersections"
  ],
  algorithmic_patterns: [
    "systematic variations",
    "recursive structures",
    "generative patterns",
    "mathematical grids",
    "controlled randomness",
    "deterministic chaos"
  ],
  mathematical_elements: [
    "geometric primitives",
    "minimal elements",
    "binary structures",
    "computational forms",
    "algorithmic beauty",
    "mathematical harmony"
  ],
  generative_structures: [
    "procedural forms",
    "systematic spacing",
    "geometric tension",
    "programmatic rhythm",
    "coded composition",
    "digital abstraction"
  ]
};

const HOPPER_ELEMENTS: HopperElements = {
  urban_scenes: [
    "empty diners",
    "city storefronts",
    "hotel rooms",
    "office spaces",
    "gas stations",
    "urban architecture",
    "coastal scenes",
    "empty restaurants",
    "morning streets",
    "evening cityscapes"
  ],
  lighting_elements: [
    "strong diagonal light",
    "morning sunlight",
    "late afternoon shadows",
    "dramatic window light",
    "stark shadows",
    "warm sunlight",
    "cool shadow tones",
    "theatrical lighting",
    "natural illumination",
    "atmospheric light"
  ],
  architectural_elements: [
    "large windows",
    "geometric forms",
    "urban buildings",
    "architectural detail",
    "stark simplification",
    "precise perspective",
    "modern structures",
    "clean lines",
    "architectural framing",
    "geometric division"
  ],
  psychological_elements: [
    "solitary figures",
    "emotional isolation",
    "quiet tension",
    "contemplative atmosphere",
    "psychological space",
    "modern alienation",
    "urban solitude",
    "psychological narrative",
    "contemplative distance",
    "spatial tension"
  ]
};

const PICASSO_ELEMENTS: PicassoElements = {
  cubist_forms: [
    "angular planes",
    "fragmented shapes",
    "geometric abstraction",
    "overlapping forms",
    "multiple viewpoints",
    "deconstructed figures"
  ],
  geometric_elements: [
    "triangular shapes",
    "cubic forms",
    "sharp angles",
    "linear elements",
    "geometric patterns",
    "abstract planes"
  ],
  abstract_figures: [
    "distorted portraits",
    "abstracted bodies",
    "fragmented faces",
    "geometric figures",
    "deconstructed forms",
    "cubist figures"
  ],
  color_elements: [
    "muted earth tones",
    "bold contrasts",
    "monochromatic schemes",
    "limited palette",
    "dramatic values",
    "geometric color blocks"
  ]
};

const WARHOL_ELEMENTS: WarholdElements = {
  pop_culture: [
    "commercial products",
    "celebrity portraits",
    "brand imagery",
    "mass media icons",
    "popular culture symbols",
    "advertising elements"
  ],
  repetition_elements: [
    "repeated images",
    "grid patterns",
    "serial imagery",
    "multiple panels",
    "screen print effects",
    "duplicated forms"
  ],
  color_schemes: [
    "vibrant pop colors",
    "high contrast palettes",
    "bold color blocks",
    "neon accents",
    "commercial color schemes",
    "synthetic hues"
  ],
  commercial_elements: [
    "consumer products",
    "advertising aesthetics",
    "brand logos",
    "mass production elements",
    "commercial imagery",
    "media culture symbols"
  ]
};

const VANGOGH_ELEMENTS: VanGoghElements = {
  brushwork_elements: [
    "impasto technique",
    "swirling strokes",
    "dynamic brushwork",
    "textured surfaces",
    "expressive marks",
    "rhythmic patterns"
  ],
  color_elements: [
    "vibrant yellows",
    "deep blues",
    "contrasting complementaries",
    "intense colors",
    "emotional palette",
    "bold chromatic choices"
  ],
  natural_elements: [
    "cypress trees",
    "wheat fields",
    "starry skies",
    "sunflowers",
    "landscape elements",
    "natural forms"
  ],
  emotional_elements: [
    "psychological intensity",
    "emotional expression",
    "spiritual resonance",
    "inner turmoil",
    "passionate rendering",
    "dramatic mood"
  ]
};

const MONDRIAN_ELEMENTS: MondrianElements = {
  geometric_elements: [
    "straight lines",
    "right angles",
    "rectangular forms",
    "grid structures",
    "perpendicular intersections",
    "balanced asymmetry"
  ],
  color_blocks: [
    "primary red",
    "primary blue",
    "primary yellow",
    "pure white",
    "pure black",
    "balanced neutrals"
  ],
  compositional_elements: [
    "grid patterns",
    "mathematical proportions",
    "balanced spaces",
    "dynamic equilibrium",
    "geometric harmony",
    "spatial rhythm"
  ],
  abstract_elements: [
    "pure abstraction",
    "geometric purity",
    "universal harmony",
    "neo-plastic forms",
    "reduced elements",
    "essential geometry"
  ]
};

const ROTHKO_ELEMENTS: RothkoElements = {
  color_fields: [
    "luminous rectangles",
    "floating forms",
    "soft edges",
    "color transitions",
    "atmospheric layers",
    "glowing boundaries"
  ],
  atmospheric_elements: [
    "ethereal light",
    "spiritual presence",
    "meditative space",
    "luminous depth",
    "transcendent glow",
    "subtle radiance"
  ],
  compositional_elements: [
    "stacked rectangles",
    "horizontal bands",
    "balanced proportions",
    "subtle asymmetry",
    "spatial depth",
    "vertical rhythm"
  ],
  emotional_elements: [
    "contemplative mood",
    "spiritual resonance",
    "emotional depth",
    "inner luminosity",
    "transcendent feeling",
    "meditative presence"
  ]
};

const KANDINSKY_ELEMENTS: KandinskyElements = {
  abstract_forms: [
    "geometric shapes",
    "organic forms",
    "dynamic lines",
    "floating elements",
    "abstract symbols",
    "spiritual forms"
  ],
  musical_elements: [
    "rhythmic patterns",
    "visual melody",
    "harmonic composition",
    "dynamic movement",
    "synesthetic forms",
    "musical notation"
  ],
  geometric_shapes: [
    "circles",
    "triangles",
    "squares",
    "curved lines",
    "angular forms",
    "intersecting planes"
  ],
  color_harmonies: [
    "vibrant contrasts",
    "spiritual colors",
    "emotional hues",
    "dynamic palettes",
    "harmonic combinations",
    "resonant tones"
  ]
};

// Add element configurations
const MALEVICH_ELEMENTS: MalevichElements = {
  suprematist_forms: [
    "floating squares",
    "geometric circles",
    "dynamic rectangles",
    "abstract crosses",
    "pure shapes",
    "cosmic forms"
  ],
  geometric_elements: [
    "black square",
    "white space",
    "geometric purity",
    "mathematical forms",
    "abstract geometry",
    "revolutionary shapes"
  ],
  spatial_elements: [
    "cosmic space",
    "infinite void",
    "floating composition",
    "dynamic balance",
    "spatial tension",
    "revolutionary space"
  ],
  color_elements: [
    "pure black",
    "absolute white",
    "primary colors",
    "revolutionary red",
    "cosmic blue",
    "geometric contrast"
  ]
};

const POPOVA_ELEMENTS: PopovaElements = {
  constructivist_forms: [
    "architectural forms",
    "industrial shapes",
    "geometric structures",
    "revolutionary design",
    "dynamic planes",
    "constructive elements"
  ],
  spatial_elements: [
    "force lines",
    "spatial tension",
    "dynamic balance",
    "architectural space",
    "revolutionary composition",
    "geometric organization"
  ],
  color_elements: [
    "revolutionary red",
    "industrial grey",
    "constructivist palette",
    "dynamic contrast",
    "architectural color",
    "spatial hues"
  ],
  dynamic_elements: [
    "force dynamics",
    "spatial movement",
    "revolutionary rhythm",
    "constructive energy",
    "architectural motion",
    "geometric flow"
  ]
};

const CARTIERBRESSON_ELEMENTS: CartierBressonElements = {
  decisive_moments: [
    "perfect timing",
    "spontaneous action",
    "fleeting gesture",
    "critical moment",
    "captured instant",
    "street life"
  ],
  composition_elements: [
    "geometric precision",
    "golden ratio",
    "dynamic balance",
    "spatial harmony",
    "perfect framing",
    "visual rhythm"
  ],
  street_elements: [
    "urban life",
    "human interaction",
    "public spaces",
    "street scenes",
    "city moments",
    "daily life"
  ],
  timing_elements: [
    "decisive instant",
    "perfect coincidence",
    "spontaneous alignment",
    "magical moment",
    "street choreography",
    "life unfolding"
  ]
};

const ARBUS_ELEMENTS: ArbusElements = {
  portrait_elements: [
    "direct gaze",
    "frontal pose",
    "square format",
    "flash lighting",
    "social outsiders",
    "revealing expressions"
  ],
  psychological_elements: [
    "inner complexity",
    "human vulnerability",
    "social marginality",
    "psychological tension",
    "revealing moments",
    "direct confrontation"
  ],
  social_elements: [
    "marginalized subjects",
    "social outcasts",
    "cultural fringe",
    "human dignity",
    "social documentation",
    "cultural observation"
  ],
  compositional_elements: [
    "central framing",
    "direct approach",
    "square format",
    "stark lighting",
    "revealing detail",
    "documentary clarity"
  ]
};

const AVEDON_ELEMENTS: AvedonElements = {
  portrait_style: [
    "stark white background",
    "minimalist setting",
    "direct gaze",
    "revealing pose",
    "psychological intensity",
    "character study"
  ],
  fashion_elements: [
    "elegant simplicity",
    "dramatic contrast",
    "precise styling",
    "minimalist aesthetic",
    "fashion context",
    "refined detail"
  ],
  lighting_elements: [
    "stark lighting",
    "sharp shadows",
    "crisp detail",
    "high contrast",
    "precise exposure",
    "clean illumination"
  ],
  psychological_elements: [
    "revealing expression",
    "inner character",
    "psychological depth",
    "human truth",
    "emotional resonance",
    "personal revelation"
  ]
};

const EGGLESTON_ELEMENTS: EgglestonElements = {
  color_elements: [
    "saturated hues",
    "democratic color",
    "chromatic intensity",
    "color relationships",
    "everyday palette",
    "natural saturation"
  ],
  composition_elements: [
    "precise framing",
    "democratic vision",
    "everyday geometry",
    "found composition",
    "natural balance",
    "subtle structure"
  ],
  everyday_elements: [
    "ordinary objects",
    "found scenes",
    "daily life",
    "vernacular america",
    "common beauty",
    "democratic subject"
  ],
  americana_elements: [
    "southern culture",
    "american vernacular",
    "local character",
    "regional identity",
    "cultural landscape",
    "everyday america"
  ]
};

const LEIBOVITZ_ELEMENTS: LeibovitzElements = {
  portrait_elements: [
    "environmental context",
    "character revelation",
    "dramatic pose",
    "narrative setting",
    "conceptual staging",
    "personality capture"
  ],
  lighting_elements: [
    "dramatic lighting",
    "theatrical illumination",
    "mood lighting",
    "atmospheric effect",
    "controlled light",
    "narrative illumination"
  ],
  conceptual_elements: [
    "narrative concept",
    "story elements",
    "symbolic props",
    "meaningful setting",
    "character elements",
    "visual storytelling"
  ],
  dramatic_elements: [
    "theatrical staging",
    "dramatic moment",
    "powerful presence",
    "emotional impact",
    "visual drama",
    "cinematic quality"
  ]
};

// Add element configurations for remaining contemporary artists
const COOPERGORFER_ELEMENTS: CooperGorferElements = {
  narrative_elements: [
    "cultural storytelling",
    "layered narrative",
    "symbolic elements",
    "mythological references",
    "identity exploration",
    "cultural heritage"
  ],
  composition_elements: [
    "layered imagery",
    "collage aesthetic",
    "dreamlike composition",
    "ethereal space",
    "floating elements",
    "dimensional depth"
  ],
  cultural_elements: [
    "traditional costume",
    "cultural symbols",
    "heritage elements",
    "identity markers",
    "cultural context",
    "historical reference"
  ],
  atmospheric_elements: [
    "dreamlike quality",
    "ethereal lighting",
    "soft atmosphere",
    "mystical mood",
    "poetic space",
    "timeless feeling"
  ]
};

const VONWONG_ELEMENTS: VonWongElements = {
  epic_elements: [
    "grand scale",
    "dramatic perspective",
    "epic staging",
    "environmental scale",
    "powerful composition",
    "visual impact"
  ],
  environmental_elements: [
    "environmental message",
    "ecological context",
    "natural elements",
    "environmental impact",
    "conservation theme",
    "sustainability focus"
  ],
  production_elements: [
    "complex staging",
    "dramatic lighting",
    "technical excellence",
    "production value",
    "creative rigging",
    "location mastery"
  ],
  impact_elements: [
    "social message",
    "emotional impact",
    "narrative power",
    "cultural relevance",
    "activist stance",
    "call to action"
  ]
};

const BOURDIN_ELEMENTS: BourdinElements = {
  fashion_elements: [
    "fashion context",
    "stylized presentation",
    "luxury aesthetic",
    "brand integration",
    "fashion narrative",
    "product focus"
  ],
  color_elements: [
    "saturated color",
    "bold palette",
    "chromatic drama",
    "color psychology",
    "tonal impact",
    "vivid hues"
  ],
  narrative_elements: [
    "mysterious story",
    "psychological edge",
    "narrative tension",
    "suggestive scene",
    "implied drama",
    "visual mystery"
  ],
  surreal_elements: [
    "surreal composition",
    "psychological space",
    "dream logic",
    "uncanny elements",
    "symbolic objects",
    "strange juxtaposition"
  ]
};

export async function generateConceptualPrompt(
  aiService: AIService,
  concept: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    category?: ConceptCategory;
    useFluxPro?: boolean;
    postPhotoNative?: boolean;
    style?: string;
  } = {}
): Promise<{ prompt: string; creativeProcess: string }> {
  let detailedPrompt = '';
  let creativeProcess = '';
  
  // Get style-specific configuration
  const styleConfig = STYLE_CONFIGS[options.style?.toLowerCase() || 'cherniak'];
  let styleElements;
  
  // Select appropriate style elements
  switch(options.style?.toLowerCase()) {
    case 'beeple':
      styleElements = BEEPLE_ELEMENTS;
      break;
    case 'xcopy':
      styleElements = XCOPY_ELEMENTS;
      break;
    case 'cherniak':
      styleElements = CHERNIAK_ELEMENTS;
      break;
    case 'hopper':
      styleElements = HOPPER_ELEMENTS;
      break;
    case 'picasso':
      styleElements = PICASSO_ELEMENTS;
      break;
    case 'warhol':
      styleElements = WARHOL_ELEMENTS;
      break;
    case 'vangogh':
      styleElements = VANGOGH_ELEMENTS;
      break;
    case 'mondrian':
      styleElements = MONDRIAN_ELEMENTS;
      break;
    case 'rothko':
      styleElements = ROTHKO_ELEMENTS;
      break;
    case 'kandinsky':
      styleElements = KANDINSKY_ELEMENTS;
      break;
    case 'malevich':
      styleElements = MALEVICH_ELEMENTS;
      break;
    case 'popova':
      styleElements = POPOVA_ELEMENTS;
      break;
    case 'cartierbresson':
      styleElements = CARTIERBRESSON_ELEMENTS;
      break;
    case 'arbus':
      styleElements = ARBUS_ELEMENTS;
      break;
    case 'avedon':
      styleElements = AVEDON_ELEMENTS;
      break;
    case 'eggleston':
      styleElements = EGGLESTON_ELEMENTS;
      break;
    case 'leibovitz':
      styleElements = LEIBOVITZ_ELEMENTS;
      break;
    case 'coopergorfer':
      styleElements = COOPERGORFER_ELEMENTS;
      break;
    case 'vonwong':
      styleElements = VONWONG_ELEMENTS;
      break;
    case 'bourdin':
      styleElements = BOURDIN_ELEMENTS;
      break;
    default:
      styleElements = CHERNIAK_ELEMENTS; // Default to Cherniak
  }

  const promptResponse = await aiService.getCompletion({
    model: options.model || 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `You are a visionary artist working in the style of ${options.style || 'Cherniak'}. 
        Create a detailed prompt that incorporates the following style elements:
        ${JSON.stringify(styleElements, null, 2)}
        
        Use the style configuration:
        ${JSON.stringify(styleConfig, null, 2)}`
      },
      {
        role: 'user',
        content: `Create a deeply expressive prompt for "${concept}" in the style of ${options.style || 'Cherniak'}. Include both the prompt and creative process.`
      }
    ],
    temperature: options.temperature || 0.85,
    maxTokens: options.maxTokens || 1500
  });

  if (promptResponse.content) {
    const promptMatch = promptResponse.content.match(/Prompt:(.+?)(?=Creative Process:|$)/s);
    const processMatch = promptResponse.content.match(/Creative Process:(.+?)(?=$)/s);

    if (promptMatch && promptMatch[1]) {
      detailedPrompt = promptMatch[1].trim();
    } else {
      detailedPrompt = promptResponse.content;
    }

    if (processMatch && processMatch[1]) {
      creativeProcess = processMatch[1].trim();
    }

    // Enhance prompt with style-specific elements
    if (styleElements && detailedPrompt) {
      // Add random style-specific elements based on the selected style
      const addStyleElements = (elements: string[], count: number = 2) => {
        return elements
          .sort(() => Math.random() - 0.5)
          .slice(0, count)
          .join(', ');
      };

      let styleEnhancement = '';
      
      switch(options.style?.toLowerCase()) {
        case 'beeple':
          styleEnhancement = `, featuring ${addStyleElements(BEEPLE_ELEMENTS.dystopian_scenes)}, with ${addStyleElements(BEEPLE_ELEMENTS.tech_elements)}, incorporating ${addStyleElements(BEEPLE_ELEMENTS.political_elements)}`;
          break;
        case 'xcopy':
          styleEnhancement = `, with ${addStyleElements(XCOPY_ELEMENTS.glitch_effects)}, featuring ${addStyleElements(XCOPY_ELEMENTS.dark_themes)}, incorporating ${addStyleElements(XCOPY_ELEMENTS.digital_artifacts)}`;
          break;
        case 'cherniak':
          styleEnhancement = `, with ${addStyleElements(CHERNIAK_ELEMENTS.geometric_forms)}, featuring ${addStyleElements(CHERNIAK_ELEMENTS.algorithmic_patterns)}, incorporating ${addStyleElements(CHERNIAK_ELEMENTS.mathematical_elements)}`;
          break;
        case 'hopper':
          styleEnhancement = `, with ${addStyleElements(HOPPER_ELEMENTS.lighting_elements)}, featuring ${addStyleElements(HOPPER_ELEMENTS.urban_scenes)}, incorporating ${addStyleElements(HOPPER_ELEMENTS.psychological_elements)}`;
          break;
        case 'picasso':
          styleEnhancement = `, with ${addStyleElements(PICASSO_ELEMENTS.cubist_forms)}, featuring ${addStyleElements(PICASSO_ELEMENTS.geometric_elements)}, incorporating ${addStyleElements(PICASSO_ELEMENTS.abstract_figures)}`;
          break;
        case 'warhol':
          styleEnhancement = `, with ${addStyleElements(WARHOL_ELEMENTS.pop_culture)}, incorporating ${addStyleElements(WARHOL_ELEMENTS.repetition_elements)}`;
          break;
        case 'vangogh':
          styleEnhancement = `, with ${addStyleElements(VANGOGH_ELEMENTS.brushwork_elements)}, incorporating ${addStyleElements(VANGOGH_ELEMENTS.color_elements)}`;
          break;
        case 'mondrian':
          styleEnhancement = `, with ${addStyleElements(MONDRIAN_ELEMENTS.geometric_elements)}, featuring ${addStyleElements(MONDRIAN_ELEMENTS.color_blocks)}, incorporating ${addStyleElements(MONDRIAN_ELEMENTS.compositional_elements)}`;
          break;
        case 'rothko':
          styleEnhancement = `, with ${addStyleElements(ROTHKO_ELEMENTS.color_fields)}, featuring ${addStyleElements(ROTHKO_ELEMENTS.atmospheric_elements)}, incorporating ${addStyleElements(ROTHKO_ELEMENTS.emotional_elements)}`;
          break;
        case 'kandinsky':
          styleEnhancement = `, with ${addStyleElements(KANDINSKY_ELEMENTS.abstract_forms)}, featuring ${addStyleElements(KANDINSKY_ELEMENTS.musical_elements)}, incorporating ${addStyleElements(KANDINSKY_ELEMENTS.geometric_shapes)}`;
          break;
        case 'malevich':
          styleEnhancement = `, with ${addStyleElements(MALEVICH_ELEMENTS.suprematist_forms)}, featuring ${addStyleElements(MALEVICH_ELEMENTS.spatial_elements)}, incorporating ${addStyleElements(MALEVICH_ELEMENTS.color_elements)}`;
          break;
        case 'popova':
          styleEnhancement = `, with ${addStyleElements(POPOVA_ELEMENTS.constructivist_forms)}, featuring ${addStyleElements(POPOVA_ELEMENTS.spatial_elements)}, incorporating ${addStyleElements(POPOVA_ELEMENTS.dynamic_elements)}`;
          break;
        case 'cartierbresson':
          styleEnhancement = `, with ${addStyleElements(CARTIERBRESSON_ELEMENTS.decisive_moments)}, featuring ${addStyleElements(CARTIERBRESSON_ELEMENTS.composition_elements)}, incorporating ${addStyleElements(CARTIERBRESSON_ELEMENTS.street_elements)}`;
          break;
        case 'arbus':
          styleEnhancement = `, with ${addStyleElements(ARBUS_ELEMENTS.portrait_elements)}, featuring ${addStyleElements(ARBUS_ELEMENTS.psychological_elements)}, incorporating ${addStyleElements(ARBUS_ELEMENTS.social_elements)}`;
          break;
        case 'avedon':
          styleEnhancement = `, with ${addStyleElements(AVEDON_ELEMENTS.portrait_style)}, featuring ${addStyleElements(AVEDON_ELEMENTS.lighting_elements)}, incorporating ${addStyleElements(AVEDON_ELEMENTS.psychological_elements)}`;
          break;
        case 'eggleston':
          styleEnhancement = `, with ${addStyleElements(EGGLESTON_ELEMENTS.color_elements)}, featuring ${addStyleElements(EGGLESTON_ELEMENTS.composition_elements)}, incorporating ${addStyleElements(EGGLESTON_ELEMENTS.everyday_elements)}`;
          break;
        case 'leibovitz':
          styleEnhancement = `, with ${addStyleElements(LEIBOVITZ_ELEMENTS.portrait_elements)}, featuring ${addStyleElements(LEIBOVITZ_ELEMENTS.lighting_elements)}, incorporating ${addStyleElements(LEIBOVITZ_ELEMENTS.conceptual_elements)}`;
          break;
        case 'coopergorfer':
          styleEnhancement = `, with ${addStyleElements(COOPERGORFER_ELEMENTS.narrative_elements)}, featuring ${addStyleElements(COOPERGORFER_ELEMENTS.composition_elements)}, incorporating ${addStyleElements(COOPERGORFER_ELEMENTS.cultural_elements)}`;
          break;
        case 'vonwong':
          styleEnhancement = `, with ${addStyleElements(VONWONG_ELEMENTS.epic_elements)}, featuring ${addStyleElements(VONWONG_ELEMENTS.environmental_elements)}, incorporating ${addStyleElements(VONWONG_ELEMENTS.impact_elements)}`;
          break;
        case 'bourdin':
          styleEnhancement = `, with ${addStyleElements(BOURDIN_ELEMENTS.fashion_elements)}, featuring ${addStyleElements(BOURDIN_ELEMENTS.color_elements)}, incorporating ${addStyleElements(BOURDIN_ELEMENTS.surreal_elements)}`;
          break;
      }
      
      detailedPrompt = `${detailedPrompt}${styleEnhancement}`;
    }
  }

  return {
    prompt: detailedPrompt,
    creativeProcess: creativeProcess
  };
} 