import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
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

// Helper function to download an image from a URL
async function downloadImage(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  const buffer = await response.buffer();
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Image downloaded to: ${outputPath}`);
}

// Function to wait for Replicate prediction to complete
async function waitForPrediction(predictionUrl: string, replicateApiKey: string): Promise<any> {
  let prediction;
  
  while (true) {
    const response = await fetch(predictionUrl, {
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }
    
    prediction = await response.json();
    
    if (prediction.status === 'succeeded') {
      return prediction;
    } else if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error}`);
    }
    
    // Wait for 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function generateArtWithFlux() {
  try {
    console.log('🎨 ArtBot Image Generator using FLUX');
    console.log('----------------------------------');
    
    // Initialize services
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const replicateApiKey = process.env.REPLICATE_API_KEY;
    
    if (!replicateApiKey) {
      throw new Error('REPLICATE_API_KEY is required for image generation with FLUX');
    }
    
    if (!anthropicApiKey && !process.env.OPENAI_API_KEY) {
      throw new Error('Either ANTHROPIC_API_KEY or OPENAI_API_KEY is required for prompt generation');
    }
    
    console.log('API Keys found:');
    console.log(`- Anthropic: ${anthropicApiKey ? 'Yes' : 'No'}`);
    console.log(`- Replicate: ${replicateApiKey ? 'Yes' : 'No'}`);
    
    const aiService = new AIService({
      anthropicApiKey,
      openaiApiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('✅ Services initialized\n');
    
    // Get concept from command line arguments or use default
    const concept = process.argv[2] || 'cosmic garden at night';
    console.log(`💡 Using concept: "${concept}"\n`);
    
    // Default image settings for FLUX
    const width = 768;
    const height = 768;
    const numInferenceSteps = 28;
    const guidanceScale = 3;
    
    console.log(`📐 Image dimensions: ${width}x${height}`);
    console.log(`🔄 Inference steps: ${numInferenceSteps}`);
    console.log(`🎯 Guidance scale: ${guidanceScale}`);
    
    // Generate detailed prompt
    console.log('📝 Generating detailed prompt...');
    const promptResponse = await aiService.getCompletion({
      model: 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: 'You are an expert art director who creates detailed prompts for AI image generation. Create a vivid, detailed art prompt based on the concept provided. Include specific visual elements, style references, color palette, and composition details. Make it approximately 200-300 words. For best results with the FLUX model, include the trigger word "CNSTLL" at the beginning of the prompt, and include keywords like "cinestill 800t", "night time", and "4k" for better quality.'
        },
        {
          role: 'user',
          content: `Create a detailed art prompt for the concept "${concept}"`
        }
      ],
      temperature: 0.7,
      maxTokens: 1000
    });
    
    // Ensure the prompt starts with the FLUX trigger word
    let detailedPrompt = promptResponse.content;
    if (!detailedPrompt.includes('CNSTLL')) {
      detailedPrompt = `CNSTLL ${detailedPrompt}`;
    }
    
    console.log(`✅ Generated prompt: ${detailedPrompt}\n`);
    
    // Generate image using FLUX model on Replicate
    console.log('🖼️ Generating image with FLUX...');
    
    // Make a direct API call to Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "9936c2def0a71d960f3c302a7d0c1c04f73fe55bee4a8fa45af33e4517c1a3bf",
        input: {
          prompt: detailedPrompt,
          width: width,
          height: height,
          num_inference_steps: numInferenceSteps,
          guidance_scale: guidanceScale,
          output_format: "png"
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Replicate API error: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log(`✅ Prediction started: ${data.id}`);
    
    // Wait for the prediction to complete
    const prediction = await waitForPrediction(data.urls.get, replicateApiKey);
    
    if (!prediction.output || prediction.output.length === 0) {
      throw new Error('Failed to generate image: No output returned');
    }
    
    const imageUrl = prediction.output[0];
    console.log(`✅ Image generated: ${imageUrl}`);
    
    // Save the image URL to a file
    const outputDir = path.join(__dirname, '..', 'output');
    ensureDirectoryExists(outputDir);
    
    const filename = `flux-${concept.replace(/\s+/g, '-').toLowerCase()}`;
    const outputUrlPath = path.join(outputDir, `${filename}.txt`);
    fs.writeFileSync(outputUrlPath, imageUrl);
    console.log(`✅ Image URL saved to: ${outputUrlPath}`);
    
    // Download the image
    const outputImagePath = path.join(outputDir, `${filename}.png`);
    await downloadImage(imageUrl, outputImagePath);
    
    return imageUrl;
  } catch (error) {
    console.error(`Error generating art with FLUX: ${error}`);
    throw error;
  }
}

// Run the function
generateArtWithFlux().catch(console.error); 