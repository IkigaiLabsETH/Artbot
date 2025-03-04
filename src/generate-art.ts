import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
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
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is required for image generation');
    }
    
    if (!anthropicApiKey && !openaiApiKey) {
      throw new Error('Either ANTHROPIC_API_KEY or OPENAI_API_KEY is required for prompt generation');
    }
    
    console.log('API Keys found:');
    console.log(`- Anthropic: ${anthropicApiKey ? 'Yes' : 'No'}`);
    console.log(`- OpenAI: ${openaiApiKey ? 'Yes' : 'No'}`);
    
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
    
    // Generate image using OpenAI's DALL-E 3
    console.log('🖼️ Generating image with DALL-E 3...');
    
    // Make a direct API call to OpenAI
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: detailedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error('Failed to generate image: No URL returned');
    }
    
    const imageUrl = data.data[0].url;
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