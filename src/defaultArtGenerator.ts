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
    // Magritte elements
    "Magritte surrealism",
    "oil painting technique",
    "visible brushstrokes",
    "canvas texture",
    "painterly quality",
    "traditional painting style",
    "fine art",
    "non-photorealistic",
    "high contrast",
    "atmospheric",
    "surreal juxtaposition",
    "dreamlike illusion",
    "mysterious sense of depth",
    "enigmatic silhouettes",
    "unexpected negative space",
    "symbolic imagery",
    "contrasting shadow play",
    "theatrical lighting",
    "layered or 'painting-within-a-painting' composition",
    "metaphorical objects",
    "subtle humor",
    "ephemeral illusions",
    "philosophical questioning",
    "conceptual paradoxes",
    "visual poetry",
    // Guy Bourdin elements
    "high-fashion surrealism",
    "cinematic drama",
    "bold and provocative styling",
    "hyper-stylized compositions",
    "exaggerated contrast",
    "saturated color intensity",
    "graphic and geometric arrangements",
    "sharp and theatrical lighting",
    "absurdist yet seductive visual narratives",
    "glossy and polished aesthetic",
    "otherworldly glamour",
    "erotic undertones with surreal juxtapositions",
    "enigmatic and dreamlike storytelling",
    "fashion photography meets fine art",
    "bold cropping and unexpected framing",
    "commercial aesthetics with artistic depth",
    "fetishistic elements with artistic intent",
    "narrative tension through visual fragments",
    "hyperreal color saturation",
    "staged scenarios with mysterious implications"
  ],
  visualElements: [
    // Magritte elements
    "bowler hats",
    "floating objects",
    "clouds",
    "blue skies",
    "reflective surfaces",
    "impossible scenes",
    "ordinary objects in extraordinary contexts",
    "visual paradoxes",
    "windows and frames",
    "silhouettes",
    "green apples (often oversized or placed in unexpected locations)",
    "men in suits (the 'anonymous everyman' figure)",
    "veiled or obscured faces",
    "unexpected scale changes",
    "train engines emerging from unusual places",
    "overlapping realities (layers within layers)",
    "theatrical backdrops (stage-like settings)",
    "contradictory shadows or silhouettes",
    "oversized everyday objects",
    "day-to-night contrasts",
    "the single eye (filled with sky or clouds)",
    "curtains framing scenes",
    "mismatched reflections",
    "disjointed landscapes",
    "blend of interior and exterior spaces",
    // Guy Bourdin elements
    "elongated limbs and dramatic poses",
    "partially obscured figures",
    "fragmented body parts as objects",
    "high heels and stockings as symbols of fetishism",
    "glossy red lips",
    "unexpected mannequin-like expressions",
    "disembodied legs and arms",
    "retro automobiles with reflections",
    "mirrors used for distorted realities",
    "poolside glamour",
    "vivid backdrops of red, pink, and orange",
    "oversized accessories as surreal objects",
    "subliminal tension in everyday settings",
    "visual irony through exaggerated femininity",
    "cinematic storytelling with incomplete narratives",
    "fashion accessories in surreal contexts",
    "models with doll-like or mannequin qualities",
    "luxury objects with sinister undertones",
    "domestic settings with uncanny elements",
    "commercial products elevated to artistic symbols"
  ],
  colorPalette: [
    // Magritte elements
    "Magritte blues",
    "soft greens",
    "earthy browns",
    "rich blues",
    "deep reds",
    "golden highlights",
    "shadow detail",
    "selective saturation",
    "oil paint color mixing",
    "limited palette typical of Magritte's work",
    "twilight blues from 'The Empire of Light'",
    "clear sky blues",
    "muted greens of foliage",
    "warm wood tones",
    "cool grays for clouds",
    // Guy Bourdin elements
    "high-contrast red and black",
    "electric blues and deep purples",
    "bold primary colors with extreme saturation",
    "glossy skin tones with a hyperreal sheen",
    "intense shadow-play creating depth",
    "high-contrast highlights with a sculptural effect",
    "retro pastel shades used subversively",
    "artificial neon glow for added tension",
    "striking monochrome with deep blacks and crisp whites",
    "candy-like color saturation",
    "blood reds against pale skin",
    "jewel tones with unnatural intensity",
    "synthetic color combinations",
    "color blocking with dramatic impact",
    "reflective surfaces with color distortion"
  ],
  compositionGuidelines: [
    // Magritte elements
    "rule of thirds",
    "leading lines",
    "depth of field",
    "framing elements",
    "balanced asymmetry",
    "surreal scale relationships",
    "clean compositions with clear subjects",
    "canvas-like proportions",
    "traditional painting composition",
    "centered single subject focus",
    "theatrical staging of elements",
    "window-like framing devices",
    "horizon line placement for psychological effect",
    "juxtaposition of disparate scales",
    "symmetrical balance with surreal disruption",
    // Guy Bourdin elements
    "tight cropping with focus on partial details",
    "radical framing techniques",
    "unexpected perspective shifts",
    "graphic and symmetrical arrangements",
    "negative space used for dramatic effect",
    "extreme foreshortening and distorted angles",
    "bold, unnatural color contrasts",
    "forced perspectives that heighten the surrealist feel",
    "motion blur used selectively to create tension",
    "fragmentation of subjects to break realism",
    "diagonal compositions with dynamic energy",
    "frame within frame techniques",
    "strategic placement of color accents",
    "compositional tension through asymmetry",
    "cinematic framing with narrative implications"
  ],
  moodAndTone: "A fusion of Magritte's dreamlike philosophical questioning with Guy Bourdin's seductive, provocative boldness. The atmosphere should blend surrealist concepts with high-fashion aesthetics, creating compositions that are both intellectually stimulating and visually striking. Magritte's quiet contemplation, subtle humor, and metaphysical puzzles merge with Bourdin's theatrical drama, erotic tension, and commercial glamour. The result should be images that provoke thought while captivating with their bold visual impact—philosophical depth expressed through provocative styling, traditional painting techniques enhanced by fashion photography's dramatic flair, and surrealist concepts given new life through contemporary visual language.",
  references: [
    // Magritte references
    "René Magritte's 'The Son of Man'",
    "René Magritte's 'The Empire of Light'",
    "René Magritte's 'The Treachery of Images'",
    "René Magritte's 'Golconda'",
    "René Magritte's 'Time Transfixed (La Durée Poignardée)'",
    "René Magritte's 'The Lovers (Les Amants)'",
    "René Magritte's 'Not to Be Reproduced (La Reproduction Interdite)'",
    "René Magritte's 'The Human Condition (La Condition Humaine)'",
    "René Magritte's 'The False Mirror (Le Faux Miroir)'",
    "René Magritte's 'Le Blanc Seing (The Blank Check)'",
    "René Magritte's 'The Listening Room (La Chambre d'Écoute)'",
    "René Magritte's 'La Clairvoyance'",
    "René Magritte's oil painting techniques",
    "Traditional Belgian surrealist painting style",
    // Guy Bourdin references
    "Guy Bourdin's Vogue Paris fashion editorials",
    "Guy Bourdin's Charles Jourdan shoe campaigns",
    "Guy Bourdin's work for French Vogue (1955-1987)",
    "Guy Bourdin's Pentax calendar series",
    "Guy Bourdin's Chanel campaigns",
    "Helmut Newton's high-gloss eroticism",
    "Man Ray's experimental fashion photography",
    "Hitchcock's dramatic lighting and compositions",
    "Kubrick's symmetrical cinematography",
    "Retro-futuristic advertising aesthetics",
    "Fetishistic and cinematic styling from the 70s and 80s",
    "Roland Barthes' semiotic analysis of fashion imagery",
    "David Lynch's surrealist film aesthetics"
  ],
  avoidElements: [
    // Common elements to avoid
    "text",
    "watermarks",
    "digital artifacts",
    "chaotic compositions",
    "abstract expressionism",
    "3D rendering look",
    "photorealistic rendering",
    "digital art aesthetics",
    // Magritte-specific avoids
    "distorted faces (unless in Magritte's specific style)",
    "overly saturated colors (unless in Bourdin's specific style)",
    // Guy Bourdin specific avoids
    "soft-focus or pastel romanticism",
    "naturalistic and candid photography",
    "muted or desaturated color schemes",
    "low-contrast, flat lighting",
    "overly digital and CGI aesthetics",
    "realism without surreal or exaggerated elements",
    "documentary-style photography",
    "casual or unstylized compositions"
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
  
  // Category detection patterns
  const categoryPatterns = [
    { category: 'lovers', keywords: ['lover', 'veil', 'covered face', 'hidden identity', 'intimacy', 'couple'] },
    { category: 'empire_of_light', keywords: ['day and night', 'empire of light', 'night sky', 'daytime', 'street lamp'] },
    { category: 'objects', keywords: ['apple', 'pipe', 'bowler hat', 'everyday object', 'still life'] },
    { category: 'windows', keywords: ['window', 'frame', 'view', 'looking through', 'glass'] },
    { category: 'silhouettes', keywords: ['silhouette', 'shadow', 'outline', 'dark figure'] },
    { category: 'metamorphosis', keywords: ['transform', 'change', 'metamorphosis', 'becoming', 'evolution'] },
    { category: 'wordplay', keywords: ['word', 'language', 'text', 'meaning', 'treachery of images'] },
    { category: 'scale', keywords: ['giant', 'miniature', 'scale', 'proportion', 'size', 'oversized'] },
    { category: 'mystery', keywords: ['mystery', 'enigma', 'puzzle', 'unknown', 'question'] },
    { category: 'landscapes', keywords: ['landscape', 'nature', 'horizon', 'vista', 'scenery'] },
    { category: 'skies', keywords: ['sky', 'cloud', 'bird', 'flying', 'heaven', 'air'] },
    { category: 'classic', keywords: ['classic', 'iconic', 'famous', 'son of man', 'golconda'] },
    // Add Bourdin-related categories
    { category: 'bourdin_fashion', keywords: ['fashion', 'vogue', 'glamour', 'editorial', 'haute couture', 'runway', 'model', 'magazine'] },
    { category: 'bourdin_color', keywords: ['vibrant', 'saturated', 'high-contrast', 'bold colors', 'red lips', 'crimson', 'electric blue'] },
    { category: 'bourdin_composition', keywords: ['cropped', 'fragmented', 'disembodied', 'partial view', 'tight framing', 'cinematic', 'theatrical'] },
    { category: 'bourdin_narrative', keywords: ['provocative', 'erotic', 'suggestive', 'mysterious narrative', 'implied story', 'tension', 'suspense'] },
    { category: 'bourdin_objects', keywords: ['stiletto', 'high heel', 'mannequin', 'luxury goods', 'cosmetics', 'perfume', 'jewelry', 'accessories'] }
  ];
  
  // Check for keyword matches
  for (const pattern of categoryPatterns) {
    if (pattern.keywords.some(keyword => conceptLower.includes(keyword))) {
      console.log(`\n🔍 Auto-detected category: ${pattern.category} based on concept keywords`);
      return pattern.category;
    }
  }
  
  return undefined;
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
      // Determine which category to use
      let category: ConceptCategory | undefined;
      
      if (detectedCategory) {
        // Try to match the detected category to a valid category
        const categoryKey = Object.keys(ConceptCategory).find(
          key => key.toLowerCase() === detectedCategory.toLowerCase()
        );
        
        if (categoryKey) {
          category = ConceptCategory[categoryKey as keyof typeof ConceptCategory];
          console.log(`\n🎬 Generating a ${category} concept...`);
        } else {
          console.log(`\n⚠️ Unknown category: "${detectedCategory}". Using MAGRITTE_SURREALISM category.`);
          category = ConceptCategory.MAGRITTE_SURREALISM;
        }
      } else {
        // If no category specified, use MAGRITTE_SURREALISM as the default
        category = ConceptCategory.MAGRITTE_SURREALISM;
        console.log(`\n🎬 Generating a ${category} concept...`);
      }
      
      // Generate the concept with the selected category
      artConcept = await generateCinematicConcept(aiService, { 
        temperature: 0.9,
        category
      });
    } else {
      // Check if the provided concept is post-photography related
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
      const isPostPhotoRelated = postPhotoKeywords.some(keyword => concept.toLowerCase().includes(keyword));
      
      // If post-photography related, use POST_PHOTOGRAPHY category
      if (isPostPhotoRelated && !detectedCategory) {
        console.log(`\n🎬 Detected post-photography related concept, using POST_PHOTOGRAPHY category...`);
        const postPhotographyConcept = await generateCinematicConcept(aiService, {
          temperature: 0.9,
          category: ConceptCategory.POST_PHOTOGRAPHY
        });
        artConcept = postPhotographyConcept;
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
          "Glossy white",
          "Neon accents",
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
    
    // Save metadata
    const metadata = {
      concept: artConcept,
      prompt: prompt,
      creativeProcess: creativeProcess,
      imageUrl: imageUrl,
      timestamp: new Date().toISOString(),
      isPostPhotoNative: isPostPhotoRelated || detectedCategory === 'post_photography',
      multiAgentCollaboration: true,
      artDirection: project.artDirection,
      critique: result.critique ? {
        strengths: result.critique.strengths,
        areasForImprovement: result.critique.areasForImprovement,
        overallScore: result.critique.overallScore
      } : null
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
        critique: result.critique
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
    // Instead of choosing one style or the other, blend them together
    const magritteStyle = artDirection.styles['magritte'] || {};
    const postPhotoStyle = artDirection.styles['postPhotography'] || {};
    
    // Create a blended style that combines elements from both
    return {
      styleEmphasis: [
        ...(magritteStyle.styleEmphasis || []).slice(0, 10), // Reduced Magritte elements
        ...(postPhotoStyle.styleEmphasis || []).slice(0, 20) // Increased Bourdin elements
      ],
      visualElements: [
        ...(magritteStyle.visualElements || []).slice(0, 10), // Reduced Magritte elements
        ...(postPhotoStyle.visualElements || []).slice(0, 20) // Increased Bourdin elements
      ],
      colorPalette: [
        ...(magritteStyle.colorPalette || []).slice(0, 8), // Reduced Magritte colors
        ...(postPhotoStyle.colorPalette || []).slice(0, 12) // Increased Bourdin colors
      ],
      compositionGuidelines: [
        ...(magritteStyle.compositionGuidelines || []).slice(0, 8), // Reduced Magritte composition
        ...(postPhotoStyle.compositionGuidelines || []).slice(0, 12) // Increased Bourdin composition
      ],
      moodAndTone: "A fusion of Magritte's dreamlike philosophical questioning with Guy Bourdin's seductive, provocative boldness. The atmosphere should blend surrealist concepts with high-fashion aesthetics, creating compositions that are both intellectually stimulating and visually striking. Magritte's quiet contemplation, subtle humor, and metaphysical puzzles merge with Bourdin's theatrical drama, erotic tension, and commercial glamour.",
      references: [
        ...(magritteStyle.references || []).slice(0, 10), // Take more Magritte references
        ...(postPhotoStyle.references || []).slice(0, 10) // Take more Bourdin references
      ],
      avoidElements: [
        ...(magritteStyle.avoidElements || []).slice(0, 5), // Take Magritte avoids
        ...(postPhotoStyle.avoidElements || []).slice(0, 8) // Take more Bourdin avoids
      ]
    };
  }
  
  // If it's using the old format, return as is
  return artDirection;
} 