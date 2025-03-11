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
    "Empire of Light series (1953-54) technique: Tesla Superchargers under impossible day-night skies",
    "Time Transfixed (1938) approach: Bitcoin transactions emerging from Tesla ports like Magritte's locomotive",
    "The Human Condition series (1933-35) style: Tesla screens showing landscapes that perfectly continue beyond their frames",
    "Son of Man (1964) treatment: Model S obscured by floating Bitcoin blocks with Magritte's perfect shadows",
    "The Treachery of Images series (1929) concept: Tesla interfaces with paradoxical text about cryptocurrency",
    "Golconda (1953) multiplication: identical Tesla key cards raining against architectural grid",
    "The False Mirror (1929) technique: Cybertruck headlight containing infinite blockchain space",
    
    // Specific Magritte Painting Techniques
    "La Belle Captive (1931) approach: Tesla windshield as canvas-within-canvas showing impossible landscapes",
    "The Listening Room (1952) scale play: giant Bitcoin mining rig filling tiny Magritte interior",
    "The Blank Signature (1965) technique: horse-rider silhouette made of flowing blockchain data",
    "The Central Story (1928) style: Tesla components floating in pure gradient sky",
    "The Six Elements (1929) fragmentation: Model 3 divided into surreal painted segments",
    "Memory of a Journey (1955) technique: recursive Tesla doorways leading to mining operations",
    "The Beautiful Relations (1963) approach: charging cables transforming into Magritte's branches",
    
    // Magritte's Philosophical Devices
    "The Key to Dreams (1930) word-image relationships: Tesla parts with contradictory blockchain labels",
    "Personal Values (1952) scale distortion: giant Bitcoin nodes dwarfing Model S interior",
    "The Forbidden Universe (1943) doubling: twin Cybertrucks in impossible mirror arrangement",
    "The Explanation (1952) symbolic objects: Tesla yoke transformed into Magritte's symbolic forms",
    "The Beautiful World (1962) transformation: charging port flowering into Bitcoin transactions",
    "The Art of Living (1967) repetition: Tesla Powerwalls in Magritte's grid patterns",
    "The Mysteries of the Horizon (1955) multiplication: multiple Magritte moons above Supercharger",
    
    // Signature Magritte Elements
    "The Victory (1939) technique: Tesla surfaces painted with Magritte's stone-like flatness",
    "The Dominion of Light (1948) lighting: impossible day-night illumination of charging stations",
    "The Collective Invention (1934) hybridization: Tesla-Bitcoin metamorphosis forms",
    "The Palace of Curtains (1929) trompe l'oeil: painted curtains revealing Model X displays",
    "The Pilgrim (1966) composition: lone Tesla in Magritte's desolate landscape",
    "The Ladder of Fire (1939) transformation: charging cable becoming flame-like Bitcoin flow",
    "The Fair Captive (1947) framing: Model S viewed through Magritte's painted frame"
  ],
  visualElements: [
    // Classic Magritte Paradoxes with Tesla
    "bowler-hatted figures with Tesla touchscreen faces (from The Son of Man)",
    "floating rocks replaced by hovering Cybertrucks (from Castle of the Pyrenees)",
    "Magritte's pipe emitting Bitcoin transactions (from The Treachery of Images)",
    "billowing curtains revealing Tesla mining operations (from The Voice of Blood)",
    "mirrors reflecting impossible Tesla charging scenes (from Reproduction Prohibited)",
    "windows showing contradictory Tesla landscapes (from The Human Condition)",
    "birds morphing into Tesla components (from The Large Family)",
    "Tesla door handles painted as Magritte's lips (from The Beautiful Prisoner)",
    "Cybertruck windows that are actually painted skies (from The Key of Dreams)",
    "Model S headlights containing miniature suns (from The Light of Coincidence)",
    
    // Magritte's Image-Within-Image with Tesla
    "Tesla screen displaying exact view behind it like Magritte's easel (from The Human Condition)",
    "Supercharger station containing its own infinite reflection (from Not to be Reproduced)",
    "Model 3 dashboard showing impossible Bitcoin landscapes (from The Domain of Arnheim)",
    "charging port revealing deep space vista (from The Universe Unmasked)",
    "side mirrors showing different times of day (from The Dominion of Light)",
    "Tesla app interface containing real clouds (from The Perfect Image)",
    "Autopilot display continuing the road beyond its frame (from Evening Falls)",
    "vehicle windows as portals to other Magritte paintings (from The Living Mirror)",
    
    // Magritte's Scale Distortions
    "gigantic Tesla key card dominating tiny city (from Personal Values)",
    "microscopic Supercharger network floating in vast sky (from The Lost Jockey)",
    "enormous Bitcoin symbol eclipsing the sun (from The Banquet)",
    "Model X dwarfed by colossal charging cable (from The Anniversary)",
    "tiny Tesla factories inside full-size Powerwall (from The Six Elements)",
    "massive Autopilot icon as architectural element (from Megalomania)",
    "planet-sized Tesla logo in intimate room (from The Listening Room)",
    "miniature mining rigs arranged on giant bowler hat (from The Happy Donor)",
    
    // Magritte's Metamorphosis Elements
    "Tesla wheels transforming into clockfaces (from Time Transfixed)",
    "charging cables becoming liquid silver (from The Waterfall)",
    "Cybertruck edges dissolving into birds (from The Large Family)",
    "Model S body flowing into ocean waves (from The Wonders of Nature)",
    "Bitcoin nodes growing like crystal formations (from The Gradation of Fire)",
    "Supercharger stations sprouting like trees (from The Blank Signature)",
    "Tesla seats morphing into clouds (from The Central Story)",
    "dashboard controls becoming musical notes (from The Alphabet of Revelations)",
    
    // Magritte's Impossible Juxtapositions
    "Tesla factory interior filled with forest (from The Blank Check)",
    "Supercharger station underwater but perfectly dry (from The Summer Steps)",
    "Model S floating in space but casting ground shadow (from The Victory)",
    "Bitcoin mining rigs made of glass containing sky (from The Future of Statues)",
    "charging cables knitted like wool (from The Red Model)",
    "Tesla screen showing what's behind the viewer (from Portrait of Edward James)",
    "Autopilot cameras seeing yesterday (from Memory of a Journey)",
    "vehicle interior bigger than exterior (from The Forbidden Universe)",
    
    // Magritte's Trompe l'oeil Techniques
    "Tesla door that's actually painted on wall (from The Victory)",
    "Bitcoin interface revealing real space behind wall (from The Human Condition II)",
    "Supercharger cable emerging from painted outlet (from Time Transfixed)",
    "Model 3 casting shadow of different car (from The Mysteries of the Horizon)",
    "charging station that's actually reflection of nothing (from The False Mirror)",
    "vehicle panel gaps revealing infinite depth (from The Kiss)",
    "Autopilot screen continuing exact landscape but at night (from Empire of Light)",
    "Tesla logo that's actually hole in canvas (from The Two Mysteries)",
    
    // Magritte's Recurring Motifs Applied
    "bowler hats raining inside Tesla cabin (from Golconda)",
    "green apples replacing all charging indicators (from The Son of Man)",
    "curtains of Bitcoin code revealing/concealing car (from The Voice of Blood)",
    "Tesla interior filled with Belgian sky (from The Dominion of Light)",
    "Model S composed entirely of cloud fragments (from The Battle of the Argonne)",
    "Cybertruck angles containing nested paintings (from Euclidean Walks)",
    "charging stations playing Magritte's musical notes (from The Alphabet of Revelations)",
    "Tesla autopilot seeing through Magritte's eye (from The False Mirror)",
    
    // Pure Magritte Painting Techniques
    "unmodulated color fields on Tesla surfaces (from The Listening Room)",
    "perfect edge definition on Cybertruck angles (from The Menaced Assassin)",
    "flat oil paint treatment of screens (from The Physical Possibilities of Thought)",
    "simplified geometric forms of charging equipment (from The Six Elements)",
    "pure painted shadows under floating Teslas (from The Dominion of Light)",
    "matte finish on all technological surfaces (from The Blank Page)",
    "precise trompe l'oeil effects on Bitcoin interfaces (from The Human Condition)",
    "absolute flatness in metallic surfaces (from The Ready-Made Bouquet)"
  ],
  colorPalette: [
    // Magritte's Sky and Atmosphere Colors
    "Empire of Light day sky blue (RGB: 135, 206, 235)",
    "Empire of Light night blue (RGB: 25, 25, 112)",
    "The Dominion of Light twilight purple (RGB: 46, 39, 57)",
    "The Voice of Space deep cosmos blue (RGB: 15, 15, 48)",
    "The Curse celestial azure (RGB: 89, 147, 193)",
    "The False Mirror iris blue (RGB: 70, 130, 180)",
    "Memory cloud white (RGB: 245, 245, 245)",
    "The Great War storm grey (RGB: 112, 128, 144)",
    
    // Magritte's Architectural Colors
    "Golconda building cream (RGB: 255, 253, 208)",
    "The Empire of Light facade grey (RGB: 169, 169, 169)",
    "Castle of the Pyrenees stone brown (RGB: 139, 131, 120)",
    "Personal Values wall beige (RGB: 245, 245, 220)",
    "The Human Condition window frame brown (RGB: 101, 67, 33)",
    "The Listening Room interior ochre (RGB: 204, 119, 34)",
    "The Secret Player stage grey (RGB: 105, 105, 105)",
    "The Annunciation marble white (RGB: 255, 253, 250)",
    
    // Magritte's Natural Elements
    "Son of Man apple green (RGB: 34, 139, 34)",
    "The Great War leaf green (RGB: 85, 107, 47)",
    "The Blank Signature grass green (RGB: 124, 252, 0)",
    "The Beautiful World rose red (RGB: 180, 20, 40)",
    "The Return bird blue (RGB: 135, 206, 250)",
    "The Central Story branch brown (RGB: 139, 69, 19)",
    "The Flowers of Evil blood red (RGB: 139, 0, 0)",
    "The Large Family tree green (RGB: 34, 139, 34)",
    
    // Magritte's Object Colors
    "The Treachery of Images pipe brown (RGB: 139, 69, 19)",
    "Time Transfixed locomotive black (RGB: 28, 28, 28)",
    "Personal Values comb gold (RGB: 255, 215, 0)",
    "The Son of Man bowler hat black (RGB: 25, 25, 25)",
    "The Victory stone grey (RGB: 128, 128, 128)",
    "The Key of Dreams mirror silver (RGB: 192, 192, 192)",
    "The Mysteries of the Horizon bowler brown (RGB: 92, 64, 51)",
    "The Ready-Made Bouquet vase blue (RGB: 65, 105, 225)",
    
    // Magritte's Atmospheric Effects
    "The Dominion of Light lamplight yellow (RGB: 255, 244, 224)",
    "Empire of Light shadow purple (RGB: 48, 25, 52)",
    "The Human Condition cloud shadow (RGB: 119, 136, 153)",
    "The Voice of Blood curtain shadow (RGB: 47, 79, 79)",
    "The Gradation of Fire flame orange (RGB: 226, 88, 34)",
    "Pandora's Box mist grey (RGB: 200, 200, 200)",
    "The Six Elements air blue (RGB: 176, 196, 222)",
    "The Future of Statues moonlight blue (RGB: 230, 230, 250)",
    
    // Tesla Colors in Magritte Style
    "Tesla pearl white (painted flat as The Promise clouds) (RGB: 255, 255, 250)",
    "Tesla deep blue metallic (unmodulated as The False Mirror) (RGB: 70, 130, 180)",
    "Tesla red multi-coat (pure as The Beautiful World rose) (RGB: 180, 20, 40)",
    "Tesla solid black (matte as Time Transfixed) (RGB: 28, 28, 28)",
    "Tesla silver (flat as The Victory stone) (RGB: 192, 192, 192)",
    "Tesla chrome delete (pure as Golconda shadows) (RGB: 47, 79, 79)",
    "Tesla glass (painted as Empire of Light windows) (RGB: 176, 196, 222)",
    "Tesla interior black (matte as The Son of Man suit) (RGB: 25, 25, 25)",
    
    // Bitcoin Elements in Magritte Style
    "Bitcoin orange (flat as The Gradation of Fire) (RGB: 226, 88, 34)",
    "Blockchain blue (pure as The Voice of Space) (RGB: 15, 15, 48)",
    "Node green (unmodulated as The Great War leaves) (RGB: 85, 107, 47)",
    "Lightning purple (matte as Memory of a Journey) (RGB: 46, 39, 57)",
    "Mining rig grey (flat as Personal Values metal) (RGB: 169, 169, 169)",
    "Crypto gold (pure as Personal Values mirror) (RGB: 255, 215, 0)",
    "Transaction blue (painted as The False Mirror iris) (RGB: 70, 130, 180)",
    "Wallet black (matte as The Key of Dreams night) (RGB: 25, 25, 112)"
  ],
  compositionGuidelines: [
    // Belgian Surrealist Compositional Principles with Tesla Elements
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
  moodAndTone: "Create a deeply surreal and metaphysical atmosphere drawing from the Belgian Surrealist tradition, where modern Tesla technology becomes mysterious through paradoxical placement and symbolic resonance. Blend Magritte's precise execution, Delvaux's dreamy atmosphere, Baes's mysticism, Mariën's object poetry, Graverol's metamorphoses, Nougé's conceptual approach, and Broodthaers's institutional critique.",
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

// Define modern Tesla colors with specific model references
const TESLA_COLOR_PALETTE = {
  exteriors: {
    pearlWhite: {
      color: "Pearl White Multi-Coat",
      reference: "Model S/3/X/Y (2020+)",
      usage: "Main vehicle color"
    },
    midnightSilver: {
      color: "Midnight Silver Metallic",
      reference: "Model S/3/X/Y (2020+)",
      usage: "Premium exterior option"
    },
    deepBlue: {
      color: "Deep Blue Metallic",
      reference: "Model S/3/X/Y (2020+)",
      usage: "Premium exterior option"
    }
  },
  interiors: {
    black: {
      color: "Premium Black",
      reference: "Model S/3/X/Y (2020+)",
      usage: "Interior trim and seats"
    },
    white: {
      color: "Ultra White",
      reference: "Model S/3/X/Y (2020+)",
      usage: "Premium interior option"
    }
  },
  displays: {
    screen: {
      color: "Tesla UI Black",
      reference: "Model S/3/X/Y (2020+)",
      usage: "Display elements"
    }
  }
}; 