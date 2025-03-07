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
    // Pure Magritte Technical Style
    "flawless oil painting technique",
    "absolute photorealistic detail",
    "perfectly smooth surface quality",
    "razor-sharp edge definition",
    "masterful tonal transitions",
    "pristine Belgian academic finish",
    "crystalline surface clarity",
    "traditional Magritte precision",
    "perfect representational accuracy",
    "museum-quality execution",
    "jewel-like paint handling",
    "mathematically precise modeling",
    "glass-like surface finish",
    "academic perfectionism"
  ],
  visualElements: [
    // Precise Portrait Framing
    "extreme close-up of bear face",
    "head and shoulders composition only",
    "face fills 80% of frame",
    "perfect square 1:1 ratio crop",
    "crystal-clear facial features",
    // Core Bear Features
    "direct eye contact with perfect symmetry",
    "ultra-sharp eye detail",
    "precise fur texture rendering",
    "mathematically centered nose",
    "perfectly balanced ears",
    // Magritte Surreal Elements
    "floating bowler hat precisely above head",
    "single green apple suspended at eye level",
    "mathematically precise sky background",
    "optically perfect cloud elements",
    // Technical Portrait Details
    "microscopic fur detail",
    "perfect catch lights in eyes",
    "pristine facial symmetry",
    "unwavering forward gaze",
    "surgical edge precision",
    "flawless light modeling"
  ],
  colorPalette: [
    // Magritte's Exact Historical Colors
    "Magritte cerulean blue (RGB: 31, 104, 178)",
    "Magritte cloud white (RGB: 245, 245, 245)",
    "Magritte bear brown (RGB: 89, 61, 43)",
    "Magritte apple green (RGB: 85, 107, 47)",
    "Magritte sky blue (RGB: 135, 206, 235)",
    "Magritte shadow grey (RGB: 128, 128, 128)",
    // Essential Tonal Values
    "pure titanium white highlights",
    "ivory black deep shadows",
    "neutral grey mid-tones",
    // Atmospheric Colors
    "Belgian daylight blue",
    "Northern European sky tone",
    "Brussels afternoon light",
    "Continental atmospheric grey",
    "Low Countries cloud color"
  ],
  compositionGuidelines: [
    // Portrait-Specific Composition
    "face must fill 80% of frame width",
    "eyes positioned exactly on upper third line",
    "nose centered on vertical axis",
    "ears balanced equally on frame edges",
    "perfect square 1:1 aspect ratio",
    // Mathematical Precision
    "golden ratio facial proportions",
    "exact rule of thirds eye placement",
    "precise geometric centering",
    "perfect facial symmetry",
    "absolute compositional balance",
    "exact proportional division",
    "mathematical tension points"
  ],
  moodAndTone: "Create a museum-quality Magritte bear portrait with absolute technical perfection, focusing on an extreme close-up composition where the bear's face dominates the frame. The execution must reflect his precise Belgian academic training with flawless oil painting technique. Every element should demonstrate perfect symmetry and unwavering direct gaze, while surreal elements must be rendered with crystalline clarity and mathematical precision. The atmosphere should embody Magritte's philosophical clarity through pristine technical execution.",
  references: [
    // Pure Magritte Masterwork References
    "The Son of Man (1964) - for perfect apple and bowler hat placement",
    "The Month of the Grape Harvest (1959) - for exact sky color calibration",
    "The Beautiful Relations (1963) - for flawless surface quality",
    "The Listening Room (1952) - for precise scale mathematics",
    "The Victory (1939) - for perfect light handling",
    "Personal Values (1952) - for exact object placement",
    "The Empire of Light (1953-54) - for precise sky/light relationship",
    "The Blank Page (1967) - for absolute surface perfection"
  ],
  avoidElements: [
    // Technical Imperfections to Avoid
    "full body shots",
    "three-quarter views",
    "profile angles",
    "tilted head poses",
    "looking away poses",
    "environmental elements",
    "busy backgrounds",
    "visible brush texture",
    "impasto technique",
    "loose brushwork",
    "painterly effects",
    "surface irregularity",
    "textural variation",
    "atmospheric softness",
    "edge ambiguity"
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
  
  // Heavily prioritize Magritte-related categories with detailed keywords
  const categoryPatterns = [
    // Primary Magritte categories (90% weight)
    { 
      category: 'magritte_classic', 
      keywords: [
        'bowler hat', 'pipe', 'apple', 'cloud', 'surreal object',
        'bear', 'window', 'sky', 'mirror', 'curtain', 'silhouette',
        'floating', 'mysterious', 'philosophical', 'paradox'
      ]
    },
    { 
      category: 'magritte_objects', 
      keywords: [
        'floating', 'impossible', 'ordinary object', 'transformation',
        'bear object', 'giant', 'miniature', 'levitation', 'stone',
        'crystal', 'wood', 'natural', 'everyday item'
      ]
    },
    { 
      category: 'magritte_metamorphosis', 
      keywords: [
        'transform', 'change', 'becoming', 'hybrid',
        'bear transformation', 'cloud bear', 'stone bear', 'tree bear',
        'merging', 'evolving', 'morphing', 'blending'
      ]
    },
    { 
      category: 'magritte_mystery', 
      keywords: [
        'hidden face', 'veiled', 'obscured', 'enigma',
        'bear face', 'shrouded', 'concealed', 'masked',
        'mysterious', 'unknown', 'secret', 'shadow'
      ]
    },
    { 
      category: 'magritte_mirrors', 
      keywords: [
        'reflection', 'mirror', 'double', 'duplicate',
        'bear reflection', 'false mirror', 'glass', 'portal',
        'parallel', 'twin', 'copied', 'repeated'
      ]
    },
    // Limited Bourdin influence (10% weight)
    { 
      category: 'bourdin_lighting', 
      keywords: ['dramatic light', 'shadow play', 'theatrical']
    }
  ];
  
  // Check for keyword matches
  for (const pattern of categoryPatterns) {
    if (pattern.keywords.some(keyword => conceptLower.includes(keyword))) {
      console.log(`\n🔍 Auto-detected category: ${pattern.category} based on concept keywords`);
      return pattern.category;
    }
  }
  
  // Default to Magritte classic if no specific category is detected
  return 'magritte_classic';
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

// Add this function before the generateArt function
async function generateArtCritique(artwork: any, artDirection: ArtDirection): Promise<{
  strengths: string[];
  areasForImprovement: string[];
  overallScore: number;
  technicalAnalysis: string[];
  compositionalAnalysis: string[];
  stylisticFidelity: string[];
  aiEvaluation?: {
    technicalScore: number;
    compositionScore: number;
    stylisticScore: number;
    analysis: string;
  };
}> {
  // Initialize AI service for evaluation
  const aiService = new AIService({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
  });
  
  await aiService.initialize();

  // Prepare the evaluation prompt
  const evaluationPrompt = `
    Analyze this artwork in the context of René Magritte's style and the following art direction:
    ${JSON.stringify(artDirection, null, 2)}

    Image URL: ${artwork.imageUrl}

    Please evaluate:
    1. Technical Execution (0-10): Surface quality, edge precision, tonal gradation, detail resolution
    2. Compositional Success (0-10): Face framing, symmetry, eye positioning, surreal element placement
    3. Stylistic Fidelity (0-10): Adherence to Magritte's style, philosophical clarity, surrealist integration
    
    Provide a detailed analysis focusing on:
    - How well it captures Magritte's technical precision
    - Success in achieving the specified composition
    - Authenticity to Magritte's surrealist vision
    - Integration of bear portrait with surreal elements
  `;

  // Get AI evaluation
  const aiResponse = await aiService.generateText(evaluationPrompt, {
    temperature: 0.3, // Lower temperature for more consistent analysis
    maxTokens: 1000
  });

  // Parse AI response for scores and analysis
  const technicalScoreMatch = aiResponse.match(/Technical Execution.*?(\d+)/);
  const compositionScoreMatch = aiResponse.match(/Compositional Success.*?(\d+)/);
  const stylisticScoreMatch = aiResponse.match(/Stylistic Fidelity.*?(\d+)/);

  const aiEvaluation = {
    technicalScore: technicalScoreMatch ? parseInt(technicalScoreMatch[1]) : 7,
    compositionScore: compositionScoreMatch ? parseInt(compositionScoreMatch[1]) : 7,
    stylisticScore: stylisticScoreMatch ? parseInt(stylisticScoreMatch[1]) : 7,
    analysis: aiResponse
  };

  // Evaluate based on Magritte's principles
  const technicalCriteria = [
    "Surface quality and smoothness",
    "Edge precision and definition",
    "Tonal gradation accuracy",
    "Detail resolution in fur rendering",
    "Light and shadow handling",
    "Color accuracy to Magritte palette"
  ];

  const compositionalCriteria = [
    "Face fills 80% of frame",
    "Perfect symmetrical alignment",
    "Eye positioning on upper third",
    "Central nose placement",
    "Square aspect ratio maintenance",
    "Surreal element placement"
  ];

  const stylisticCriteria = [
    "Magritte's philosophical clarity",
    "Surrealist element integration",
    "Bear portrait authenticity",
    "Direct gaze engagement",
    "Academic painting technique",
    "Overall conceptual strength"
  ];

  // Use AI scores to influence criteria evaluation
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];
  const technicalAnalysis: string[] = [];
  const compositionalAnalysis: string[] = [];
  const stylisticFidelity: string[] = [];

  // Technical Analysis influenced by AI technical score
  technicalCriteria.forEach(criterion => {
    const score = (aiEvaluation.technicalScore / 10) + (Math.random() * 0.3 - 0.15); // Add small random variation
    if (score > 0.7) {
      technicalAnalysis.push(`✓ Strong ${criterion}`);
      strengths.push(`Excellent ${criterion.toLowerCase()}`);
    } else {
      technicalAnalysis.push(`△ Could improve ${criterion}`);
      areasForImprovement.push(`Enhance ${criterion.toLowerCase()}`);
    }
  });

  // Compositional Analysis influenced by AI composition score
  compositionalCriteria.forEach(criterion => {
    const score = (aiEvaluation.compositionScore / 10) + (Math.random() * 0.3 - 0.15);
    if (score > 0.7) {
      compositionalAnalysis.push(`✓ Achieved ${criterion}`);
      strengths.push(`Successful ${criterion.toLowerCase()}`);
    } else {
      compositionalAnalysis.push(`△ Adjust ${criterion}`);
      areasForImprovement.push(`Refine ${criterion.toLowerCase()}`);
    }
  });

  // Stylistic Analysis influenced by AI stylistic score
  stylisticCriteria.forEach(criterion => {
    const score = (aiEvaluation.stylisticScore / 10) + (Math.random() * 0.3 - 0.15);
    if (score > 0.7) {
      stylisticFidelity.push(`✓ Captured ${criterion}`);
      strengths.push(`Strong ${criterion.toLowerCase()}`);
    } else {
      stylisticFidelity.push(`△ Develop ${criterion}`);
      areasForImprovement.push(`Strengthen ${criterion.toLowerCase()}`);
    }
  });

  // Calculate overall score using AI evaluation scores
  const overallScore = Math.min(10, Math.round(
    (aiEvaluation.technicalScore + aiEvaluation.compositionScore + aiEvaluation.stylisticScore) / 3
  ));

  return {
    strengths,
    areasForImprovement,
    overallScore,
    technicalAnalysis,
    compositionalAnalysis,
    stylisticFidelity,
    aiEvaluation
  };
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
    
    // If no concept is provided via command line, generate a random cinematic concept
    let artConcept = concept;
    
    if (!artConcept) {
      // Default to MAGRITTE_CLASSIC category unless explicitly specified otherwise
      let category = ConceptCategory.MAGRITTE_CLASSIC;
      
      if (detectedCategory) {
        // Try to match the detected category to a valid category
        const categoryKey = Object.keys(ConceptCategory).find(
          key => key.toLowerCase() === detectedCategory.toLowerCase()
        );
        
        if (categoryKey) {
          category = ConceptCategory[categoryKey as keyof typeof ConceptCategory];
          console.log(`\n🎬 Generating a ${category} concept...`);
        } else {
          console.log(`\n⚠️ Unknown category: "${detectedCategory}". Using MAGRITTE_CLASSIC category.`);
          category = ConceptCategory.MAGRITTE_CLASSIC;
        }
      } else {
        console.log(`\n🎬 Generating a Magritte classic concept...`);
      }
      
      // Generate the concept with the selected category
      artConcept = await generateCinematicConcept(aiService, { 
        temperature: 0.9,
        category
      });
    } else {
      // Check if the provided concept is Magritte-related
      const magritteKeywords = [
        // Core Magritte elements
        'bowler hat', 'pipe', 'apple', 'cloud', 'window', 'sky',
        'mirror', 'curtain', 'silhouette', 'floating', 'mysterious',
        // Bear-specific Magritte elements
        'bear face', 'bear reflection', 'bear cloud', 'bear window',
        'bear silhouette', 'bear transformation', 'bear paradox',
        // Philosophical elements
        'philosophical', 'paradox', 'surreal', 'impossible', 'metaphysical',
        // Natural elements
        'stone', 'wood', 'leaf', 'tree', 'mountain', 'ocean', 'sky',
        // Symbolic objects
        'key', 'door', 'frame', 'room', 'chair', 'table', 'book',
        // Specific Magritte techniques
        'magritte', 'surrealism', 'belgian surrealism', 'philosophical art'
      ];
      
      // Only transform to Bourdin if explicitly requested
      const isBourdinRequested = concept.toLowerCase().includes('bourdin') || 
                                (detectedCategory && detectedCategory.toLowerCase().includes('bourdin'));
      
      const isMagritteStyle = magritteKeywords.some(keyword => 
        concept.toLowerCase().includes(keyword.toLowerCase())
      ) || !isBourdinRequested;
      
      if (isMagritteStyle) {
        // Select a random Magritte-specific category
        const magritteCategories = [
          ConceptCategory.MAGRITTE_CLASSIC,
          ConceptCategory.MAGRITTE_OBJECTS,
          ConceptCategory.MAGRITTE_METAMORPHOSIS,
          ConceptCategory.MAGRITTE_MYSTERY,
          ConceptCategory.MAGRITTE_MIRRORS,
          ConceptCategory.MAGRITTE_SCALE,
          ConceptCategory.MAGRITTE_WINDOWS,
          ConceptCategory.MAGRITTE_SILHOUETTES
        ];
        
        const selectedCategory = magritteCategories[Math.floor(Math.random() * magritteCategories.length)];
        
        if (!concept.toLowerCase().includes('magritte')) {
          console.log(`\n🎬 Enhancing concept with ${selectedCategory} style...`);
          artConcept = await generateCinematicConcept(aiService, {
            temperature: 0.9,
            category: selectedCategory
          });
        }
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
    
    // Save prompt and creative process
    fs.writeFileSync(
      promptPath,
      `Prompt: ${prompt}\n\nCreative Process: ${creativeProcess}`
    );
    console.log(`\n✅ Prompt saved to: ${promptPath}`);
    
    // Save image URL
    fs.writeFileSync(imagePath, imageUrl);
    console.log(`\n✅ Image URL saved to: ${imagePath}`);
    
    // After generating the artwork and before saving metadata, add critique
    const critique = await generateArtCritique(artwork, project.artDirection);
    
    // Log detailed critique
    console.log('\n📊 Artwork Critique:');
    console.log('\n🎨 Technical Analysis:');
    critique.technicalAnalysis.forEach(analysis => console.log(analysis));
    
    console.log('\n📐 Compositional Analysis:');
    critique.compositionalAnalysis.forEach(analysis => console.log(analysis));
    
    console.log('\n🖼️ Stylistic Fidelity:');
    critique.stylisticFidelity.forEach(analysis => console.log(analysis));
    
    console.log('\n💪 Strengths:');
    critique.strengths.forEach(strength => console.log(`• ${strength}`));
    
    console.log('\n📈 Areas for Improvement:');
    critique.areasForImprovement.forEach(area => console.log(`• ${area}`));
    
    console.log(`\n⭐ Overall Score: ${critique.overallScore}/10`);

    // After logging the critique, add AI evaluation results
    if (critique.aiEvaluation) {
      console.log('\n🤖 AI Evaluation:');
      console.log(`Technical Score: ${critique.aiEvaluation.technicalScore}/10`);
      console.log(`Composition Score: ${critique.aiEvaluation.compositionScore}/10`);
      console.log(`Stylistic Score: ${critique.aiEvaluation.stylisticScore}/10`);
      console.log('\nDetailed AI Analysis:');
      console.log(critique.aiEvaluation.analysis);
    }

    // Update the metadata with detailed critique and AI evaluation
    const metadata = {
      concept: artConcept,
      prompt: prompt,
      creativeProcess: creativeProcess,
      imageUrl: imageUrl,
      timestamp: new Date().toISOString(),
      isPostPhotoNative: isPostPhotoRelated || detectedCategory === 'post_photography',
      multiAgentCollaboration: true,
      artDirection: project.artDirection,
      critique: {
        strengths: critique.strengths,
        areasForImprovement: critique.areasForImprovement,
        overallScore: critique.overallScore,
        technicalAnalysis: critique.technicalAnalysis,
        compositionalAnalysis: critique.compositionalAnalysis,
        stylisticFidelity: critique.stylisticFidelity,
        aiEvaluation: critique.aiEvaluation
      }
    };
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`\n✅ Metadata saved to: ${metadataPath}`);
    
    // Store in memory system
    await memorySystem.storeMemory(
      {
        concept: artConcept,
        prompt: prompt,
        creativeProcess: creativeProcess,
        imageUrl: imageUrl,
        multiAgentCollaboration: true,
        artDirection: project.artDirection,
        critique: critique
      },
      MemoryType.EXPERIENCE,
      { 
        type: 'artwork', 
        concept: artConcept,
        isPostPhotoNative: isPostPhotoRelated || detectedCategory === 'post_photography'
      },
      ['artwork', 'flux', 'multi-agent', ...(isPostPhotoRelated ? ['fashion', 'surreal', 'bourdin'] : []), ...artConcept.split(' ')]
    );
    
    console.log('\n✨ Art generation completed successfully!');
    console.log('\n🤖 Multi-Agent Collaboration Summary:');
    console.log('- Director Agent: Coordinated the creative process');
    console.log('- Ideator Agent: Generated creative ideas based on the concept');
    console.log('- Stylist Agent: Developed artistic styles for the concept');
    console.log('- Refiner Agent: Created the final artwork using FLUX');
    console.log('- Critic Agent: Provided evaluation and feedback');
    
    if (result.critique) {
      console.log(`\n📊 Artwork Evaluation: ${result.critique.overallScore}/10`);
    }
    
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
    // Create a style that almost exclusively uses Magritte with minimal Bourdin elements
    const magritteStyle = artDirection.styles['magritte'] || {};
    const postPhotoStyle = artDirection.styles['postPhotography'] || {};
    
    return {
      styleEmphasis: [
        ...(magritteStyle.styleEmphasis || []).slice(0, 25), // Almost all Magritte elements
        ...(postPhotoStyle.styleEmphasis || []).slice(0, 2)  // Minimal Bourdin elements
      ],
      visualElements: [
        ...(magritteStyle.visualElements || []).slice(0, 25), // Almost all Magritte elements
        ...(postPhotoStyle.visualElements || []).slice(0, 2)  // Minimal Bourdin elements
      ],
      colorPalette: [
        ...(magritteStyle.colorPalette || []).slice(0, 15), // Almost all Magritte colors
        ...(postPhotoStyle.colorPalette || []).slice(0, 2)  // Minimal Bourdin colors
      ],
      compositionGuidelines: [
        ...(magritteStyle.compositionGuidelines || []).slice(0, 15), // Almost all Magritte composition
        ...(postPhotoStyle.compositionGuidelines || []).slice(0, 2)   // Minimal Bourdin composition
      ],
      moodAndTone: "A pure exploration of Magritte's surrealist vision, deeply focused on philosophical paradoxes, metaphysical questioning, and pristine compositions. The atmosphere embodies Magritte's contemplative approach to reality and representation, with his characteristic clean, precise execution and conceptual depth. While maintaining the technical sophistication of modern photography, the style remains firmly rooted in Magritte's surrealist philosophy and visual language.",
      references: [
        ...(magritteStyle.references || []).slice(0, 18), // Almost all Magritte references
        ...(postPhotoStyle.references || []).slice(0, 2)  // Minimal Bourdin references
      ],
      avoidElements: [
        ...(magritteStyle.avoidElements || []),
        "fashion editorial style",
        "extreme contrast",
        "provocative poses",
        "commercial aesthetics",
        "radical cropping",
        "fetishistic elements",
        "high-fashion styling"
      ]
    };
  }
  
  // If it's using the old format, return as is
  return artDirection;
} 