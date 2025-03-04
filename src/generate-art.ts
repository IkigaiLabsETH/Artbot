import { ReplicateService } from './services/replicate/index.js';
import { AIService } from './services/ai/index.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateArt() {
  try {
    console.log('🎨 ArtBot Image Generator');
    console.log('------------------------');

    // Initialize services
    const replicateApiKey = process.env.REPLICATE_API_KEY;
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is required');
    }
    const replicateService = new ReplicateService({ apiKey: replicateApiKey });
    console.log(`✅ Replicate API key found: ${replicateApiKey.substring(0, 5)}...`);

    // Set default model and dimensions
    const defaultModel = 'stability-ai/sdxl';
    const width = 1024;
    const height = 1024;
    console.log(`🖼️ Default image model: ${defaultModel}`);
    console.log(`📐 Image dimensions: ${width}x${height}`);

    // Initialize AI service for prompt generation
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!anthropicApiKey && !openaiApiKey) {
      throw new Error('Either ANTHROPIC_API_KEY or OPENAI_API_KEY is required');
    }
    
    if (anthropicApiKey) {
      console.log(`✅ Anthropic API key found: ${anthropicApiKey.substring(0, 5)}...`);
    }
    
    if (openaiApiKey) {
      console.log(`✅ OpenAI API key found (fallback): ${openaiApiKey.substring(0, 5)}...`);
    }
    
    const aiService = new AIService({
      anthropicApiKey,
      openaiApiKey,
    });
    
    console.log('✅ Services initialized\n');

    // Get concept from command line arguments or use default
    const concept = process.argv[2] || 'cosmic garden';
    console.log(`💡 Using concept: "${concept}"\n`);

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
    
    // Use the correct model version
    const modelVersion = "stability-ai/sdxl:7762fd07";
    console.log(`🔄 Running prediction on model: ${modelVersion}`);
    
    const input = {
      prompt: detailedPrompt,
      width,
      height,
      num_outputs: 1
    };
    
    console.log(`📝 Input: ${JSON.stringify(input, null, 2)}`);
    
    const prediction = await replicateService.runPrediction(modelVersion, input);
    
    if (prediction.status !== 'success' || !prediction.output || prediction.output.length === 0) {
      throw new Error(`Prediction failed: ${JSON.stringify(prediction)}`);
    }
    
    const imageUrl = prediction.output[0];
    console.log(`✅ Image generated: ${imageUrl}`);

    // Save the image URL to a file
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = concept.replace(/\s+/g, '-').toLowerCase();
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