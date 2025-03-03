import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables from .env file
dotenv.config();

// Directly require the plugin source files
const { CreativeEngine } = require('../packages/plugin-art-creator/src/services/CreativeEngine');
const { StyleService } = require('../packages/plugin-art-creator/src/services/style');
const { ReplicateService } = require('../packages/plugin-art-creator/src/services/replicate');
const { generateArt } = require('../packages/plugin-art-creator/src/actions/generateArt');
const { evolveStyle } = require('../packages/plugin-art-creator/src/actions/evolveStyle');
const { artContextProvider, socialContextProvider } = require('../packages/plugin-art-creator/src/providers');

async function main() {
  try {
    console.log('🧪 Testing ArtCreatorPlugin components directly...');
    
    // Check if API keys are set
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('Anthropic API Key:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('Replicate API Key:', process.env.REPLICATE_API_KEY ? '✅ Set' : '❌ Not set');
    
    // Initialize the services
    console.log('\n🔄 Initializing services...');
    
    const creativeEngine = new CreativeEngine({
      openaiApiKey: process.env.OPENAI_API_KEY,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY
    });
    
    const styleService = new StyleService();
    
    const replicateService = new ReplicateService({
      apiKey: process.env.REPLICATE_API_KEY
    });
    
    // Initialize the services
    console.log('\n🚀 Starting services...');
    await creativeEngine.initialize();
    await styleService.initialize();
    await replicateService.initialize();
    console.log('✅ Services initialized successfully');
    
    // Log available providers
    console.log('\n📊 Available providers:');
    console.log('  - artContextProvider');
    console.log('  - socialContextProvider');
    
    // Test generate-art action
    console.log('\n🖌️ Testing generate-art action...');
    
    // Create a mock runtime for the action
    const mockRuntime = {
      runtime: {
        getService: (serviceType) => {
          console.log(`Mock runtime: getService(${serviceType}) called`);
          // Return the appropriate service based on the service type
          if (serviceType === 'TEXT_GENERATION') {
            return creativeEngine;
          }
          return null;
        }
      }
    };
    
    // Execute the action
    console.log('\n🎨 Executing generate-art action...');
    const result = await generateArt.execute({
      concept: 'cosmic garden',
      style: 'minimalist',
      medium: 'digital',
      explorationRate: 0.5,
      count: 2
    }, mockRuntime);
    
    console.log('✅ Action executed successfully');
    console.log('📊 Result:', result);
    
    console.log('\n🚀 Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

main(); 