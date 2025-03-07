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
    // Pure Magritte Oil Painting Style
    "classic Magritte oil painting technique",
    "traditional surrealist paint handling",
    "characteristic Magritte matte finish",
    "subtle oil paint texture",
    "pure Magritte brushwork precision",
    "quintessential painted surface quality",
    "traditional canvas-like finish",
    "classic oil painting depth",
    "pure Magritte paint layering",
    "characteristic painted light effects",
    "traditional surrealist color blending",
    "metaphysical stillness in paint",
    "pure Magritte pictorial logic",
    "classic painted object relationships",
    "perfect Magritte painterly balance"
  ],
  visualElements: [
    // Pure Magritte Painting Elements
    "classic Magritte painted scale relationships",
    "traditional oil-painted sky",
    "quintessential painted atmospheric depth",
    "characteristic Magritte surface finish",
    "metaphysical painted windows",
    "pure Magritte object rendering in oils",
    "classic painted cloud formations",
    "perfect painted light treatment",
    "metaphysical space in oils",
    "pure Magritte object relationships",
    "classic painted architectural elements",
    "quintessential painted shadows",
    "perfect painted surface qualities",
    "pure philosophical painted arrangements",
    "classic Magritte curtain textures in oil"
  ],
  colorPalette: [
    // Magritte's Oil Painting Palette
    "quintessential Magritte oil blue (slightly muted)",
    "traditional painted sky blue (with subtle variation)",
    "classic Magritte grey (oil paint quality)",
    "painted black (soft matte finish)",
    "oil painting white (subtle canvas texture)",
    "pure Magritte earth tones in oil",
    "classic painted cloud white",
    "quintessential shadow tones in oils",
    "perfect daylight blue (painted quality)",
    "pure metaphysical neutrals in oil paint"
  ],
  compositionGuidelines: [
    // Pure Magritte Painting Composition
    "perfect Magritte painted positioning",
    "quintessential painted depth",
    "pure surrealist painted balance",
    "classic Magritte scale in oils",
    "philosophical use of painted space",
    "perfect painted object isolation",
    "pure Magritte painted symmetry",
    "quintessential surrealist canvas framing",
    "classic metaphysical perspective in oils",
    "perfect Magritte painted spatial logic",
    "pure object-ground relationship in paint",
    "classic surrealist depth in oils",
    "quintessential painted window framing",
    "perfect philosophical painted composition",
    "pure metaphysical staging in oils"
  ],
  moodAndTone: "Create a pure Magritte-style oil painting that embodies his quintessential philosophical surrealism. The execution must demonstrate his characteristic oil painting technique with its subtle surface quality and traditional painted finish. Every element should contribute to a profound sense of surrealist questioning, rendered with his signature painted clarity and philosophical weight. The work should feel as if it emerged directly from Magritte's easel, with the characteristic matte finish and precise paint handling of his iconic works.",
  references: [
    "Magritte's 'The Son of Man' (1964) - for characteristic oil painting technique",
    "Magritte's 'The False Mirror' (1929) - for painted eye treatment",
    "Magritte's 'The Listening Room' (1952) - for painted scale and presence",
    "Magritte's 'The Blank Signature' (1965) - for oil painting execution",
    "Magritte's 'The Central Story' (1928) - for painted compositional balance",
    "Magritte's 'The Glass Key' (1959) - for oil surface treatment",
    "Magritte's 'The Empire of Light' (1953-54) - for painted metaphysical light",
    "Magritte's 'The Human Condition' (1933) - for pure painted philosophical depth",
    "Magritte's 'Time Transfixed' (1938) - for classic painted surrealist logic",
    "Magritte's 'The Treachery of Images' (1929) - for traditional oil technique"
  ],
  avoidElements: [
    // Anti-Magritte Elements
    "photorealistic effects",
    "camera-like precision",
    "photographic qualities",
    "digital smoothness",
    "hyper-realistic details",
    "lens-like effects",
    "HDR-style lighting",
    "photographic depth of field",
    "camera-based perspective",
    "impressionistic effects",
    "expressionistic elements",
    "loose rendering",
    "heavy impasto texture",
    "visible brushstrokes",
    "abstract forms",
    "gestural marks",
    "fashion styling",
    "commercial aesthetics",
    "editorial elements",
    "dramatic lighting",
    "complex patterns",
    "decorative elements",
    "random compositions",
    "narrative drama",
    "emotional expression",
    "dynamic movement",
    "temporal effects"
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
  
  // Convert category to filename format (e.g., 'magritte_lovers' or 'bourdin_fashion')
  const prefix = category.toLowerCase().includes('bourdin') ? 'bourdin' : 'magritte';
  const categoryName = category.toLowerCase().replace(/^bourdin_|^magritte_/, '');
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

// Detect concept category based on content if not explicitly provided
function detectConceptCategory(concept: string): string | undefined {
  if (!concept) return undefined;
  
  const conceptLower = concept.toLowerCase();
  
  // Heavily prioritize close-up portrait categories
  const categoryPatterns = [
    { 
      category: 'portrait_closeup', 
      keywords: [
        'close-up', 'portrait', 'face', 'eyes', 'gaze', 'stare',
        'macro', 'detail', 'facial', 'expression', 'look',
        'direct', 'front view', 'symmetrical', 'centered'
      ]
    }
  ];
  
  // Check for keyword matches
  for (const pattern of categoryPatterns) {
    if (pattern.keywords.some(keyword => conceptLower.includes(keyword))) {
      console.log(`\n🔍 Auto-detected category: ${pattern.category} based on concept keywords`);
      return pattern.category;
    }
  }
  
  // Default to portrait_closeup if no specific category is detected
  return 'portrait_closeup';
}

// Determine the category to use
const detectedCategory = categoryArg || detectConceptCategory(concept);

// Check for category-specific art direction if category is provided
const categoryArtDirection = loadCategoryArtDirection(detectedCategory);

// Log the art direction selection process
console.log('\n🎨 Art Direction Selection:');
if (categoryArg) {
  console.log(`- Using explicitly specified category: "${categoryArg}"`);
} else if (detectedCategory) {
  console.log(`- Using auto-detected category: "${detectedCategory}"`);
} else {
  console.log('- Using default art direction (no specific category)');
}

if (fileArtDirection) {
  console.log('- Found custom art-direction.json file');
}

if (categoryArtDirection) {
  console.log(`- Applied category-specific art direction from: ${detectedCategory}.json`);
} else if (detectedCategory) {
  console.log(`- No category-specific file found for "${detectedCategory}", using base art direction`);
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

// Modify the generateArt function to include the new critique
async function generateArt(concept: string) {
  try {
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
      defaultNumInferenceSteps: parseInt(process.env.INFERENCE_STEPS || '28', 10),
      defaultGuidanceScale: parseFloat(process.env.GUIDANCE_SCALE || '3'),
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
    
    // If no concept is provided via command line, generate multiple cinematic concepts
    let artConcept = concept;
    
    if (!artConcept) {
      // Always use portrait-focused classic category
      let category = ConceptCategory.MAGRITTE_CLASSIC;
      
      console.log(`\n🎬 Generating styled bear portrait concept...`);
      
      // Generate a single base concept
      const basePortraitConcepts = await generateMultipleConcepts(
        aiService,
        1, // Generate only 1 concept
        {
          temperature: 0.7,
          category
        }
      );

      // Define distinctive bear styling elements
      const bearStyles = [
        // Modern Hipster Styles
        {
          accessory: "thick-rimmed vintage Wayfarers",
          personality: "indie hipster",
          detail: "matte black frames with subtle coffee stains"
        },
        {
          accessory: "artisanal leather suspenders",
          personality: "craft beer enthusiast",
          detail: "hand-stitched with copper hardware"
        },
        {
          accessory: "carefully disheveled beanie",
          personality: "vinyl collector",
          detail: "locally sourced merino wool in mustard yellow"
        },
        
        // Classic Rock Styles
        {
          accessory: "worn leather jacket",
          personality: "rock legend",
          detail: "vintage studs and hand-painted band logos"
        },
        {
          accessory: "signature bandana",
          personality: "guitar hero",
          detail: "faded red with silver skull pattern"
        },
        {
          accessory: "spiked leather collar",
          personality: "punk rocker",
          detail: "chrome spikes catching dramatic light"
        },
        
        // Alternative/Indie Rock
        {
          accessory: "oversized flannel shirt",
          personality: "grunge icon",
          detail: "perfectly distressed red and black plaid"
        },
        {
          accessory: "vintage band t-shirt",
          personality: "indie musician",
          detail: "faded Sonic Youth design with artistic tears"
        },
        {
          accessory: "layered silver necklaces",
          personality: "alternative artist",
          detail: "mixed chains with guitar pick pendant"
        },
        
        // Modern Rock Fashion
        {
          accessory: "designer leather wristbands",
          personality: "modern rocker",
          detail: "studded black leather with chrome details"
        },
        {
          accessory: "custom ear piercings",
          personality: "punk artist",
          detail: "multiple silver hoops catching light"
        },
        {
          accessory: "vintage military jacket",
          personality: "rebel musician",
          detail: "customized with band patches and safety pins"
        },
        
        // Hipster Fashion
        {
          accessory: "authentic 80s denim jacket",
          personality: "retro enthusiast",
          detail: "perfectly faded with hand-sewn patches"
        },
        {
          accessory: "artisanal bow tie",
          personality: "coffee connoisseur",
          detail: "handwoven organic cotton in forest green"
        },
        {
          accessory: "vintage typewriter key necklace",
          personality: "analog artist",
          detail: "brass keys spelling 'CREATE'"
        },
        
        // Fusion Styles
        {
          accessory: "mixed metal ear cuff",
          personality: "avant-garde performer",
          detail: "copper and silver geometric design"
        },
        {
          accessory: "hand-painted denim vest",
          personality: "street artist",
          detail: "custom artwork with metallic accents"
        },
        {
          accessory: "vintage camera strap",
          personality: "underground photographer",
          detail: "weathered leather with brass hardware"
        },
        
        // Statement Pieces
        {
          accessory: "oversized vintage sunglasses",
          personality: "festival headliner",
          detail: "round gold frames with gradient lenses"
        },
        {
          accessory: "handmade feather earring",
          personality: "bohemian rocker",
          detail: "black feathers with silver accents"
        },
        {
          accessory: "tattoo choker",
          personality: "90s revival artist",
          detail: "layered with silver charm details"
        },
        
        // Urban Rock
        {
          accessory: "custom chain necklace",
          personality: "urban legend",
          detail: "mixed metals with vintage guitar pendant"
        },
        {
          accessory: "distressed denim collar",
          personality: "garage band icon",
          detail: "hand-frayed with safety pin accents"
        },
        {
          accessory: "leather fedora",
          personality: "indie folk artist",
          detail: "vintage black with silver feather band"
        }
      ];

      // Select three random styles without repetition
      const availableStyles = [...bearStyles];
      const selectedStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)];
      
      // Create styled portrait concept
      artConcept = `Minimalist ${selectedStyle.personality} bear with ${selectedStyle.accessory} (${selectedStyle.detail}). Ultra-close facial study, eyes dominating frame, perfect symmetry, pure black background.`;
      console.log(`\n✨ Generated styled portrait concept: "${artConcept}"`);
    } else {
      // Enhance any provided concept with styling elements if not present
      const styleKeywords = [
        'glasses', 'monocle', 'hat', 'cap', 'tie', 'bowtie',
        'necklace', 'scarf', 'collar', 'brooch', 'pin'
      ];
      
      const hasStyle = styleKeywords.some(keyword => 
        artConcept.toLowerCase().includes(keyword)
      );
      
      if (!hasStyle) {
        console.log(`\n🎬 Enhancing concept with distinctive styling...`);
        const style = {
          accessory: "vintage round glasses",
          personality: "intellectual",
          detail: "gold wire frames catching light"
        };
        artConcept = `Minimalist bear portrait with ${style.accessory} - ${style.personality} expression, ${style.detail}. Ultra-close facial study, eyes dominating frame, perfect symmetry, pure black background.`;
      }
    }
    
    console.log(`\n💡 Using concept: "${artConcept}"`);
    
    // Check if the concept is post-photography related for the project setup
    const postPhotoKeywords = [
      // Fashion and styling keywords
      'fashion', 'glamour', 'editorial', 'haute couture', 'runway', 'model', 'magazine', 'styling',
      // Visual style keywords
      'glossy', 'high-contrast', 'saturated', 'vibrant', 'bold colors', 'electric', 'crimson',
      // Composition keywords
      'cropped', 'fragmented', 'disembodied', 'partial view', 'tight framing', 'cinematic', 'theatrical',
      // Narrative and mood keywords
      'provocative', 'erotic', 'suggestive', 'mysterious narrative', 'implied story', 'tension', 'suspense',
      // Object keywords
      'stiletto', 'high heel', 'mannequin', 'luxury goods', 'cosmetics', 'perfume', 'jewelry', 'accessories',
      // Artist references
      'bourdin', 'newton', 'avedon', 'penn', 'post-photography'
    ];
    const isPostPhotoRelated = postPhotoKeywords.some(keyword => artConcept.toLowerCase().includes(keyword));
    
    // Determine if we should use Bourdin style
    const useBourdinStyle = detectedCategory?.toLowerCase().includes('bourdin') || 
                           (detectedCategory === undefined && isPostPhotoRelated && 
                            (artConcept.toLowerCase().includes('bourdin') ||
                             artConcept.toLowerCase().includes('fashion') ||
                             artConcept.toLowerCase().includes('editorial')));
                             
    // Determine if we should use Magritte style
    const useMagritteStyle = detectedCategory?.toLowerCase().includes('magritte') || 
                            (detectedCategory === undefined && !isPostPhotoRelated && 
                             (artConcept.toLowerCase().includes('magritte') ||
                              artConcept.toLowerCase().includes('surreal')));
                              
    // Determine if we should use Impressionist style
    const useImpressionistStyle = detectedCategory === 'impressionist';
    
    // Get the appropriate style from the art direction file if it exists
    let artDirectionStyle = artDirection;
    if (fileArtDirection && fileArtDirection.styles) {
      artDirectionStyle = getStyleFromArtDirection(fileArtDirection, isPostPhotoRelated);
    }
    
    // Create a category-specific art direction
    let categoryArtDirection: ArtDirection = { ...artDirectionStyle };
    
    if (useImpressionistStyle) {
      // Override with impressionist-specific art direction
      categoryArtDirection = {
        styleEmphasis: ["Impressionist style", ...(artDirectionStyle.styleEmphasis?.filter(style => 
          !style.toLowerCase().includes('magritte') && 
          !style.toLowerCase().includes('surreal')) || [])],
        visualElements: ["visible brushstrokes", "emphasis on light", "everyday subject matter", 
          ...(artDirectionStyle.visualElements?.filter(element => 
            !["bowler hats", "floating objects", "impossible scenes", 
             "ordinary objects in extraordinary contexts"].includes(element)) || [])],
        colorPalette: ["light colors", "visible brushstrokes", 
          ...(artDirectionStyle.colorPalette?.filter(color => !color.toLowerCase().includes('magritte')) || [])],
        compositionGuidelines: ["visible brushstrokes", "emphasis on light", "everyday subject matter", 
          ...(artDirectionStyle.compositionGuidelines?.filter(guideline => 
            !guideline.toLowerCase().includes('surreal')) || [])],
        moodAndTone: "light and airy with a focus on capturing fleeting moments and natural light",
        references: ["Claude Monet's 'Waterlilies'", "Pierre-Auguste Renoir's 'Luncheon of the Boating Party'",
          ...(artDirectionStyle.references?.filter(ref => !ref.toLowerCase().includes('magritte')) || [])],
        avoidElements: [...(artDirectionStyle.avoidElements || []), "surreal elements", "impossible scenes"]
      };
    } else if (useBourdinStyle) {
      // Override with enhanced Bourdin-specific art direction
      categoryArtDirection = {
        styleEmphasis: [
          "Extreme post-photography style",
          "Provocative high-fashion surrealism",
          "Ultra-bold and theatrical styling",
          "Maximum dramatic impact",
          "Hyper-stylized compositions",
          "Radical narrative tension",
          "Commercial glamour with artistic depth",
          "Fashion editorial extremes",
          "Bourdin signature cropping",
          "Psychological drama in fashion",
          ...(artDirectionStyle.styleEmphasis?.filter(style => 
            !style.toLowerCase().includes('magritte') && 
            !style.toLowerCase().includes('traditional surreal')) || [])
        ],
        visualElements: [
          "Dramatically cropped limbs",
          "Extreme poses and gestures",
          "Fetishistic fashion elements",
          "High-gloss surfaces",
          "Luxury objects with menace",
          "Blood-red accents",
          "Mirror fragmentations",
          "Mannequin-like figures",
          "Theatrical props with tension",
          "Compressed spatial relationships",
          ...(artDirectionStyle.visualElements?.filter(element => 
            !["bowler hats", "floating objects", "clouds in rooms"].includes(element)) || [])
        ],
        colorPalette: [
          "Maximum contrast black",
          "Blood red",
          "Electric blue",
          "Acid green",
          "Hot pink",
          "Deep burgundy",
          "Metallic silver",
          "Flesh tones with tension",
          ...(artDirectionStyle.colorPalette?.filter(color => 
            !color.toLowerCase().includes('magritte')) || [])
        ],
        compositionGuidelines: [
          "Extreme cropping techniques",
          "Radical framing angles",
          "Maximum spatial compression",
          "Theatrical staging",
          "Geometric precision",
          "Aggressive negative space",
          "Dramatic scale relationships",
          "Psychological framing",
          "Fashion editorial dynamics",
          "Bourdin signature perspectives",
          ...(artDirectionStyle.compositionGuidelines?.filter(guideline => 
            !guideline.toLowerCase().includes('traditional surreal')) || [])
        ],
        moodAndTone: "Ultra-provocative and intensely theatrical with maximum dramatic impact. Creates extreme tension through radical juxtapositions of beauty and unease. Pushes fashion photography to its psychological and visual limits with Bourdin's signature style of high-gloss menace and seductive discomfort.",
        references: [
          "Guy Bourdin's most provocative Vogue Paris editorials",
          "Charles Jourdan shoe campaign extremes",
          "Bourdin's controversial 1970s work",
          "Pentax calendar radical compositions",
          "Bourdin's color-saturated commercial work",
          ...(artDirectionStyle.references?.filter(ref => 
            !ref.toLowerCase().includes('magritte')) || [])
        ],
        avoidElements: [
          "Soft or romantic elements",
          "Natural or candid moments",
          "Traditional fashion poses",
          "Conservative framing",
          "Muted colors",
          "Gentle lighting",
          "Documentary style",
          "Traditional surrealism",
          ...(artDirectionStyle.avoidElements || [])
        ]
      };
    } else {
      // For all other styles, ensure we blend Magritte and Guy Bourdin elements
      // Add some Guy Bourdin elements if they're not already present
      if (!categoryArtDirection.styleEmphasis?.some(style => style.toLowerCase().includes('fashion'))) {
        categoryArtDirection.styleEmphasis = [
          ...(categoryArtDirection.styleEmphasis || []),
          "high-fashion surrealism",
          "cinematic drama",
          "bold and provocative styling"
        ];
      }
      
      if (!categoryArtDirection.visualElements?.some(element => element.toLowerCase().includes('limbs'))) {
        categoryArtDirection.visualElements = [
          ...(categoryArtDirection.visualElements || []),
          "elongated limbs and dramatic poses",
          "partially obscured figures",
          "fragmented body parts as objects"
        ];
      }
      
      if (!categoryArtDirection.colorPalette?.some(color => color.toLowerCase().includes('contrast'))) {
        categoryArtDirection.colorPalette = [
          ...(categoryArtDirection.colorPalette || []),
          "high-contrast red and black",
          "electric blues and deep purples"
        ];
      }
      
      if (!categoryArtDirection.compositionGuidelines?.some(guideline => guideline.toLowerCase().includes('cropping'))) {
        categoryArtDirection.compositionGuidelines = [
          ...(categoryArtDirection.compositionGuidelines || []),
          "tight cropping with focus on partial details",
          "radical framing techniques"
        ];
      }
      
      // Ensure the mood and tone reflects the blend
      if (!categoryArtDirection.moodAndTone?.toLowerCase().includes('bourdin') && 
          !categoryArtDirection.moodAndTone?.toLowerCase().includes('fashion')) {
        categoryArtDirection.moodAndTone = categoryArtDirection.moodAndTone + 
          " Blended with Guy Bourdin's provocative high-fashion surrealism for a unique visual impact.";
      }
      
      // Add Guy Bourdin references if not present
      if (!categoryArtDirection.references?.some(ref => ref.toLowerCase().includes('bourdin'))) {
        categoryArtDirection.references = [
          ...(categoryArtDirection.references || []),
          "Guy Bourdin's Vogue Paris fashion editorials",
          "Guy Bourdin's Charles Jourdan shoe campaigns"
        ];
      }
    }
    
    // Create a project for the multi-agent system
    const project = {
      title: artConcept,
      description: `Create an artistic interpretation of the concept: "${artConcept}"`,
      useFlux: true,
      requirements: [
        "Create a visually striking image that captures the essence of the concept",
        "Use cinematic lighting and composition",
        "Incorporate rich visual metaphors and symbolism",
        isPostPhotoRelated ? "Include high-fashion surrealism with bold styling and provocative compositions" : "Balance abstract and recognizable elements",
        useMagritteStyle ? "Use René Magritte's surrealist style with clean compositions and philosophical questioning" : 
        useImpressionistStyle ? "Use Impressionist style with visible brushstrokes, emphasis on light, and everyday subject matter" : 
        "Evoke an emotional response in the viewer"
      ],
      outputFilename: `flux-${artConcept.replace(/\s+/g, '-').toLowerCase()}`,
      // Add the category-specific art direction to the project
      artDirection: categoryArtDirection
    };
    
    // Log art direction being used
    console.log('\n🎨 Art Direction:');
    console.log(`- Style Emphasis: ${project.artDirection.styleEmphasis?.join(', ') || 'None specified'}`);
    console.log(`- Visual Elements: ${project.artDirection.visualElements?.join(', ') || 'None specified'}`);
    console.log(`- Color Palette: ${project.artDirection.colorPalette?.join(', ') || 'None specified'}`);
    console.log(`- Composition: ${project.artDirection.compositionGuidelines?.join(', ') || 'None specified'}`);
    console.log(`- Mood and Tone: ${project.artDirection.moodAndTone || 'None specified'}`);
    if (project.artDirection.references && project.artDirection.references.length > 0) {
      console.log(`- References: ${project.artDirection.references.join(', ')}`);
    }
    if (project.artDirection.avoidElements && project.artDirection.avoidElements.length > 0) {
      console.log(`- Avoiding: ${project.artDirection.avoidElements.join(', ')}`);
    }
    
    // Run the art project using the multi-agent system
    console.log('\n🖼️ Generating art using multi-agent collaboration...');
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
    
    // Save outputs to files
    const sanitizedConcept = artConcept.replace(/\s+/g, '-').toLowerCase();
    const promptPath = path.join(outputDir, `flux-${sanitizedConcept}-prompt.txt`);
    const imagePath = path.join(outputDir, `flux-${sanitizedConcept}.txt`);
    const metadataPath = path.join(outputDir, `flux-${sanitizedConcept}-metadata.json`);
    
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
      isPostPhotoNative: isPostPhotoRelated || detectedCategory === 'post_photography',
      multiAgentCollaboration: true,
      artDirection: project.artDirection
    };
    
    // Save metadata silently
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Store in memory system silently
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
        isPostPhotoNative: isPostPhotoRelated || detectedCategory === 'post_photography'
      },
      ['artwork', 'flux', 'multi-agent', ...(isPostPhotoRelated ? ['fashion', 'surreal', 'bourdin'] : []), ...artConcept.split(' ')]
    );
    
    // Minimal completion message
    console.log('✅ Generation complete');
    
  } catch (error) {
    console.error('❌ Error generating art:', error);
  }
}

// Run the main function
generateArt(concept).catch(console.error);

// Export the function for use in other modules
export { generateArt };

// Function to get the appropriate style from the art direction file
function getStyleFromArtDirection(artDirection: any, isPostPhotoRelated: boolean = false): ArtDirection {
  // If the art direction has a styles object, it's using the new format
  if (artDirection && artDirection.styles) {
    // Use exclusively Magritte style
    const magritteStyle = artDirection.styles['magritte'] || {};
    
    return {
      styleEmphasis: magritteStyle.styleEmphasis || defaultArtDirection.styleEmphasis,
      visualElements: magritteStyle.visualElements || defaultArtDirection.visualElements,
      colorPalette: magritteStyle.colorPalette || defaultArtDirection.colorPalette,
      compositionGuidelines: magritteStyle.compositionGuidelines || defaultArtDirection.compositionGuidelines,
      moodAndTone: magritteStyle.moodAndTone || defaultArtDirection.moodAndTone,
      references: magritteStyle.references || defaultArtDirection.references,
      avoidElements: [
        ...(magritteStyle.avoidElements || []),
        "fashion editorial style",
        "commercial aesthetics",
        "provocative elements",
        "extreme contrasts",
        "dynamic compositions",
        "narrative drama",
        "emotional expression",
        "temporal effects",
        "gestural elements",
        "textural experimentation"
      ]
    };
  }
  
  // If it's using the old format, return the default Magritte-focused art direction
  return defaultArtDirection;
} 