import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { CreativeEngine } from './services/CreativeEngine.js';
import { ReplicateService } from './services/replicate/index.js';
import { AIService } from './services/ai/index.js';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Default art generator using FLUX with conceptually rich prompts
 */
async function generateArt(concept?: string): Promise<void> {
  try {
    console.log('🎨 ArtBot - Generating Art with FLUX');
    console.log('------------------------------------');
    
    // Initialize services
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const replicateApiKey = process.env.REPLICATE_API_KEY;
    
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is required for image generation with FLUX');
    }
    
    if (!anthropicApiKey && !openaiApiKey) {
      throw new Error('Either ANTHROPIC_API_KEY or OPENAI_API_KEY is required for prompt generation');
    }
    
    console.log('API Keys found:');
    console.log(`- Anthropic: ${anthropicApiKey ? 'Yes' : 'No'}`);
    console.log(`- OpenAI: ${openaiApiKey ? 'Yes' : 'No'}`);
    console.log(`- Replicate: ${replicateApiKey ? 'Yes' : 'No'}`);
    
    // Initialize the ReplicateService with FLUX as the default model
    const replicateService = new ReplicateService({
      apiKey: replicateApiKey
    });
    
    // Initialize the AIService
    const aiService = new AIService({
      anthropicApiKey,
      openaiApiKey
    });
    
    // Initialize the CreativeEngine
    const creativeEngine = new CreativeEngine({
      anthropicApiKey,
      openaiApiKey,
      replicateService
    });
    
    await creativeEngine.initialize();
    console.log('✅ Services initialized\n');
    
    // Get concept from command line arguments or use default
    const artConcept = concept || process.argv[2] || 'cosmic garden at night';
    console.log(`💡 Using concept: "${artConcept}"\n`);
    
    // Generate conceptual image
    console.log('🖼️ Generating conceptual image...');
    const result = await creativeEngine.generateConceptualImage(artConcept);
    
    if (!result.imageUrl) {
      throw new Error('Failed to generate image');
    }
    
    console.log(`✅ Generated prompt: ${result.prompt}\n`);
    console.log(`✅ Creative process: ${result.creativeProcess}\n`);
    console.log(`✅ Image URL: ${result.imageUrl}\n`);
    
    // Save the results
    const outputDir = path.join(__dirname, '..', 'output');
    ensureDirectoryExists(outputDir);
    
    // Save the prompt and creative process to a file
    const promptFilename = `flux-${artConcept.replace(/\s+/g, '-').toLowerCase()}-prompt.txt`;
    const promptFilePath = path.join(outputDir, promptFilename);
    fs.writeFileSync(promptFilePath, `Prompt: ${result.prompt}\n\nCreative Process: ${result.creativeProcess}`);
    console.log(`✅ Prompt saved to: ${promptFilePath}\n`);
    
    // Save the image URL to a file
    const outputUrlPath = path.join(outputDir, `flux-${artConcept.replace(/\s+/g, '-').toLowerCase()}.txt`);
    fs.writeFileSync(outputUrlPath, result.imageUrl);
    console.log(`✅ Image URL saved to: ${outputUrlPath}`);
    
    // Save metadata about the generation
    const metadata = {
      concept: artConcept,
      prompt: result.prompt,
      creativeProcess: result.creativeProcess,
      imageUrl: result.imageUrl,
      timestamp: new Date().toISOString()
    };
    
    const metadataPath = path.join(outputDir, `flux-${artConcept.replace(/\s+/g, '-').toLowerCase()}-metadata.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Metadata saved to: ${metadataPath}`);
    
    console.log('\n✨ Art generation completed successfully!');
    
    return;
  } catch (error) {
    console.error(`Error generating art: ${error}`);
    throw error;
  }
}

// Run the function if this file is executed directly
if (import.meta.url === import.meta.resolve('./defaultArtGenerator.js') || 
    import.meta.url.endsWith('/defaultArtGenerator.ts') || 
    import.meta.url.endsWith('/defaultArtGenerator.js')) {
  generateArt().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export the function for use in other modules
export { generateArt }; 