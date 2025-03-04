import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ReplicateService } from './services/replicate/index.js';
import { AIService } from './services/ai/index.js';

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

async function generateArt() {
  try {
    console.log('🎨 ArtBot Image Generator');
    console.log('------------------------');
    
    // Initialize services
    const replicateApiKey = process.env.REPLICATE_API_KEY;
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is required');
    }
    
    if (!anthropicApiKey && !openaiApiKey) {
      throw new Error('Either ANTHROPIC_API_KEY or OPENAI_API_KEY is required');
    }
    
    console.log('API Keys found:');
    console.log(`- Replicate: ${replicateApiKey ? 'Yes' : 'No'}`);
    console.log(`- Anthropic: ${anthropicApiKey ? 'Yes' : 'No'}`);
    console.log(`- OpenAI: ${openaiApiKey ? 'Yes' : 'No'}`);
    
    const replicateService = new ReplicateService({ apiKey: replicateApiKey });
    const aiService = new AIService({
      anthropicApiKey,
      openaiApiKey,
    });
    
    console.log('✅ Services initialized\n');
    
    // Get concept from command line arguments or use default
    const concept = process.argv[2] || 'cosmic garden';
    console.log(`💡 Using concept: "${concept}"\n`);
    
    // Default image settings
    const width = 1024;
    const height = 1024;
    console.log(`📐 Image dimensions: ${width}x${height}`);
    
    // Generate detailed prompt
    console.log('📝 Generating detailed prompt...');
    const promptResponse = await aiService.getCompletion({
      model: 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: 'You are an expert art director who creates detailed prompts for AI image generation. Create a vivid, detailed art prompt based on the concept provided. Include specific visual elements, style references, color palette, and composition details. Make it approximately 200-300 words.'
        },
        {
          role: 'user',
          content: `Create a detailed art prompt for the concept "${concept}"`
        }
      ],
      temperature: 0.7,
      maxTokens: 1000
    });
    
    const detailedPrompt = promptResponse.content;
    console.log(`✅ Generated prompt: ${detailedPrompt}\n`);
    
    // Generate image
    console.log('🖼️ Generating image...');
    
    // Use the default model from the ReplicateService
    // This will use 'stability-ai/sdxl' which is set as the default in the service
    
    const input = {
      prompt: detailedPrompt,
      width: width,
      height: height,
      num_outputs: 1,
      guidance_scale: 7.5,
      num_inference_steps: 50,
      negative_prompt: "low quality, blurry, distorted, deformed, ugly, poor composition"
    };
    
    console.log(`📝 Input: ${JSON.stringify(input, null, 2)}`);
    
    // Use the generateImage method which uses the default model
    const imageUrl = await replicateService.generateImage(detailedPrompt, {
      width: width,
      height: height,
      num_inference_steps: 50,
      guidance_scale: 7.5,
      negative_prompt: "low quality, blurry, distorted, deformed, ugly, poor composition"
    });
    
    if (!imageUrl) {
      throw new Error('Failed to generate image');
    }
    
    console.log(`✅ Image generated: ${imageUrl}`);
    
    // Save the image URL to a file
    const outputDir = path.join(__dirname, '..', 'output');
    ensureDirectoryExists(outputDir);
    
    const filename = `${concept.replace(/\s+/g, '-').toLowerCase()}`;
    const outputPath = path.join(outputDir, `${filename}.txt`);
    fs.writeFileSync(outputPath, imageUrl);
    console.log(`✅ Image URL saved to: ${outputPath}`);
    
    return imageUrl;
  } catch (error) {
    console.error(`Error generating art: ${error}`);
    throw error;
  }
}

// Run the function
generateArt().catch(console.error); 