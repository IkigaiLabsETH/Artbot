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

// Define portrait-specific categories for PFP series
const magritteCategories = [
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
  
  // Academic Series (New)
  'bear_pfp_professor',     // Distinguished professor with glasses
  'bear_pfp_astronomer',    // Stargazer with telescope
  'bear_pfp_archaeologist', // Field researcher with tools
  'bear_pfp_botanist_academic', // Academic botanist with specimens
  'bear_pfp_librarian',     // Rare book curator
  'bear_pfp_mathematician', // Mathematician with formulas
  'bear_pfp_chemist',      // Chemist with laboratory coat
  'bear_pfp_linguist',     // Language scholar with manuscripts
  'bear_pfp_historian',    // History scholar with documents
  'bear_pfp_philosopher',  // Philosophy professor with tome
  
  // Mystical Series (New)
  'bear_pfp_alchemist',    // Alchemist with potions
  'bear_pfp_astrologer',   // Astrologer with celestial maps
  'bear_pfp_fortune',      // Fortune teller with crystal ball
  'bear_pfp_mystic',       // Mystic with sacred scrolls
  'bear_pfp_shaman',       // Shaman with ritual items
  'bear_pfp_druid',        // Druid with nature elements
  'bear_pfp_oracle',       // Oracle with prophetic tools
  'bear_pfp_wizard',       // Wizard with magical items
  'bear_pfp_sage',         // Sage with ancient texts
  'bear_pfp_occultist',    // Occultist with arcane symbols
  
  // Steampunk Series (New)
  'bear_pfp_inventor',      // Victorian inventor with brass goggles
  'bear_pfp_timekeeper',    // Clockwork master with gears
  'bear_pfp_aeronaut',      // Airship captain with brass telescope
  'bear_pfp_mechanist',     // Steam engine expert with tools
  'bear_pfp_alchemtech',    // Steampunk alchemist with apparatus
  'bear_pfp_automaton',     // Mechanical being with brass parts
  'bear_pfp_navigator',     // Sky charts and brass compass
  'bear_pfp_artificer',     // Mechanical craftsman with tools
  'bear_pfp_steamsmith',    // Steam machinery expert
  'bear_pfp_chronologist',  // Time device specialist
  
  // Classical Series (New)
  'bear_pfp_composer',      // Classical music composer
  'bear_pfp_conductor',     // Orchestra conductor with baton
  'bear_pfp_violinist',     // Violin virtuoso with instrument
  'bear_pfp_pianist',       // Grand piano performer
  'bear_pfp_cellist',       // Cello master with bow
  'bear_pfp_harpist',       // Harp player with strings
  'bear_pfp_flautist',      // Flute player with instrument
  'bear_pfp_operatic',      // Opera singer with score
  'bear_pfp_chamber',       // Chamber musician
  'bear_pfp_maestro',       // Music master with manuscript
  
  // Diplomatic Series (New)
  'bear_pfp_ambassador',    // Distinguished diplomat
  'bear_pfp_consul',        // Consular official with seal
  'bear_pfp_attache',       // Cultural attaché with portfolio
  'bear_pfp_envoy',         // Special envoy with documents
  'bear_pfp_minister',      // Foreign minister with briefcase
  'bear_pfp_delegate',        // UN delegate with credentials
  'bear_pfp_emissary',      // Royal emissary with scroll
  'bear_pfp_chancellor',    // Chancellor with ceremonial chain
  'bear_pfp_secretary',      // Secretary of state with portfolio
  'bear_pfp_legate',          // Papal legate with seal
  
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
  
  // Additional Academic Types
  'bear_pfp_cartographer',      // Map maker with tools
  'bear_pfp_paleographer',      // Ancient writing expert
  'bear_pfp_antiquarian',        // Antique manuscript expert
  'bear_pfp_naturalist',        // Nature study scholar
  'bear_pfp_cosmologist',        // Universe study scholar
  
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
  'bear_pfp_kombucha',      // Kombucha brewing master
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
  'bear_pfp_soundhunter',   // Field recording artist
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
    
    // Academic Headwear
    "professor's mortarboard",
    "astronomer's night cap",
    "archaeologist's field hat",
    "curator's reading glasses",
    "mathematician's spectacles",
    "chemist's safety goggles",
    "linguist's translation lens",
    "historian's archive cap",
    "philosopher's thinking cap",
    "researcher's magnifying glass",
    
    // Mystical Headwear
    "alchemist's hood",
    "astrologer's star cap",
    "fortune teller's head wrap",
    "mystic's ceremonial crown",
    "shaman's spirit mask",
    "druid's leaf crown",
    "oracle's veil",
    "wizard's pointed hat",
    "sage's wisdom band",
    "occultist's symbolic hat",
    
    // Steampunk Headwear
    "brass goggled top hat",
    "gear-decorated bowler",
    "copper-plated aviator cap",
    "mechanical monocle hat",
    "steam-powered helmet",
    "clockwork crown",
    "brass-fitted cap",
    "gear-rimmed glasses",
    "mechanical eye patch",
    "steam valve hat",
    
    // Classical Music Headwear
    "conductor's formal cap",
    "composer's velvet beret",
    "virtuoso's silk headband",
    "maestro's ceremonial hat",
    "chamber musician's cap",
    "opera performer's crown",
    "concert master's hat",
    "orchestral director's cap",
    "soloist's formal headpiece",
    "classical performer's hat",
    
    // Diplomatic Headwear
    "ambassador's formal hat",
    "diplomatic corps cap",
    "consular official's hat",
    "ministerial top hat",
    "envoy's formal cap",
    "chancellor's ceremonial hat",
    "emissary's plumed hat",
    "delegate's formal headpiece",
    "diplomatic service cap",
    "ceremonial state hat",
    
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
    
    // Academic Tools
    "rare book magnifier",
    "star chart compass",
    "archaeological brush",
    "specimen collection box",
    "library catalog cards",
    "mathematical compass",
    "laboratory equipment",
    "ancient manuscript case",
    "historical documents",
    "philosophical treatise",
    
    // Mystical Items
    "alchemical apparatus",
    "celestial armillary",
    "crystal ball stand",
    "mystical scrollcase",
    "ritual medicine bag",
    "natural talismans",
    "prophetic tablets",
    "magical implements",
    "wisdom scrolls",
    "occult symbols",
    
    // Steampunk Accessories
    "brass mechanical arm",
    "clockwork compass",
    "steam pressure gauge",
    "gear-decorated spyglass",
    "mechanical calculator",
    "steam-powered tool",
    "brass navigation device",
    "mechanical measuring tool",
    "steam engine miniature",
    "clockwork assistant",
    
    // Classical Music Accessories
    "conductor's baton",
    "golden music stand",
    "vintage metronome",
    "orchestral score",
    "classical instrument",
    "sheet music folder",
    "tuning fork set",
    "composer's quill",
    "musical manuscript",
    "performance program",
    
    // Diplomatic Accessories
    "diplomatic portfolio",
    "official seal press",
    "ceremonial staff",
    "document case",
    "credential holder",
    "treaty scroll",
    "diplomatic pouch",
    "official dispatch box",
    "state seal",
    "ceremonial mace",
    
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
    
    // Academic Neckwear
    "professor's bow tie",
    "observatory scarf",
    "field researcher's tie",
    "curator's cravat",
    "academic stole",
    "laboratory safety collar",
    "translator's neckerchief",
    "archivist's tie",
    "philosophical scarf",
    "scholar's collar",
    
    // Mystical Neckwear
    "alchemist's chain",
    "celestial collar",
    "mystic beads",
    "ritual necklace",
    "spirit fetish",
    "natural fiber wrap",
    "oracle's collar",
    "wizard's chain",
    "sage's meditation beads",
    "symbolic amulet",
    
    // Steampunk Neckwear
    "gear-decorated cravat",
    "brass-buttoned collar",
    "steam pipe necklace",
    "mechanical bow tie",
    "clockwork collar",
    "copper chain collar",
    "brass gear tie",
    "mechanical choker",
    "steam valve collar",
    "gear link chain",
    
    // Classical Music Neckwear
    "conductor's white tie",
    "performer's bow tie",
    "orchestral cravat",
    "maestro's silk scarf",
    "classical collar",
    "concert bow tie",
    "formal neck ruff",
    "musical score tie",
    "performance collar",
    "ceremonial neck chain",
    
    // Diplomatic Neckwear
    "diplomatic corps tie",
    "ambassador's cravat",
    "ceremonial collar",
    "official neck chain",
    "state ceremony tie",
    "diplomatic service scarf",
    "formal state collar",
    "embassy formal tie",
    "consular corps cravat",
    "ministerial chain",
    
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
    
    // Academic Attire
    "professor's robes",
    "observatory coat",
    "field researcher's vest",
    "curator's jacket",
    "academic gown",
    "laboratory coat",
    "translator's blazer",
    "archivist's coat",
    "philosopher's robe",
    "scholar's jacket",
    
    // Mystical Garments
    "alchemist's robe",
    "astrologer's cloak",
    "fortune teller's shawl",
    "mystic's ceremonial robe",
    "shaman's ritual garb",
    "druid's natural vestments",
    "oracle's flowing robe",
    "wizard's star-patterned cloak",
    "sage's meditation robe",
    "occultist's symbolic vestments",
    
    // Steampunk Attire
    "brass-fitted coat",
    "gear-decorated vest",
    "steam engineer's jacket",
    "mechanical suit",
    "clockwork waistcoat",
    "copper-plated armor",
    "steam-powered suit",
    "mechanical formal wear",
    "brass-buttoned coat",
    "gear mechanism suit",
    
    // Classical Music Attire
    "conductor's tailcoat",
    "performer's formal suit",
    "orchestral dress coat",
    "concert formal wear",
    "chamber music attire",
    "opera performance coat",
    "classical musician's suit",
    "maestro's formal jacket",
    "soloist's concert wear",
    "performance formal coat",
    
    // Diplomatic Attire
    "ambassador's formal suit",
    "diplomatic corps uniform",
    "consular official's coat",
    "ministerial formal wear",
    "embassy formal suit",
    "chancellor's robes",
    "diplomatic service uniform",
    "state ceremony coat",
    "official diplomatic wear",
    "formal state uniform",
    
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
    
    // Academic Elements
    "rare manuscript",
    "brass telescope",
    "archaeological artifacts",
    "preserved specimens",
    "library index",
    "geometric instruments",
    "laboratory apparatus",
    "ancient scrolls",
    "historical documents",
    "philosophical texts",
    
    // Mystical Elements
    "alchemical vessel",
    "astrolabe",
    "crystal sphere",
    "mystical tome",
    "medicine bundle",
    "natural artifacts",
    "prophetic runes",
    "magical staff",
    "wisdom tablets",
    "occult grimoire",
    
    // Steampunk Elements
    "brass clockwork device",
    "steam pressure meter",
    "mechanical calculator",
    "gear mechanism display",
    "steam engine model",
    "brass navigation tool",
    "clockwork automaton",
    "steam-powered invention",
    "mechanical measuring device",
    "brass scientific instrument",
    
    // Classical Music Elements
    "golden conductor's stand",
    "vintage musical score",
    "classical instrument case",
    "orchestral arrangement",
    "composer's manuscript",
    "antique metronome",
    "performance program",
    "musical notation book",
    "concert hall sketch",
    "classical music award",
    
    // Diplomatic Elements
    "diplomatic seal",
    "official document case",
    "ceremonial staff",
    "state credentials",
    "treaty document",
    "embassy seal press",
    "diplomatic dispatch",
    "official portfolio",
    "state ceremony medal",
    "diplomatic code book",
    
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
    
    // Academic Elements
    "rare manuscript",
    "brass telescope",
    "archaeological artifacts",
    "preserved specimens",
    "library index",
    "geometric instruments",
    "laboratory apparatus",
    "ancient scrolls",
    "historical documents",
    "philosophical texts",
    
    // Mystical Elements
    "alchemical vessel",
    "astrolabe",
    "crystal sphere",
    "mystical tome",
    "medicine bundle",
    "natural artifacts",
    "prophetic runes",
    "magical staff",
    "wisdom tablets",
    "occult grimoire",
    
    // Steampunk Elements
    "brass clockwork device",
    "steam pressure meter",
    "mechanical calculator",
    "gear mechanism display",
    "steam engine model",
    "brass navigation tool",
    "clockwork automaton",
    "steam-powered invention",
    "mechanical measuring device",
    "brass scientific instrument",
    
    // Classical Music Elements
    "golden conductor's stand",
    "vintage musical score",
    "classical instrument case",
    "orchestral arrangement",
    "composer's manuscript",
    "antique metronome",
    "performance program",
    "musical notation book",
    "concert hall sketch",
    "classical music award",
    
    // Diplomatic Elements
    "diplomatic seal",
    "official document case",
    "ceremonial staff",
    "state credentials",
    "treaty document",
    "embassy seal press",
    "diplomatic dispatch",
    "official portfolio",
    "state ceremony medal",
    "diplomatic code book",
    
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
    `a distinguished female bear portrait in profile wearing a ${primary}, ${secondary}, and ${neck}, dressed in a ${cloth}, with ${additional}, painted in Magritte's precise style against a Belgian sky blue background`,
  ];
  
  return magritteBearPFP[0];
}

// Determine the category to use
const detectedCategory = categoryArg || 'bear_pfp_classic';

// Check for category-specific art direction if category is provided
const categoryArtDirection = loadCategoryArtDirection(detectedCategory);

// Log the art direction selection process
console.log('\n🎨 Art Direction Selection:');
if (categoryArg) {
  console.log(`- Using explicitly specified category: "${categoryArg}"`);
} else if (detectedCategory) {
  console.log(`- Using auto-detected category: "${detectedCategory}"`);
} else {
  console.log('- Using default bear portrait');
}

if (fileArtDirection) {
  console.log('- Found custom art-direction.json file');
}

if (categoryArtDirection) {
  console.log(`- Applied category-specific art direction from: ${detectedCategory}.json`);
} else if (detectedCategory) {
  console.log(`- No category-specific file found for "${detectedCategory}", using base bear portrait`);
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

// Create project configuration function
function createProjectConfig(concept: string, selectedCategory: string, baseFilename: string, categoryArtDirection: any) {
  return {
    title: concept,
    description: `Create a Magritte-style bear PFP portrait: "${concept}"`,
    useFlux: true,
    modelConfig: {
      prompt_prefix: `Create a portrait of a distinguished female bear in René Magritte's distinctive painting style, perfectly centered for a PFP (Profile Picture). The image should embody Magritte's precise yet painterly technique that captures `,
      prompt_suffix: `. Render with Magritte's signature artistic elements:
- Painting Style: 
  * Magritte's characteristic smooth, matte finish
  * Subtle visible brushwork in flat color areas
  * Soft edges with precise control
  * Deliberate paint application with minimal texture
  * Careful gradients reminiscent of Belgian sky
  * Oil painting technique with minimal impasto
- Artistic Elements:
  * Clean, unmodulated color fields
  * Subtle tonal transitions
  * Precise yet painterly edges
  * Careful attention to light and shadow
  * Magritte's characteristic surface quality
Must maintain the artist's distinctive painting style while being perfectly centered for profile picture use.`,
      negative_prompt: [
        "photorealistic", "hyperrealistic", "camera photo", "photograph", "DSLR", "studio lighting",
        "3D rendering", "CGI", "digital art", "graphic design", "illustration", "cartoon",
        "rough texture", "heavy impasto", "visible brushstrokes", "expressionistic", "loose style",
        "sketchy", "unfinished", "abstract", "modernist", "contemporary", "avant-garde",
        "full body shot", "landscape format", "action poses", "busy backgrounds",
        "natural wilderness", "full face view", "messy composition", "cluttered elements",
        "informal poses", "casual style", "modern clothing", "contemporary fashion",
        "sports wear", "casual accessories"
      ].join(", ")
    },
    requirements: [
      "Create a perfectly centered portrait in Magritte's painting style",
      "Capture his distinctive smooth, matte finish and subtle brushwork",
      "Maintain clean, unmodulated color fields with precise edges",
      ...(categoryArtDirection?.styleEmphasis || []).slice(0, 3)
    ],
    outputFilename: baseFilename,
    artDirection: {
      ...(categoryArtDirection || defaultArtDirection),
      styleEmphasis: [
        // Painting Technique
        "Magritte's characteristic smooth, matte finish",
        "Subtle visible brushwork in flat areas",
        "Precise yet painterly edges",
        "Careful oil paint application",
        "Minimal surface texture",
        "Controlled tonal transitions",
        "Clean color fields",
        "Belgian surrealist painting style",
        "Traditional oil painting method",
        "Deliberate artistic technique",
        
        // Composition Elements
        "Perfect center alignment",
        "Noble bearing and dignity",
        "Formal portrait arrangement",
        "Classical profile view",
        "Elegant accessory placement"
      ],
      visualElements: [
        // Headwear
        "classic bowler hat with Magritte's matte finish",
        "dignified top hat with subtle paint texture",
        "academic cap with careful brushwork",
        "pith helmet with precise edge control",
        "naval officer's cap with clean color fields",
        
        // Eyewear
        "gold-rimmed monocle with painterly reflection",
        "wire-framed spectacles with delicate brushwork",
        "pince-nez glasses with subtle highlights",
        "curator's eyepiece with careful detailing",
        "jeweled opera glasses with controlled shine",
        
        // Neckwear
        "silk bow tie with smooth color transition",
        "formal cravat with subtle fabric texture",
        "ceremonial sash with clean color blocks",
        "academic stole with precise folds",
        "diplomatic corps tie with careful shading",
        
        // Additional Elements
        "golden pocket watch with painterly reflection",
        "black umbrella with Magritte's characteristic finish",
        "floating apple with perfect matte surface",
        "smoking pipe with subtle wood grain",
        "leather-bound book with careful detail work"
      ],
      colorPalette: [
        // Magritte's Signature Colors
        "Belgian sky blue (smooth gradient)",
        "Magritte cloud white (unmodulated)",
        "Son of Man apple green (matte finish)",
        "Empire of Light blue (careful transition)",
        "Golconda grey (precise tone)",
        
        // Clothing Colors
        "deep black (smooth application)",
        "midnight blue (subtle variation)",
        "charcoal grey (controlled shade)",
        "oxford grey (clean field)",
        
        // Metallic Colors
        "polished brass (painterly shine)",
        "antique gold (careful highlight)",
        "burnished silver (subtle reflection)",
        
        // Accent Colors
        "burgundy (deep tone)",
        "forest green (rich hue)",
        "royal purple (noble shade)",
        "classic ivory (pure field)",
        "rich mahogany (warm tone)"
      ],
      compositionGuidelines: [
        // Painting-Focused Guidelines
        "maintain Magritte's characteristic smooth finish",
        "apply colors in clean, unmodulated fields",
        "create subtle transitions between tones",
        "control edge quality with precision",
        "balance painterly and precise elements",
        "achieve proper oil paint surface quality",
        "capture traditional portrait dignity",
        "emphasize careful detail rendering",
        "focus on clean color relationships",
        "preserve artistic integrity"
      ]
    }
  };
}

// Modify the concept detection to always use bear portrait style
function detectConceptCategory(concept: string): string {
  // Always return bear_pfp_classic as default
  return 'bear_pfp_classic';
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
      defaultWidth: parseInt(process.env.IMAGE_WIDTH || '2048', 10),
      defaultHeight: parseInt(process.env.IMAGE_HEIGHT || '2048', 10),
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
    const selectedCategory = magritteCategories[Math.floor(Math.random() * magritteCategories.length)];
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
      description: `${artConcept}\n\nA distinguished female bear portrait in Magritte's surrealist style, featuring a ${
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
        'magritte style',
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
function getStyleFromArtDirection(artDirection: any, style: ArtistStyle = 'magritte'): ArtDirection {
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