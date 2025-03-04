import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { CreativeEngine } from './services/CreativeEngine.js';
import { ReplicateService } from './services/replicate/index.js';
import { AIService } from './services/ai/index.js';
import { MemorySystem, MemoryType } from './services/memory/index.js';
import { StyleService } from './services/style/index.js';
import { MultiAgentSystem } from './services/multiagent/index.js';
import { generateCinematicConcept, generateMultipleConcepts, ConceptCategory } from './services/ai/conceptGenerator.js';

// Load environment variables
dotenv.config();

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
    
    console.log('🎨 ArtBot - Generating Art with FLUX Pro');
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
    
    // Initialize multi-agent system
    const multiAgentSystem = new MultiAgentSystem({
      aiService,
    });
    
    await multiAgentSystem.initialize();
    
    // Initialize creative engine with all services
    const creativeEngine = new CreativeEngine({
      aiService,
      replicateService,
      memorySystem,
      styleService,
    });
    
    console.log('🧠 Creative Engine initialized');
    console.log('✅ Services initialized');
    
    // If no concept is provided via command line, generate a random cinematic concept
    let artConcept = concept;
    
    if (!artConcept) {
      // Determine which category to use
      let category: ConceptCategory | undefined;
      
      if (categoryArg) {
        // Try to match the category argument to a valid category
        const categoryKey = Object.keys(ConceptCategory).find(
          key => key.toLowerCase() === categoryArg.toLowerCase()
        );
        
        if (categoryKey) {
          category = ConceptCategory[categoryKey as keyof typeof ConceptCategory];
          console.log(`\n🎬 Generating a ${category} concept...`);
        } else {
          console.log(`\n⚠️ Unknown category: "${categoryArg}". Using default cinematic category.`);
          category = ConceptCategory.CINEMATIC;
        }
      } else {
        // If no category specified, use a random category for variety
        const categories = Object.values(ConceptCategory);
        category = categories[Math.floor(Math.random() * categories.length)];
        console.log(`\n🎬 Generating a ${category} concept...`);
      }
      
      // Generate the concept with the selected category
      artConcept = await generateCinematicConcept(aiService, { 
        temperature: 0.9,
        category
      });
    }
    
    console.log(`\n💡 Using concept: "${artConcept}"`);
    
    // Generate conceptual image
    console.log('\n🖼️ Generating conceptual image...');
    const result = await creativeEngine.generateConceptualImage(artConcept);
    
    if (!result.imageUrl) {
      console.error('❌ Failed to generate image');
      return;
    }
    
    // Save outputs to files
    const sanitizedConcept = artConcept.replace(/\s+/g, '-').toLowerCase();
    const promptPath = path.join(outputDir, `flux-${sanitizedConcept}-prompt.txt`);
    const imagePath = path.join(outputDir, `flux-${sanitizedConcept}.txt`);
    const metadataPath = path.join(outputDir, `flux-${sanitizedConcept}-metadata.json`);
    
    // Save prompt and creative process
    fs.writeFileSync(
      promptPath,
      `Prompt: ${result.prompt}\n\nCreative Process: ${result.creativeProcess}`
    );
    console.log(`\n✅ Prompt saved to: ${promptPath}`);
    
    // Save image URL
    fs.writeFileSync(imagePath, result.imageUrl);
    console.log(`\n✅ Image URL saved to: ${imagePath}`);
    
    // Save metadata
    const metadata = {
      concept: artConcept,
      prompt: result.prompt,
      creativeProcess: result.creativeProcess,
      imageUrl: result.imageUrl,
      timestamp: new Date().toISOString(),
    };
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`\n✅ Metadata saved to: ${metadataPath}`);
    
    // Store in memory system
    await memorySystem.storeMemory(
      {
        concept: artConcept,
        prompt: result.prompt,
        creativeProcess: result.creativeProcess,
        imageUrl: result.imageUrl,
      },
      MemoryType.EXPERIENCE,
      { type: 'artwork', concept: artConcept },
      ['artwork', 'flux', ...artConcept.split(' ')]
    );
    
    console.log('\n✨ Art generation completed successfully!');
  } catch (error) {
    console.error('❌ Error generating art:', error);
  }
}

// Run the main function
generateArt(concept).catch(console.error);

// Export the function for use in other modules
export { generateArt }; 