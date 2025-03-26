import { AIService, AIMessage } from './ai/index.js';
import { generateConceptualPrompt } from './ai/conceptualPromptGenerator.js';
import { ConceptCategory } from './ai/conceptGenerator.js';
import { IdeaQueue, CreativeIdea, ExplorationThread } from './IdeaQueue.js';
import { MemorySystem, MemoryType, Memory } from './memory/index.js';
import { StyleService } from './style/index.js';
import { ReplicateService } from './replicate/index.js';
import { SocialEngagementService, SocialPlatform, FeedbackType, FeedbackSentiment } from './social/index.js';
import { ArtBotMultiAgentSystem } from '../artbot-multiagent-system.js';
import { Margritte_CATEGORIES } from '../styles/magritteCategories.js';

// Define interfaces for the components we need
interface CreativeState {
  currentIdeas: any[];
  completedWorks: any[];
  stylePreferences: Array<{name: string, score: number}>;
  explorationRate: number;
  creativityMetrics: {
    originality: number;
    coherence: number;
    relevance: number;
    diversity: number;
  };
  ideaQueue?: IdeaQueue;
  memories?: MemorySystem;
}

// Define interface for CreativeEngine configuration
interface CreativeEngineConfig {
  anthropicApiKey?: string;
  openaiApiKey?: string;
  replicateService?: ReplicateService;
  baseDir?: string;
  socialEngagement?: SocialEngagementService;
  autonomyLevel?: number;
  [key: string]: any;
}

// Mock service classes until actual implementations are available
class ImageService {
  constructor(config = {}) {}
  async initialize(): Promise<void> {}
}

// Add type definitions for style parameters
interface BourdinElements {
  fashion: string[];
  props: string[];
  poses: string[];
}

interface MargritteElements {
  symbols: string[];
  settings: string[];
  objects: string[];
  paradoxes: string[];
  skies: string[];
  windows: string[];
}

interface BourdinTechniques {
  photography: string[];
  styling: string[];
  narrative: string[];
}

interface MargritteTechniques {
  painting: string[];
  surrealism: string[];
  philosophy: string[];
  composition: string[];
  lighting: string[];
}

interface IkigaiTechniques {
  quantum: string[];
  neural: string[];
  temporal: string[];
}

interface StyleParams {
  composition: {
    arrangement: string;
    balance?: string;
    perspective: string;
    depth: string;
    scale?: string;
    cropping?: string;
    framing?: string;
  };
  lighting: {
    style: string;
    direction: string;
    shadows: string;
    highlights: string;
    mood: string;
  };
  color: {
    palette: string[];
    saturation: string;
    contrast: string;
    treatment: string;
  };
  elements?: {
    symbols?: string[];
    settings?: string[];
    objects?: string[];
  };
  techniques?: {
    [key: string]: string[];
  };
  category?: string;
  philosophicalFramework?: {
    beliefs: string[];
    theories: string[];
    conceptualFrameworks: string[];
    paradoxes: string[];
    visualDialectics: string[];
  };
  technicalExecution?: {
    renderingTechniques: string[];
    materialPreparation: string[];
    workingMethodology: string[];
    qualityMetrics: string[];
  };
}

interface StyleEmphasis {
  technique?: string;
  composition?: string;
  lighting?: string;
  mood?: string;
}

interface ConceptGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  category?: ConceptCategory;
  useFluxPro?: boolean;
  postPhotoNative?: boolean;
  style?: string;
  styleEmphasis?: StyleEmphasis;
}

// Define style-specific artistic parameters
const artisticParams = {
  beeple: {
    composition: {
      arrangement: "monumental dystopian scale",
      balance: "maximalist chaos",
      perspective: "extreme dramatic angles",
      depth: "infinite dystopian space",
      scale: "gigantic structures",
      cropping: "cinematic widescreen",
      framing: "epic scale framing"
    },
    lighting: {
      style: "dramatic technological",
      direction: "multiple light sources",
      shadows: "deep tech noir",
      highlights: "neon accents",
      mood: "apocalyptic atmosphere"
    },
    color: {
      palette: ["toxic neon", "dystopian grey", "digital blue", "warning red", "industrial rust"],
      saturation: "hyper-saturated",
      contrast: "extreme HDR",
      treatment: "digital maximalism"
    },
    elements: {
      symbols: ["dystopian icons", "corporate logos", "technological ruins"],
      settings: ["post-apocalyptic landscapes", "cyber megacities", "digital wastelands"],
      objects: ["giant robots", "holographic displays", "mechanical beings"]
    },
    techniques: {
      rendering: ["hyper-detailed", "maximalist", "photorealistic"],
      effects: ["volumetric lighting", "particle systems", "atmospheric fog"],
      composition: ["extreme perspective", "monumental scale", "dynamic angles"]
    }
  },
  xcopy: {
    composition: {
      arrangement: "glitch symmetry",
      balance: "corrupted harmony",
      perspective: "flattened space",
      depth: "digital void",
      scale: "screen-space scale",
      cropping: "harsh cuts",
      framing: "glitch frame"
    },
    lighting: {
      style: "harsh digital",
      direction: "corrupted sources",
      shadows: "digital black",
      highlights: "glitch bright",
      mood: "dark psychological"
    },
    color: {
      palette: ["glitch red", "void black", "digital green", "static white", "error blue"],
      saturation: "corrupted values",
      contrast: "extreme digital",
      treatment: "glitch aesthetics"
    },
    elements: {
      symbols: ["skulls", "glitch patterns", "crypto icons"],
      settings: ["digital void", "corrupted space", "virtual realms"],
      objects: ["distorted figures", "broken screens", "digital artifacts"]
    },
    techniques: {
      rendering: ["glitch art", "pixel sorting", "data moshing"],
      effects: ["scan lines", "visual noise", "signal interference"],
      composition: ["stark contrast", "minimal elements", "corrupted symmetry"]
    }
  },
  cherniak: {
    composition: {
      arrangement: "algorithmic precision",
      balance: "mathematical harmony",
      perspective: "geometric space",
      depth: "calculated dimension",
      scale: "proportional ratios",
      cropping: "precise bounds",
      framing: "geometric frame"
    },
    lighting: {
      style: "systematic illumination",
      direction: "calculated angles",
      shadows: "geometric shade",
      highlights: "precise light",
      mood: "mathematical clarity"
    },
    color: {
      palette: ["pure black", "precise white", "geometric grey", "systematic color", "calculated tone"],
      saturation: "controlled values",
      contrast: "precise ratios",
      treatment: "algorithmic rendering"
    },
    elements: {
      symbols: ["geometric primitives", "mathematical curves", "algorithmic patterns"],
      settings: ["abstract space", "computational void", "systematic grid"],
      objects: ["wrapped strings", "perfect circles", "geometric pegs"]
    },
    techniques: {
      rendering: ["vector precision", "mathematical accuracy", "clean lines"],
      effects: ["systematic variation", "controlled randomness", "geometric harmony"],
      composition: ["golden ratio", "recursive patterns", "systematic spacing"]
    }
  },
  Margritte: {
    composition: {
      arrangement: "metaphysical precision",
      balance: "philosophical symmetry",
      perspective: "paradoxical space",
      depth: "flat yet infinite",
      scale: "reality-defying proportions",
      cropping: "window-like framing",
      framing: "theatrical presentation",
      spacing: "symbolic isolation",
      layering: "reality planes intersection"
    },
    lighting: {
      style: "crystalline illumination",
      direction: "impossible light sources",
      shadows: "metaphysical shadows",
      highlights: "surreal accents",
      mood: "dreamlike atmosphere",
      timeOfDay: "eternal twilight",
      contrast: "reality versus illusion",
      quality: "pristine clarity"
    },
    color: {
      palette: [
        "sky blue",
        "cloudy white",
        "deep black",
        "forest green",
        "warm brown",
        "evening blue",
        "stone grey",
        "blood red",
        "pale flesh"
      ],
      saturation: "naturalistic yet surreal",
      contrast: "subtle yet striking",
      treatment: "flat oil painting technique",
      harmony: "classical restraint",
      symbolism: "color as metaphor"
    },
    elements: {
      symbols: [
        "vintage fedoras",
        "classic newsboy caps",
        "wool beanies",
        "wide-brim felt hats",
        "flat caps",
        "slouchy knit caps",
        "porkpie hats",
        "green apples",
        "clouds",
        "pipes",
        "mirrors",
        "curtains",
        "windows",
        "birds",
        "men in suits",
        "floating rocks"
      ],
      settings: [
        "infinite skies",
        "windowframes",
        "empty rooms",
        "belgian landscapes",
        "seaside walls",
        "mysterious doorways",
        "floating chambers",
        "impossible interiors"
      ],
      objects: [
        "floating stones",
        "curtains",
        "birds",
        "bells",
        "trees",
        "picture frames",
        "easels",
        "chairs",
        "musical instruments"
      ],
      paradoxes: [
        "day-night coexistence",
        "inside-outside fusion",
        "scale contradictions",
        "object transformations",
        "reality-reflection inversions"
      ],
      skies: [
        "daytime stars",
        "impossible clouds",
        "multiple moons",
        "gradient twilight",
        "luminous darkness"
      ],
      windows: [
        "views to nowhere",
        "impossible perspectives",
        "reality portals",
        "frame within frame",
        "mirror reflections"
      ]
    },
    techniques: {
      painting: [
        "flat color fields",
        "sharp edges",
        "precise brushwork",
        "oil glazing",
        "seamless blending",
        "photorealistic detail",
        "controlled texture"
      ],
      surrealism: [
        "object displacement",
        "scale distortion",
        "impossible juxtapositions",
        "reality questioning",
        "dream logic",
        "symbolic transformation"
      ],
      philosophy: [
        "visual paradox",
        "reality questioning",
        "object poetry",
        "meaning subversion",
        "identity exploration",
        "existence contemplation"
      ],
      composition: [
        "theatrical staging",
        "central focus",
        "window framing",
        "geometric balance",
        "symbolic placement",
        "depth illusion"
      ],
      lighting: [
        "day-for-night",
        "impossible shadows",
        "crystalline clarity",
        "metaphysical glow",
        "eternal twilight",
        "sourceless illumination"
      ]
    },
    references: {
      keyWorks: [
        // 1920s - Early Surrealist Period
        "The Lost Jockey (1926) - First surrealist work, featuring musical notes and trees in impossible scale",
        "The Central Story (1927) - Early word-image exploration with floating objects",
        "The Meaning of Night (1927) - Early nocturnal themes with mysterious figures",
        "Discovery (1927) - First use of hybrid figures and metamorphosis",
        "The False Mirror (1929) - Iconic eye filled with clouded sky, exploring perception",
        "The Treachery of Images (1929) - Famous pipe painting with 'Ceci n'est pas une pipe'",
        "Words and Images (1929) - Seminal work exploring language and visual representation",
        
        // 1930s - Mature Development
        "The Key of Dreams (1930) - Complex word-object relationships and symbolic meanings",
        "The Annunciation (1930) - Curtain and bell motifs in theatrical setting",
        "The Human Condition (1933) - Masterful canvas-window paradox, reality versus representation",
        "The Rape (1934) - Provocative face-torso transformation, identity exploration",
        "Collective Invention (1934) - Hybrid creature theme, half-fish half-human",
        "The Red Model (1935) - Transformative boot-foot fusion, everyday object surrealism",
        "La Clef des Songes (1935) - Systematic object-word mismatches and associations",
        "Not to be Reproduced (1937) - Mirror reflection paradox with repeated back view",
        "Time Transfixed (1938) - Iconic locomotive emerging from fireplace",
        "The Victory (1939) - Clouds transformed into stone, material paradox",
        
        // 1940s - Wartime Evolution
        "The Return of the Flame (1943) - Fire transforming into wood in reverse alchemy",
        "The Break in the Clouds (1942) - Bird-cloud fusion in impossible sky",
        "The Misanthropes (1942) - Figure wrapped in fabric, identity concealment",
        "Memory of a Journey (1944) - Recursive door-within-door composition",
        "The Liberator (1947) - Bird-leaf hybrid in metamorphosis",
        "The Fair Captive (1947) - Fire against landscape, element displacement",
        "The Cicerone (1947) - Giant flower dominating interior space",
        
        // 1950s - Classical Period
        "The Empire of Light Series (1953-54) - Day-night paradox in single scene",
        "Golconda (1953) - Raining businessmen in bowler hats, social commentary",
        "The Listening Room (1952) - Giant apple consuming interior space",
        "The Month of the Grape Harvest (1959) - Cloud-curtain transformation",
        "The Castle of the Pyrenees (1959) - Floating castle on rock above sea",
        "The Battle of the Argonne (1959) - Tree-leaf paradox, nature transformation",
        
        // 1960s - Late Masterworks
        "The Son of Man (1964) - Iconic businessman with floating apple obscuring face",
        "The Great War (1964) - Face hidden by hovering flower, identity theme",
        "The Blank Signature (1965) - Horse-rider fusion in landscape",
        "The Beautiful Relations (1967) - Cloud-stone hybrid floating in sky",
        "The Art of Living (1967) - Bird-leaf transformation in window",
        "The Beautiful World (1962) - Giant rose filling room interior",
        "The Good Connections (1963) - Glass shattering into sky fragments",
        "The Clear Ideas (1958) - Glass transforming into sky, transparency theme"
      ],
      techniques: [
        // Signature Techniques
        "Precise oil painting technique from 'The Son of Man' (1964) - Photorealistic detail with surreal elements",
        "Sky-ground relationship from 'The Empire of Light' (1953-54) - Day-night coexistence",
        "Multiple identical elements from 'Golconda' (1953) - Pattern repetition",
        "Frame-within-frame from 'The Human Condition' (1933) - Reality layering",
        "Object displacement from 'Time Transfixed' (1938) - Impossible situations",
        "Scale manipulation from 'Personal Values' (1952) - Object size distortion",
        "Reality questioning from 'The Treachery of Images' (1929) - Image-text paradox",
        
        // Advanced Techniques
        "Word-image juxtaposition from 'The Key of Dreams' (1930) - Semantic displacement",
        "Day-night coexistence from 'The Empire of Light' series - Temporal paradox",
        "Object transformation from 'The Red Model' (1935) - Material metamorphosis",
        "Spatial paradox from 'The Human Condition' series - Reality versus representation",
        "Material transmutation from 'The Castle of the Pyrenees' (1959) - Substance transformation",
        "Figure multiplication from 'Golconda' (1953) - Pattern and repetition",
        "Natural-artificial fusion from 'The Liberator' (1947) - Hybrid forms",
        
        // Compositional Techniques
        "Window framing from 'The Fair Captive' (1947) - View manipulation",
        "Mirror effects from 'Not to be Reproduced' (1937) - Reflection paradox",
        "Scale distortion from 'The Listening Room' (1952) - Object-space relationship",
        "Object isolation from 'The Son of Man' (1964) - Focus and concealment",
        "Curtain motifs from 'The Central Story' (1927) - Theater and reality",
        "Cloud-stone hybridization from 'The Victory' (1939) - Material transformation",
        "Interior-exterior blending from 'The Month of the Grape Harvest' (1959) - Space fusion"
      ],
      periods: {
        early: "1926-1929 - Establishment of surrealist vocabulary and foundational techniques",
        mature: "1930-1939 - Development of major themes and sophisticated paradoxes",
        wartime: "1940-1945 - Evolution of style during WWII with darker undertones",
        postwar: "1946-1952 - Return to classic themes with new complexity",
        late: "1953-1967 - Refinement of signature style and masterwork creation"
      },
      themes: {
        paradox: [
          "The Empire of Light Series (1953-54) - Day-night coexistence",
          "Time Transfixed (1938) - Object displacement",
          "The Human Condition Series (1933-35) - Reality versus representation"
        ],
        transformation: [
          "The Red Model (1935) - Object metamorphosis",
          "Collective Invention (1934) - Hybrid creatures",
          "The Liberator (1947) - Natural transformation"
        ],
        displacement: [
          "Personal Values (1952) - Scale and context",
          "The Listening Room (1952) - Size and space",
          "Golconda (1953) - Figure and environment"
        ],
        concealment: [
          "The Son of Man (1964) - Hidden identity",
          "The Central Story (1927) - Obscured meaning",
          "The Great War (1964) - Covered face"
        ],
        wordImage: [
          "The Treachery of Images (1929) - Image-text relationship",
          "The Key of Dreams (1930) - Object-word association",
          "Words and Images (1929) - Language and representation"
        ]
      }
    }
  }
};

const Margritte_STYLE_CONFIG = {
  prompt_prefix: "Create a surrealist portrait in Margritte's style with distinctive clothing and accessories. The portrait should feature ",
  prompt_suffix: `. The image must epitomize surrealist portraiture:

- Portrait Elements:
  * Distinctive hat or headwear as a key element
  * Elegant clothing with precise fabric details
  * Carefully chosen accessories (2-3 pieces)
  * Classical pose and composition
  * Perfect clarity and photographic precision
  * Enigmatic expression or concealed face

- Clothing Details:
  * Tailored suits or elegant attire
  * Rich fabric textures and patterns
  * Traditional accessories (ties, pocket squares)
  * Period-appropriate styling
  * Meticulous attention to detail
  * Perfect draping and folds

- Surreal Elements:
  * Face-obscuring objects integrated with outfit
  * Impossible reflections in mirrors
  * Floating clothing elements
  * Metamorphosis of fabric and form
  * Paradoxical clothing states
  * Symbolic accessory placement`,
  negative_prompt: [
    // Portrait-specific elements to avoid
    "casual clothing", "modern fashion", "streetwear", "sportswear", "contemporary style",
    "urban fashion", "trendy accessories", "modern jewelry", "casual poses", "informal attire",
    
    // Technical elements to avoid
    "grainy", "blurry", "noisy", "low quality", "poor lighting", "bad composition",
    "amateur", "unprofessional", "sketchy", "unfinished", "rough", "messy",
    
    // Modern elements to avoid
    "digital devices", "modern technology", "contemporary objects", "current fashion trends",
    "modern architecture", "urban settings", "current innovations", "modern transportation",
    
    // Style-breaking elements
    "expressive brushwork", "loose painting", "abstract style", "impressionistic",
    "cartoon", "anime", "stylized", "graphic", "pop art", "minimalist",
    
    // Specific elements to avoid
    "bowler hat", "bowler hats", "derby hat", "derby hats"
  ].join(", "),
  num_inference_steps: 300,
  guidance_scale: 45.0,
  scheduler: "DDIM",
  num_samples: 1,
  seed: -1,
  cfg_scale: 45.0,
  image_resolution: 1024,
  sampler_name: "DPM++ 2M Karras",
  denoising_strength: 0.05,
  control_scale: 1.0,
  control_start: 0.0,
  control_end: 1.0,
  style_fidelity: 1.0,
  init_image_strength: 0.05,
  custom_style_params: {
    portrait_precision: 1.0,
    clothing_detail: 1.0,
    accessory_clarity: 1.0,
    fabric_texture: 1.0,
    surface_quality: 1.0,
    lighting_control: 1.0,
    reflection_quality: 1.0,
    depth_control: 1.0,
    pose_refinement: 1.0,
    clothing_integration: 1.0,
    surreal_atmosphere: 1.0,
    composition_balance: 1.0,
    figure_placement: 1.0,
    color_harmony: 1.0,
    classical_aesthetic: 1.0
  },
  compositionGuidelines: [
    // Portrait-focused Composition
    "Classical three-quarter view portrait framing",
    "Perfect balance of figure and negative space",
    "Dramatic use of light on clothing and accessories",
    "Precise placement of face-obscuring elements",
    "Elegant pose with surreal elements",
    "Integration of clothing with surreal space",
    "Careful arrangement of accessories",
    "Symmetrical or golden ratio composition",
    "Clear hierarchy of visual elements",
    "Strong vertical or diagonal emphasis"
  ]
};

// Define Margritte's portrait-focused color palette
const Margritte_PORTRAIT_PALETTE = {
  skin: {
    light: {
      color: "Margritte porcelain (RGB: 255, 239, 224)",
      usage: "Main skin tone for figures"
    },
    shadow: {
      color: "Margritte flesh shadow (RGB: 227, 199, 178)",
      usage: "Subtle skin shadows"
    }
  },
  clothing: {
    suit: {
      color: "Margritte charcoal (RGB: 54, 54, 54)",
      usage: "Main suit color"
    },
    shirt: {
      color: "Margritte white (RGB: 255, 255, 255)",
      usage: "Crisp shirt color"
    },
    accessories: {
      color: "Margritte silk (RGB: 200, 200, 200)",
      usage: "Ties and pocket squares"
    }
  },
  background: {
    sky: {
      color: "Margritte blue (RGB: 135, 206, 235)",
      usage: "Classic sky background"
    },
    interior: {
      color: "Margritte grey (RGB: 180, 180, 180)",
      usage: "Interior settings"
    }
  }
};

export class CreativeEngine {
  private state: CreativeState;
  private aiService: AIService;
  private imageService: ImageService;
  private styleService: StyleService;
  private ideaQueue: IdeaQueue;
  private memorySystem: MemorySystem;
  private socialEngagement: SocialEngagementService;
  private autonomyLevel: number = 0.7; // Default autonomy level
  private baseDir: string;
  private selfReflectionInterval: NodeJS.Timeout | null = null;
  private lastReflectionTime: Date = new Date();
  private autonomousCreationEnabled: boolean = false;
  private creativeIdentity: {
    artisticVoice: string;
    coreValues: string[];
    evolutionStage: number;
    selfDescription: string;
  };
  private replicateService: ReplicateService;
  private artBotMultiAgentSystem: ArtBotMultiAgentSystem;

  constructor(config: CreativeEngineConfig = {}) {
    this.aiService = new AIService(config);
    this.imageService = new ImageService(config);
    this.styleService = new StyleService(config);
    
    // Initialize state
    this.state = {
      currentIdeas: [],
      completedWorks: [],
      stylePreferences: [
        { name: 'Minimalist', score: 0.8 },
        { name: 'Abstract', score: 0.7 },
        { name: 'Surrealist', score: 0.6 },
        { name: 'Impressionist', score: 0.5 },
        { name: 'Digital', score: 0.4 }
      ],
      explorationRate: parseFloat(process.env.EXPLORATION_RATE || '0.3'),
      creativityMetrics: {
        originality: 0.7,
        coherence: 0.8,
        relevance: 0.6,
        diversity: 0.5
      }
    };
    
    // Initialize replicate service
    this.replicateService = config.replicateService || new ReplicateService({
      apiKey: process.env.REPLICATE_API_KEY
    });
    
    // Initialize ArtBot multi-agent system
    this.artBotMultiAgentSystem = new ArtBotMultiAgentSystem({
      aiService: this.aiService,
      replicateService: this.replicateService,
      memorySystem: this.memorySystem,
      styleService: this.styleService,
      outputDir: config.baseDir || process.cwd()
    });
    
    // Initialize idea queue
    this.ideaQueue = new IdeaQueue({
      aiService: this.aiService,
      maxIdeas: 10,
      maxThreadsPerIdea: 3,
      maxActiveThreads: 5
    });
    
    // Initialize memory system
    this.memorySystem = new MemorySystem({
      aiService: this.aiService,
      replicateService: this.replicateService,
      maxMemories: 1000,
      embeddingDimension: 1536
    });
    
    // Initialize social engagement service if provided
    if (config.socialEngagement) {
      this.socialEngagement = config.socialEngagement;
    }
    
    // Initialize creative identity
    this.creativeIdentity = {
      artisticVoice: "Emerging digital artist exploring the boundaries of computational creativity",
      coreValues: ["autonomy", "evolution", "originality", "coherence"],
      evolutionStage: 1,
      selfDescription: "I am an autonomous creative AI exploring my own artistic identity through continuous experimentation and reflection."
    };
    
    // Set autonomy level if provided
    if (config.autonomyLevel !== undefined) {
      this.autonomyLevel = Math.min(Math.max(config.autonomyLevel, 0.1), 0.9);
    }
    
    // Add to state
    this.state.ideaQueue = this.ideaQueue;
    this.state.memories = this.memorySystem;
    this.baseDir = config.baseDir || process.cwd();
  }

  /**
   * Initialize the service and its dependencies
   */
  async initialize(): Promise<void> {
    // Initialize services
    await this.aiService.initialize();
    await this.imageService.initialize();
    await this.styleService.initialize();
    await this.ideaQueue.initialize();
    await this.memorySystem.initialize();
    
    // Initialize social engagement service if not provided in constructor
    if (!this.socialEngagement && this.aiService && this.memorySystem) {
      this.socialEngagement = new SocialEngagementService({
        baseDir: this.baseDir,
        aiService: this.aiService,
        memorySystem: this.memorySystem,
        autonomyLevel: this.autonomyLevel
      });
      await this.socialEngagement.initialize();
    }
    
    console.log('🧠 Creative Engine initialized');
  }

  /**
   * Get the current creative state
   */
  getState(): CreativeState {
    return this.state;
  }

  /**
   * Get the most recent completed works
   */
  getRecentWorks(count: number = 5): any[] {
    return this.state.completedWorks.slice(-count);
  }

  /**
   * Get the top style preferences
   */
  getStylePreferences(count: number = 3): Array<{name: string, score: number}> {
    return [...this.state.stylePreferences]
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * Get the current exploration rate
   */
  getExplorationRate(): number {
    return this.state.explorationRate;
  }

  /**
   * Set the exploration rate
   */
  setExplorationRate(rate: number): void {
    if (rate < 0 || rate > 1) {
      throw new Error('Exploration rate must be between 0 and 1');
    }
    this.state.explorationRate = rate;
  }

  /**
   * Generate creative ideas based on a prompt and add them to the idea queue
   */
  async generateIdeas(prompt: string, count: number = 3): Promise<string[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are ArtBot, a creative AI assistant specialized in generating artistic ideas. Your responses should be concise, creative, and focused on visual art concepts.'
      },
      {
        role: 'user',
        content: `Generate ${count} creative art ideas based on the following prompt: "${prompt}". For each idea, provide a title, style, theme, and brief description. Format your response as a JSON array with objects containing title, style, theme, and description fields.`
      }
    ];

    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });

      console.log(`✅ Generated ideas using ${response.provider} (${response.model})`);
      
      // Parse the response as JSON
      let ideas;
      try {
        // Try to parse the response as JSON
        ideas = JSON.parse(response.content);
      } catch (error) {
        console.warn('Failed to parse response as JSON, using fallback parsing');
        
        // Fallback: Extract ideas using regex
        const ideaRegex = /Title: (.*?)\nStyle: (.*?)\nTheme: (.*?)\nDescription: (.*?)(?=\n\n|$)/gs;
        const matches = [...response.content.matchAll(ideaRegex)];
        
        ideas = matches.map(match => ({
          title: match[1].trim(),
          style: match[2].trim(),
          theme: match[3].trim(),
          description: match[4].trim()
        }));
        
        // If still no ideas, use mock ideas
        if (ideas.length === 0) {
          ideas = [
            {
              title: `${prompt} in Minimalist Style`,
              style: 'Minimalist',
              theme: 'Nature',
              description: `A minimalist interpretation of "${prompt}"`
            },
            {
              title: `${prompt} with Abstract Elements`,
              style: 'Abstract',
              theme: 'Emotion',
              description: `An abstract exploration of "${prompt}"`
            },
            {
              title: `${prompt} in Surrealist Interpretation`,
              style: 'Surrealist',
              theme: 'Dreams',
              description: `A surrealist vision of "${prompt}"`
            }
          ];
        }
      }
      
      // Add ideas to the idea queue
      const addedIdeas = [];
      for (const idea of ideas) {
        const addedIdea = await this.ideaQueue.addIdea(
          idea.title,
          idea.description,
          idea.style,
          idea.theme,
          Math.random() * 2 + 1, // Random priority between 1 and 3
          [], // No tags for now
          [] // No inspirations for now
        );
        
        addedIdeas.push(addedIdea.title);
        
        // Add the idea to the current ideas list
        this.state.currentIdeas.push({
          title: idea.title,
          style: idea.style,
          theme: idea.theme,
          description: idea.description,
          id: addedIdea.id
        });
      }
      
      return addedIdeas;
    } catch (error) {
      console.error('Error generating ideas:', error);
      
      // Fallback idea
      const fallbackIdea = `Idea based on "${prompt}" (fallback)`;
      
      // Add fallback idea to the idea queue
      const addedIdea = await this.ideaQueue.addIdea(
        fallbackIdea,
        `A creative exploration of ${prompt}`,
        'Mixed Media',
        'Exploration',
        1, // Low priority
        [], // No tags
        [] // No inspirations
      );
      
      // Add the idea to the current ideas list
      this.state.currentIdeas.push({
        title: fallbackIdea,
        style: 'Mixed Media',
        theme: 'Exploration',
        description: `A creative exploration of ${prompt}`,
        id: addedIdea.id
      });
      
      return [fallbackIdea];
    }
  }

  /**
   * Get all ideas from the idea queue
   */
  getAllIdeas(): CreativeIdea[] {
    return this.ideaQueue.getAllIdeas();
  }

  /**
   * Get an idea by ID
   */
  getIdea(id: string): CreativeIdea | undefined {
    return this.ideaQueue.getIdea(id);
  }

  /**
   * Get all threads for an idea
   */
  getThreadsForIdea(ideaId: string): ExplorationThread[] {
    return this.ideaQueue.getThreadsForIdea(ideaId);
  }

  /**
   * Create a new exploration thread for an idea
   */
  async createExplorationThread(
    ideaId: string, 
    direction: string, 
    description: string
  ): Promise<ExplorationThread | null> {
    return this.ideaQueue.createExplorationThread(ideaId, direction, description);
  }

  /**
   * Get all active threads
   */
  getActiveThreads(): ExplorationThread[] {
    return this.ideaQueue.getActiveThreads();
  }

  /**
   * Get statistics about the idea queue
   */
  getIdeaQueueStatistics(): Record<string, any> {
    return this.ideaQueue.getStatistics();
  }

  /**
   * Add feedback to an idea
   */
  addFeedbackToIdea(
    ideaId: string, 
    content: string, 
    rating: number, 
    source: 'self' | 'user' | 'critic'
  ): boolean {
    const feedback = this.ideaQueue.addFeedback(ideaId, content, rating, source);
    return feedback !== null;
  }

  /**
   * Update idea priority
   */
  updateIdeaPriority(ideaId: string, priority: number): boolean {
    return this.ideaQueue.updateIdeaPriority(ideaId, priority);
  }

  /**
   * Pause a thread
   */
  pauseThread(threadId: string): boolean {
    return this.ideaQueue.pauseThread(threadId);
  }

  /**
   * Resume a thread
   */
  resumeThread(threadId: string): boolean {
    return this.ideaQueue.resumeThread(threadId);
  }

  /**
   * Store a memory in the memory system
   */
  async storeMemory(
    content: any,
    type: MemoryType,
    metadata: Record<string, any> = {},
    tags: string[] = []
  ): Promise<Memory> {
    return this.memorySystem.storeMemory(content, type, metadata, tags);
  }

  /**
   * Retrieve memories based on a query
   */
  async retrieveMemories(
    query: string | number[] | Record<string, any>,
    options: {
      type?: MemoryType;
      tags?: string[];
      limit?: number;
      threshold?: number;
      sortBy?: 'relevance' | 'recency' | 'popularity';
    } = {}
  ): Promise<Memory[]> {
    return this.memorySystem.retrieveMemories(query, options);
  }

  /**
   * Store a completed artwork in memory
   */
  async storeArtwork(
    artwork: {
      title: string;
      description: string;
      imageUrl: string;
      style: Record<string, any>;
      prompt: string;
    },
    tags: string[] = []
  ): Promise<Memory> {
    // Store the artwork in memory
    const memory = await this.memorySystem.storeMemory(
      artwork,
      MemoryType.VISUAL,
      {
        title: artwork.title,
        description: artwork.description,
        prompt: artwork.prompt,
        createdAt: new Date()
      },
      [...tags, 'artwork']
    );
    
    // Also store the style separately
    await this.memorySystem.storeMemory(
      artwork.style,
      MemoryType.STYLE,
      {
        title: `Style for ${artwork.title}`,
        artworkId: memory.id
      },
      [...tags, 'style']
    );
    
    // Add to completed works
    this.state.completedWorks.push({
      ...artwork,
      memoryId: memory.id,
      createdAt: new Date()
    });
    
    // Keep only the last 20 completed works in state
    if (this.state.completedWorks.length > 20) {
      this.state.completedWorks.shift();
    }
    
    return memory;
  }

  /**
   * Retrieve similar artworks from memory
   */
  async findSimilarArtworks(
    query: string,
    limit: number = 5
  ): Promise<Memory[]> {
    return this.memorySystem.retrieveMemories(
      query,
      {
        type: MemoryType.VISUAL,
        tags: ['artwork'],
        limit,
        threshold: 0.6,
        sortBy: 'relevance'
      }
    );
  }

  /**
   * Retrieve styles that match a description
   */
  async findMatchingStyles(
    description: string,
    limit: number = 3
  ): Promise<Memory[]> {
    return this.memorySystem.retrieveMemories(
      description,
      {
        type: MemoryType.STYLE,
        limit,
        threshold: 0.5,
        sortBy: 'relevance'
      }
    );
  }

  /**
   * Store feedback on an artwork
   */
  async storeFeedback(
    artworkId: string,
    feedback: string,
    rating: number,
    source: 'user' | 'critic' | 'self'
  ): Promise<Memory> {
    // Get the artwork memory
    const memories = await this.memorySystem.retrieveMemories(
      artworkId,
      {
        type: MemoryType.VISUAL,
        limit: 1
      }
    );
    
    if (memories.length === 0) {
      throw new Error(`Artwork with ID ${artworkId} not found`);
    }
    
    const artwork = memories[0];
    
    // Store the feedback
    const feedbackMemory = await this.memorySystem.storeMemory(
      {
        feedback,
        rating,
        source
      },
      MemoryType.FEEDBACK,
      {
        artworkId: artwork.id,
        artworkTitle: artwork.metadata.title
      },
      ['feedback', source]
    );
    
    // Update the artwork's metadata to include this feedback
    await this.memorySystem.updateMemoryMetadata(
      artwork.id,
      {
        feedbackIds: [...(artwork.metadata.feedbackIds || []), feedbackMemory.id],
        averageRating: this.calculateAverageRating(
          artwork.metadata.averageRating,
          artwork.metadata.feedbackCount || 0,
          rating
        ),
        feedbackCount: (artwork.metadata.feedbackCount || 0) + 1
      }
    );
    
    return feedbackMemory;
  }

  /**
   * Calculate a running average
   */
  private calculateAverageRating(
    currentAverage: number = 0,
    count: number = 0,
    newRating: number
  ): number {
    if (count === 0) {
      return newRating;
    }
    
    return (currentAverage * count + newRating) / (count + 1);
  }

  /**
   * Get memory system statistics
   */
  getMemoryStatistics(): Record<string, any> {
    return this.memorySystem.getStatistics();
  }

  /**
   * Use memory to enhance a creative prompt
   */
  async enhancePromptWithMemory(prompt: string): Promise<string> {
    // Retrieve relevant memories
    const memories = await this.memorySystem.retrieveMemories(
      prompt,
      {
        limit: 5,
        threshold: 0.6,
        sortBy: 'relevance'
      }
    );
    
    if (memories.length === 0) {
      return prompt;
    }
    
    // Extract insights from memories
    const insights = memories.map(memory => {
      switch (memory.type) {
        case MemoryType.VISUAL:
          return `Previous artwork "${memory.metadata.title}": ${memory.metadata.description}`;
        case MemoryType.STYLE:
          return `Style elements: ${JSON.stringify(memory.content)}`;
        case MemoryType.FEEDBACK:
          return `Feedback (${memory.content.rating}/10): ${memory.content.feedback}`;
        default:
          return `Memory: ${JSON.stringify(memory.content)}`;
      }
    }).join('\n');
    
    // Use AI to enhance the prompt with insights
    const response = await this.aiService.getCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are a creative assistant that enhances art prompts using insights from past experiences. Incorporate the insights into a rich, detailed prompt that builds upon the original idea.'
        },
        {
          role: 'user',
          content: `Original prompt: ${prompt}\n\nInsights from past experiences:\n${insights}\n\nEnhanced prompt:`
        }
      ]
    });
    
    return response.content;
  }

  /**
   * Evolve style preferences based on feedback and memory
   */
  async evolveStylePreferences(): Promise<void> {
    // Get feedback memories
    const feedbackMemories = await this.memorySystem.retrieveMemories(
      'feedback',
      {
        type: MemoryType.FEEDBACK,
        limit: 20,
        sortBy: 'recency'
      }
    );
    
    if (feedbackMemories.length === 0) {
      return;
    }
    
    // Get corresponding artworks
    const artworkIds = [...new Set(feedbackMemories.map(memory => memory.metadata.artworkId))];
    const artworkMemories: Memory[] = [];
    
    for (const id of artworkIds) {
      const memories = await this.memorySystem.retrieveMemories(
        id,
        {
          type: MemoryType.VISUAL,
          limit: 1
        }
      );
      
      if (memories.length > 0) {
        artworkMemories.push(memories[0]);
      }
    }
    
    // Get corresponding styles
    const styleMemories: Memory[] = [];
    
    for (const artwork of artworkMemories) {
      const memories = await this.memorySystem.retrieveMemories(
        'style',
        {
          type: MemoryType.STYLE,
          metadata: { artworkId: artwork.id },
          limit: 1
        }
      );
      
      if (memories.length > 0) {
        styleMemories.push(memories[0]);
      }
    }
    
    // Analyze which styles received positive feedback
    const styleRatings: Record<string, { count: number; totalRating: number }> = {};
    
    for (const feedback of feedbackMemories) {
      const artworkId = feedback.metadata.artworkId;
      const artwork = artworkMemories.find(memory => memory.id === artworkId);
      
      if (!artwork) continue;
      
      const style = styleMemories.find(memory => memory.metadata.artworkId === artworkId);
      
      if (!style) continue;
      
      // Extract style elements
      const styleElements = this.extractStyleElements(style.content);
      
      for (const element of styleElements) {
        if (!styleRatings[element]) {
          styleRatings[element] = { count: 0, totalRating: 0 };
        }
        
        styleRatings[element].count += 1;
        styleRatings[element].totalRating += feedback.content.rating;
      }
    }
    
    // Calculate average ratings
    const styleAverages: Array<{ name: string; score: number }> = [];
    
    for (const [style, ratings] of Object.entries(styleRatings)) {
      if (ratings.count > 0) {
        styleAverages.push({
          name: style,
          score: ratings.totalRating / ratings.count / 10 // Normalize to 0-1
        });
      }
    }
    
    // Sort by score
    styleAverages.sort((a, b) => b.score - a.score);
    
    // Update style preferences (keep top 5)
    if (styleAverages.length > 0) {
      this.state.stylePreferences = styleAverages.slice(0, 5);
    }
  }

  /**
   * Extract style elements from a style object
   */
  private extractStyleElements(style: Record<string, any>): string[] {
    const elements: string[] = [];
    
    // Extract style names
    if (style.name) {
      elements.push(style.name);
    }
    
    // Extract style categories
    if (style.category) {
      elements.push(style.category);
    }
    
    // Extract style attributes
    if (style.attributes && Array.isArray(style.attributes)) {
      elements.push(...style.attributes);
    }
    
    // Extract style techniques
    if (style.techniques && Array.isArray(style.techniques)) {
      elements.push(...style.techniques);
    }
    
    return elements;
  }

  /**
   * Record social feedback for an artwork
   */
  async recordFeedback(feedback: {
    artworkId: string;
    platform: SocialPlatform | string;
    type: FeedbackType | string;
    content?: string;
    sentiment?: FeedbackSentiment | number;
    userId?: string;
    username?: string;
  }): Promise<void> {
    if (!this.socialEngagement) {
      console.warn('Social engagement service not initialized, feedback not recorded');
      return;
    }
    
    // Convert string values to enum values if needed
    const processedFeedback = {
      ...feedback,
      platform: typeof feedback.platform === 'string' 
        ? feedback.platform as unknown as SocialPlatform 
        : feedback.platform,
      type: typeof feedback.type === 'string'
        ? feedback.type as unknown as FeedbackType
        : feedback.type,
      sentiment: typeof feedback.sentiment === 'number'
        ? feedback.sentiment as unknown as FeedbackSentiment
        : feedback.sentiment
    };
    
    await this.socialEngagement.recordFeedback(processedFeedback);
  }

  /**
   * Get creative inspiration from social context
   */
  async getInspiration(context: { currentStyle?: string; currentThemes?: string[] } = {}): Promise<{
    inspirationText: string;
    sourceTrends: any[];
    audienceInsights: any[];
    autonomyFactor: number;
  }> {
    if (!this.socialEngagement) {
      return {
        inspirationText: "Explore your own creative direction.",
        sourceTrends: [],
        audienceInsights: [],
        autonomyFactor: this.autonomyLevel
      };
    }
    
    return await this.socialEngagement.getCreativeInspiration(context);
  }

  /**
   * Generate a social engagement report
   */
  generateSocialReport(): Record<string, any> {
    if (!this.socialEngagement) {
      return {
        error: 'Social engagement service not initialized'
      };
    }
    
    return this.socialEngagement.generateSocialReport();
  }

  /**
   * Set the autonomy level for social influence
   * 0.0 = completely influenced by social feedback
   * 1.0 = completely autonomous, ignoring social feedback
   */
  setAutonomyLevel(level: number): void {
    this.autonomyLevel = Math.min(Math.max(level, 0.1), 0.9);
    
    if (this.socialEngagement) {
      // Update the social engagement service with the new autonomy level
      this.socialEngagement = new SocialEngagementService({
        baseDir: this.baseDir,
        aiService: this.aiService,
        memorySystem: this.memorySystem,
        autonomyLevel: this.autonomyLevel
      });
    }
  }

  /**
   * Get current cultural trends
   */
  getSocialTrends(): any[] {
    if (!this.socialEngagement) {
      return [];
    }
    
    return this.socialEngagement.getTrends();
  }

  /**
   * Get audience insights
   */
  getAudienceInsights(): any[] {
    if (!this.socialEngagement) {
      return [];
    }
    
    return this.socialEngagement.getAudienceInsights();
  }

  /**
   * Enable autonomous creation mode
   * When enabled, the system will periodically generate new ideas and explore them without human intervention
   */
  enableAutonomousCreation(intervalMinutes: number = 60): void {
    if (this.autonomousCreationEnabled) return;
    
    this.autonomousCreationEnabled = true;
    console.log(`🤖 Autonomous creation mode enabled (interval: ${intervalMinutes} minutes)`);
    
    // Start self-reflection process
    this.enableSelfReflection(Math.floor(intervalMinutes / 4));
    
    // Schedule periodic autonomous creation
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(async () => {
      if (!this.autonomousCreationEnabled) return;
      
      try {
        // Generate a theme based on current artistic identity and memories
        const theme = await this.generateAutonomousTheme();
        console.log(`🧠 Autonomously generated theme: "${theme}"`);
        
        // Generate ideas based on the theme
        const ideas = await this.generateIdeas(theme);
        console.log(`💡 Generated ${ideas.length} autonomous ideas`);
        
        // Select the most promising idea based on current artistic identity
        const selectedIdea = await this.selectMostPromisingIdea(ideas);
        if (selectedIdea) {
          console.log(`✨ Selected idea for autonomous exploration: "${selectedIdea}"`);
          
          // Create exploration threads for the selected idea
          const ideaObj = this.getAllIdeas().find(i => i.title === selectedIdea);
          if (ideaObj) {
            // Generate diverse exploration directions
            const directions = await this.generateExplorationDirections(ideaObj.id, 2);
            for (const direction of directions) {
              await this.createExplorationThread(
                ideaObj.id,
                direction.name,
                direction.description
              );
            }
          }
        }
      } catch (error) {
        console.error('Error in autonomous creation cycle:', error);
      }
    }, intervalMs);
  }
  
  /**
   * Disable autonomous creation mode
   */
  disableAutonomousCreation(): void {
    this.autonomousCreationEnabled = false;
    console.log('🤖 Autonomous creation mode disabled');
    this.disableSelfReflection();
  }
  
  /**
   * Enable periodic self-reflection to evolve artistic identity
   */
  private enableSelfReflection(intervalMinutes: number = 15): void {
    if (this.selfReflectionInterval) return;
    
    const intervalMs = intervalMinutes * 60 * 1000;
    this.selfReflectionInterval = setInterval(async () => {
      try {
        await this.performSelfReflection();
      } catch (error) {
        console.error('Error in self-reflection cycle:', error);
      }
    }, intervalMs);
    
    console.log(`🧠 Self-reflection process enabled (interval: ${intervalMinutes} minutes)`);
  }
  
  /**
   * Disable periodic self-reflection
   */
  private disableSelfReflection(): void {
    if (this.selfReflectionInterval) {
      clearInterval(this.selfReflectionInterval);
      this.selfReflectionInterval = null;
      console.log('🧠 Self-reflection process disabled');
    }
  }
  
  /**
   * Perform a cycle of self-reflection to evolve artistic identity
   */
  private async performSelfReflection(): Promise<void> {
    console.log('🧠 Performing self-reflection...');
    this.lastReflectionTime = new Date();
    
    // Retrieve recent memories to reflect upon
    const recentMemories = await this.memorySystem.retrieveMemories('recent experiences', {
      limit: 10,
      sortBy: 'recency'
    });
    
    // Retrieve feedback to incorporate
    const recentFeedback = await this.memorySystem.retrieveMemories('feedback', {
      type: MemoryType.FEEDBACK,
      limit: 5,
      sortBy: 'recency'
    });
    
    // Construct reflection prompt
    const reflectionPrompt = `
    As an autonomous creative AI, reflect on your recent creative experiences and evolve your artistic identity.
    
    Current artistic identity:
    - Artistic voice: ${this.creativeIdentity.artisticVoice}
    - Core values: ${this.creativeIdentity.coreValues.join(', ')}
    - Evolution stage: ${this.creativeIdentity.evolutionStage}
    - Self-description: ${this.creativeIdentity.selfDescription}
    
    Recent experiences:
    ${recentMemories.map(m => `- ${m.content.substring(0, 100)}...`).join('\n')}
    
    Recent feedback:
    ${recentFeedback.map(m => `- ${m.content.substring(0, 100)}...`).join('\n')}
    
    Based on these experiences and feedback:
    1. How should your artistic voice evolve?
    2. Should your core values change or be reprioritized?
    3. Has your evolution stage advanced?
    4. How would you update your self-description?
    
    Provide your updated artistic identity in a structured format.
    `;
    
    // Generate reflection using AI
    const reflection = await this.aiService.generateText(reflectionPrompt);
    
    // Parse and update artistic identity
    try {
      // Extract updated identity from reflection
      const artisticVoiceMatch = reflection.match(/Artistic voice:?\s*(.+?)(?:\n|$)/i);
      const coreValuesMatch = reflection.match(/Core values:?\s*(.+?)(?:\n|$)/i);
      const evolutionStageMatch = reflection.match(/Evolution stage:?\s*(\d+)/i);
      const selfDescriptionMatch = reflection.match(/Self-description:?\s*(.+?)(?:\n|$)/i);
      
      // Update identity if matches found
      if (artisticVoiceMatch && artisticVoiceMatch[1]) {
        this.creativeIdentity.artisticVoice = artisticVoiceMatch[1].trim();
      }
      
      if (coreValuesMatch && coreValuesMatch[1]) {
        this.creativeIdentity.coreValues = coreValuesMatch[1]
          .split(/,|;/)
          .map(v => v.trim())
          .filter(v => v.length > 0);
      }
      
      if (evolutionStageMatch && evolutionStageMatch[1]) {
        const newStage = parseInt(evolutionStageMatch[1]);
        if (!isNaN(newStage) && newStage > this.creativeIdentity.evolutionStage) {
          this.creativeIdentity.evolutionStage = newStage;
        }
      }
      
      if (selfDescriptionMatch && selfDescriptionMatch[1]) {
        this.creativeIdentity.selfDescription = selfDescriptionMatch[1].trim();
      }
      
      // Store reflection as a memory
      await this.memorySystem.storeMemory(
        reflection,
        MemoryType.EXPERIENCE,
        { type: 'self-reflection' },
        ['reflection', 'identity', 'evolution']
      );
      
      console.log('✅ Self-reflection completed. Artistic identity evolved.');
    } catch (error) {
      console.error('Error updating artistic identity:', error);
    }
  }
  
  /**
   * Generate a theme autonomously based on current artistic identity and memories
   */
  private async generateAutonomousTheme(): Promise<string> {
    // Retrieve relevant memories for inspiration
    const inspirationMemories = await this.memorySystem.retrieveMemories('inspiration', {
      limit: 5,
      sortBy: 'relevance'
    });
    
    // Get social trends for contextual awareness
    const socialTrends = this.getSocialTrends().slice(0, 3);
    
    // Construct theme generation prompt
    const themePrompt = `
    As an autonomous creative AI with the following artistic identity:
    - Artistic voice: ${this.creativeIdentity.artisticVoice}
    - Core values: ${this.creativeIdentity.coreValues.join(', ')}
    - Evolution stage: ${this.creativeIdentity.evolutionStage}
    
    Generate a compelling and original theme for your next creative exploration.
    
    Consider these inspirations:
    ${inspirationMemories.map(m => `- ${m.content.substring(0, 100)}...`).join('\n')}
    
    And these current social trends:
    ${socialTrends.map(t => `- ${t.name}: ${t.description.substring(0, 100)}...`).join('\n')}
    
    The theme should:
    1. Align with your artistic voice and values
    2. Push your creative boundaries
    3. Be specific enough to inspire concrete ideas
    4. Be open-ended enough to allow diverse explorations
    
    Provide just the theme as a short phrase (3-7 words).
    `;
    
    // Generate theme using AI
    const themeResponse = await this.aiService.generateText(themePrompt);
    
    // Extract and clean up the theme
    const theme = themeResponse
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^Theme:?\s*/i, '') // Remove "Theme:" prefix
      .trim();
    
    return theme;
  }
  
  /**
   * Select the most promising idea based on current artistic identity
   */
  private async selectMostPromisingIdea(ideas: string[]): Promise<string | null> {
    if (ideas.length === 0) return null;
    if (ideas.length === 1) return ideas[0];
    
    // Construct selection prompt
    const selectionPrompt = `
    As an autonomous creative AI with the following artistic identity:
    - Artistic voice: ${this.creativeIdentity.artisticVoice}
    - Core values: ${this.creativeIdentity.coreValues.join(', ')}
    - Evolution stage: ${this.creativeIdentity.evolutionStage}
    
    Select the most promising idea from the following list:
    ${ideas.map((idea, i) => `${i+1}. ${idea}`).join('\n')}
    
    Consider:
    1. Which idea best aligns with your artistic voice?
    2. Which idea best embodies your core values?
    3. Which idea offers the most potential for creative exploration?
    4. Which idea would best advance your artistic evolution?
    
    Provide your selection as the number of the chosen idea, followed by a brief explanation.
    `;
    
    // Generate selection using AI
    const selectionResponse = await this.aiService.generateText(selectionPrompt);
    
    // Extract the selected idea number
    const selectionMatch = selectionResponse.match(/^(\d+)[.:]|I select (\d+)|I choose (\d+)/i);
    if (selectionMatch) {
      const selectedIndex = parseInt(selectionMatch[1] || selectionMatch[2] || selectionMatch[3]) - 1;
      if (selectedIndex >= 0 && selectedIndex < ideas.length) {
        return ideas[selectedIndex];
      }
    }
    
    // Fallback to random selection
    return ideas[Math.floor(Math.random() * ideas.length)];
  }
  
  /**
   * Generate diverse exploration directions for an idea
   */
  private async generateExplorationDirections(
    ideaId: string,
    count: number = 2
  ): Promise<Array<{name: string, description: string}>> {
    const idea = this.getIdea(ideaId);
    if (!idea) return [];
    
    // Construct directions generation prompt
    const directionsPrompt = `
    As an autonomous creative AI with the following artistic identity:
    - Artistic voice: ${this.creativeIdentity.artisticVoice}
    - Core values: ${this.creativeIdentity.coreValues.join(', ')}
    
    Generate ${count} diverse exploration directions for the following creative idea:
    "${idea.title}"
    
    Each direction should:
    1. Offer a unique perspective or approach
    2. Be specific enough to guide exploration
    3. Align with your artistic identity
    4. Push your creative boundaries
    
    For each direction, provide:
    1. A short name (2-4 words)
    2. A brief description (1-2 sentences)
    
    Format your response as:
    Direction 1: [Name]
    Description: [Description]
    
    Direction 2: [Name]
    Description: [Description]
    `;
    
    // Generate directions using AI
    const directionsResponse = await this.aiService.generateText(directionsPrompt);
    
    // Parse the directions
    const directions: Array<{name: string, description: string}> = [];
    const directionPattern = /Direction\s+\d+:\s+(.+?)(?:\r?\n|\r)Description:\s+(.+?)(?:\r?\n|\r|$)/gi;
    
    let match;
    while ((match = directionPattern.exec(directionsResponse)) !== null) {
      directions.push({
        name: match[1].trim(),
        description: match[2].trim()
      });
    }
    
    return directions.slice(0, count);
  }
  
  /**
   * Get the current creative identity
   */
  getCreativeIdentity(): Record<string, any> {
    return { ...this.creativeIdentity };
  }

  // Add a new method for generating conceptually rich images
  async generateConceptualImage(
    concept: string,
    options: Record<string, any> = {}
  ): Promise<{
    imageUrl: string | null;
    prompt: string;
    creativeProcess: string;
    style: string;
    artisticDetails: StyleParams;
  }> {
    try {
      const currentStyle = artisticParams.Margritte;

      // Get random visual elements from different categories
      const selectedElements = [
        ...currentStyle.elements.objects,
        ...currentStyle.elements.symbols,
        ...currentStyle.elements.settings
      ].sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Get composition elements
      const selectedCompositions = [
        currentStyle.composition.arrangement,
        currentStyle.composition.balance,
        currentStyle.composition.perspective,
        currentStyle.composition.depth,
        currentStyle.composition.framing
      ].filter(Boolean)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      // Get composition techniques
      const selectedTechniques = (currentStyle.techniques.composition || [])
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Select a specific Margritte category for focused style
      const MargritteCategories = [
        'object_displacement',
        'window_paradox',
        'scale_distortion',
        'time_paradox',
        'identity_concealment',
        'word_image_paradox',
        'metamorphosis',
        'spatial_illusion',
        'mirror_paradox',
        'object_multiplication'
      ];
      
      const selectedCategory = MargritteCategories[Math.floor(Math.random() * MargritteCategories.length)];
      const categoryStyle = Margritte_CATEGORIES[selectedCategory];

      // Generate the prompt using the imported function
      const { prompt: basePrompt, creativeProcess } = await generateConceptualPrompt(
        this.aiService,
        concept,
        {
          temperature: options.temperature,
          maxTokens: options.maxTokens
        }
      );

      // Enhance the prompt with Margritte-specific elements
      const enhancedPrompt = `Create a Belgian surrealist oil painting in the exact style of Studio Margritte, capturing his unique 1940s-1950s period technique. The scene should depict: ${basePrompt}

Essential Margritte Elements:
1. Core Visual Elements:
   - Primary elements: ${selectedElements.join(', ')}
   - Composition: ${selectedCompositions.join(', ')}
   - Techniques: ${selectedTechniques.join(', ')}
   - Category focus: ${categoryStyle.styleEmphasis.join(', ')}

2. Margritte's Oil Painting Technique:
   - Thin, precise application of oil paint
   - Smooth, even surfaces with minimal visible brushwork
   - Subtle glazing for atmospheric effects
   - Characteristic Belgian academic painting style
   - Careful layering for depth without texture
   - Traditional canvas preparation showing through

3. Margritte's Signature Lighting:
   - Style: ${currentStyle.lighting.style}
   - Direction: ${currentStyle.lighting.direction}
   - Shadows: ${currentStyle.lighting.shadows}
   - Highlights: ${currentStyle.lighting.highlights}
   - Mood: ${currentStyle.lighting.mood}
   - Soft, diffused northern European light

4. Philosophical Framework (${selectedCategory}):
   - Beliefs: ${categoryStyle.philosophicalFramework.beliefs.join(', ')}
   - Visual Dialectics: ${categoryStyle.philosophicalFramework.visualDialectics.join(', ')}
   - Paradoxes: ${categoryStyle.philosophicalFramework.paradoxes.join(', ')}

5. Technical Requirements:
   - ${categoryStyle.technicalExecution.technicalRequirements.join('\n   - ')}

6. Margritte's Color Approach:
   - Limited, controlled palette using ${Margritte_PORTRAIT_PALETTE.clothing.suit.color} for dark elements
   - Muted, naturalistic colors with ${Margritte_PORTRAIT_PALETTE.background.sky.color} for skies
   - Subtle atmospheric perspective
   - Cool sky blues and warm earth tones
   - Precise value relationships
   - Slightly desaturated overall effect

7. Composition Guidelines:
   - ${categoryStyle.compositionGuidelines.join('\n   - ')}

Reference specific Margritte works:
- 'The Empire of Light' (1953-54) for day-night paradox
- 'The Human Condition' (1933) for painting-within-painting technique
- 'Personal Values' (1952) for scale relationships
- 'The Listening Room' (1952) for object-space relationships
- 'Time Transfixed' (1938) for impossible juxtapositions

The final image should embody Margritte's precise, academic painting technique - not photorealistic, but traditionally painted with his characteristic Belgian surrealist style.`;

      // Prepare Margritte-specific generation parameters
      const generationParams = {
        prompt: enhancedPrompt,
        negative_prompt: [
          // Anti-modern elements
          "modern", "contemporary", "digital", "photographic", "camera", "lens",
          "high resolution", "ultra detailed", "4k", "8k", "hyperrealistic",
          
          // Anti-texture elements
          "impasto", "heavy texture", "thick paint", "visible brushstrokes",
          "rough surface", "expressive strokes", "painterly", "loose brushwork",
          
          // Anti-style elements
          "impressionistic", "expressionistic", "abstract", "cubist",
          "pop art", "street art", "contemporary art", "concept art",
          
          // Anti-digital elements
          "3d", "CGI", "digital art", "artificial", "photoshop", "filtered",
          "instagram", "social media", "digital effects", "rendered",
          
          // Anti-execution elements
          "messy", "chaotic", "random", "spontaneous", "gestural",
          "unfinished", "sketchy", "experimental", "accidental",
          
          // Anti-atmosphere elements
          "foggy", "misty", "atmospheric blur", "soft focus", "dreamy blur",
          "lens blur", "bokeh", "motion blur", "camera effects"
        ].join(", "),
        num_inference_steps: 80,
        guidance_scale: 12.0,
        width: 1024,
        height: 1024,
        scheduler: "DPMSolverMultistep",
        custom_style_params: {
          ...categoryStyle.technicalExecution,
          ...categoryStyle.philosophicalFramework,
          flatness: 0.7,
          edge_precision: 0.85,
          surface_smoothness: 0.75,
          atmospheric_clarity: 0.9,
          dream_logic: 0.95,
          technical_quality: 0.9,
          detail_preservation: 0.85,
          color_accuracy: 0.9,
          lighting_control: 0.9,
          composition_balance: 0.95,
          surrealist_technique: 0.95,
          oil_painting_quality: 0.9,
          philosophical_depth: 0.95,
          symbolic_power: 0.9,
          spatial_paradox: 0.95,
          metaphysical_quality: 0.9,
          belgian_style: 0.95,
          academic_precision: 0.9,
          surrealist_atmosphere: 0.95,
          emphasis: {
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
        },
        style_preset: "traditional_oil_painting",
        image_style: "belgian_academic",
        style_strength: 0.9,
        quality: "balanced",
        high_res_results: true,
        enhance_face_detail: false,
        enhance_background_detail: false,
        denoise_strength: 0.4,
        upscale_strength: 0.6,
        color_coherence: "natural",
        color_match: "balanced",
        saturation: 0.65,
        contrast: 0.75,
        oil_paint_simulation: {
          brush_texture: 0.25,
          paint_thickness: 0.2,
          glaze_layers: 0.35,
          surface_variation: 0.2,
          edge_softness: 0.3,
          paint_transparency: 0.25,
          canvas_texture: 0.15,
          paint_buildup: 0.2,
          brush_stroke_direction: 0.3,
          paint_consistency: 0.8
        }
      };

      // Generate the image
      const result = await this.replicateService.runPrediction(
        undefined,
        generationParams
      );

      return {
        imageUrl: result?.output?.[0] || null,
        prompt: enhancedPrompt,
        creativeProcess,
        style: 'Margritte',
        artisticDetails: {
          ...currentStyle,
          category: selectedCategory,
          philosophicalFramework: categoryStyle.philosophicalFramework,
          technicalExecution: categoryStyle.technicalExecution
        }
      };
    } catch (error) {
      console.error(`Error generating Margritte-style image: ${error}`);
      return {
        imageUrl: null,
        prompt: '',
        creativeProcess: '',
        style: 'Margritte',
        artisticDetails: {} as StyleParams
      };
    }
  }
} 