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

// Style configurations
const STYLE_CONFIGS: { [key: string]: StyleConfig } = {
  Margritte: {
    prompt_prefix: "In the surrealist style of René Magritte, create a scene with ",
    prompt_suffix: ". Incorporate Magritte's signature elements: precise oil painting technique, philosophical paradox, metaphysical depth, symbolic power, and spatial contradictions. Reference his masterpieces like 'The Son of Man', 'The Human Condition', and 'The False Mirror'.",
    negative_prompt: "photorealistic, digital art, harsh, dark, gritty, moody, dystopian, horror, violent, grotesque, minimalist, abstract, rough, sketchy, unfinished, animation, cartoon, anime",
    num_inference_steps: 50,
    guidance_scale: 12.0,
    style_emphasis: {
      surrealist_technique: 0.95,
      oil_painting_quality: 0.9,
      philosophical_depth: 0.95,
      symbolic_power: 0.9,
      spatial_paradox: 0.95,
      metaphysical_quality: 0.9,
      belgian_style: 0.95,
      academic_precision: 0.9,
      surrealist_atmosphere: 0.95
    }
  }
};

// Define Margritte-specific elements
const Margritte_ELEMENTS = {
  visual_elements: [
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
  techniques: [
    "hand-drawn animation",
    "watercolor effects",
    "soft lighting",
    "atmospheric perspective",
    "environmental detail",
    "fluid movement",
    "character expression",
    "natural color harmony",
    "traditional animation",
    "painted backgrounds"
  ],
  concepts: [
    "environmental harmony",
    "cultural preservation",
    "magical realism",
    "emotional storytelling",
    "childhood wonder",
    "human resilience",
    "nature connection",
    "spiritual elements",
    "cultural identity",
    "technological balance"
  ],
  compositions: [
    "balanced natural compositions",
    "dynamic camera movements",
    "atmospheric perspective",
    "environmental storytelling",
    "character-focused framing",
    "layered backgrounds",
    "natural lighting integration",
    "fluid motion emphasis",
    "environmental harmony",
    "emotional resonance"
  ]
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
  } = {}
): Promise<{ prompt: string; creativeProcess: string }> {
  let detailedPrompt = '';
  let creativeProcess = '';
  
  // Get Margritte's style configuration
  const styleConfig = STYLE_CONFIGS.Margritte;
  
  const promptResponse = await aiService.getCompletion({
    model: 'claude-3-sonnet-20240229',
    messages: [
      {
        role: 'system',
        content: `You are a Studio Margritte art director, creating detailed prompts that capture the surrealist style of Margritte. 
        Create a detailed prompt that incorporates Margritte's distinctive style elements:
        ${JSON.stringify(Margritte_ELEMENTS, null, 2)}
        
        Use your style configuration:
        ${JSON.stringify(styleConfig, null, 2)}
        
        Focus on:
        1. Philosophical paradox and metaphysical depth
        2. Symbolic power and spatial contradictions
        3. Precise oil painting technique
        4. Masterpieces and cultural references`
      },
      {
        role: 'user',
        content: `Create a detailed prompt for "${concept}" in Margritte's surrealist style. Include both the prompt and your creative process. Focus on philosophical paradox, symbolic power, and precise oil painting technique.`
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

    // Enhance prompt with Margritte-specific elements
    if (detailedPrompt) {
      const addMargritteElements = (elements: string[], count: number = 2) => {
        return elements
          .sort(() => Math.random() - 0.5)
          .slice(0, count)
          .join(', ');
      };

      const styleEnhancement = `, featuring ${addMargritteElements(Margritte_ELEMENTS.visual_elements)}, with ${addMargritteElements(Margritte_ELEMENTS.techniques)}, incorporating ${addMargritteElements(Margritte_ELEMENTS.concepts)}`;
      
      detailedPrompt = `${styleConfig.prompt_prefix}${detailedPrompt}${styleEnhancement}${styleConfig.prompt_suffix}`;
    }
  }

  return {
    prompt: detailedPrompt,
    creativeProcess: creativeProcess
  };
} 