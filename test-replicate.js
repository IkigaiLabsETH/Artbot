// Simple test script for ReplicateService
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ReplicateService } from './src/services/replicate/index.js';

// Initialize dotenv
dotenv.config();

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testReplicateService() {
  console.log('Testing ReplicateService...');
  
  // Create an instance of ReplicateService
  const replicateService = new ReplicateService({
    apiKey: process.env.REPLICATE_API_KEY,
    defaultModel: 'stability-ai/sdxl'
  });
  
  // Initialize the service
  await replicateService.initialize();
  
  try {
    console.log('Generating image...');
    const result = await replicateService.generateImage({
      prompt: 'A futuristic AI artist creating a masterpiece, digital art style',
      width: 768,
      height: 768
    });
    
    console.log('Image generation successful!');
    console.log('Image URL:', result);
  } catch (error) {
    console.error('Error generating image:', error);
  }
}

// Run the test
testReplicateService().catch(console.error); 