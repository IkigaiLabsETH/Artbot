import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ArtBotMultiAgentSystem } from './artbot-multiagent-system.js';
import { ReplicateService } from './services/replicate/index.js';
import { AIService } from './services/ai/index.js';
import { MemorySystem, MemoryType } from './services/memory/index.js';
import { StyleService } from './services/style/index.js';
import { generateCinematicConcept, generateMultipleConcepts, ConceptCategory } from './services/ai/conceptGenerator.js';
import * as readline from 'readline';
import { StyleManager, ArtistStyle } from './styles/styleManager.js';

// Load environment variables
dotenv.config();

// Art Direction Configuration
// This allows us to provide specific artistic direction to the multi-agent system
interface ArtDirection {
  styleEmphasis?: string[];       // Specific styles to emphasize
  visualElements?: string[];      // Required visual elements
  colorPalette?: string[];        // Specific color palette to use
  compositionGuidelines?: string[]; // Guidelines for composition
  moodAndTone?: string;           // Overall mood and tone
  references?: string[];          // Reference artists or works
  avoidElements?: string[];       // Elements to avoid
  styles?: {                      // Style variants
    [key: string]: ArtDirection;
  };
  defaultStyle?: string;          // Default style to use
}

// Default art direction that can be overridden by environment variables or parameters
const defaultArtDirection: ArtDirection = {
  styleEmphasis: [
    // Belgian Surrealist Influences
    "Magritte's metaphysical precision",
    "Paul Delvaux's dreamlike atmosphere",
    "Rachel Baes's mysterious symbolism",
    "Marcel Mariën's object juxtaposition",
    "Jane Graverol's feminine surrealism",
    "Paul Nougé's conceptual paradox",
    "Marcel Broodthaers's institutional critique",
    "symbolic resonance",
    "temporal displacement",
    "philosophical questioning",
    "poetic displacement",
    "dreamlike composition",
    "spatial illusion",
    "dramatic tension",
    "harmonious abstraction"
  ],
  visualElements: [
    // Strictly Vintage Computer Elements
    "floating vintage computers",
    "levitating retro displays",
    "classic interface elements floating in space",
    "hovering vintage keyboards",
    "geometric patterns of circuit boards",
    "billowing curtains revealing retro screens",
    "clouded skies filled with classic icons",
    "mirror reflections of vintage interfaces",
    "classic startup sounds visualized",
    "original computer mice in surreal patterns",
    "glowing power lights",
    "suspended vintage floppy disks",
    "ethereal dot matrix printers",
    "metaphysical peripheral ports",
    "symbolic early software stacks"
  ],
  colorPalette: [
    // Vintage Computer Color Palette
    "classic beige",
    "warm cream",
    "platinum grey",
    "classic interface blue",
    "vintage monitor green",
    "retro keyboard grey",
    "system window grey",
    "phosphor green",
    "early menu bar white",
    "classic shadow grey",
    "vintage platinum",
    "retro computer beige"
  ],
  compositionGuidelines: [
    // Belgian Surrealist Compositional Principles
    "Magritte's paradoxical placement",
    "Delvaux's architectural perspective",
    "Baes's intimate staging",
    "Mariën's object poetry",
    "Graverol's symbolic framing",
    "Nougé's conceptual arrangement",
    "Broodthaers's institutional spaces",
    "mysterious depth",
    "surreal scale relationships",
    "metaphysical perspective",
    "poetic object placement",
    "dramatic tension",
    "geometric rhythm",
    "philosophical space",
    "symbolic resonance"
  ],
  moodAndTone: "Create a deeply surreal and metaphysical atmosphere drawing from the Belgian Surrealist tradition, where vintage Apple technology becomes mysterious through paradoxical placement and symbolic resonance. Blend Magritte's precise execution, Delvaux's dreamy atmosphere, Baes's mysticism, Mariën's object poetry, Graverol's metamorphoses, Nougé's conceptual approach, and Broodthaers's institutional critique.",
  references: [
    // Belgian Surrealist Master Influences
    "Magritte's pristine execution and impossible scenarios",
    "Delvaux's dreamy architectural spaces",
    "Rachel Baes's mysterious feminine symbolism",
    "Marcel Mariën's poetic object arrangements",
    "Jane Graverol's surreal transformations",
    "Paul Nougé's conceptual paradoxes",
    "Marcel Broodthaers's institutional critiques",
    "Belgian surrealist use of text and image",
    "Collective Belgian surrealist atmosphere",
    "Shared themes of displacement and mystery"
  ],
  avoidElements: [
    // Elements to Strictly Avoid
    "non-Apple antique objects",
    "vintage furniture or decor",
    "traditional antique elements",
    "period architectural details",
    "classical ornaments",
    "vintage clothing or fashion",
    "antique books or papers",
    "historical artifacts",
    "period-specific decorative elements",
    "vintage mechanical objects",
    "antique scientific instruments",
    "old-world aesthetics",
    "vintage transportation elements",
    "period lighting fixtures",
    "traditional art materials"
  ]
};

// Function to load art direction from a JSON file if it exists
function loadArtDirectionFromFile(filePath: string): ArtDirection | null {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent) as ArtDirection;
    }
  } catch (error) {
    console.warn(`Warning: Could not load art direction from ${filePath}:`, error);
  }
  return null;
}

// Function to load category-specific art direction
function loadCategoryArtDirection(category?: string): ArtDirection | null {
  if (!category) return null;
  
  // Convert category to filename format (now including Ikigai)
  const prefix = category.toLowerCase().includes('ikigai') ? 'ikigai' : 
                category.toLowerCase().includes('bourdin') ? 'bourdin' : 'magritte';
  const categoryName = category.toLowerCase().replace(/^ikigai_|^bourdin_|^magritte_/, '');
  const categoryFileName = `${prefix}_${categoryName.replace(/\s+/g, '_')}.json`;
  const categoryFilePath = path.join(process.cwd(), categoryFileName);
  
  const categoryArtDirection = loadArtDirectionFromFile(categoryFilePath);
  if (categoryArtDirection) {
    console.log(`Loaded category-specific art direction from ${categoryFileName}`);
    return categoryArtDirection;
  }
  
  return null;
}

// Check for art direction file in the current directory
const artDirectionFilePath = path.join(process.cwd(), 'art-direction.json');
const fileArtDirection = loadArtDirectionFromFile(artDirectionFilePath);

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get concept from command line arguments
const concept = process.argv[2];
// Get category from command line arguments (if provided)
const categoryArg = process.argv[3];

// Initialize the style manager
const styleManager = new StyleManager();

// Modify the concept detection to always use Magritte style
function detectConceptCategory(concept: string): string {
  // Always return magritte_style to enforce Magritte as default
  return 'magritte_style';
}

// Determine the category to use
const detectedCategory = categoryArg || 'magritte_classic';

// Check for category-specific art direction if category is provided
const categoryArtDirection = loadCategoryArtDirection(detectedCategory);

// Log the art direction selection process
console.log('\n🎨 Art Direction Selection:');
if (categoryArg) {
  console.log(`- Using explicitly specified category: "${categoryArg}"`);
} else if (detectedCategory) {
  console.log(`- Using auto-detected category: "${detectedCategory}"`);
} else {
  console.log('- Using default Magritte art direction (no specific category)');
}

if (fileArtDirection) {
  console.log('- Found custom art-direction.json file');
}

if (categoryArtDirection) {
  console.log(`- Applied category-specific art direction from: ${detectedCategory}.json`);
} else if (detectedCategory) {
  console.log(`- No category-specific file found for "${detectedCategory}", using base Magritte direction`);
}

// Merge art directions with priority: category > file > default
const artDirection: ArtDirection = {
  ...defaultArtDirection,
  ...fileArtDirection,
  ...categoryArtDirection
};

// Define the models
const FLUX_PRO_MODEL = 'black-forest-labs/flux-1.1-pro';
const FLUX_MODEL_BASE = 'adirik/flux-cinestill';
const MINIMAX_MODEL = 'minimax/image-01';

// Define the models with Belgian Surrealist-LiveTheLifeTV fusion settings
const MAGRITTE_STYLE_CONFIG = {
  prompt_prefix: "Create a precise Magritte-style portrait composition with his characteristic treatment of faces and figures as mysterious objects. Using the exact painting technique from 'The Son of Man' (1964) and 'Golconda' (1953), with their pristine surface quality and perfect, shadowless rendering, create ",
  prompt_suffix: `. The portrait must follow Magritte's precise style:

- Portrait Treatment:
  * Faces treated as mysterious objects
  * Perfect, mask-like rendering of flesh
  * Absolutely flat, shadowless surfaces
  * Crystal-clear edge definition
  * No traditional modeling
  * Pure, unmodulated color fields
  * Pristine, photographic precision
  * Complete elimination of brushwork
  * Surgical exactness in details
  * Perfect, sourceless illumination

- Background Treatment:
  * Pure, flat color fields only
  * No atmospheric perspective
  * No traditional space or depth
  * Perfect, clean surfaces
  * Modern, timeless setting
  * Absolute geometric precision
  * No decorative elements
  * No period references
  * Clear, enigmatic space
  * Pristine emptiness

- Technical Requirements:
  * Use Magritte's 1950-60s technique
  * Achieve photographic clarity
  * Maintain perfect flatness
  * Create knife-edge precision
  * Ensure mechanical perfection
  * Eliminate all texture
  * Pure color separation
  * Absolute control
  * Perfect finish`,
  negative_prompt: "brushstrokes, texture, impasto, painterly, expressive, loose, gestural, impressionistic, abstract, rough, sketchy, uneven, textured surface, visible canvas, brush marks, paint thickness, palette knife, dry brush, scumbling, glazing, layered paint, broken color, atmospheric effect, sfumato, chiaroscuro, tonal gradation, blended colors, soft edges, feathered edges, painterly technique, artistic looseness, expressive brushwork, textural variation, surface irregularity, paint drips, spontaneous marks, gestural marks, painterly abstraction, artistic freedom, loose handling, energetic brushwork, thick paint, thin paint, variable paint, artistic interpretation, creative brushwork, expressive technique, artistic style, painterly style, artistic flourish, creative expression, artistic license, interpretive style, loose interpretation, creative freedom, artistic spontaneity, expressive freedom, creative license, artistic variation, interpretive freedom, loose style, creative interpretation, expressive style, artistic spontaneity, painterly freedom, creative style, interpretive technique, loose technique, artistic technique, expressive interpretation, creative technique, painterly interpretation, artistic expression, loose expression, creative expression, interpretive expression, 3D, depth, volume, photographic, camera, lens, DSLR, photography, realistic, hyperrealistic, cinematic, dramatic, atmospheric, moody, emotional, expressive, dynamic, energetic, vibrant, lively, animated, movement, motion, action, drama, intensity, passion, force, power, strength, vigor, vitality, life, spirit, soul, feeling, sentiment, mood, atmosphere, ambiance, environment, setting, context, situation, condition, state, quality, character, nature, essence, being, existence, reality, truth, fact, actuality, certainty, definiteness, precision, accuracy, exactness, correctness, rightness, trueness, authenticity, genuineness, validity, legitimacy, soundness, reliability, dependability, trustworthiness, credibility, believability, plausibility, probability, likelihood, possibility, chance, prospect, potential, capacity, capability, ability, power, faculty, means, way, method, manner, mode, fashion, style, approach, technique, procedure, process, practice, custom, habit, routine, convention, tradition, norm, standard, criterion, measure, gauge, test, check, verification, validation, confirmation, corroboration, substantiation, proof, evidence, demonstration, illustration, exemplification, instance, example, case, occurrence, happening, event, incident, episode, occasion, circumstance, situation, condition, state, position, place, location, spot, point, mark, sign, indication, signal, symptom, manifestation, expression, display, showing, exhibition, presentation, demonstration, revelation, disclosure, exposure, uncovering, unfolding, development, evolution, progression, advance, advancement, progress, growth, expansion, enlargement, extension, increase, enhancement, improvement, betterment, amelioration, upgrade, uplift, elevation, raising, lifting, boosting, heightening, intensification, strengthening, reinforcement, fortification, consolidation, stabilization, establishment, institution, constitution, formation, creation, generation, production, making, manufacturing, construction, building, assembly, composition, compilation, collection, gathering, accumulation, amassing, stockpiling, hoarding, storage, preservation, conservation, protection, safeguarding, security, safety, surety, certainty, assurance, guarantee, warranty, pledge, promise, commitment, obligation, duty, responsibility, charge, trust, care, custody, guardianship, keeping, maintenance, support, sustenance, subsistence, livelihood, living, life, existence, being, essence, nature, character, quality, property, attribute, characteristic, feature, aspect, element, component, constituent, ingredient, part, portion, piece, bit, fragment, section, segment, division, subdivision, department, branch, sector, sphere, realm, domain, field, area, region, territory, zone, space, place, position, location, situation, site, spot, point, mark, apple logo, bitten apple, apple computer logo, apple inc logo, apple brand symbol",
  num_inference_steps: 200,    // Increased further for maximum precision
  guidance_scale: 35.0,       // Increased for even stronger style adherence
  scheduler: "DPMSolverMultistep",
  num_samples: 1,
  seed: -1,
  cfg_scale: 35.0,           // Increased to match guidance_scale
  image_resolution: 1024,
  sampler_name: "DPM++ 2M Karras",
  denoising_strength: 0.2,    // Reduced further for maximum flatness
  control_scale: 1.0,        // Maximum control for style
  control_start: 0.0,        // Start control from beginning
  control_end: 1.0,          // Maintain control throughout
  style_fidelity: 1.0,       // Maximum style fidelity
  init_image_strength: 0.2,   // Low init image strength for cleaner result
  custom_style_params: {
    portrait_precision: 1.0,    // Maximum portrait precision
    face_flatness: 1.0,        // Maximum face flatness
    flesh_smoothness: 1.0,     // Perfect flesh rendering
    suit_precision: 1.0,       // Perfect suit rendering
    background_purity: 1.0,    // Pure, clean backgrounds
    symbolic_clarity: 1.0      // Clear symbolic elements
  }
};

// Define Magritte's iconic color palette with specific artwork references
const MAGRITTE_COLOR_PALETTE = {
  sky: {
    day: {
      color: "luminous cerulean blue",
      reference: "The Empire of Light (1953-54)",
      usage: "Clean, pure sky backgrounds"
    },
    night: {
      color: "deep prussian blue",
      reference: "The Dominion of Light (1948)",
      usage: "Deep, solid dark backgrounds"
    },
    twilight: {
      color: "pale grey-blue",
      reference: "The Blank Signature (1965)",
      usage: "Neutral atmospheric backgrounds"
    }
  },
  portraits: {
    face: {
      color: "pale porcelain flesh",
      reference: "The Son of Man (1964)",
      usage: "Main portrait elements"
    },
    suit: {
      color: "deep charcoal grey",
      reference: "Golconda (1953)",
      usage: "Business attire and formal elements"
    },
    mask: {
      color: "deep viridian green",
      reference: "The Son of Man (1964) apple",
      usage: "Obscuring elements and symbolic objects"
    },
    shadow: {
      color: "cool prussian shadow",
      reference: "The Great War (1964)",
      usage: "Portrait shadows and depth"
    }
  },
  backgrounds: {
    pure: {
      color: "flat cerulean blue",
      reference: "The Victory (1939)",
      usage: "Clean, pure background planes"
    },
    neutral: {
      color: "pale grey-white",
      reference: "Decalcomania (1966)",
      usage: "Neutral portrait backgrounds"
    },
    modern: {
      color: "clear sky blue",
      reference: "The Dominion of Light series",
      usage: "Contemporary settings"
    }
  },
  objects: {
    symbolic: {
      color: "deep viridian",
      reference: "The Son of Man (1964)",
      usage: "Key symbolic elements"
    },
    formal: {
      color: "pure charcoal black",
      reference: "Golconda bowler hats",
      usage: "Business and formal objects"
    },
    technological: {
      color: "pale platinum grey",
      reference: "The Listening Room (1952)",
      usage: "Modern and tech elements"
    }
  }
};

// Define vintage computer hardware colors with generic model references
const VINTAGE_COMPUTER_PALETTE = {
  plastics: {
    beige: {
      color: "Pantone 453C warm beige",
      reference: "Classic Personal Computer (1980s)",
      usage: "Main computer case color"
    },
    platinum: {
      color: "Pantone 427C cool grey",
      reference: "Professional Workstation (1987)",
      usage: "Later model case color"
    },
    cream: {
      color: "Pantone 7527C warm cream",
      reference: "Home Computer (1983)",
      usage: "Early model case color"
    }
  },
  accents: {
    text: {
      color: "dark warm grey",
      reference: "Classic computer text",
      usage: "Labels and text elements"
    },
    screen: {
      color: "phosphor green",
      reference: "Vintage monitor display",
      usage: "Display elements"
    }
  },
  screens: {
    background: {
      color: "soft warm grey",
      reference: "Classic computer display",
      usage: "Monitor background color"
    }
  }
};

// Update LIVE_THE_LIFE_ELEMENTS with portrait focus
const LIVE_THE_LIFE_ELEMENTS = {
  settings: [
    "pure cerulean blue background from The Victory",
    "stark neutral space with Decalcomania's clarity",
    "clean grey-white backdrop from The Great War",
    "luminous sky blue setting from Empire of Light",
    "pristine pale background from The Son of Man",
    "perfect shadowless space from Golconda",
    "crystalline void from The Central Story"
  ],
  portraits: [
    "mysterious figure in bowler hat with monitor face",
    "business suit figure with screen head",
    "Golconda-style figure carrying vintage device",
    "Son of Man pose with floating vintage screen",
    "multiple identical figures with monitor heads like Golconda",
    "figure in suit with glowing screen face",
    "portrait with floating computer obscuring face"
  ],
  objects: [
    "vintage computer floating like a mysterious object",
    "retro machine as a surreal element",
    "classic interface as an enigmatic symbol",
    "keyboard suspended in pure blue space",
    "monitor screen as a void into another reality",
    "floppy disk as an enigmatic floating object",
    "computer mouse transformed into a surreal portrait element"
  ],
  color_palettes: [
    // Portrait-focused palettes
    ["pure cerulean blue", "pale porcelain flesh", "deep charcoal grey"],
    ["clear sky blue", "Pantone 453C beige", "pure black"],
    ["pale grey-white", "deep viridian", "platinum grey"],
    ["luminous blue", "pale flesh", "matte black"]
  ],
  lighting: [
    "perfect sourceless light from Son of Man",
    "clear shadowless illumination from Golconda",
    "pure even lighting from The Great War",
    "pristine clarity from The Central Story",
    "crystalline illumination from Victory",
    "perfect diffusion from Decalcomania",
    "absolute clarity from Empire of Light"
  ]
};

// Add this helper function for user input
async function getUserInput(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Modify the generateArt function
async function generateArt(concept: string) {
  try {
    // Initialize the style manager first
    const styleManager = new StyleManager();

    // Define available Magritte-fusion categories
    const magritteCategories = [
      // Original Categories
      'magritte_classic',
      'magritte_empire_of_light',
      'magritte_landscapes',
      'magritte_metamorphosis',
      'magritte_mystery',
      'magritte_objects',
      'magritte_scale',
      'magritte_silhouettes',
      'magritte_skies',
      'magritte_windows',
      'magritte_wordplay',
      
      // New Specialized Categories
      'magritte_mirrors_illusion',      // Focuses on mirror reflections and optical illusions
      'magritte_time_dilation',         // Explores temporal distortions and multiple time states
      'magritte_floating_elements',     // Specialized in levitating objects and gravity defiance
      'magritte_hybrid_forms',          // Blending of different objects or beings
      'magritte_interior_exterior',     // Playing with inside/outside relationships
      'magritte_perspective_paradox',   // Impossible perspectives and spatial relationships
      'magritte_veiled_presence',       // Hidden or obscured figures and objects
      'magritte_symbolic_doors',        // Doorways to impossible spaces
      'magritte_cloud_metamorphosis',   // Cloud transformations and sky elements
      'magritte_nocturnal_mystery',     // Night scenes with surreal elements
      'magritte_domestic_surreal',      // Everyday objects made strange
      'magritte_architectural_dreams',   // Impossible buildings and structures
      'magritte_infinite_recursion',    // Images within images, endless repetition
      'magritte_material_transmutation', // Objects changing material properties
      'magritte_theatrical_reality',     // Stage-like settings with surreal elements
      'magritte_philosophical_objects',  // Objects that question their own existence
      'magritte_temporal_windows',       // Windows showing different times/realities
      'magritte_identity_masks',         // Playing with hidden and revealed identities
      'magritte_gravity_defiance',       // Objects and scenes that defy physics
      'magritte_dimensional_portals'     // Portals to other dimensions/realities
    ];

    // Randomly select a Magritte category
    const selectedCategory = magritteCategories[Math.floor(Math.random() * magritteCategories.length)];
    console.log(`\n✨ Using ${selectedCategory.replace('magritte_', '').replace('_', ' ')} for generation`);

    // Check for API keys
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const replicateApiKey = process.env.REPLICATE_API_KEY;
    
    console.log('🎨 ArtBot - Generating Art with Multi-Agent System');
    console.log('------------------------------------');
    console.log('API Keys found:');
    console.log(`- Anthropic: ${anthropicApiKey ? 'Yes' : 'No'}`);
    console.log(`- OpenAI: ${openaiApiKey ? 'Yes' : 'No'}`);
    console.log(`- Replicate: ${replicateApiKey ? 'Yes' : 'No'}`);
    
    // Initialize AI service
    const aiService = new AIService({
      anthropicApiKey,
      openaiApiKey,
    });
    
    await aiService.initialize();
    
    // Initialize the ReplicateService with FLUX Pro as the default model
    const replicateService = new ReplicateService({
      apiKey: replicateApiKey,
      defaultModel: process.env.DEFAULT_IMAGE_MODEL || FLUX_PRO_MODEL,
      defaultWidth: parseInt(process.env.IMAGE_WIDTH || '1024', 10),
      defaultHeight: parseInt(process.env.IMAGE_HEIGHT || '1024', 10),
      defaultNumInferenceSteps: parseInt(process.env.INFERENCE_STEPS || '200', 10),  // Increased to 200
      defaultGuidanceScale: parseFloat(process.env.GUIDANCE_SCALE || '35.0'),       // Increased to 35.0
    });
    
    await replicateService.initialize();
    
    // Initialize memory system
    const memorySystem = new MemorySystem({
      aiService,
      replicateService,
      baseDir: process.env.STORAGE_PATH || '.artbot',
    });
    
    await memorySystem.initialize();
    console.log(`📚 Loaded ${memorySystem.getMemories().size} memories from storage`);
    
    // Initialize style service
    const styleService = new StyleService({
      replicateService,
    }, process.cwd());
    
    await styleService.initialize();
    
    // Initialize the ArtBotMultiAgentSystem with Magritte focus
    const artBotMultiAgentSystem = new ArtBotMultiAgentSystem({
      aiService,
      replicateService,
      memorySystem,
      styleService,
      outputDir
    });
    
    await artBotMultiAgentSystem.initialize();
    console.log('🤖 ArtBot Multi-Agent System initialized for Magritte-style generation');
    console.log('✅ Services initialized');
    
    // If no concept is provided, generate a fusion concept
    let artConcept = concept;
    
    if (!artConcept) {
      // Get the category-specific art direction
      const categoryArtDirection = loadCategoryArtDirection(selectedCategory);
      
      console.log(`\n🎬 Generating fusion concept for ${selectedCategory.replace('magritte_', '').replace('_', ' ')}...`);
      
      // Get elements from both styles
      const magritteElements = categoryArtDirection?.visualElements || defaultArtDirection.visualElements;
      const magritteStyle = categoryArtDirection?.styleEmphasis || defaultArtDirection.styleEmphasis;
      const liveTheLifeSettings = LIVE_THE_LIFE_ELEMENTS.settings;
      const liveTheLifeObjects = LIVE_THE_LIFE_ELEMENTS.objects;
      
      // Select random elements from both styles with fallbacks
      const selectedMagritteElement = magritteElements[Math.floor(Math.random() * magritteElements.length)] || "floating vintage Apple computer";
      const selectedMagritteStyle = magritteStyle[Math.floor(Math.random() * magritteStyle.length)] || "Magritte's metaphysical precision";
      const selectedSetting = liveTheLifeSettings[Math.floor(Math.random() * liveTheLifeSettings.length)] || "pristine oil-painted environment";
      const selectedObject = liveTheLifeObjects[Math.floor(Math.random() * liveTheLifeObjects.length)] || "Macintosh with perfect oil painting finish";
      
      // Create a fusion concept with validation
      artConcept = `A surrealist scene where ${selectedMagritteElement} meets ${selectedObject} in ${selectedSetting}, painted with ${selectedMagritteStyle}`;
      console.log(`\n✨ Generated fusion concept: "${artConcept}"`);
    }
    
    console.log(`\n💡 Using concept: "${artConcept}"`);
    
    // Update the project creation
    const hash = Buffer.from(artConcept).toString('base64')
      .replace(/[+/=]/g, '') // Remove base64 special chars
      .slice(0, 8); // Take first 8 chars of hash
    
    const timestamp = new Date().getTime().toString(36).slice(-6); // Take last 6 chars of timestamp
    const stylePrefix = selectedCategory.replace('magritte_', '').slice(0, 4); // Take first 4 chars of style
    const baseFilename = `${stylePrefix}-${timestamp}-${hash}`; // Will be ~19 chars long
    
    const project = {
      title: artConcept,
      description: `Create a ${selectedCategory.replace('magritte_', '').replace('_', ' ')} surrealist artwork: "${artConcept}"`,
      useFlux: true,
      modelConfig: {
        ...MAGRITTE_STYLE_CONFIG,
        prompt_prefix: `In René Magritte's ${selectedCategory.replace('magritte_', '').replace('_', ' ')} surrealism, create a scene that blends metaphysical wonder with retro-futuristic nostalgia. Combine `,
        prompt_suffix: `. Render with:
- Lighting: Dramatic illumination with noir undertones
- Color: Rich, warm vintage tones contrasted with deep blues
- Composition: Clean Magritte-style surrealism
- Atmosphere: Mysterious and narrative-driven
- Technical quality: Hyperrealistic details with painterly surrealist elements
Style emphasizing symbolic resonance and surreal storytelling.`
      },
      requirements: [
        `Create a precise Magritte surrealist composition`,
        ...(categoryArtDirection?.styleEmphasis || []).slice(0, 3)
      ],
      outputFilename: baseFilename,
      artDirection: {
        ...(categoryArtDirection || defaultArtDirection),
        colorPalette: [...(LIVE_THE_LIFE_ELEMENTS.color_palettes[0])],
        lighting: [...(LIVE_THE_LIFE_ELEMENTS.lighting.slice(0, 3))]
      }
    };

    // Update logging to show selected style configuration
    console.log(`\n🎨 ${selectedCategory.replace('magritte_', '').replace('_', ' ')} Style Configuration:`);
    console.log('- Style emphasis:', project.artDirection.styleEmphasis.slice(0, 3).join(', '));
    console.log('- Color palette:', project.artDirection.colorPalette.slice(0, 3).join(', '));
    
    // Run the art project using the multi-agent system
    console.log(`\n🖼️ Generating Magritte-style art using multi-agent collaboration...`);
    const result = await artBotMultiAgentSystem.runArtProject(project);
    
    // Check if we have a valid result with artwork
    if (!result) {
      console.error('❌ Failed to generate image: No result returned');
      return;
    }
    
    // Initialize artwork data with defaults if not present
    const artwork = result.artwork || {};
    
    // Extract results from the multi-agent process
    let imageUrl = artwork.imageUrl || '';
    const prompt = artwork.prompt || '';
    const creativeProcess = artwork.creativeProcess || "Generated through multi-agent collaboration";
    
    // Validate the image URL
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      console.error(`❌ Invalid image URL: ${imageUrl}`);
      imageUrl = 'https://replicate.delivery/pbxt/AHFVdBEQcWgGTkn4MbkxDmHiLvULIEg5jX8CXNlP63xYHFjIA/out.png';
      console.log(`Using fallback image URL: ${imageUrl}`);
    } else {
      console.log(`✅ Image generated successfully: ${imageUrl}`);
    }
    
    // Update file paths to use selected style
    const promptPath = path.join(outputDir, `${baseFilename}-p.txt`);
    const imagePath = path.join(outputDir, `${baseFilename}.txt`);
    const metadataPath = path.join(outputDir, `${baseFilename}-m.json`);
    
    // Save prompt and creative process (silently)
    fs.writeFileSync(
      promptPath,
      `Prompt: ${prompt}\n\nCreative Process: ${creativeProcess}`
    );
    
    // Save and display only the image URL
    fs.writeFileSync(imagePath, imageUrl);
    console.log(`\n✨ Generated Image URL: ${imageUrl}`);
    
    // Create metadata object
    const metadata = {
      concept: artConcept,
      prompt: prompt,
      creativeProcess: creativeProcess,
      imageUrl: imageUrl,
      timestamp: new Date().toISOString(),
      isSurrealist: true,
      multiAgentCollaboration: true,
      artDirection: project.artDirection
    };
    
    // Save metadata silently
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Update memory tags to include selected style
    await memorySystem.storeMemory(
      {
        concept: artConcept,
        prompt: prompt,
        creativeProcess: creativeProcess,
        imageUrl: imageUrl,
        multiAgentCollaboration: true,
        artDirection: project.artDirection
      },
      MemoryType.EXPERIENCE,
      { 
        type: 'artwork', 
        concept: artConcept,
        style: selectedCategory.replace('magritte_', '').replace('_', '')
      },
      ['artwork', 'flux', 'multi-agent', selectedCategory.replace('magritte_', '').replace('_', ''), ...artConcept.split(' ')]
    );
    
    // Minimal completion message
    console.log('✅ Generation complete');
    
  } catch (error) {
    console.error('❌ Error generating art:', error);
  }
}

// Run the main function
generateArt(concept).catch(console.error);

// Export the function and types for use in other modules
export { generateArt, ArtistStyle };

// Modify the getStyleFromArtDirection function
function getStyleFromArtDirection(artDirection: any, style: ArtistStyle = 'magritte'): ArtDirection {
  if (artDirection && artDirection.styles) {
    const selectedStyle = artDirection.styles[style] || styleManager.getStyle(style);
    return selectedStyle;
  }
  
  return styleManager.getStyle(style);
} 