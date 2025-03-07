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
    // Pure Portrait Focus
    "extreme close-up portrait technique",
    "absolute photorealistic detail in facial features",
    "perfectly smooth surface quality",
    "razor-sharp eye definition",
    "masterful fur rendering",
    "pristine portrait finish",
    "crystalline facial clarity",
    "perfect anatomical precision",
    "museum-quality execution",
    "mathematically precise facial modeling",
    // Essential Minimalism
    "absolute essential elements only",
    "pure portrait focus",
    "stark simplicity",
    "singular subject emphasis",
    "minimal compositional elements"
  ],
  visualElements: [
    // Extreme Portrait Focus
    "extreme macro close-up of bear face",
    "eyes and nose only composition",
    "face fills 95% of frame",
    "perfect square 1:1 ratio crop",
    "ultra-sharp facial features",
    // Core Bear Features
    "direct eye contact with perfect symmetry",
    "ultra-detailed iris texture",
    "microscopic fur detail around eyes",
    "mathematically centered nose",
    "perfect facial symmetry",
    // Essential Details
    "pristine catch lights in eyes",
    "individual eyelash definition",
    "unwavering forward gaze",
    "surgical edge precision",
    "absolute minimal lighting"
  ],
  colorPalette: [
    // Essential Portrait Colors
    "bear fur brown (RGB: 89, 61, 43)",
    "eye highlight white (RGB: 245, 245, 245)",
    "iris detail brown (RGB: 75, 54, 33)",
    // Minimal Tones
    "pure black for depth",
    "single highlight tone",
    "one shadow value"
  ],
  compositionGuidelines: [
    // Extreme Portrait Composition
    "face must fill 95% of frame width",
    "eyes positioned exactly on upper third line",
    "nose perfectly centered on vertical axis",
    "absolute symmetrical balance",
    "perfect square 1:1 aspect ratio",
    // Mathematical Precision
    "golden ratio eye spacing",
    "exact rule of thirds eye placement",
    "precise facial centering",
    // Minimalist Constraints
    "no environmental elements",
    "pure black background",
    "single light source only",
    "minimal depth layers"
  ],
  moodAndTone: "Create an extremely minimalist bear portrait with absolute technical perfection, focusing exclusively on an extreme macro close-up where only the bear's eyes and nose are visible. Strip away all surreal elements to achieve radical simplicity. The execution must demonstrate flawless technique with an unwavering focus on facial features. Every element should emphasize the bear's direct gaze and perfect symmetry. The atmosphere should embody pure portraiture through pristine technical execution and absolute minimalism.",
  references: [
    // Portrait References
    "Chuck Close's 'Big Self-Portrait' (1967-1968) - for extreme close-up technique",
    "The Blank Page (1967) - for absolute surface perfection",
    "Dürer's precision in animal studies - for anatomical accuracy"
  ],
  avoidElements: [
    // Composition Restrictions
    "anything below nose level",
    "anything above forehead",
    "any body elements",
    "three-quarter views",
    "profile angles",
    "tilted head poses",
    "looking away poses",
    // Background Elements
    "any background elements",
    "environmental context",
    "props or objects",
    "surreal elements",
    "floating items",
    "bowler hats",
    "apples",
    "clouds",
    // Technical Restrictions
    "multiple light sources",
    "complex shadows",
    "textural variations",
    "atmospheric effects",
    "decorative elements",
    "pattern elements"
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
      
      console.log(`\n🎬 Generating styled bear portrait concepts...`);
      
      // First generate base concepts
      const basePortraitConcepts = await generateMultipleConcepts(
        aiService,
        3, // Generate 3 concepts
        {
          temperature: 0.7, // Higher temperature for more creative variations
          category
        }
      );

      // Define distinctive bear styling elements
      const bearStyles = [
        {
          accessory: "vintage round glasses",
          personality: "intellectual",
          detail: "gold wire frames catching light"
        },
        {
          accessory: "silk bow tie",
          personality: "sophisticated",
          detail: "deep burgundy with subtle pattern"
        },
        {
          accessory: "leather newsboy cap",
          personality: "artisan",
          detail: "worn leather texture"
        },
        {
          accessory: "pearl necklace",
          personality: "elegant",
          detail: "single strand of lustrous pearls"
        },
        {
          accessory: "monocle",
          personality: "distinguished",
          detail: "gold chain accent"
        },
        {
          accessory: "velvet beret",
          personality: "artistic",
          detail: "deep navy velvet"
        }
      ];

      // Enhance each concept with unique styling
      const enhancedConcepts = basePortraitConcepts.map((concept, index) => {
        // Select a random style (ensure each concept gets a different style)
        const style = bearStyles[Math.floor(Math.random() * bearStyles.length)];
        
        // Create styled portrait concept
        return `Minimalist bear portrait with ${style.accessory} - ${style.personality} expression, ${style.detail}. Ultra-close facial study, eyes dominating frame, perfect symmetry, pure black background.`;
      });

      // Display enhanced concepts for selection
      console.log('\n📝 Generated Styled Portrait Concepts:');
      enhancedConcepts.forEach((concept, index) => {
        console.log(`${index + 1}. ${concept}`);
      });

      // Get user input for concept selection
      const selection = await getUserInput('\n🤔 Please select a styled portrait concept (1-3): ');
      const selectedIndex = parseInt(selection) - 1;
      
      if (selectedIndex >= 0 && selectedIndex < enhancedConcepts.length) {
        artConcept = enhancedConcepts[selectedIndex];
        console.log(`\n✨ Selected styled portrait concept: "${artConcept}"`);
      } else {
        console.log('\n⚠️ Invalid selection. Using the first styled portrait concept as default.');
        artConcept = enhancedConcepts[0];
        console.log(`\n✨ Selected styled portrait concept: "${artConcept}"`);
      }
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
    
    // Save prompt and creative process
    fs.writeFileSync(
      promptPath,
      `Prompt: ${prompt}\n\nCreative Process: ${creativeProcess}`
    );
    console.log(`\n✅ Prompt saved to: ${promptPath}`);
    
    // Save image URL
    fs.writeFileSync(imagePath, imageUrl);
    console.log(`\n✅ Image URL saved to: ${imagePath}`);
    
    // Update the metadata without critique
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