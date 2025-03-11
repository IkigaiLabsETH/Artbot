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
    // Magritte's Key Painting Series References
    "Empire of Light series (1953-54) technique: fashion models under impossible day-night skies",
    "Time Transfixed (1938) approach: fashion accessories emerging from unexpected spaces like Magritte's locomotive",
    "The Human Condition series (1933-35) style: windows and portholes showing landscapes that perfectly continue beyond their frames",
    "Son of Man (1964) treatment: fashion figures obscured by floating geometric objects with Magritte's perfect shadows",
    "The Treachery of Images series (1929) concept: fashion displays with paradoxical text about reality",
    "Golconda (1953) multiplication: identical fashion accessories raining against architectural grid",
    "The False Mirror (1929) technique: porthole windows containing infinite dreamlike space",
    
    // Specific Magritte Painting Techniques
    "La Belle Captive (1931) approach: windows as canvas-within-canvas showing impossible landscapes",
    "The Listening Room (1952) scale play: giant fashion accessories filling tiny Magritte interior",
    "The Blank Signature (1965) technique: human silhouette made of flowing fabric or color",
    "The Central Story (1928) style: fashion elements floating in pure gradient sky",
    "The Six Elements (1929) fragmentation: human figure divided into surreal painted segments",
    "Memory of a Journey (1955) technique: recursive doorways leading to dreamlike spaces",
    "The Beautiful Relations (1963) approach: ordinary objects transforming into Magritte's branches",
    
    // Magritte's Philosophical Devices
    "The Key to Dreams (1930) word-image relationships: fashion items with contradictory labels",
    "Personal Values (1952) scale distortion: giant everyday objects dwarfing intimate interior spaces",
    "The Forbidden Universe (1943) doubling: twin fashion figures in impossible mirror arrangement",
    "The Explanation (1952) symbolic objects: ordinary items transformed into Magritte's symbolic forms",
    "The Beautiful World (1962) transformation: fashion accessories flowering into surreal forms",
    "The Art of Living (1967) repetition: fashion elements in Magritte's grid patterns",
    "The Mysteries of the Horizon (1955) multiplication: multiple Magritte moons above fashion scene",
    
    // Signature Magritte Elements
    "The Victory (1939) technique: fashion surfaces painted with Magritte's stone-like flatness",
    "The Dominion of Light (1948) lighting: impossible day-night illumination of fashion settings",
    "The Collective Invention (1934) hybridization: fashion-object metamorphosis forms",
    "The Palace of Curtains (1929) trompe l'oeil: painted curtains revealing fashion displays",
    "The Pilgrim (1966) composition: lone figure in Magritte's desolate landscape",
    "The Ladder of Fire (1939) transformation: ordinary objects becoming flame-like surreal forms",
    "The Fair Captive (1947) framing: fashion scene viewed through Magritte's painted frame"
  ],
  visualElements: [
    // Classic Magritte Paradoxes with Fashion Elements
    "bowler-hatted figures with mirror or porthole faces (from The Son of Man)",
    "floating objects replaced by hovering fashion accessories (from Castle of the Pyrenees)",
    "Magritte's pipe emitting colorful fabric (from The Treachery of Images)",
    "billowing curtains revealing surreal fashion scenes (from The Voice of Blood)",
    "mirrors reflecting impossible fashion scenarios (from Reproduction Prohibited)",
    "windows showing contradictory fashion landscapes (from The Human Condition)",
    "birds morphing into fashion elements (from The Large Family)",
    "doorways painted as Magritte's lips (from The Beautiful Prisoner)",
    "fashion display windows that are actually painted skies (from The Key of Dreams)",
    "porthole windows containing miniature suns (from The Light of Coincidence)",
    
    // Magritte's Image-Within-Image with Fashion
    "fashion display showing exact view behind it like Magritte's easel (from The Human Condition)",
    "porthole window containing its own infinite reflection (from Not to be Reproduced)",
    "fashion magazine showing impossible landscapes (from The Domain of Arnheim)",
    "handbag opening revealing deep space vista (from The Universe Unmasked)",
    "mirrors showing different times of day (from The Dominion of Light)",
    "fashion advertisement containing real clouds (from The Perfect Image)",
    "window display continuing the street beyond its frame (from Evening Falls)",
    "fashion boutique windows as portals to other Magritte paintings (from The Living Mirror)",
    
    // Magritte's Scale Distortions
    "gigantic fashion accessory dominating tiny city (from Personal Values)",
    "microscopic fashion elements floating in vast sky (from The Lost Jockey)",
    "enormous shoe eclipsing the sun (from The Banquet)",
    "fashion model dwarfed by colossal everyday object (from The Anniversary)",
    "tiny fashion boutiques inside full-size handbag (from The Six Elements)",
    "massive fashion icon as architectural element (from Megalomania)",
    "planet-sized fashion logo in intimate room (from The Listening Room)",
    "miniature fashion accessories arranged on giant bowler hat (from The Happy Donor)",
    
    // Magritte's Metamorphosis Elements
    "fashion accessories transforming into clockfaces (from Time Transfixed)",
    "fabric becoming liquid silver (from The Waterfall)",
    "fashion silhouettes dissolving into birds (from The Large Family)",
    "clothing flowing into ocean waves (from The Wonders of Nature)",
    "fashion displays growing like crystal formations (from The Gradation of Fire)",
    "shoes sprouting like trees (from The Blank Signature)",
    "fashion elements morphing into clouds (from The Central Story)",
    "jewelry becoming musical notes (from The Alphabet of Revelations)",
    
    // Magritte's Impossible Juxtapositions
    "fashion boutique interior filled with forest (from The Blank Check)",
    "fashion runway underwater but perfectly dry (from The Summer Steps)",
    "fashion model floating in space but casting ground shadow (from The Victory)",
    "fashion accessories made of glass containing sky (from The Future of Statues)",
    "fabric knitted like impossible materials (from The Red Model)",
    "fashion display showing what's behind the viewer (from Portrait of Edward James)",
    "mirrors seeing yesterday (from Memory of a Journey)",
    "boutique interior bigger than exterior (from The Forbidden Universe)",
    
    // Magritte's Trompe l'oeil Techniques
    "fashion boutique door that's actually painted on wall (from The Victory)",
    "fashion display revealing real space behind wall (from The Human Condition II)",
    "clothing emerging from painted wardrobe (from Time Transfixed)",
    "fashion model casting shadow of different person (from The Mysteries of the Horizon)",
    "mirror that's actually reflection of nothing (from The False Mirror)"
  ],
  colorPalette: [
    // Classic Magritte Painting Colors
    "The Empire of Light sky blue (RGB: 135, 206, 235)",
    "The Son of Man apple green (RGB: 126, 186, 86)",
    "The Treachery of Images tobacco brown (RGB: 193, 154, 107)",
    "The Human Condition cloud white (RGB: 236, 236, 236)",
    "Golconda bowler hat black (RGB: 28, 28, 28)",
    "The False Mirror iris blue (RGB: 70, 130, 180)",
    "Time Transfixed locomotive black (RGB: 20, 20, 20)",
    "The Listening Room apple green (RGB: 141, 182, 0)",
    "Personal Values comb blue (RGB: 176, 196, 222)",
    "The Menaced Assassin blood red (RGB: 138, 7, 7)",
    "The Voice of Blood curtain shadow (RGB: 47, 79, 79)",
    "The Gradation of Fire flame orange (RGB: 226, 88, 34)",
    "Pandora's Box mist grey (RGB: 200, 200, 200)",
    "The Six Elements air blue (RGB: 176, 196, 222)",
    "The Future of Statues moonlight blue (RGB: 230, 230, 250)",
    
    // Contemporary Fashion Surrealism Colors
    "Porthole aqua (clean as The False Mirror) (RGB: 64, 224, 208)",
    "Fashion orange (vibrant as The Gradation of Fire) (RGB: 255, 140, 0)",
    "Runway yellow (pure as The Beautiful World) (RGB: 255, 223, 0)",
    "Studio pink (soft as The Rose of the Winds) (RGB: 255, 182, 193)",
    "Accessory red (bold as The Menaced Assassin) (RGB: 220, 20, 60)",
    "Minimalist white (flat as Empire of Light clouds) (RGB: 245, 245, 245)",
    "Surreal blue (deep as The Dominion of Light) (RGB: 25, 25, 112)",
    "Fashion neutral (matte as The Son of Man suit) (RGB: 210, 180, 140)",
    "Porthole glass (reflective as Not to be Reproduced) (RGB: 176, 224, 230)",
    "Impossible shadow (dark as Time Transfixed) (RGB: 47, 79, 79)",
    "Dreamscape lavender (soft as Memory of a Journey) (RGB: 230, 230, 250)",
    "Surreal green (vibrant as The Domain of Arnheim) (RGB: 0, 158, 96)",
    "Fashion metallic (reflective as Personal Values mirror) (RGB: 192, 192, 192)",
    "Boutique blue (clean as The Human Condition sky) (RGB: 135, 206, 250)",
    "Accessory gold (pure as The Golden Legend) (RGB: 255, 215, 0)"
  ],
  compositionGuidelines: [
    // Contemporary Surrealist Fashion Principles
    "Clean minimalist environments with bold color blocking",
    "Dramatic use of porthole windows and confined spaces",
    "Impossible perspectives and gravity-defying poses",
    "Reflective surfaces and mirror play",
    "Repetition of figures and fashion elements",
    "Intimate spaces opening to infinite vistas",
    "Underwater and floating compositions",
    "Strong geometric architectural framing",
    "Saturated color against neutral backgrounds",
    "Multiple identical figures in surreal arrangements",
    "Juxtaposition of interior and exterior spaces",
    "Fashion elements at impossible scales",
    "Models interacting with surreal environments",
    "Dreamlike lighting and color transitions",
    "Architectural elements as fashion frames",
    "Symmetrical and balanced compositions",
    "Floating objects and suspended motion",
    "Portals and doorways to impossible spaces",
    "Play with scale and perspective",
    "Integration of fashion with surreal elements"
  ],
  moodAndTone: "Create a deeply surreal and metaphysical atmosphere drawing from the Belgian Surrealist tradition, where everyday objects become mysterious through paradoxical placement and symbolic resonance. Evoke a dreamlike quality with clean, minimalist environments featuring bold, saturated colors (especially oranges, yellows, blues, and pinks). Compose scenes with impossible perspectives where fashion elements and ordinary objects take on extraordinary significance through unusual scale relationships, repetition, and unexpected juxtapositions. Portray confined spaces with porthole/window motifs that create a sense of both intimacy and infinity. Blend Magritte's precise execution, Delvaux's dreamy atmosphere, Baes's mysticism, Mariën's object poetry, Graverol's metamorphoses, Nougé's conceptual approach, and Broodthaers's institutional critique. The overall aesthetic should feel contemporary and fashion-forward while maintaining the philosophical depth of surrealism - creating scenes that are simultaneously beautiful, unsettling, and thought-provoking. Emphasize the tension between reality and illusion, interior and exterior spaces, presence and absence, singularity and multiplicity. The human figure should interact with the surreal elements in ways that question conventional relationships between body, object, and environment, suggesting narratives that remain tantalizingly open to interpretation.",
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
  prompt_prefix: "Create a contemporary surrealist fashion composition with clean, minimalist execution and metaphysical atmosphere. Drawing from both Magritte's surrealist precision and modern fashion photography, compose ",
  prompt_suffix: `. The image must epitomize contemporary surrealist fashion:

- Visual Execution:
  * Clean, minimalist environments with perfect clarity
  * Bold, saturated colors with dramatic contrasts
  * Pristine surfaces and sharp edge definition
  * Architectural precision in spatial relationships
  * Photographic clarity with surreal elements
  * Complete control of light and shadow

- Surreal Atmosphere:
  * Impossible perspectives and gravity-defying poses
  * Dreamlike spaces with infinite depth
  * Porthole windows and confined spaces opening to vast vistas
  * Multiple reflections and mirror effects
  * Underwater environments and floating elements
  * Repetition of figures and fashion elements

- Contemporary Fashion Elements:
  * Modern, fashion-forward styling
  * Bold color blocking and geometric forms
  * Architectural framing of the human figure
  * Interaction between fashion and surreal space
  * Play with scale and proportion
  * Integration of fashion with environment`,
  negative_prompt: "vintage, retro, antique, old-fashioned, weathered, distressed, grungy, textured, noisy, grainy, blurry, soft, painterly, sketchy, hand-drawn, illustrated, cartoon, anime, stylized, abstract, expressionistic, impressionistic, loose, gestural, brushy, impasto, rough, uneven, dirty, damaged, worn, faded, muted, desaturated, dull, flat, lifeless, amateur, unprofessional, low-quality, poor lighting, bad composition, awkward poses, unfashionable, outdated, period costume, historical, classical, traditional, folk, rustic, primitive, tribal, ethnic, ornate, decorative, cluttered, busy, chaotic, messy, disorganized, unbalanced, asymmetrical, random, accidental, spontaneous, casual, informal, candid, snapshot, documentary, journalistic, editorial, commercial, advertising, product, stock photo, generic, cliché, boring, ordinary, mundane, everyday, common, typical, standard, conventional, mainstream, trendy, fashionable, hip, cool, edgy, urban, street, graffiti, industrial, mechanical, technical, digital, electronic, futuristic, sci-fi, fantasy, magical, mystical, spiritual, religious, symbolic, metaphorical, allegorical, narrative, storytelling, conceptual, minimal, simple, clean, modern, contemporary, timeless, classic, elegant, sophisticated, luxurious, glamorous, beautiful, pretty, cute, sweet, romantic, feminine, masculine, neutral, natural, organic, environmental, landscape, cityscape, architecture, interior, exterior, day, night, indoor, outdoor, studio, location, portrait, fashion, beauty, lifestyle, still life, nature, wildlife, travel, sports, action, movement, emotion, mood, atmosphere, lighting, color, composition, perspective, depth, space, time, reality, surreal, abstract, conceptual, experimental, avant-garde, artistic, creative, innovative, original, unique, personal, authentic, genuine, real, true, honest, sincere, meaningful, powerful, impactful, memorable, iconic, timeless",
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
    fashion_precision: 1.0,
    minimalist_environment: 1.0,
    color_saturation: 1.0,
    architectural_clarity: 1.0,
    surface_quality: 1.0,
    lighting_control: 1.0,
    reflection_quality: 1.0,
    depth_control: 1.0,
    perspective_manipulation: 1.0,
    fashion_integration: 1.0,
    surreal_atmosphere: 1.0,
    spatial_composition: 1.0,
    figure_placement: 1.0,
    color_harmony: 1.0,
    modern_aesthetic: 1.0
  },
  compositionGuidelines: [
    // Contemporary Surrealist Fashion Composition
    "Clean minimalist environments with bold color blocking",
    "Dramatic use of porthole windows and confined spaces",
    "Impossible perspectives and gravity-defying poses",
    "Reflective surfaces and mirror play",
    "Repetition of figures and fashion elements",
    "Intimate spaces opening to infinite vistas",
    "Underwater and floating compositions",
    "Strong geometric architectural framing",
    "Saturated color against neutral backgrounds",
    "Multiple identical figures in surreal arrangements",
    "Juxtaposition of interior and exterior spaces",
    "Fashion elements at impossible scales",
    "Models interacting with surreal environments",
    "Dreamlike lighting and color transitions",
    "Architectural elements as fashion frames",
    "Symmetrical and balanced compositions",
    "Floating objects and suspended motion",
    "Portals and doorways to impossible spaces",
    "Play with scale and perspective",
    "Integration of fashion with surreal elements"
  ]
};

// Define Magritte's iconic color palette with specific artwork references
const MAGRITTE_COLOR_PALETTE = {
  // Refined color palette limited to Magritte's unmodulated tones
  sky: {
    day: {
      color: "Magritte sky blue (Pantone 292 C)",
      reference: "The Dominion of Light series, The Son of Man",
      usage: "Luminous daytime skies"
    },
    night: {
      color: "Magritte midnight blue (Pantone 540 C)",
      reference: "The Empire of Light series, The Lovers",
      usage: "Enigmatic night skies"
    }
  },
  
  portraits: {
    flesh: {
      color: "Magritte porcelain flesh (Pantone 7506 C)",
      reference: "The Son of Man, The Lovers, The Great War",
      usage: "Smooth, flat skin tones"
    },
    hair: {
      color: "Magritte chestnut brown (Pantone 469 C)",
      reference: "The Great War, Golconda, The Son of Man",
      usage: "Neatly groomed hair"
    },
    cloth: {
      color: "Magritte drapery white (Pantone 7541 C)",
      reference: "The Lovers, The Heart of the Matter, The Therapist",
      usage: "Flowing fabric and shrouds"
    }
  },

  objects: {
    apple: {
      color: "Magritte apple green (Pantone 360 C)",
      reference: "The Son of Man, The Listening Room",
      usage: "Iconic green apples"
    },
    stone: {
      color: "Magritte stone grey (Pantone 409 C)",
      reference: "The Castle of the Pyrenees, The Art of Living",
      usage: "Massive stone elements"
    },
    wood: {
      color: "Magritte wood brown (Pantone 730 C)",
      reference: "The Treachery of Images, The Six Elements",
      usage: "Wooden objects and surfaces"
    }
  },

  backgrounds: {
    wall: {
      color: "Magritte wall grey (Pantone 400 C)",
      reference: "The Human Condition, The Memoirs of a Saint",
      usage: "Flat interior walls"
    },
    void: {
      color: "Magritte void black (Pantone Black C)", 
      reference: "The Dominion of Light, Time Transfixed",
      usage: "Absolute darkness and shadows"
    },
    sky: {
      color: "Magritte sky white (Pantone 663 C)",
      reference: "Decalcomania, The Happy Donor",
      usage: "Pale, infinite skyscapes" 
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
    "computer mouse transformed into a surreal portrait element",
    "CRT monitor as a window into a metaphysical realm",
    "vintage computer components arranged in impossible configurations",
    "classic keyboard keys raining from a surreal sky",
    "floppy disks metamorphosing into mysterious creatures",
    "computer mouse cord tangled in a surreal knot",
    "vintage computer manual pages scattered in a dreamlike landscape",
    "computer tower opened to reveal a surreal interior world",
    "computer chip as a labyrinthine city in a surreal space",
    "vintage computer fan as a hypnotic vortex",
    "computer speaker as a portal to an alternate reality",
    "computer cables twisted into surreal organic forms",
    "motherboard as an abstract expressionist landscape",
    "punch cards as enigmatic symbols in a surreal composition",
    "computer case as a frame for a metaphysical still life",
    "vintage computer ad as a surreal collage element",
    "computer programming book as a surreal pop-up sculpture"
  ],
  color_palettes: [
    // Portrait-focused palettes
    ["pure cerulean blue", "pale porcelain flesh", "deep charcoal grey"],
    ["clear sky blue", "Pantone 453C beige", "pure black"],
    ["pale grey-white", "deep viridian", "platinum grey"],
    ["luminous blue", "pale flesh", "matte black"],
    
    // Empire of Light palettes
    ["midnight blue", "golden lamplight", "misty grey"],
    ["twilight cerulean", "warm ivory", "deep shadow black"],
    ["dusk purple", "pale yellow", "charcoal darkness"],
    
    // Mysterious Interior palettes
    ["deep mahogany brown", "pale alabaster", "prussian blue"],
    ["rich burgundy", "antique ivory", "slate grey"],
    ["dark emerald", "cream white", "ebony black"],
    
    // Symbolic Object palettes
    ["blood crimson", "pearl white", "deep navy"],
    ["forest green", "bone white", "dark umber"],
    ["royal purple", "shell pink", "graphite grey"],
    
    // Metaphysical Landscape palettes
    ["horizon blue", "cloud white", "earth brown"],
    ["sunset orange", "misty grey", "deep indigo"],
    ["morning gold", "fog white", "mountain grey"],
    
    // Belgian Surrealist Masters palettes
    ["Delvaux twilight blue", "moonlit flesh", "shadow black"],
    ["Graverol emerald", "mystical white", "dark violet"],
    ["Mariën cobalt", "paper white", "ink black"],
    
    // Contemporary Interpretations
    ["electric blue", "digital white", "matte black"],
    ["neon cerulean", "synthetic flesh", "carbon grey"],
    ["cyber azure", "artificial ivory", "obsidian black"]
  ],
  lighting: [
    "perfect sourceless light from Son of Man",
    "clear shadowless illumination from Golconda",
    "pure even lighting from The Great War",
    "pristine clarity from The Central Story",
    "crystalline illumination from Victory",
    "perfect diffusion from Decalcomania",
    "absolute clarity from Empire of Light"
  ],
  styleEmphasis: [
    // Magritte's Key Painting Series References
    "Empire of Light series (1953-54) technique: fashion models under impossible day-night skies",
    "Time Transfixed (1938) approach: fashion accessories emerging from unexpected spaces like Magritte's locomotive",
    "The Human Condition series (1933-35) style: windows and portholes showing landscapes that perfectly continue beyond their frames",
    "Son of Man (1964) treatment: fashion figures obscured by floating geometric objects with Magritte's perfect shadows",
    "The Treachery of Images series (1929) concept: fashion displays with paradoxical text about reality",
    "Golconda (1953) multiplication: identical fashion accessories raining against architectural grid",
    "The False Mirror (1929) technique: porthole windows containing infinite dreamlike space",
    
    // Specific Magritte Painting Techniques
    "La Belle Captive (1931) approach: windows as canvas-within-canvas showing impossible landscapes",
    "The Listening Room (1952) scale play: giant fashion accessories filling tiny Magritte interior",
    "The Blank Signature (1965) technique: human silhouette made of flowing fabric or color",
    "The Central Story (1928) style: fashion elements floating in pure gradient sky",
    "The Six Elements (1929) fragmentation: human figure divided into surreal painted segments",
    "Memory of a Journey (1955) technique: recursive doorways leading to dreamlike spaces",
    "The Beautiful Relations (1963) approach: ordinary objects transforming into Magritte's branches",
    
    // Magritte's Philosophical Devices
    "The Key to Dreams (1930) word-image relationships: fashion items with contradictory labels",
    "Personal Values (1952) scale distortion: giant everyday objects dwarfing intimate interior spaces",
    "The Forbidden Universe (1943) doubling: twin fashion figures in impossible mirror arrangement",
    "The Explanation (1952) symbolic objects: ordinary items transformed into Magritte's symbolic forms",
    "The Beautiful World (1962) transformation: fashion accessories flowering into surreal forms",
    "The Art of Living (1967) repetition: fashion elements in Magritte's grid patterns",
    "The Mysteries of the Horizon (1955) multiplication: multiple Magritte moons above fashion scene",
    
    // Signature Magritte Elements
    "The Victory (1939) technique: fashion surfaces painted with Magritte's stone-like flatness",
    "The Dominion of Light (1948) lighting: impossible day-night illumination of fashion settings",
    "The Collective Invention (1934) hybridization: fashion-object metamorphosis forms",
    "The Palace of Curtains (1929) trompe l'oeil: painted curtains revealing fashion displays",
    "The Pilgrim (1966) composition: lone figure in Magritte's desolate landscape",
    "The Ladder of Fire (1939) transformation: ordinary objects becoming flame-like surreal forms",
    "The Fair Captive (1947) framing: fashion scene viewed through Magritte's painted frame"
  ],
  references: [
    // Magritte's most iconic and recognizable portrait works
    "The Son of Man (1964) - Apple obscuring bowler-hatted man's face",
    "The Lovers (1928) - Kissing couple with cloth-shrouded heads", 
    "Golconda (1953) - Raining men in identical bowler hats and suits",
    "The Great War (1964) - Flowers obscuring bowler-hatted figure's face",
    "The Therapist (1937) - Seated figure with birdcage head",
    "The Rape (1934) - Woman's face replaced by nude torso",
    "The Happy Donor (1966) - Landscape reflected in man's head silhouette",
    "The Heart of the Matter (1928) - Mysterious cloth-wrapped figure",
    "The Month of the Grape Harvest (1959) - Suited man with apple in barren landscape",
    "The Dominion of Light series (1949-1965) - Paradoxical day/night scenes",
    "The Empire of Light series (1948-1964) - Glowing windows in night scenes",
    "The Human Condition series (1933-1935) - Paintings within paintings",
    "The Castle of the Pyrenees (1959) - Massive stone on tiny base",
    "The Listening Room (1952) - Giant green apple filling interior room",
    "The Six Elements (1929) - Fragmented portrait with wooden objects",
    "Decalcomania (1966) - Sky merging into rocky cliffside",
    "The Treachery of Images (1929) - 'Ceci n'est pas une pipe' inscription",
    "Time Transfixed (1938) - Train emerging from fireplace",
    "The Eternally Obvious (1930) - Fragmented and recomposed female nude",
    "The Art of Living (1967) - Stone relief with bowler-hatted men"
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

/**
 * Formats a color palette for display with proper formatting and grouping
 * @param colors Array of color strings
 * @param maxDisplay Maximum number of colors to display (optional)
 * @returns Formatted string representation of the color palette
 */
function formatColorPalette(colors: string[], maxDisplay?: number): string {
  if (!colors || colors.length === 0) {
    return 'No colors defined';
  }

  const displayColors = maxDisplay ? colors.slice(0, maxDisplay) : colors;
  const remaining = maxDisplay && colors.length > maxDisplay ? colors.length - maxDisplay : 0;

  const formattedColors = displayColors.map(color => {
    // Clean up the color name and ensure proper formatting
    const cleanColor = color.trim()
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\s+/g, ' '); // Normalize spaces

    // Check for RGB values and format them nicely
    const rgbMatch = cleanColor.match(/\(RGB:\s*(\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [_, r, g, b] = rgbMatch;
      return `\n  - ${cleanColor.split('(')[0].trim()} (🎨 RGB: ${r}, ${g}, ${b})`;
    }

    // Check for Pantone values
    const pantoneMatch = cleanColor.match(/\(Pantone [^)]+\)/);
    if (pantoneMatch) {
      return `\n  - ${cleanColor}`;
    }

    return `\n  - ${cleanColor}`;
  }).join('');

  let output = `Color Palette:${formattedColors}`;
  if (remaining > 0) {
    output += `\n  ... and ${remaining} more colors`;
  }

  return output;
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
      
      console.log(`\n🎨 Generating Magritte-style concept for ${selectedCategory.replace('magritte_', '').replace('_', ' ')}...`);
      
      // Get elements from the Magritte style
      const magritteElements = categoryArtDirection?.visualElements || defaultArtDirection.visualElements;
      const magritteStyle = categoryArtDirection?.styleEmphasis || defaultArtDirection.styleEmphasis;
      
      // Select random elements from the Magritte style with fallbacks
      const selectedMagritteElement = magritteElements[Math.floor(Math.random() * magritteElements.length)] || "floating apple";
      const selectedMagritteStyle = magritteStyle[Math.floor(Math.random() * magritteStyle.length)] || "Magritte's metaphysical precision";
      
      // Create a Magritte-style surrealist portrait concept
      const magritteConceptTemplate = [
        `A surrealist portrait where ${selectedMagritteElement} obscures the face, painted with ${selectedMagritteStyle}`,
        `An enigmatic figure wearing a bowler hat with ${selectedMagritteElement} as a face, executed in the style of ${selectedMagritteStyle}`,
        `A portrait with ${selectedMagritteElement} as a mask, rendered with ${selectedMagritteStyle}`,
        `A dreamlike portrait of a figure with ${selectedMagritteElement} for a head, imbued with ${selectedMagritteStyle}`,
        `Multiple identical figures in bowler hats and suits, with ${selectedMagritteElement} heads, composed like Golconda and painted with ${selectedMagritteStyle}`
      ];

      const magritteConceptIndex = Math.floor(Math.random() * magritteConceptTemplate.length);
      artConcept = magritteConceptTemplate[magritteConceptIndex];

      console.log(`\n✨ Generated Magritte-style portrait concept: "${artConcept}"`);
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
      description: `Create a ${selectedCategory.replace('magritte_', '').replace('_', ' ')} surrealist portrait artwork: "${artConcept}"`,
      useFlux: true,
      modelConfig: {
        ...MAGRITTE_STYLE_CONFIG,
        prompt_prefix: `In René Magritte's ${selectedCategory.replace('magritte_', '').replace('_', ' ')} surrealist portrait style, create a composition that blends metaphysical wonder with enigmatic facial elements. Combine `,
        prompt_suffix: `. Render with:
- Lighting: Dramatic illumination with noir undertones
- Color: Rich, warm vintage tones contrasted with deep blues
- Composition: Clean Magritte-style surrealism focused on the figure
- Atmosphere: Mysterious and narrative-driven
- Technical quality: Hyperrealistic details with painterly surrealist elements
Style emphasizing symbolic resonance and surreal portraiture.`
      },
      requirements: [
        `Create a precise Magritte surrealist portrait composition`,
        ...(categoryArtDirection?.styleEmphasis || []).slice(0, 3)
      ],
      outputFilename: baseFilename,
      artDirection: {
        ...(categoryArtDirection || defaultArtDirection),
        colorPalette: [
          // Portrait colors
          ...(MAGRITTE_COLOR_PALETTE.portraits.flesh.color),
          ...(MAGRITTE_COLOR_PALETTE.portraits.hair.color),
          ...(MAGRITTE_COLOR_PALETTE.portraits.cloth.color),
          // Sky colors
          ...(MAGRITTE_COLOR_PALETTE.sky.day.color),
          ...(MAGRITTE_COLOR_PALETTE.sky.night.color),
          // Background colors
          ...(MAGRITTE_COLOR_PALETTE.backgrounds.wall.color),
          ...(MAGRITTE_COLOR_PALETTE.backgrounds.void.color),
          ...(MAGRITTE_COLOR_PALETTE.backgrounds.sky.color)
        ],
        lighting: [...(MAGRITTE_COLOR_PALETTE.portraits.cloth.color)],
        references: [
          // Expanded references to Magritte's specific portrait techniques
          "The Son of Man (1964) - Iconic apple obscuring bowler-hatted man's face",
          "The Lovers (1928) - Kissing couple with cloth-shrouded heads",
          "Golconda (1953) - Raining men in bowler hats and suits",
          "The Great War (1964) - Bowler-hatted figure with flowers obscuring face",
          "The Therapist (1937) - Seated figure with birdcage head",
          "The Rape (1934) - Woman's face replaced by torso",
          "The Happy Donor (1966) - Landscape reflected in man's head silhouette", 
          "The Heart of the Matter (1928) - Mysterious figure wrapped in white cloth",
          "The Month of the Grape Harvest (1959) - Suited man with apple in barren landscape",
          "The Dominion of Light series (1949-1965) - Paradoxical day/night scenes",
          "The Empire of Light series (1948-1964) - Glowing windows in night scenes",
          "The Human Condition series (1933-1935) - Paintings within paintings",
          "The Castle of the Pyrenees (1959) - Massive stone on small base",
          "The Listening Room (1952) - Giant green apple filling interior room",
          "The Six Elements (1929) - Fragmented portrait with wooden objects",
          "Decalcomania (1966) - Sky merging into rocky cliffside",
          "The Treachery of Images (1929) - 'Ceci n'est pas une pipe' inscription",
          "Time Transfixed (1938) - Train emerging from fireplace",
          "The Eternally Obvious (1930) - Fragmented and recomposed female nude",
          "The Art of Living (1967) - Stone relief with bowler-hatted men",
          "The Memoirs of a Saint (1960) - Candlelit figure in bowler hat",
          "The Happy Donor (1966) - Landscape reflected in man's head silhouette",
          "The Difficult Crossing (1926) - Figure struggling through surreal landscape",
          "The Mysteries of the Horizon (1955) - Figures on beach with floating objects",
          "The Philosopher's Lamp (1936) - Glowing light bulb with bowler hat",
          "The Fair Captive (1931) - Nude woman with fish and ship elements",
          "The Healer (1936) - Figure with candle flame obscuring face",
          "The Cicerone (1947) - Faceless figure in art gallery with paintings",
          "The Survivor (1950) - Fragmented classical statue in barren landscape",
          "The Collective Invention (1934) - Mermaid figure on beach",
          "The Explanation (1952) - Giant key in room with figure at window"
        ]
      }
    };

    // Update logging to show selected style configuration with improved formatting
    console.log(`\n🎨 ${selectedCategory.replace('magritte_', '').replace('_', ' ')} Style Configuration:`);
    console.log('- Style emphasis:', project.artDirection.styleEmphasis.slice(0, 3).join(', '));
    console.log(formatColorPalette(project.artDirection.colorPalette, 10)); // Show first 10 colors
    
    // Run the art project using the multi-agent system
    console.log(`\n🖼️ Generating Magritte-style portrait art using multi-agent collaboration...`);
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