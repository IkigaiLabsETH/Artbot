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
    // Magritte's Distinctive Style with Bourdin and Kandinsky influences
    "metaphysical surrealism",
    "paradoxical realism",
    "symbolic juxtaposition",
    "mysterious atmosphere",
    "theatrical staging",
    "geometric spirituality",
    "poetic displacement",
    "dreamlike composition",
    "philosophical questioning",
    "spatial illusion",
    "dramatic tension",
    "harmonious abstraction",
    "symbolic resonance",
    "temporal displacement",
    "spiritual geometry"
  ],
  visualElements: [
    // Visual Language Elements
    "floating objects",
    "impossible windows",
    "mysterious doorways",
    "dramatic shadows",
    "geometric forms",
    "billowing curtains",
    "clouded skies",
    "mirror reflections",
    "levitating stones",
    "spiritual symbols",
    "theatrical lighting",
    "geometric patterns",
    "surreal landscapes",
    "metaphysical props",
    "symbolic objects"
  ],
  colorPalette: [
    // Magritte-Bourdin-Kandinsky Fusion
    "belgian sky blue",
    "deep twilight",
    "dramatic red",
    "spiritual yellow",
    "metaphysical green",
    "mysterious grey",
    "theatrical gold",
    "surreal azure",
    "geometric ultramarine",
    "philosophical brown"
  ],
  compositionGuidelines: [
    // Compositional Principles
    "paradoxical placement",
    "dramatic staging",
    "geometric balance",
    "mysterious depth",
    "symbolic framing",
    "theatrical lighting",
    "spiritual harmony",
    "surreal scale",
    "metaphysical perspective",
    "poetic arrangement",
    "dramatic tension",
    "geometric rhythm",
    "philosophical space",
    "temporal discord",
    "symbolic resonance"
  ],
  moodAndTone: "Create a deeply surreal and metaphysical atmosphere in Magritte's tradition, where familiar objects become mysterious through paradoxical placement and symbolic resonance. Incorporate Bourdin's dramatic staging and theatrical lighting to enhance the narrative tension, while using Kandinsky's geometric spirituality to add harmonic structure.",
  references: [
    // Master Influences
    "Magritte's metaphysical paradoxes and symbolic imagery",
    "Magritte's mysterious atmospheres and impossible scenarios",
    "Bourdin's dramatic staging and theatrical lighting",
    "Bourdin's narrative tension and composition",
    "Kandinsky's spiritual geometry and harmony",
    "Kandinsky's dynamic forms and color relationships",
    "Magritte's window motifs and sky treatments",
    "Magritte's displacement of ordinary objects",
    "Bourdin's use of dramatic color and shadow",
    "Kandinsky's abstract spiritual elements"
  ],
  avoidElements: [
    // Elements to Avoid
    "literal surrealism",
    "obvious symbolism",
    "random juxtaposition",
    "excessive drama",
    "decorative geometry",
    "cliché imagery",
    "forced mystery",
    "shallow philosophy",
    "predictable composition",
    "imitative surrealism",
    "theatrical excess",
    "rigid geometry",
    "obvious narrative",
    "superficial staging",
    "meaningless symbols"
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

// Modify the concept detection to use style parameter
function detectConceptCategory(concept: string, style: ArtistStyle = 'magritte'): string {
  // Always return magritte_style regardless of input to enforce Magritte as default
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

// Define the models with Magritte-specific settings
const MAGRITTE_STYLE_CONFIG = {
  prompt_prefix: "In the metaphysical surrealist style of Magritte, with Bourdin's dramatic staging and Kandinsky's spiritual geometry. Create a mysterious and philosophical interpretation with ",
  prompt_suffix: ". Use paradoxical placement, theatrical lighting, and geometric harmony. Style emphasizing symbolic resonance and impossible realities.",
  negative_prompt: "literal, obvious, random, excessive, decorative, cliché, forced, shallow, predictable, imitative, theatrical, rigid, superficial",
  num_inference_steps: 50,
  guidance_scale: 12.5
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

// Add this helper function to get available styles as a formatted string
function getAvailableStylesFormatting(styleManager: StyleManager): string {
  const styles = Array.from(styleManager.getAllStyles().keys());
  return styles.map((style, index) => `${index + 1}. ${style}`).join('\n');
}

// Modify the generateArt function
async function generateArt(concept: string, style: ArtistStyle = 'magritte') {
  try {
    // Initialize the style manager first
    const styleManager = new StyleManager();

    // Prompt for style selection
    console.log('\n🎨 Available Art Styles:');
    console.log(getAvailableStylesFormatting(styleManager));
    
    const defaultStyle = styleManager.getCurrentDefaultStyleName();
    const styleInput = await getUserInput(`\nSelect a style (1-${styleManager.getAllStyles().size}) or press Enter for default (${defaultStyle}): `);
    
    // Convert input to style selection
    let selectedStyle: ArtistStyle;
    if (styleInput.trim() === '') {
      selectedStyle = defaultStyle;
    } else {
      const styleIndex = parseInt(styleInput) - 1;
      const styles = Array.from(styleManager.getAllStyles().keys());
      if (styleIndex >= 0 && styleIndex < styles.length) {
        selectedStyle = styles[styleIndex];
      } else {
        console.log(`Invalid selection, using default style (${defaultStyle})`);
        selectedStyle = defaultStyle;
      }
    }

    console.log(`\n✨ Using ${selectedStyle} style for generation`);

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
    
    // Initialize the ArtBotMultiAgentSystem
    const artBotMultiAgentSystem = new ArtBotMultiAgentSystem({
      aiService,
      replicateService,
      memorySystem,
      styleService,
      outputDir
    });
    
    await artBotMultiAgentSystem.initialize();
    console.log('🤖 ArtBot Multi-Agent System initialized');
    console.log('✅ Services initialized');
    
    // If no concept is provided via command line, generate Magritte concept
    let artConcept = concept;
    
    if (!artConcept) {
      // Always use Magritte-focused category
      let category = ConceptCategory.MAGRITTE;
      
      console.log(`\n🎬 Generating Magritte-inspired surrealist concept...`);
      
      // Generate a single base concept
      const baseConcepts = await generateMultipleConcepts(
        aiService,
        1, // Generate only 1 concept
        {
          temperature: 0.7,
          category
        }
      );

      // Define distinctive Magritte styling elements
      const magritteStyles = [
        // Metaphysical Elements
        {
          element: "floating bowler hat",
          essence: "identity questioner",
          detail: "hovering mysteriously in Belgian sky"
        },
        {
          element: "window to nowhere",
          essence: "reality challenger",
          detail: "framing impossible views of inner truth"
        },
        {
          element: "metamorphic clouds",
          essence: "form transformer",
          detail: "clouds taking shapes of everyday objects"
        },
        
        // Symbolic Objects
        {
          element: "giant green apple",
          essence: "scale disruptor",
          detail: "filling an entire room with paradoxical presence"
        },
        {
          element: "multiplied pipes",
          essence: "representation questioner",
          detail: "each denying its own existence"
        },
        {
          element: "mirror of impossibility",
          essence: "reflection philosopher",
          detail: "showing what cannot be there"
        },
        
        // Theatrical Settings
        {
          element: "curtained reality",
          essence: "scene revealer",
          detail: "billowing fabric revealing hidden truths"
        },
        {
          element: "door to elsewhere",
          essence: "portal master",
          detail: "opening into philosophical paradox"
        },
        {
          element: "stone castle",
          essence: "solidity challenger",
          detail: "floating weightlessly in clear sky"
        },
        
        // Metaphysical Spaces
        {
          element: "infinite room",
          essence: "space bender",
          detail: "where inside becomes outside"
        },
        {
          element: "time-frozen scene",
          essence: "moment keeper",
          detail: "where multiple times coexist"
        },
        {
          element: "perspective puzzle",
          essence: "vision questioner",
          detail: "where up and down lose meaning"
        }
      ];

      // Select a random Magritte style
      const selectedStyle = magritteStyles[Math.floor(Math.random() * magritteStyles.length)];
      
      // Create styled Magritte concept
      artConcept = `Surrealist ${selectedStyle.essence} with ${selectedStyle.element} (${selectedStyle.detail}). Metaphysical study of perception, symbolic objects dominating space, mysterious atmosphere.`;
      console.log(`\n✨ Generated Magritte-inspired concept: "${artConcept}"`);
    }
    
    console.log(`\n💡 Using concept: "${artConcept}"`);
    
    // Update the project creation to use selected style
    const project = {
      title: artConcept,
      description: `Create an interpretation in ${selectedStyle} style: "${artConcept}"`,
      useFlux: true,
      modelConfig: styleManager.getStyle(selectedStyle).modelConfig,
      requirements: [
        `Create an interpretation with ${selectedStyle}'s characteristic elements`,
        ...styleManager.getStyle(selectedStyle).styleEmphasis.slice(0, 5)
      ],
      outputFilename: `${selectedStyle}-flux-${artConcept.replace(/\s+/g, '-').toLowerCase()}`,
      artDirection: styleManager.getStyle(selectedStyle)
    };

    // Update logging to show selected style configuration
    console.log(`\n🎨 ${selectedStyle} Style Configuration:`);
    console.log(`- Using ${selectedStyle}'s distinctive style`);
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
    const promptPath = path.join(outputDir, `${selectedStyle}-flux-${sanitizedConcept}-prompt.txt`);
    const imagePath = path.join(outputDir, `${selectedStyle}-flux-${sanitizedConcept}.txt`);
    const metadataPath = path.join(outputDir, `${selectedStyle}-flux-${sanitizedConcept}-metadata.json`);
    
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
        style: selectedStyle
      },
      ['artwork', 'flux', 'multi-agent', selectedStyle, ...artConcept.split(' ')]
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