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
  modelConfig?: {
    prompt_prefix: string;
    prompt_suffix: string;
    negative_prompt: string;
    num_inference_steps: number;
    guidance_scale: number;
    style_emphasis?: {
      [key: string]: number;
    };
  };
  MargritteContext?: {
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
  };
}

// Define the default art direction
const artDirection: ArtDirection = {
  styles: {
    magritte: {
      styleEmphasis: [
        "surrealistComposition",
        "meticulousPainting",
        "enigmaticElements",
        "symbolicJuxtaposition",
        "dreamlikeAtmosphere",
        "perfectMatteFinish",
        "crystalClearEdges",
        "pureColorFields",
        "sourcelessIllumination",
        "paradoxicalScenes",
        "floatingElements",
        "geometricForms",
        "mysteriousComposition",
        "symbolicElements",
        "visualTension"
      ],
      visualElements: [
        "floatingObjects",
        "geometricForms",
        "symbolicElements",
        "mysteriousComposition",
        "paradoxicalScenes",
        "bowlerHat",
        "pipe",
        "greenApple",
        "cloudySky",
        "floatingRocks",
        "mirrorReflections",
        "wordPaintings",
        "hiddenFaces",
        "impossiblePerspectives",
        "visualParadoxes"
      ],
      colorPalette: [
        "#1E90FF", // Magritte's signature cerulean blue
        "#000080", // Deep navy blue
        "#F5F5F5", // Pure white porcelain
        "#2F4F4F", // Dark slate grey
        "#006400", // Deep forest green
        "#004225", // Dark emerald
        "#228B22", // Forest green
        "#87CEEB", // Light sky blue
        "#D3D3D3", // Light grey
        "#E0E0E0"  // Light grey
      ],
      compositionGuidelines: [
        "perfectlySmoothMatteFinish",
        "crystalClearEdgeDefinition",
        "pureUnmodulatedColorFields",
        "sourcelessPerfectIllumination",
        "cleanEnigmaticComposition",
        "preciseGeometricForms",
        "balancedVisualElements",
        "paradoxicalArrangement",
        "mysteriousAtmosphere",
        "symbolicJuxtaposition"
      ],
      moodAndTone: "mysterious and enigmatic with a focus on surrealist juxtaposition and visual paradox",
      modelConfig: {
        prompt_prefix: "Create in the surrealist style of René Magritte, with ",
        prompt_suffix: ". Emphasize perfectly smooth matte finish, crystal clear edge definition, pure unmodulated color fields, and sourceless perfect illumination. Include surrealist juxtaposition and enigmatic composition. Use Magritte's signature cerulean blue sky and meticulous painting technique.",
        negative_prompt: "photorealistic, 3D rendered, CGI, digital art, harsh lighting, dark themes, anime style, cartoon style, watercolor, hand-drawn, sketchy, rough edges, Studio Margritte, animation, whimsical, cute, fantasy",
        num_inference_steps: 50,
        guidance_scale: 12.0,
        style_emphasis: {
          surrealistComposition: 0.95,
          meticulousPainting: 0.95,
          enigmaticElements: 0.90,
          symbolicJuxtaposition: 0.90,
          dreamlikeAtmosphere: 0.90,
          perfectMatteFinish: 0.95,
          crystalClearEdges: 0.95,
          pureColorFields: 0.90,
          sourcelessIllumination: 0.90,
          paradoxicalScenes: 0.90
        }
      }
    }
  },
  defaultStyle: "magritte"
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
  
  // Always use Margritte prefix and force Margritte style
  const prefix = 'Margritte';
  const categoryFileName = `${prefix}_classic.json`;
  const categoryFilePath = path.join(process.cwd(), categoryFileName);
  
  const categoryArtDirection = loadArtDirectionFromFile(categoryFilePath);
  if (categoryArtDirection) {
    console.log(`Loaded Margritte art direction from ${categoryFileName}`);
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

// Define portrait-specific categories for PFP series
const MargritteCategories = [
  // Adventure Series
  'bear_pfp_pilot',          // Vintage aviator with leather jacket
  'bear_pfp_surfer',         // Retro surf culture with board
  'bear_pfp_snowboarder',    // Winter sports with goggles
  'bear_pfp_mountaineer',    // Alpine explorer with ice axe
  'bear_pfp_sailor',         // Maritime adventurer with peacoat
  'bear_pfp_skater',         // Vintage skateboard culture
  'bear_pfp_cyclist',        // Classic cycling with cap
  'bear_pfp_diver',          // Vintage scuba with brass helmet
  'bear_pfp_racer',          // Classic motorsport with leather
  'bear_pfp_climber',        // Rock climbing with rope
  'bear_pfp_astronaut',      // Space explorer with helmet
  'bear_pfp_speleologist',   // Cave explorer with headlamp
  'bear_pfp_wingsuit',       // Wingsuit flyer with gear
  'bear_pfp_kayaker',        // Whitewater adventurer
  'bear_pfp_paraglider',     // Paragliding enthusiast
  'bear_pfp_arctic',         // Arctic explorer with fur hood
  'bear_pfp_desert',         // Desert adventurer with shemagh
  'bear_pfp_jungle',         // Jungle explorer with pith helmet
  'bear_pfp_volcano',        // Volcanologist with heat suit
  'bear_pfp_submarine',      // Submarine captain with periscope
  'bear_pfp_highaltitude',   // High-altitude mountaineer with oxygen mask
  'bear_pfp_deepcave',       // Deep cave explorer with specialized gear
  'bear_pfp_polardiver',     // Under-ice diving specialist
  'bear_pfp_sandboarder',    // Desert dune sandboarding expert
  'bear_pfp_glaciologist',   // Glacier research specialist
  'bear_pfp_volcanoboard',   // Volcano boarding enthusiast
  'bear_pfp_canyoneer',      // Technical canyon descent expert
  'bear_pfp_iceclimber',     // Ice climbing specialist
  'bear_pfp_avalanche',      // Avalanche research expert
  'bear_pfp_desertexplor',   // Deep desert expedition leader
  'bear_pfp_jungleroute',    // Jungle route finder
  'bear_pfp_cavephotog',     // Cave photography specialist
  'bear_pfp_polarnight',     // Polar night explorer
  'bear_pfp_tropicstorm',    // Tropical storm chaser
  'bear_pfp_tidepools',      // Extreme tide pool researcher
  'bear_pfp_geothermal',     // Geothermal vent explorer
  'bear_pfp_desertarch',     // Desert archaeology specialist
  'bear_pfp_rainforest',     // Rainforest canopy researcher
  'bear_pfp_permafrost',     // Permafrost research expert
  'bear_pfp_seamount',       // Underwater seamount explorer
  'bear_pfp_polarlights',    // Aurora research specialist
  'bear_pfp_desertnight',    // Night desert navigator
  'bear_pfp_cavebio',        // Cave biology researcher
  'bear_pfp_glacierarch',    // Glacier archaeology expert
  'bear_pfp_volcanogas',     // Volcanic gas researcher
  'bear_pfp_junglemed',      // Jungle medicine explorer
  'bear_pfp_polarbot',       // Polar robotics specialist
  'bear_pfp_cavewater',      // Underground river explorer
  'bear_pfp_desertbot',      // Desert robotics expert
  'bear_pfp_junglearch',     // Lost city archaeology specialist
  
  // Artistic Series
  'bear_pfp_painter',        // Artist with beret and palette
  'bear_pfp_sculptor',       // Sculptor with chisel and smock
  'bear_pfp_photographer',   // Classic camera and dark room coat
  'bear_pfp_musician',       // Jazz player with instrument
  'bear_pfp_poet',          // Bohemian writer with notebook
  'bear_pfp_dancer',        // Ballet with classic tutu
  'bear_pfp_architect',     // Modernist with drafting tools
  'bear_pfp_filmmaker',     // Director with vintage camera
  'bear_pfp_designer',      // Fashion designer with measuring tape
  'bear_pfp_printmaker',    // Printmaker with ink-stained apron
  'bear_pfp_glassblower',   // Glass artist with tools
  'bear_pfp_ceramicist',    // Pottery artist with clay
  'bear_pfp_muralist',      // Street artist with spray cans
  'bear_pfp_weaver',        // Textile artist with loom
  'bear_pfp_jeweler',       // Jewelry maker with gems
  'bear_pfp_origami',       // Paper artist with creations
  'bear_pfp_calligrapher',  // Calligrapher with brushes
  'bear_pfp_puppeteer',     // Puppet master with marionettes
  'bear_pfp_mosaic',        // Mosaic artist with tiles
  'bear_pfp_neon',          // Neon artist with glass tubes
  'bear_pfp_performance',   // Performance artist with props
  'bear_pfp_textile',       // Textile art innovator
  'bear_pfp_digital',       // Digital art pioneer
  'bear_pfp_conceptual',    // Conceptual art theorist
  'bear_pfp_installation',  // Installation art creator
  'bear_pfp_mixedmedia',    // Mixed media explorer
  'bear_pfp_landart',       // Land art sculptor
  'bear_pfp_soundart',      // Sound installation artist
  'bear_pfp_videoart',      // Video art pioneer
  'bear_pfp_newmedia',      // New media innovator
  'bear_pfp_archivist',     // Art preservation specialist
  'bear_pfp_curator',       // Gallery curator with white gloves
  'bear_pfp_arthistorian',  // Art history scholar
  'bear_pfp_conservator',   // Art conservation expert
  'bear_pfp_gallerist',     // Gallery owner with catalog
  'bear_pfp_artcritic',     // Art critic with notebook
  'bear_pfp_collector',     // Art collector with portfolio
  'bear_pfp_restorer',      // Art restoration specialist
  'bear_pfp_appraiser',     // Art valuation expert
  'bear_pfp_dealer',        // Fine art dealer with documents
  
  // Contemporary Art Forms
  'bear_pfp_nftartist',     // NFT art creator
  'bear_pfp_cryptoart',     // Cryptocurrency art pioneer
  'bear_pfp_aicollab',      // AI art collaborator
  'bear_pfp_vrartist',      // Virtual reality artist
  'bear_pfp_hologram',      // Holographic art creator
  'bear_pfp_bioart',        // Biological art innovator
  'bear_pfp_generative',    // Generative art coder
  'bear_pfp_roboticart',    // Robotic art engineer
  'bear_pfp_datavis',       // Data visualization artist
  'bear_pfp_augmented',     // Augmented reality creator
  
  // Blockchain & Web3 Art Forms
  'bear_pfp_defi',          // DeFi trader with charts and tokens
  'bear_pfp_dao',           // DAO governance participant
  'bear_pfp_hodler',        // Long-term crypto hodler
  'bear_pfp_miner',         // Crypto mining operator
  'bear_pfp_validator',     // Blockchain validator/staker
  'bear_pfp_tokenomics',    // Tokenomics designer
  'bear_pfp_dapp',          // Decentralized app developer
  'bear_pfp_metaverse',     // Metaverse architect
  'bear_pfp_onchain',       // On-chain data analyst
  'bear_pfp_smartcontract', // Smart contract developer
  'bear_pfp_tradfi',        // TradFi to crypto bridge
  
  // Experimental Art Forms
  'bear_pfp_lightart',      // Light installation artist
  'bear_pfp_kinetic',       // Kinetic sculpture creator
  'bear_pfp_interactive',   // Interactive art designer
  'bear_pfp_timebase',      // Time-based media artist
  'bear_pfp_ecological',    // Ecological art innovator
  'bear_pfp_biofeedback',   // Biofeedback art pioneer
  'bear_pfp_quantum',       // Quantum art experimenter
  'bear_pfp_nanoart',       // Nano-scale art creator
  'bear_pfp_spaceart',      // Space art pioneer
  'bear_pfp_weatherart',    // Weather system artist
  
  // Hipster Series
  'bear_pfp_barista',       // Coffee artisan with apron
  'bear_pfp_vinylista',     // Record collector with headphones
  'bear_pfp_craftbrewer',   // Craft beer maker with hops
  'bear_pfp_botanist',      // Plant enthusiast with terrarium
  'bear_pfp_mixologist',    // Cocktail creator with shaker
  'bear_pfp_vintage',       // Antique collector with monocle
  'bear_pfp_bookshop',      // Independent bookstore owner
  'bear_pfp_foodie',        // Gastronome with tasting spoon
  'bear_pfp_cyclist_fixed', // Fixed gear bike messenger
  'bear_pfp_artisanal',     // Artisanal craftsperson
  'bear_pfp_zerowaste',     // Sustainable living enthusiast
  'bear_pfp_apiarist',      // Urban beekeeper with hive
  'bear_pfp_fermentation',  // Fermentation specialist
  'bear_pfp_herbalist',     // Herbal medicine maker
  'bear_pfp_vinyl_dj',      // Vinyl DJ with turntables
  'bear_pfp_teasmith',      // Tea ceremony master
  'bear_pfp_chocolatier',   // Artisanal chocolate maker
  'bear_pfp_forager',       // Urban foraging expert
  'bear_pfp_perfumer',      // Natural perfume creator
  'bear_pfp_tintype',       // Vintage photography artist
  
  // New Hipster Series Additions
  'bear_pfp_sourdough',     // Artisanal bread baker
  'bear_pfp_coffeegeek',    // Coffee science enthusiast
  'bear_pfp_vintagepen',    // Fountain pen collector
  'bear_pfp_printmaker',    // Traditional printmaking artist
  'bear_pfp_indigo',        // Natural dye specialist
  'bear_pfp_leathercraft',  // Traditional leather worker
  'bear_pfp_bookrestore',   // Book restoration expert
  'bear_pfp_typewriter',    // Vintage typewriter enthusiast
  'bear_pfp_bonsai',        // Bonsai cultivation master
  'bear_pfp_vintagebike',   // Classic bicycle restorer
  
  // Contemporary Craft Series
  'bear_pfp_smallbatch',    // Small-batch goods maker
  'bear_pfp_slowfood',      // Slow food movement chef
  'bear_pfp_naturaldye',    // Natural textile dyer
  'bear_pfp_handbound',     // Hand-bound journal maker
  'bear_pfp_woodtype',      // Wood type printing expert
  'bear_pfp_herbalbar',     // Botanical cocktail creator
  'bear_pfp_seedsaver',     // Heritage seed collector
  'bear_pfp_cheesemaker',   // Artisanal cheese crafter
  'bear_pfp_knifesmith',    // Custom knife maker
  'bear_pfp_ceramicist',    // Studio pottery artist
  
  // Urban Homesteading Series
  'bear_pfp_urbanfarm',     // City farming specialist
  'bear_pfp_preserving',    // Food preservation expert
  'bear_pfp_herbgarden',    // Medicinal herb gardener
  'bear_pfp_rainwater',     // Water harvesting expert
  'bear_pfp_composting',    // Urban composting specialist
  'bear_pfp_soapmaker',     // Natural soap artisan
  'bear_pfp_candlemaker',   // Beeswax candle crafter
  'bear_pfp_fiberspinner',  // Natural fiber artist
  'bear_pfp_meadmaker',     // Artisanal mead brewer
  'bear_pfp_wildcrafted',   // Wild plant harvester
  
  // Modern Maker Series
  'bear_pfp_analogsynth',   // Analog synthesizer builder
  'bear_pfp_modular',       // Modular electronics creator
  'bear_pfp_vintagecam',    // Camera restoration expert
  'bear_pfp_vinylpress',    // Custom vinyl presser
  'bear_pfp_tapelabel',     // Cassette label curator
  'bear_pfp_zinemaker',     // Independent zine publisher
  'bear_pfp_patchmaker',    // Embroidered patch designer
  'bear_pfp_pinmaker',      // Enamel pin creator
  'bear_pfp_stickermake',   // Artisanal sticker maker
  'bear_pfp_riso',          // Risograph print artist
  
  // Sustainable Living Series
  'bear_pfp_repaircafe',    // Repair cafe specialist
  'bear_pfp_thriftcore',    // Creative thrifting expert
  'bear_pfp_upcycler',      // Creative materials reuser
  'bear_pfp_minimalist',    // Mindful minimalist
  'bear_pfp_packagefree',   // Zero-waste shop owner
  'bear_pfp_clothingfix',   // Garment repair specialist
  'bear_pfp_toolfixer',     // Tool restoration expert
  'bear_pfp_furnitureup',   // Furniture upcycling artist
  'bear_pfp_ecofashion',    // Sustainable fashion designer
  'bear_pfp_swapshop',      // Item exchange curator
  
  // Additional Adventure Types
  'bear_pfp_balloonist',      // Hot air balloon explorer
  'bear_pfp_polar',          // Polar expedition leader
  'bear_pfp_treasure',        // Treasure hunter with map
  'bear_pfp_safari',          // Safari explorer with binoculars
  'bear_pfp_deep_sea',        // Deep sea explorer
  
  // Additional Artistic Types
  'bear_pfp_lithographer',    // Stone printing artist
  'bear_pfp_etcher',          // Etching plate artist
  'bear_pfp_woodblock',        // Woodblock print master
  'bear_pfp_fresco',            // Fresco painter with tools
  'bear_pfp_miniature',        // Miniature painting artist
  
  
  // New Adventure Series Additions
  'bear_pfp_freediver',     // Freediving explorer with monofin
  'bear_pfp_highliner',     // Highline walker with slackline
  'bear_pfp_caver',         // Cave exploration specialist
  'bear_pfp_packrafter',    // Packraft wilderness explorer
  'bear_pfp_alpinist',      // Alpine climbing specialist
  'bear_pfp_skitourer',     // Backcountry ski explorer
  'bear_pfp_trailrunner',   // Ultra trail running expert
  'bear_pfp_iceclimber',    // Ice climbing specialist
  'bear_pfp_wavesurfer',    // Big wave surfing expert
  'bear_pfp_skyrunner',     // Mountain running specialist
  
  // New Artistic Series Additions
  'bear_pfp_soundartist',   // Sound installation artist
  'bear_pfp_bioartist',     // Biological art creator
  'bear_pfp_lightartist',   // Light installation designer
  'bear_pfp_dataartist',    // Data visualization artist
  'bear_pfp_kinetic',       // Kinetic sculpture artist
  'bear_pfp_hologram',      // Holographic art creator
  'bear_pfp_projection',    // Projection mapping artist
  'bear_pfp_augmented',     // Augmented reality artist
  'bear_pfp_generative',    // Generative art creator
  'bear_pfp_installation',  // Installation art specialist
  
  // New Hipster Series Additions
  'bear_pfp_mycologist',    // Mushroom foraging expert
  'bear_pfp_vintagegame',   // Vintage game collector
  'bear_pfp_analogphoto',   // Analog photography artist
  'bear_pfp_ceramicist',    // Modern ceramics artist
  'bear_pfp_zinemaker',     // Independent zine creator
  'bear_pfp_synthwave',     // Synthwave music producer
  'bear_pfp_hydroponics',   // Urban hydroponic farmer
  'bear_pfp_letterpress',   // Letterpress print artist
  'bear_pfp_streetwear',    // Vintage streetwear curator
  
  // Additional Adventure Series
  'bear_pfp_bouldering',    // Boulder climbing specialist
  'bear_pfp_slackliner',    // Slackline balance artist
  'bear_pfp_wingfoiler',    // Wing foiling water sport
  'bear_pfp_speedflyer',    // Speed flying adrenaline
  'bear_pfp_iceswimmer',    // Ice swimming expert
  'bear_pfp_canyoneer',     // Canyon exploration expert
  'bear_pfp_snowkiter',     // Snow kiting adventurer
  'bear_pfp_hydrofoiler',   // Hydrofoil board rider
  'bear_pfp_skydancer',     // Aerial dance performer
  'bear_pfp_coasteer',      // Coastal adventure explorer
  
  // Additional Artistic Series
  'bear_pfp_cryptoartist',  // Blockchain art creator
  'bear_pfp_biofeedback',   // Biofeedback art pioneer
  'bear_pfp_neuralart',     // Neural network artist
  'bear_pfp_fractalmaker',  // Fractal art designer
  'bear_pfp_glitchartist',  // Digital glitch artist
  'bear_pfp_voxelartist',   // Voxel art specialist
  'bear_pfp_aicollab',      // AI collaboration artist
  'bear_pfp_biodesigner',   // Bio-design artist
  'bear_pfp_quantumart',    // Quantum computing artist
  'bear_pfp_4dart',         // 4D art conceptualist
  
  // Additional Hipster Series
  'bear_pfp_solarpunk',     // Solarpunk lifestyle guru
  'bear_pfp_retrotech',     // Retro tech enthusiast
  'bear_pfp_vegancraft',    // Vegan crafts creator
  'bear_pfp_minimalist',    // Extreme minimalist
  'bear_pfp_upcycler',      // Creative upcycling artist
  'bear_pfp_microgreen',    // Microgreens specialist
  'bear_pfp_vinylhunter',   // Rare vinyl hunter
  'bear_pfp_techweaver',    // Tech-integrated textiles
  'bear_pfp_algaelab',      // Algae cultivation artist
  'bear_pfp_soundhunter',   // Field recording artist,
  
  // Additional Adventure Headwear
  "bouldering beanie",
  "slackline balance cap",
  "wing foiling helmet",
  "speedflying aerodynamic helmet",
  "ice swimming cap",
  "canyoneering helmet",
  "snow kiting goggles",
  "hydrofoil racing helmet",
  "aerial dance headpiece",
  "coasteering safety helmet",
  
  // Blockchain & Web3 Headwear
  "crypto trader's LED matrix glasses",
  "bitcoin miner's cooling headset",
  "blockchain developer's AR visor",
  "NFT artist's holographic crown",
  "DAO governance cap with voting indicators",
  "hardware wallet security helmet",
  "DeFi analyst's multi-chart glasses",
  "validator node operator's cooling headband",
  "metaverse explorer's VR headset",
  "smart contract auditor's debugging glasses",
  "web3 hacker's terminal visor",
  "token economist's data crown",
  
  // Additional Artistic Headwear
  "crypto-art visor",
  "biofeedback sensor crown",
  "neural interface headset",
  "fractal projection glasses",
  "glitch effect visor",
  "voxel creator headset",
  "AI collaboration interface",
  "bio-design protective mask",
  "quantum computing glasses",
  "4D visualization headset",
  
  // Additional Hipster Headwear
  "solarpunk crystal crown",
  "vintage tech headphones",
  "sustainable fiber cap",
  "minimalist design hat",
  "upcycled material headband",
  "microgreen grower's cap",
  "vinyl collector's headphones",
  "tech-weave beanie",
  "algae lab protective cap",
  "field recording headphones",
  
  // Hipster Headwear
  "barista's flat cap",
  "vintage fedora",
  "craft brewer's beanie",
  "botanical sun hat",
  "mixologist's newsboy cap",
  "antique collector's cap",
  "bookshop reading glasses",
  "gastronome's tasting cap",
  "fixed gear cycling cap",
  "artisan's work cap",
  
  // New Hipster Headwear
  "sourdough baker's linen cap",
  "coffee scientist's tasting cap",
  "fountain pen collector's visor",
  "printmaker's protective cap",
  "natural dyer's bandana",
  "leatherworker's craftsman cap",
  "book restorer's magnifying visor",
  "typewriter enthusiast's vintage cap",
  "bonsai master's sun hat",
  "bicycle restorer's workshop cap",
  
  // Contemporary Craft Headwear
  "small-batch maker's bandana",
  "slow food chef's toque",
  "natural dye artist's head wrap",
  "bookbinder's work cap",
  "wood type printer's visor",
  "botanical mixologist's cap",
  "seed collector's field hat",
  "cheesemaker's hygiene cap",
  "knifesmith's safety visor",
  "ceramicist's clay-proof cap",
  
  // Urban Homesteading Headwear
  "urban farmer's straw hat",
  "food preserver's hair net",
  "herb gardener's sun visor",
  "rainwater collector's cap",
  "compost specialist's bandana",
  "soap maker's protective cap",
  "candle crafter's work cap",
  "fiber artist's weaving band",
  "mead maker's brewing cap",
  "foraging expert's field hat",
  
  // Modern Maker Headwear
  "synth builder's anti-static cap",
  "modular electronics visor",
  "camera repair magnifying cap",
  "vinyl pressing safety cap",
  "tape label curator's beanie",
  "zine maker's creative cap",
  "patch designer's work hat",
  "pin maker's safety glasses",
  "sticker artist's bandana",
  "riso print master's cap",
  
  // Sustainable Living Headwear
  "repair cafe specialist's cap",
  "thrifting expert's vintage hat",
  "upcycler's creative bandana",
  "minimalist's essential cap",
  "zero-waste shop cap",
  "clothing repair visor",
  "tool restoration goggles",
  "furniture upcycler's cap",
  "eco-fashion designer's hat",
  "swap shop curator's beanie"
];

// Function to generate bear PFP concepts in Magritte's style
function generateBearConcept(): string {
  const primaryAccessories = [
    // Adventure Headwear
    "leather aviator cap",
    "vintage ski goggles",
    "maritime captain's hat",
    "classic cycling cap",
    "retro diving helmet",
    "mountaineering beanie",
    "surf culture bandana",
    "skater's vintage helmet",
    "racing leather cap",
    "climber's headlamp",
    "astronaut's space helmet",
    "spelunker's light cap",
    "wingsuit helmet",
    "kayaker's spray skirt",
    "paraglider's helmet",
    
    // Artistic Headwear
    "painter's beret",
    "sculptor's work cap",
    "photographer's visor",
    "conductor's cap",
    "poet's slouch hat",
    "architect's modernist glasses",
    "filmmaker's beret",
    "designer's avant-garde hat",
    "printmaker's bandana",
    "artist's newsboy cap",
    "glassblower's safety visor",
    "ceramicist's work cap",
    "muralist's spray mask",
    "weaver's head wrap",
    "jeweler's loupe headband",
    
    // Hipster Headwear
    "barista's flat cap",
    "vintage fedora",
    "craft brewer's beanie",
    "botanical sun hat",
    "mixologist's newsboy cap",
    "antique collector's cap",
    "bookshop reading glasses",
    "gastronome's tasting cap",
    "fixed gear cycling cap",
    "artisan's work cap",
    "zero waste bandana",
    "beekeeper's hat",
    "fermentation specialist's cap",
    "herbalist's woven hat",
    "vinyl DJ's headphones",
    
    // New Adventure Headwear
    "freediving mask",
    "highliner's balance cap",
    "caver's LED helmet",
    "packrafter's dry cap",
    "alpinist's helmet",
    "ski touring helmet",
    "trail runner's visor",
    "ice climber's helmet",
    "big wave surfer's cap",
    "skyrunner's lightweight cap",
    
    // New Artistic Headwear
    "sound artist's headphones",
    "bioartist's protective visor",
    "light artist's LED crown",
    "data artist's AR glasses",
    "kinetic artist's dynamic hat",
    "hologram artist's visor",
    "projection artist's headset",
    "augmented reality glasses",
    "generative artist's headpiece",
    "installation artist's beret",
    
    // New Hipster Headwear
    "mycologist's foraging cap",
    "vintage gaming headset",
    "analog photographer's cap",
    "ceramicist's work bandana",
    "zinemaker's newsprint cap",
    "synthwave producer's headphones",
    "hydroponic farmer's cap",
    "letterpress printer's visor",
    "kombucha brewer's bandana",
    "streetwear curator's cap",
    
    // Additional Adventure Headwear
    "bouldering beanie",
    "slackline balance cap",
    "wing foiling helmet",
    "speedflying aerodynamic helmet",
    "ice swimming cap",
    "canyoneering helmet",
    "snow kiting goggles",
    "hydrofoil racing helmet",
    "aerial dance headpiece",
    "coasteering safety helmet",
    
    // Blockchain & Web3 Headwear
    "crypto trader's LED matrix glasses",
    "bitcoin miner's cooling headset",
    "blockchain developer's AR visor",
    "NFT artist's holographic crown",
    "DAO governance cap with voting indicators",
    "hardware wallet security helmet",
    "DeFi analyst's multi-chart glasses",
    "validator node operator's cooling headband",
    "metaverse explorer's VR headset",
    "smart contract auditor's debugging glasses",
    "web3 hacker's terminal visor",
    "token economist's data crown",
    
    // Additional Artistic Headwear
    "crypto-art visor",
    "biofeedback sensor crown",
    "neural interface headset",
    "fractal projection glasses",
    "glitch effect visor",
    "voxel creator headset",
    "AI collaboration interface",
    "bio-design protective mask",
    "quantum computing glasses",
    "4D visualization headset",
    
    // Additional Hipster Headwear
    "solarpunk crystal crown",
    "vintage tech headphones",
    "sustainable fiber cap",
    "minimalist design hat",
    "upcycled material headband",
    "microgreen grower's cap",
    "vinyl collector's headphones",
    "tech-weave beanie",
    "algae lab protective cap",
    "field recording headphones",
    
    // Hipster Headwear
    "barista's flat cap",
    "vintage fedora",
    "craft brewer's beanie",
    "botanical sun hat",
    "mixologist's newsboy cap",
    "antique collector's cap",
    "bookshop reading glasses",
    "gastronome's tasting cap",
    "fixed gear cycling cap",
    "artisan's work cap",
    
    // New Hipster Headwear
    "sourdough baker's linen cap",
    "coffee scientist's tasting cap",
    "fountain pen collector's visor",
    "printmaker's protective cap",
    "natural dyer's bandana",
    "leatherworker's craftsman cap",
    "book restorer's magnifying visor",
    "typewriter enthusiast's vintage cap",
    "bonsai master's sun hat",
    "bicycle restorer's workshop cap",
    
    // Contemporary Craft Headwear
    "small-batch maker's bandana",
    "slow food chef's toque",
    "natural dye artist's head wrap",
    "bookbinder's work cap",
    "wood type printer's visor",
    "botanical mixologist's cap",
    "seed collector's field hat",
    "cheesemaker's hygiene cap",
    "knifesmith's safety visor",
    "ceramicist's clay-proof cap",
    
    // Urban Homesteading Headwear
    "urban farmer's straw hat",
    "food preserver's hair net",
    "herb gardener's sun visor",
    "rainwater collector's cap",
    "compost specialist's bandana",
    "soap maker's protective cap",
    "candle crafter's work cap",
    "fiber artist's weaving band",
    "mead maker's brewing cap",
    "foraging expert's field hat",
    
    // Modern Maker Headwear
    "synth builder's anti-static cap",
    "modular electronics visor",
    "camera repair magnifying cap",
    "vinyl pressing safety cap",
    "tape label curator's beanie",
    "zine maker's creative cap",
    "patch designer's work hat",
    "pin maker's safety glasses",
    "sticker artist's bandana",
    "riso print master's cap",
    
    // Sustainable Living Headwear
    "repair cafe specialist's cap",
    "thrifting expert's vintage hat",
    "upcycler's creative bandana",
    "minimalist's essential cap",
    "zero-waste shop cap",
    "clothing repair visor",
    "tool restoration goggles",
    "furniture upcycler's cap",
    "eco-fashion designer's hat",
    "swap shop curator's beanie"
  ];

  const secondaryAccessories = [
    // Adventure Accessories
    "vintage flight goggles",
    "retro surf shades",
    "mountaineering compass",
    "sailor's telescope",
    "skater's vintage sunglasses",
    "cyclist's racing glasses",
    "diver's brass gauge",
    "racer's protective goggles",
    "climber's carabiner",
    "adventurer's binoculars",
    "space navigation device",
    "cave mapping tools",
    "altimeter watch",
    "river reading tools",
    "wind measurement device",
    
    // Artistic Tools
    "painter's palette",
    "sculptor's chisel",
    "vintage camera",
    "musical instrument",
    "poet's fountain pen",
    "architect's ruler",
    "film director's viewfinder",
    "designer's measuring tape",
    "printmaker's tools",
    "artist's brushes",
    "glassblowing pipe",
    "pottery wheel",
    "spray can set",
    "weaving shuttle",
    "jeweler's loupe",
    
    // Hipster Items
    "artisanal coffee filter",
    "vinyl record sleeve",
    "craft beer tasting glass",
    "terrarium glass",
    "cocktail mixing spoon",
    "vintage magnifying glass",
    "first edition book",
    "tasting notebook",
    "fixed gear bike lock",
    "artisan's tool belt",
    "reusable utensils",
    "honey dipper",
    "fermentation crock",
    "herb drying rack",
    "turntable needle",
    
    // New Adventure Tools
    "freediving computer",
    "highline balance meter",
    "cave mapping device",
    "packraft navigation tool",
    "alpine route finder",
    "avalanche transceiver",
    "trail GPS device",
    "ice climbing tools",
    "wave height meter",
    "altitude monitor",
    
    // New Artistic Tools
    "sound visualization pad",
    "bio-art microscope",
    "light control panel",
    "data visualization tablet",
    "kinetic control remote",
    "hologram projector",
    "projection mapping device",
    "AR controller",
    "generative art tablet",
    "installation control pad",
    
    // New Hipster Items
    "mushroom identification guide",
    "vintage game console",
    "medium format camera",
    "pottery wheel controller",
    "risograph printer",
    "synthesizer controller",
    "hydroponic monitoring device",
    "letterpress gauge",
    "fermentation monitor",
    "streetwear authentication tool",
    
    // Additional Adventure Tools
    "climbing chalk bag",
    "slackline tension meter",
    "wing foil control bar",
    "speedflying variometer",
    "ice swimming thermometer",
    "canyon mapping device",
    "snow kite wind meter",
    "hydrofoil trim control",
    "aerial dance apparatus",
    "coasteering navigation tool",
    
    // Blockchain & Web3 Tools
    "hardware wallet device",
    "crypto trading terminal",
    "blockchain explorer tablet",
    "NFT authentication scanner",
    "smart contract auditing tool",
    "validator node console",
    "token staking interface",
    "private key management device",
    "merkle tree visualizer",
    "multi-signature signing pad",
    "gas fee optimizer",
    "DeFi portfolio analyzer",
    "mempool transaction viewer",
    "cold storage vault key",
    "hash verification system",
    
    // Additional Artistic Tools
    "blockchain art tablet",
    "biofeedback visualizer",
    "neural pattern generator",
    "fractal algorithm display",
    "glitch manipulation pad",
    "voxel modeling tool",
    "AI collaboration interface",
    "bio-design microscope",
    "quantum state viewer",
    "4D modeling device",
    
    // Additional Hipster Items
    "solar power analyzer",
    "restored vintage computer",
    "vegan craft tools",
    "minimalist design tool",
    "upcycling workshop tools",
    "microgreen monitoring pad",
    "vinyl authentication scope",
    "tech-weave controller",
    "algae monitoring system",
    "field recording equipment",
    
    // Hipster Items
    "artisanal coffee filter",
    "vinyl record sleeve",
    "craft beer tasting glass",
    "terrarium glass",
    "cocktail mixing spoon",
    
    // New Hipster Tools
    "sourdough starter jar",
    "coffee refractometer",
    "vintage fountain pen case",
    "traditional printing press",
    "natural dye vat",
    "leather working tools",
    "book restoration kit",
    "vintage typewriter tools",
    "bonsai trimming set",
    "bicycle repair tools",
    
    // Contemporary Craft Tools
    "small-batch production tools",
    "slow food cooking implements",
    "natural dye collection",
    "bookbinding equipment",
    "wood type blocks",
    "botanical infusion kit",
    "seed preservation tools",
    "cheese aging tools",
    "knife forging equipment",
    "pottery wheel tools",
    
    // Urban Homesteading Tools
    "urban farming tools",
    "food preservation equipment",
    "herb drying racks",
    "rainwater collection system",
    "composting tools",
    "soap making supplies",
    "candle making kit",
    "fiber spinning wheel",
    "mead brewing equipment",
    "wildcrafting basket",
    
    // Modern Maker Tools
    "synthesizer repair kit",
    "modular patch cables",
    "camera repair tools",
    "vinyl pressing equipment",
    "tape dubbing deck",
    "zine printing supplies",
    "patch embroidery hoop",
    "enamel pin tools",
    "sticker cutting machine",
    "risograph printer",
    
    // Sustainable Living Tools
    "repair cafe toolkit",
    "thrifting measurement tape",
    "upcycling supplies",
    "minimalist organizers",
    "zero-waste containers",
    "sewing repair kit",
    "tool restoration supplies",
    "furniture refinishing tools",
    "eco-fabric samples",
    "swap shop inventory tools"
  ];

  const neckwear = [
    // Adventure Neckwear
    "vintage flight scarf",
    "sailor's neckerchief",
    "mountaineer's rope",
    "surfer's shell necklace",
    "racer's bandana",
    "cyclist's winner medal",
    "diver's air hose",
    "climber's safety rope",
    "skater's chain",
    "adventurer's compass",
    "space suit collar",
    "caving rope",
    "wingsuit zipper",
    "kayak spray guard",
    "paragliding harness",
    
    // Artistic Neckwear
    "artist's paint-splattered scarf",
    "sculptor's work collar",
    "camera strap",
    "musician's bow tie",
    "poet's cravat",
    "architect's measuring tape",
    "director's headphones",
    "designer's silk scarf",
    "printmaker's ink-stained cloth",
    "artist's neck wrap",
    "glassblower's protective collar",
    "ceramicist's apron tie",
    "street artist's respirator",
    "weaver's thread spool",
    "jeweler's chain",
    
    // Hipster Neckwear
    "barista's coffee-stained scarf",
    "vinyl collector's headphones",
    "brewer's hop garland",
    "botanical vine wrap",
    "mixologist's bow tie",
    "vintage chain",
    "librarian's reading glasses chain",
    "foodie's napkin",
    "messenger bag strap",
    "artisan's tool strap",
    "recycled fabric wrap",
    "beekeeper's veil",
    "fermentation weight",
    "dried herb garland",
    "audio cable wrap",
    
    // New Adventure Neckwear
    "freediver's neck weight",
    "highliner's safety harness",
    "caver's rope system",
    "packrafter's dry suit seal",
    "alpinist's rope coil",
    "ski tourer's buff",
    "trail runner's cooling towel",
    "ice climber's rope",
    "surfer's leash",
    "skyrunner's hydration system",
    
    // New Artistic Neckwear
    "sound artist's cable wrap",
    "bioart protective collar",
    "light artist's LED scarf",
    "data visualization tie",
    "kinetic art chain",
    "hologram reflector collar",
    "projection mapping badge",
    "AR marker necklace",
    "generative art pendant",
    "installation artist's tool strap",
    
    // New Hipster Neckwear
    "mushroom collector's pouch",
    "vintage gaming lanyard",
    "camera strap collection",
    "ceramicist's apron tie",
    "zine distributor's bag strap",
    "synthwave cable chain",
    "hydroponic tool holder",
    "letterpress ink cloth",
    "kombucha scoby carrier",
    "streetwear chain collection",
    
    // Additional Adventure Neckwear
    "bouldering crash pad strap",
    "slackline safety harness",
    "wing foil harness",
    "speedflying chest strap",
    "thermal swimming collar",
    "canyoneering rope system",
    "snow kite harness",
    "hydrofoil impact vest",
    "aerial dance sling",
    "coasteering safety line",
    
    // Blockchain & Web3 Neckwear
    "hardware wallet pendant",
    "private key QR code scarf",
    "bitcoin logo medallion",
    "blockchain node status collar",
    "mining rig cooling scarf",
    "NFT showcase display pendant",
    "consensus algorithm pattern tie",
    "ledger security lanyard",
    "crypto portfolio tracker collar",
    "validator node status indicator",
    "DeFi protocol map scarf",
    "token holder voting badge",
    "multi-chain connector links",
    
    // Additional Artistic Neckwear
    "crypto art medallion",
    "biofeedback sensor collar",
    "neural network chain",
    "fractal pattern scarf",
    "glitch effect collar",
    "voxel display pendant",
    "AI interface collar",
    "bio-design protective collar",
    "quantum computing chain",
    "4D visualization pendant",
    
    // Additional Hipster Neckwear
    "solar panel necklace",
    "vintage tech chain",
    "sustainable fiber scarf",
    "minimalist design collar",
    "upcycled material wrap",
    "microgreen harvest pouch",
    "vinyl collector's lanyard",
    "tech-weave scarf",
    "algae culture carrier",
    "sound recording strap",
    
    // Hipster Neckwear
    "barista's coffee-stained scarf",
    "vinyl collector's headphones",
    "brewer's hop garland",
    "botanical vine wrap",
    "mixologist's bow tie",
    
    // New Hipster Neckwear
    "baker's flour-dusted scarf",
    "coffee cupper's aroma guard",
    "pen collector's ink cloth",
    "printer's ink-stained scarf",
    "dyer's indigo bandana",
    "leather worker's apron tie",
    "book restorer's protective scarf",
    "typewriter ribbon necklace",
    "bonsai master's zen scarf",
    "bicycle chain necklace",
    
    // Contemporary Craft Neckwear
    "artisan's workshop scarf",
    "chef's neckerchief",
    "dyer's color sample wrap",
    "bookbinder's thread spool",
    "printer's type gauge chain",
    "herbalist's dried flower garland",
    "seed collector's pouch strap",
    "cheesemaker's culture bag",
    "knifesmith's leather strap",
    "potter's clay-proof scarf",
    
    // Urban Homesteading Neckwear
    "garden tool carrier strap",
    "preserving jar carrier",
    "herb drying line",
    "water testing kit strap",
    "compost thermometer band",
    "soap curing rack strap",
    "candle wick holder",
    "fiber twist counter",
    "mead testing tube holder",
    "foraging bag strap",
    
    // Modern Maker Neckwear
    "circuit testing strap",
    "patch cable organizer",
    "camera strap collection",
    "vinyl press gauge chain",
    "tape deck alignment band",
    "zine distribution bag",
    "patch sample display",
    "pin board carrier",
    "sticker sheet holder",
    "ink drum strap",
    
    // Sustainable Living Neckwear
    "tool carrier strap",
    "thrift haul bag strap",
    "material collection sling",
    "minimal gear carrier",
    "zero-waste bag strap",
    "thread and needle holder",
    "restoration tool wrap",
    "furniture strap carrier",
    "fabric sample chain",
    "swap item carrier"
  ];

  const clothing = [
    // Adventure Wear
    "vintage leather flight jacket",
    "retro surf poncho",
    "mountaineering coat",
    "sailor's peacoat",
    "classic racing leather",
    "cycling jersey",
    "diving suit",
    "climber's vest",
    "skater's vintage jacket",
    "explorer's coat",
    "space suit",
    "caving overalls",
    "wingsuit",
    "kayaking dry suit",
    "paragliding jacket",
    
    // Artistic Wear
    "painter's smock",
    "sculptor's apron",
    "photographer's vest",
    "musician's tailcoat",
    "poet's velvet jacket",
    "architect's black turtleneck",
    "director's jacket",
    "designer's avant-garde coat",
    "printmaker's work jacket",
    "artist's paint-splattered coat",
    "glassblower's heat suit",
    "potter's clay-dusted apron",
    "street artist's utility vest",
    "weaver's pattern coat",
    "jeweler's precision smock",
    
    // Hipster Wear
    "barista's denim apron",
    "vintage record store jacket",
    "brewer's work coat",
    "botanical work shirt",
    "mixologist's vest",
    "antique dealer's jacket",
    "bookshop cardigan",
    "chef's jacket",
    "bike messenger jacket",
    "artisan's work coat",
    "upcycled patchwork jacket",
    "beekeeper's suit",
    "fermenter's lab coat",
    "herbalist's garden coat",
    "DJ's vintage jacket",
    
    // New Adventure Wear
    "freediving wetsuit",
    "highliner's harness suit",
    "caver's coverall",
    "packrafter's dry suit",
    "alpinist's shell jacket",
    "ski touring suit",
    "trail running vest",
    "ice climbing suit",
    "big wave impact vest",
    "skyrunning suit",
    
    // New Artistic Wear
    "sound artist's utility vest",
    "bioart lab coat",
    "light artist's reflective suit",
    "data visualization jacket",
    "kinetic art worksuit",
    "hologram artist's coat",
    "projection mapping vest",
    "AR developer jacket",
    "generative artist's suit",
    "installation work coat",
    
    // New Hipster Wear
    "mushroom foraging vest",
    "vintage gaming jacket",
    "analog photography vest",
    "modern potter's apron",
    "zine creator's jacket",
    "synthwave producer's coat",
    "hydroponic work suit",
    "letterpress apron",
    "kombucha lab coat",
    "curated vintage jacket",
    
    // Additional Adventure Wear
    "bouldering chalk vest",
    "slackline performance suit",
    "wing foiling wetsuit",
    "speedflying wingsuit",
    "thermal swimming suit",
    "canyoneering dry suit",
    "snow kiting suit",
    "hydrofoil impact suit",
    "aerial dance costume",
    "coasteering wetsuit",
    
    // Additional Artistic Wear
    "crypto art display suit",
    "biofeedback sensor suit",
    "neural pattern coat",
    "fractal projection vest",
    "glitch effect jacket",
    "voxel creator suit",
    "AI collaboration coat",
    "bio-design lab coat",
    "quantum computing suit",
    "4D visualization vest",
    
    // Additional Hipster Wear
    "solarpunk sustainable coat",
    "vintage tech jacket",
    "vegan craft apron",
    "minimalist design coat",
    "upcycled fashion piece",
    "microgreen lab coat",
    "vinyl archival jacket",
    "tech-weave garment",
    "algae lab coat",
    "field recording vest",
    
    // Hipster Wear
    "barista's denim apron",
    "vintage record store jacket",
    "brewer's work coat",
    "botanical work shirt",
    "mixologist's vest",
    
    // New Hipster Wear
    "baker's linen apron",
    "coffee lab coat",
    "pen collector's vest",
    "printer's ink-proof smock",
    "dyer's workshop coat",
    "leather worker's apron",
    "book restoration coat",
    "typewriter repair jacket",
    "bonsai master's robe",
    "bicycle mechanic's coveralls",
    
    // Contemporary Craft Wear
    "artisan's workshop coat",
    "slow food chef's jacket",
    "natural dyer's smock",
    "bookbinder's apron",
    "wood type printer's coat",
    "botanical bartender's vest",
    "seed bank lab coat",
    "cheesemaker's whites",
    "knifesmith's leather apron",
    "potter's studio coat",
    
    // Urban Homesteading Wear
    "urban farmer's overalls",
    "food preservation apron",
    "herb garden smock",
    "rain collection gear",
    "compost work clothes",
    "soap maker's apron",
    "candle maker's smock",
    "fiber artist's dress",
    "mead maker's coat",
    "foraging vest",
    
    // Modern Maker Wear
    "electronics work coat",
    "modular synth lab coat",
    "camera repair smock",
    "vinyl press coveralls",
    "tape label curator's jacket",
    "zine maker's ink apron",
    "patch maker's work coat",
    "pin maker's safety smock",
    "sticker artist's apron",
    "riso printer's coat",
    
    // Sustainable Living Wear
    "repair specialist's apron",
    "thrifted ensemble",
    "upcycled work coat",
    "minimalist uniform",
    "zero-waste apron",
    "mending specialist's smock",
    "tool restorer's coveralls",
    "furniture worker's apron",
    "eco-fashion prototype",
    "swap shop curator's coat"
  ];

  const additionalElements = [
    // Adventure Elements
    "vintage compass",
    "surfboard",
    "ice axe",
    "nautical map",
    "skateboard",
    "bicycle wheel",
    "diving helmet",
    "racing goggles",
    "climbing rope",
    "adventure journal",
    "space telescope",
    "cave crystal",
    "wind meter",
    "river rapids map",
    "thermal updraft gauge",
    
    // Artistic Elements
    "paint palette",
    "sculptor's chisel",
    "vintage camera",
    "musical score",
    "poetry manuscript",
    "architectural plans",
    "film reel",
    "design sketches",
    "printing press",
    "artist's brushes",
    "molten glass orb",
    "pottery wheel",
    "spray paint can",
    "weaving loom",
    "precious gems",
    
    // Hipster Elements
    "pour-over coffee maker",
    "vinyl record",
    "craft beer bottle",
    "terrarium",
    "cocktail shaker",
    "vintage collectible",
    "rare book",
    "tasting notes",
    "fixed gear bicycle",
    "artisan's tools",
    "zero waste kit",
    "honeycomb frame",
    "kombucha scoby",
    "herb bundle",
    "turntable setup",
    
    // New Adventure Elements
    "freediving fins",
    "highline balance bar",
    "cave mapping tablet",
    "packraft paddle",
    "alpine ice axe",
    "ski touring poles",
    "trail running pack",
    "ice climbing picks",
    "big wave gun",
    "skyrunning poles",
    
    // New Artistic Elements
    "sound visualization screen",
    "living art specimen",
    "light control board",
    "data art display",
    "kinetic sculpture piece",
    "hologram projector",
    "projection mapping screen",
    "AR visualization",
    "generative art display",
    "installation framework",
    
    // New Hipster Elements
    "rare mushroom collection",
    "vintage game collection",
    "film camera collection",
    "ceramic art piece",
    "limited edition zine",
    "modular synthesizer",
    "hydroponic garden",
    "letterpress type set",
    "kombucha brewing jar",
    "rare streetwear piece",
    
    // Additional Adventure Elements
    "climbing crash pad",
    "slackline tension system",
    "wing foil board",
    "speedflying parachute",
    "ice swimming thermometer",
    "canyon rope system",
    "snow kite control bar",
    "hydrofoil board",
    "aerial dance silk",
    "coasteering gear set",
    
    // Additional Artistic Elements
    "blockchain visualization",
    "biofeedback display",
    "neural pattern screen",
    "fractal generation display",
    "glitch effect monitor",
    "voxel creation space",
    "AI collaboration display",
    "bio-design specimen",
    "quantum state display",
    "4D art projection",
    
    // Additional Hipster Elements
    "solar power system",
    "restored vintage device",
    "vegan craft creation",
    "minimalist art piece",
    "upcycled sculpture",
    "microgreen garden",
    "rare vinyl collection",
    "tech-woven fabric",
    "algae culture system",
    "field recording setup",
    
    // Hipster Elements
    "pour-over coffee maker",
    "vinyl record",
    "craft beer bottle",
    "terrarium",
    "cocktail shaker",
    "vintage collectible",
    "rare book",
    "tasting notes",
    "fixed gear bicycle",
    "artisan's tools",
    "zero waste kit",
    "honeycomb frame",
    "kombucha scoby",
    "herb bundle",
    "turntable setup",
    
    // New Adventure Elements
    "freediving fins",
    "highline balance bar",
    "cave mapping tablet",
    "packraft paddle",
    "alpine ice axe",
    "ski touring poles",
    "trail running pack",
    "ice climbing picks",
    "big wave gun",
    "skyrunning poles",
    
    // New Artistic Elements
    "sound visualization screen",
    "living art specimen",
    "light control board",
    "data art display",
    "kinetic sculpture piece",
    "hologram projector",
    "projection mapping screen",
    "AR visualization",
    "generative art display",
    "installation framework",
    
    // New Hipster Elements
    "rare mushroom collection",
    "vintage game collection",
    "film camera collection",
    "ceramic art piece",
    "limited edition zine",
    "modular synthesizer",
    "hydroponic garden",
    "letterpress type set",
    "kombucha brewing jar",
    "rare streetwear piece"
  ];

  // Create a combination of elements
  const primary = primaryAccessories[Math.floor(Math.random() * primaryAccessories.length)];
  const secondary = secondaryAccessories[Math.floor(Math.random() * secondaryAccessories.length)];
  const neck = neckwear[Math.floor(Math.random() * neckwear.length)];
  const cloth = clothing[Math.floor(Math.random() * clothing.length)];
  const additional = additionalElements[Math.floor(Math.random() * additionalElements.length)];

  const magritteBearPFP = [
    `a distinguished bear portrait in profile wearing a ${primary}, ${secondary}, and ${neck}, dressed in a ${cloth}, with ${additional}, painted in Magritte's surrealist style against a Belgian sky blue background`,
  ];
  
  return magritteBearPFP[0];
}

// Modify the concept detection to use Magritte style
function detectConceptCategory(concept: string): string {
  return 'magritte';  // Always return magritte to force Magritte style
}

// Add NFT Metadata Interface
interface NFTMetadata {
  name: string;                 // Title of the NFT
  description: string;          // Detailed description
  image: string;               // Image URL
  attributes: {                // NFT traits/characteristics
    category: string;          // e.g., "Hipster Series"
    subcategory: string;       // e.g., "Urban Forager"
    style: string;            // e.g., "Magritte Surrealist"
    accessories: string[];     // List of accessories
    clothing: string;          // Main clothing item
    tools: string[];          // Special tools/equipment
    palette: string[];        // Color palette used
    [key: string]: any;       // Additional custom attributes
  };
  external_url?: string;       // Optional link to external site
  background_color?: string;   // Optional background color
  animation_url?: string;      // Optional animation/3D model
  youtube_url?: string;        // Optional YouTube link
  tags: string[];             // Searchable tags
  created_by: string;         // Artist/Creator name
  creation_date: string;      // ISO date string
  series: string;             // Collection series name
  edition?: number;           // Edition number if limited
  total_editions?: number;    // Total editions if limited
}

// Update the generateArt function
async function generateArt(concept: string) {
  try {
    // Initialize the style manager first
    const styleManager = new StyleManager();

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
      defaultWidth: parseInt(process.env.IMAGE_WIDTH || '1440', 10),
      defaultHeight: parseInt(process.env.IMAGE_HEIGHT || '1440', 10),
      defaultNumInferenceSteps: parseInt(process.env.INFERENCE_STEPS || '200', 10),
      defaultGuidanceScale: parseFloat(process.env.GUIDANCE_SCALE || '35.0'),
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

    // If no concept is provided, generate a bear-focused concept
    let artConcept = concept || generateBearConcept();
    
    // Randomly select a bear portrait category
    const selectedCategory = MargritteCategories[Math.floor(Math.random() * MargritteCategories.length)];
    console.log(`\n✨ Using ${selectedCategory.replace('bear_', '').replace('_', ' ')} for generation`);
    
    console.log(`\n💡 Using concept: "${artConcept}"`);

    // Create a safe string for hashing
    const safeString = artConcept.toString();
    
    // Update the project creation with safe string handling
    const hash = Buffer.from(safeString).toString('base64')
      .replace(/[+/=]/g, '')
      .slice(0, 8);
    
    const timestamp = new Date().getTime().toString(36).slice(-6);
    const stylePrefix = selectedCategory.replace('bear_', '').slice(0, 4);
    const baseFilename = `${stylePrefix}-${timestamp}-${hash}`;
    
    // Create the project configuration
    const project = createProjectConfig(artConcept, selectedCategory, baseFilename, categoryArtDirection);

    // Update logging to show selected style configuration
    console.log(`\n🎨 ${selectedCategory.replace('bear_', '').replace('_', ' ')} Style Configuration:`);
    console.log('- Style emphasis:', project.artDirection.styleEmphasis.slice(0, 3).join(', '));
    console.log(formatColorPalette(project.artDirection.colorPalette, 10));
    
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
    
    // Generate concept elements by parsing the concept string
    const conceptString = generateBearConcept();
    const withParts = conceptString.split(', ')[0].split(' with ');
    const dressedParts = withParts[1]?.split(' dressed in ') || [];
    const andParts = dressedParts[0]?.split(' and ') || [];
    
    const conceptElements = {
      primary: andParts[0] || '',
      secondary: andParts[1]?.split(', with ')[0] || '',
      cloth: dressedParts[1]?.split(', with ')[0] || '',
      additional: dressedParts[1]?.split(', with ')[1] || ''
    };

    const { primary, secondary, cloth, additional } = conceptElements;

    // Create metadata object with NFT standards
    const metadata: NFTMetadata = {
      name: `${selectedCategory.replace('bear_pfp_', '').split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Bear`,
      description: `${artConcept}\n\nA distinguished bear portrait in Magritte's surrealist style, featuring a ${
        selectedCategory.replace('bear_pfp_', '').replace(/_/g, ' ')
      } bear with characteristic accessories and tools. Created through multi-agent AI collaboration.`,
      image: imageUrl,
      attributes: {
        category: selectedCategory.split('_')[2] || 'Classic',
        subcategory: selectedCategory.replace('bear_pfp_', ''),
        style: "Magritte Surrealist",
        accessories: [primary, secondary].filter(Boolean),
        clothing: cloth,
        tools: [additional].filter(Boolean),
        palette: project.artDirection.colorPalette?.slice(0, 5) || [],
      },
      tags: [
        'bear portrait',
        'surrealist',
        'Magritte style',
        selectedCategory.replace('bear_pfp_', '').replace(/_/g, ' '),
        ...artConcept.toLowerCase().split(' ').filter(word => word.length > 3),
        primary.split(' ')[0],
        cloth.split(' ')[0]
      ].filter(Boolean),
      created_by: "ArtBot Multi-Agent System",
      creation_date: new Date().toISOString(),
      series: "Surrealist Bear Portraits",
      edition: 1,
      total_editions: 1
    };

    // Define output paths
    const outputPaths = {
      metadata: path.join(outputDir, `${baseFilename}-metadata.json`),
      openSea: path.join(outputDir, `${baseFilename}-opensea.json`),
      image: path.join(outputDir, `${baseFilename}.txt`)
    };

    // Save complete metadata
    fs.writeFileSync(outputPaths.metadata, JSON.stringify(metadata, null, 2));

    // Create OpenSea-compatible metadata version
    const openSeaMetadata = {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      attributes: Object.entries(metadata.attributes).map(([trait_type, value]) => ({
        trait_type,
        value: Array.isArray(value) ? value.join(', ') : value
      })),
      external_url: `https://surrealist-bears.art/${baseFilename}`,
      background_color: project.artDirection.colorPalette?.[0]?.replace(/[^0-9A-Fa-f]/g, '') || 'FFFFFF'
    };

    // Save OpenSea metadata
    fs.writeFileSync(outputPaths.openSea, JSON.stringify(openSeaMetadata, null, 2));

    // Update memory system with NFT metadata
    await memorySystem.storeMemory(
      {
        ...metadata,
        prompt: prompt,
        creativeProcess: creativeProcess,
        multiAgentCollaboration: true,
        artDirection: project.artDirection
      },
      MemoryType.EXPERIENCE,
      { 
        type: 'artwork', 
        concept: artConcept,
        style: selectedCategory.replace('bear_', '').replace('_', ''),
        nft: true
      },
      ['artwork', 'nft', 'flux', 'multi-agent', selectedCategory.replace('bear_', '').replace('_', ''), ...metadata.tags]
    );

    // Log metadata creation
    console.log('\n📝 Generated NFT metadata files:');
    console.log(`- Full metadata: ${outputPaths.metadata}`);
    console.log(`- OpenSea format: ${outputPaths.openSea}`);
    
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
function getStyleFromArtDirection(artDirection: any, style: ArtistStyle = 'Margritte'): ArtDirection {
  if (artDirection && artDirection.styles) {
    const selectedStyle = artDirection.styles[style] || styleManager.getStyle(style);
    return selectedStyle;
  }
  
  return styleManager.getStyle(style);
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

// Determine the category to use
const detectedCategory = 'magritte';  // Always use magritte

// Check for category-specific art direction
const categoryArtDirection = loadCategoryArtDirection(detectedCategory);

// Log the art direction selection process
console.log('\n🎨 Art Direction Selection:');
console.log(`- Using Magritte art style`);

if (fileArtDirection) {
  console.log('- Found custom art-direction.json file');
}

if (categoryArtDirection) {
  console.log(`- Applied Magritte art direction from magritte_classic.json`);
} else {
  console.log(`- Creating new Magritte art direction file...`);
  // Create the Magritte style file if it doesn't exist
  const magritteStylePath = path.join(process.cwd(), 'magritte_classic.json');
  if (!fs.existsSync(magritteStylePath)) {
    fs.writeFileSync(magritteStylePath, JSON.stringify(artDirection.styles.magritte, null, 2));
    console.log('- Created Magritte style configuration file');
  }
}

// Define the models
const FLUX_PRO_MODEL = 'black-forest-labs/flux-1.1-pro';
const FLUX_MODEL_BASE = 'adirik/flux-cinestill';
const FALLBACK_MODEL = 'black-forest-labs/flux-1.1-pro';
const MINIMAX_MODEL = 'minimax/image-01';

// Create project configuration function
function createProjectConfig(concept: string, selectedCategory: string, baseFilename: string, categoryArtDirection: ArtDirection | null) {
  return {
    title: concept,
    description: `Create a Magritte-style bear PFP portrait: "${concept}"`,
    useFlux: true,
    modelConfig: {
      prompt_prefix: "Create in the surrealist style of René Magritte, with ",
      prompt_suffix: ". Emphasize perfectly smooth matte finish, crystal clear edge definition, pure unmodulated color fields, and sourceless perfect illumination. Include surrealist juxtaposition and enigmatic composition.",
      negative_prompt: "photorealistic, 3D rendered, CGI, digital art, harsh lighting, dark themes, anime style, cartoon style, watercolor, hand-drawn, sketchy, rough edges",
      num_inference_steps: 50,
      guidance_scale: 12.0
    },
    requirements: [
      "Create a perfectly centered portrait in Magritte's surrealist style",
      "Use Magritte's signature cerulean blue sky",
      "Maintain crystal clear edge definition",
      "Apply pure unmodulated color fields",
      "Include surrealist juxtaposition",
      "Create enigmatic composition",
      "Use meticulous painting technique",
      "Add floating elements",
      "Create dreamlike atmosphere",
      "Emphasize perfect matte finish",
      "Include symbolic elements",
      "Create paradoxical scenes",
      "Use precise geometric forms",
      "Maintain sourceless illumination",
      "Add mysterious elements",
      ...(categoryArtDirection?.styleEmphasis || []).slice(0, 3)
    ],
    outputFilename: baseFilename,
    artDirection: {
      ...(categoryArtDirection || artDirection.styles.magritte),
      colorPalette: artDirection.styles.magritte.colorPalette
    }
  };
}

// Magritte-inspired color palette
const magritteColors = {
  sky: {
    primary: '#1E90FF',    // Magritte's signature cerulean blue
    secondary: '#000080',  // Deep navy blue
    accent: '#87CEEB'      // Light sky blue
  },
  bear: {
    primary: '#F5F5F5',    // Pure white porcelain
    secondary: '#2F4F4F',  // Dark slate grey
    accent: '#D3D3D3'      // Light grey
  },
  clothing: {
    primary: '#006400',    // Deep forest green
    secondary: '#004225',  // Dark emerald
    accent: '#228B22'      // Forest green
  },
  background: {
    primary: '#1E90FF',    // Magritte's signature cerulean blue
    secondary: '#F5F5F5',  // Pure white
    accent: '#E0E0E0'      // Light grey
  }
};

// Add Magritte's signature style elements
const magritteStyle = [
  'perfectly smooth matte finish',
  'crystal clear edge definition',
  'pure unmodulated color fields',
  'sourceless perfect illumination',
  'clean enigmatic composition',
  'surrealist juxtaposition',
  'meticulous painting technique',
  'precise geometric forms',
  'floating elements',
  'dreamlike atmosphere'
];