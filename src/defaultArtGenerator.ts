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
    // Strictly Vintage Apple Elements
    "floating Macintosh SE/30 computers",
    "levitating Apple IIe displays",
    "System 7 interface floating in space",
    "rainbow Apple logos in impossible arrangements",
    "hovering vintage Mac keyboards",
    "geometric patterns of Apple II circuit boards",
    "billowing curtains revealing Mac Plus screens",
    "clouded skies filled with MacOS icons",
    "mirror reflections of Apple Lisa interfaces",
    "classic Mac startup chimes visualized",
    "original Macintosh mice in surreal patterns",
    "glowing Apple II power lights",
    "suspended 5.25-inch Apple floppy disks",
    "ethereal Apple ImageWriter printers",
    "metaphysical Apple Desktop Bus ports",
    "symbolic early HyperCard stacks"
  ],
  colorPalette: [
    // Vintage Apple Color Palette
    "original Macintosh beige",
    "Apple II warm cream",
    "platinum grey",
    "classic Mac OS blue",
    "rainbow logo red",
    "rainbow logo yellow",
    "rainbow logo green",
    "rainbow logo blue",
    "rainbow logo purple",
    "System 7 window grey",
    "Apple II green phosphor",
    "early Mac menu bar white",
    "classic Mac shadow grey",
    "Apple IIc platinum",
    "vintage keyboard beige"
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
  prompt_prefix: "Drawing from the Belgian Surrealist tradition but focusing exclusively on vintage Apple technology, create a scene that blends surrealism with LiveTheLifeTV's modern cinematic vision. Using only classic Apple products and interfaces from the Macintosh era (1984-1995), the scene should maintain the Belgian Surrealists' execution while incorporating ",
  prompt_suffix: `. Render with meticulous attention to:
- Objects: Exclusively vintage Apple hardware and interfaces:
  * Macintosh computers (128K through Quadra)
  * Apple II family systems
  * Original Apple peripherals and accessories
  * Classic Mac OS interfaces and icons
  * Apple-specific cables and connectors
  * Period-accurate Apple marketing elements
- Color Palette: Classic Apple computing colors:
  * Warm beiges and creams from original Macintosh cases
  * Platinum greys from Apple IIc and later Macs
  * Phosphorescent greens from early monitors
  * Rainbow logo spectrum (red, orange, yellow, green, blue, purple)
  * Clean whites from early Mac interface elements
  * System-specific greys and blues from Mac OS
- Lighting: Belgian Surrealist approaches with vintage tech:
  * Magritte's crystalline illumination on CRT screens
  * Delvaux's dreamy atmosphere with screen glow
  * Baes's mysterious glow from status LEDs
  * Computer lab fluorescent clarity
- Composition: Belgian Surrealist principles with Apple elements:
  * Magritte's impossible juxtapositions of Mac hardware
  * Delvaux's architectural depth in computer labs
  * Mariën's poetic arrangements of Apple products
  * Graverol's symbolic framing of interfaces
- Technical Elements:
  * Perfectly smooth paint application
  * Crisp edges and precise details
  * Photorealistic rendering of Apple hardware
  * Clean, uncluttered compositions
  * Sharp focus throughout
Style emphasizing Belgian Surrealist mastery while exclusively using vintage Apple aesthetics.`,
  negative_prompt: "loose brushwork, visible brushstrokes, impasto, textured paint, expressionistic, sketchy, painterly, rough, gestural, abstract, messy, blurry, modern devices, contemporary colors, dark moody tones, grungy textures, weathered surfaces, distressed materials, non-Apple antiques, vintage furniture, classical elements, traditional antiques, period decorations, vintage mechanical objects, antique artifacts",
  num_inference_steps: 50,
  guidance_scale: 12.5
};

// Add LiveTheLifeTV-specific visual elements with Magritte's painting approach
const LIVE_THE_LIFE_ELEMENTS = {
  settings: [
    "pristinely rendered Apple II computer labs",
    "crystal-clear vintage Macintosh workstations",
    "meticulously detailed early Apple development spaces",
    "cleanly painted Cupertino offices circa 1984",
    "precisely rendered Apple II manufacturing facilities",
    "photorealistic Mac testing laboratories",
    "mathematically perfect Apple service centers"
  ],
  objects: [
    "flawlessly rendered Macintosh 128K",
    "pristinely detailed Apple IIe",
    "perfectly painted original rainbow Apple logos",
    "meticulously rendered Apple Extended Keyboard",
    "crystalline Apple monitors",
    "immaculately painted Apple ImageWriter",
    "precisely detailed Apple 3.5-inch floppy disks",
    "cleanly executed Apple Desktop Bus mouse",
    "photorealistic System 6 interfaces",
    "perfectly rendered AppleTalk connectors"
  ],
  lighting: [
    "Magritte's crystalline daylight on CRT screens",
    "pristinely rendered LED indicator lights",
    "mathematically perfect screen glow",
    "cleanly painted vintage monitor illumination",
    "precisely rendered Apple logo highlights",
    "meticulously detailed computer lab lighting",
    "photorealistic screen reflections"
  ],
  color_palettes: [
    ["original Macintosh beige", "System 7 grey", "Apple II green"],
    ["platinum grey", "rainbow logo spectrum", "early Mac white"],
    ["Apple IIc cream", "Mac OS blue", "status LED red"],
    ["keyboard beige", "screen phosphor", "menu bar grey"]
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
    console.log(`\n✨ Using ${selectedCategory.replace('magritte_', '').replace('_', ' ')} × LiveTheLifeTV fusion for generation`);

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
      defaultNumInferenceSteps: parseInt(process.env.INFERENCE_STEPS || '40', 10),
      defaultGuidanceScale: parseFloat(process.env.GUIDANCE_SCALE || '12.0'),
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
      const magritteElements = categoryArtDirection?.visualElements || [];
      const magritteStyle = categoryArtDirection?.styleEmphasis || [];
      const liveTheLifeSettings = LIVE_THE_LIFE_ELEMENTS.settings;
      const liveTheLifeObjects = LIVE_THE_LIFE_ELEMENTS.objects;
      
      // Select random elements from both styles
      const selectedMagritteElement = magritteElements[Math.floor(Math.random() * magritteElements.length)];
      const selectedMagritteStyle = magritteStyle[Math.floor(Math.random() * magritteStyle.length)];
      const selectedSetting = liveTheLifeSettings[Math.floor(Math.random() * liveTheLifeSettings.length)];
      const selectedObject = liveTheLifeObjects[Math.floor(Math.random() * liveTheLifeObjects.length)];
      
      // Create a fusion concept
      artConcept = `A surrealist scene where ${selectedMagritteElement} meets ${selectedObject} in a ${selectedSetting}, rendered with ${selectedMagritteStyle}`;
      console.log(`\n✨ Generated fusion concept: "${artConcept}"`);
    }
    
    console.log(`\n💡 Using concept: "${artConcept}"`);
    
    // Update the project creation
    const project = {
      title: artConcept,
      description: `Create a ${selectedCategory.replace('magritte_', '').replace('_', ' ')} × LiveTheLifeTV fusion: "${artConcept}"`,
      useFlux: true,
      modelConfig: {
        ...MAGRITTE_STYLE_CONFIG,
        prompt_prefix: `In a fusion of René Magritte's ${selectedCategory.replace('magritte_', '').replace('_', ' ')} surrealism and LiveTheLifeTV's cinematic vision, create a scene that blends metaphysical wonder with retro-futuristic nostalgia. Combine `,
        prompt_suffix: `. Render with:
- Lighting: Dramatic cinema-inspired illumination with noir undertones
- Color: Rich, warm vintage tones (especially reds and oranges) contrasted with deep blues
- Composition: Clean Magritte-style surrealism meets contemporary design
- Atmosphere: Mysterious and narrative-driven, suggesting stories beyond the frame
- Technical quality: Hyperrealistic details with painterly surrealist elements
Style emphasizing both symbolic resonance and cinematic storytelling.`
      },
      requirements: [
        `Create a fusion of Magritte surrealism and LiveTheLifeTV's cinematic style`,
        ...(categoryArtDirection?.styleEmphasis || []).slice(0, 3),
        ...LIVE_THE_LIFE_ELEMENTS.settings.slice(0, 2)
      ],
      outputFilename: `magritte-livethelife-${selectedCategory.replace('magritte_', '')}-${artConcept.replace(/\s+/g, '-').toLowerCase()}`,
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
    const sanitizedConcept = artConcept.replace(/\s+/g, '-').toLowerCase();
    const promptPath = path.join(outputDir, `${selectedCategory.replace('magritte_', '').replace('_', '-')}-${sanitizedConcept}-prompt.txt`);
    const imagePath = path.join(outputDir, `${selectedCategory.replace('magritte_', '').replace('_', '-')}-${sanitizedConcept}.txt`);
    const metadataPath = path.join(outputDir, `${selectedCategory.replace('magritte_', '').replace('_', '-')}-${sanitizedConcept}-metadata.json`);
    
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