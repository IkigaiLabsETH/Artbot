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
    
    // International Surrealist Influences
    "Salvador Dalí's paranoid-critical method and dream-like imagery",
    "Max Ernst's collage novels and frottage techniques",
    "Yves Tanguy's abstract and biomorphic landscapes",
    "André Breton's automatic writing and surrealist games",
    "Man Ray's rayographs and solarized photographs",
    "Hans Bellmer's uncanny and fragmented dolls",
    "Leonora Carrington's fantastical and mythological narratives",
    "Dorothea Tanning's surreal and psychologically charged interiors",
    
    // Related Artistic Movements and Influences
    "Giorgio de Chirico's metaphysical and enigmatic compositions",
    "Frida Kahlo's symbolic self-portraits and dream-like elements",
    "Joan Miró's abstract and biomorphic forms and color palettes",
    "Jean Arp's organic and fluid shapes and reliefs",
    "Hannah Hoch's Dadaist photomontages and collages",
    "Kurt Schwitters's Merz assemblages and installations",
    "Pablo Picasso's cubist fragmentation and multiple perspectives",
    "Henri Matisse's expressive use of color and simplified forms",
    
    // Avant-Garde Techniques and Approaches
    "Automatic drawing and writing for subconscious expression",
    "Collage and assemblage for unexpected juxtapositions",
    "Frottage and grattage for texture and chance effects",
    "Photomontage and solarization for surreal distortions",
    "Exquisite corpse and surrealist games for collaborative creation",
    "Biomorphic abstraction for organic and fluid forms",
    "Fragmentation and distortion of the human figure",
    "Symbolic and archetypal imagery for psychological depth",
    
    // Expanded Surrealist Themes and Concepts
    "The uncanny and the return of the repressed",
    "The marvelous and the convulsive beauty",
    "The crisis of the object and the phantom object",
    "The resolution of dream and reality into a surreality",
    "The omnipotence of desire and the triumph of love",
    "The revolution of language and the new myth",
    "The occultation of Surrealism and the surrealist occult",
    "The haunted self and the labyrinthine psyche"
  ],
  visualElements: [
    // Magritte-inspired surreal elements with a vintage computer twist
    "floating vintage computers with Magritte's iconic apples and bowler hats",
    "levitating retro displays in dreamlike landscapes reminiscent of Magritte's paintings",
    "classic interface elements floating in surreal skies filled with Magritte's clouds and birds",
    "hovering vintage keyboards with keys transforming into Magritte's pipes and candles",
    "geometric patterns of circuit boards blending into Magritte's fragmented architectural elements",
    "billowing curtains revealing retro screens that contain Magritte's paintings within paintings",
    "clouded skies filled with classic computer icons and Magritte's enigmatic symbols",
    "mirror reflections of vintage interfaces merging with Magritte's self-referential illusions",
    "classic startup sounds visualized as Magritte's musical notes floating in surreal spaces",
    "original computer mice in surreal patterns alongside Magritte's disembodied hands and eyes",
    "glowing power lights illuminating Magritte's uncanny still life arrangements",
    "suspended vintage floppy disks orbiting Magritte's giant floating objects",
    "ethereal dot matrix printers outputting Magritte's paradoxical text fragments",
    "metaphysical peripheral ports connecting to Magritte's impossible dream-spaces",
    "symbolic early software stacks merging with Magritte's conceptual object-scapes",
    "vintage computer components entangled in Magritte's vines, roots, and organic forms",
    "retro computer cases opening to reveal Magritte's surreal interior worlds",
    "classic computer fans blowing Magritte's curtains and revealing hidden realities",
    "vintage computer cords transforming into Magritte's umbilical cords and life-lines",
    "antique computer manuals with pages morphing into Magritte's flying birds and soaring sheets"
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
  prompt_prefix: "Create an enigmatic Magritte-style portrait composition with his signature pristine execution, absolute flatness, and metaphysical atmosphere. Eliminate any trace of brushwork, texture, or depth. Adhering precisely to the techniques in 'The Son of Man' (1964), 'The Lovers' (1928), and 'Golconda' (1953), with their machine-like perfection and razor-sharp edges, create ",
  prompt_suffix: `. The portrait must epitomize Magritte's iconic style:

- Pristine Execution:
  * Faces as perfectly smooth, mask-like objects
  * Absolutely flat, shadowless flesh with no modeling
  * Crystal-clear edge definition and surgical exactness
  * Pure, unmodulated color fields and complete flatness
  * Photographic clarity and precision in every detail
  * Total elimination of any visible brushwork or texture

- Enigmatic Atmosphere:
  * Timeless, otherworldly spaces of pristine emptiness
  * Metaphysical staging with philosophical undertones
  * Surreal juxtapositions and conceptual paradoxes
  * Poetic arrangement of objects in evocative constellations
  * Sense of mystery, displacement, and cognitive dissonance
  * Tension between hyperrealism and dream-like surrealism

- Magritte's Metaphysical Themes:
  * The uncanny and the everyday made strange
  * The double, the mirror, and the split self
  * Metamorphosis and transformation of figures and objects
  * The crisis of the object and the phantom object
  * The resolution of dream and reality into a surreality
  * The omnipotence of desire and the triumph of love`,
  negative_prompt: "painterly, expressive, loose, gestural, impressionistic, abstract, rough, sketchy, uneven, textured surface, visible canvas, brush marks, paint thickness, palette knife, dry brush, scumbling, glazing, layered paint, broken color, atmospheric perspective, sfumato, chiaroscuro, tonal gradation, color blending, soft edges, feathered edges, visible brushwork, artistic looseness, textural variation, surface irregularity, paint drips, spontaneous marks, energetic brushwork, thick impasto, variable paint application, artistic interpretation, expressive technique, painterly style, artistic flourish, creative expression, interpretive style, loose handling, artistic spontaneity, expressive freedom, creative license, artistic variation, interpretive freedom, loose style, creative interpretation, expressive style, painterly freedom, creative style, interpretive technique, loose technique, expressive interpretation, creative technique, painterly interpretation, artistic expression, loose expression, creative expression, interpretive expression, visible artist's hand, evidence of process, imperfection, 3D, depth, volume, modeling, shading, form, contour, highlight, shadow, cast shadow, core shadow, reflected light, photographic effects, camera blur, lens flare, bokeh, vignette, film grain, noise, pixelation, posterization, halftone, screen printing, risograph, linocut, woodcut, etching, engraving, aquatint, mezzotint, lithography, silkscreen, monoprint, cyanotype, blueprint, ascii art, vector art, 3D render, CGI, computer graphics, digital art, glitch art, pixel art, low poly, wireframe, hologram, VR, AR, stereoscopic, anaglyph",
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
    face_flatness: 1.0,
    flesh_smoothness: 1.0,
    edge_sharpness: 1.0,
    surface_quality: 1.0,
    color_separation: 1.0,
    brushwork_elimination: 1.0,
    depth_removal: 1.0,
    atmospheric_negation: 1.0,
    conceptual_emphasis: 1.0,
    metaphysical_resonance: 1.0,
    surreal_juxtaposition: 1.0,
    enigmatic_staging: 1.0,
    cognitive_dissonance: 1.0,
    hyperreal_surrealism: 1.0
  },
  compositionGuidelines: [
    // Magritte's Iconic Compositional Devices in Portraits
    "Obscuring the face with displaced objects ('The Son of Man')",
    "Multiplying figures in grid-like arrangements ('Golconda')",
    "Transforming facial features into uncanny objects ('The Rape')",
    "Fusing figures with background elements ('The Therapist')",
    "Shrouding heads with cloth or drapery ('The Lovers')",
    "Isolating figures in empty, infinite spaces ('The Month of the Grape Harvest')",
    "Merging portrait and landscape/skyscape ('The Happy Donor')",
    "Repeating motifs across a series ('The Dominion of Light')",
    "Fragmenting and recomposing the body ('The Eternally Obvious')",
    "Juxtaposing day and night, interior and exterior ('Time Transfixed')",
    "Paradoxical object placement to create cognitive dissonance",
    "Metaphysical flattening of space to suggest timeless unreality",
    "Symbolic framing with windows, doors, and curtains",
    "Conceptual staging of philosophical and existential themes",
    "Geometric precision and architectural structuring of space",
    "Surreal scale juxtapositions and relative size distortions",
    "Dramatic frontality and confrontational central subject",
    "Symmetrical balancing and mirroring of compositional elements",
    "Visual puns, double meanings, and semiotic slippage",
    "Poetic arrangement of objects in evocative constellations"
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
    // Key aspects of Magritte's style in portrait works
    "Magritte's absolute precision and pristine execution",
    "Perfectly flat, shadowless rendering of all surfaces",
    "Crystal-clear edge definition and razor-sharp details",
    "Pure, unmodulated color fields with no blending or shading",
    "Photographic clarity and machine-like reproducibility",
    "Total elimination of any visible brushwork or texture",
    "Timeless, enigmatic staging with no period references",
    "Metaphysical flattening of space and perspective",
    "Conceptual emphasis on philosophical and existential themes",
    "Poetic juxtaposition and symbolic arrangement of objects",
    "Geometric precision and architectural structuring of composition",
    "Surreal distortions of scale and relative sizes",
    "Confrontational frontality and centrality of subject",
    "Symmetrical balancing and mirroring of elements",
    "Visual paradoxes, double meanings, and cognitive dissonance",
    "Uncanny transformations and fusions of figures and objects",
    "Displacement and dislocation of expected realities",
    "Tension between hyperrealism and oneiric surrealism",
    "Sense of mystery, ambiguity, and metaphysical resonance",
    "Absolute mastery of technique in service of concept"
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
    "The Treachery of Images (1929) - 'This is not a pipe' inscription",
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

    // Update logging to show selected style configuration
    console.log(`\n🎨 ${selectedCategory.replace('magritte_', '').replace('_', ' ')} Style Configuration:`);
    console.log('- Style emphasis:', project.artDirection.styleEmphasis.slice(0, 3).join(', '));
    console.log('- Color palette:', project.artDirection.colorPalette.slice(0, 3).join(', '));
    
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