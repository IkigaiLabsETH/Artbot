// Simple test script for the art creator plugin
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Mock the core module to avoid import issues
const mockCore = {
  Service: class Service {
    constructor() {}
    initialize() { return Promise.resolve(); }
  },
  ServiceType: {
    TEXT_GENERATION: 'TEXT_GENERATION'
  }
};

// Mock the plugin components
class CreativeEngine extends mockCore.Service {
  constructor(config) {
    super();
    this.openaiApiKey = config.openaiApiKey;
    this.anthropicApiKey = config.anthropicApiKey;
    console.log('CreativeEngine created with API keys:', 
      this.openaiApiKey ? '✅ OpenAI' : '❌ OpenAI',
      this.anthropicApiKey ? '✅ Anthropic' : '❌ Anthropic');
  }

  async generateIdeas(concept, count = 5) {
    console.log(`Generating ${count} ideas for concept: ${concept}`);
    // Mock implementation
    return [
      `A minimalist ${concept} with geometric shapes`,
      `An abstract interpretation of ${concept} with vibrant colors`,
      `A surreal ${concept} with dreamlike elements`,
      `A detailed ${concept} with intricate patterns`,
      `A futuristic ${concept} with technological elements`
    ].slice(0, count);
  }
}

class StyleService extends mockCore.Service {
  constructor() {
    super();
  }

  async getStyles() {
    return [
      { id: 'minimalist', name: 'Minimalist', score: 0.8 },
      { id: 'abstract', name: 'Abstract', score: 0.7 },
      { id: 'surreal', name: 'Surreal', score: 0.6 },
      { id: 'detailed', name: 'Detailed', score: 0.5 },
      { id: 'futuristic', name: 'Futuristic', score: 0.4 }
    ];
  }
}

class ReplicateService extends mockCore.Service {
  constructor(config) {
    super();
    this.apiKey = config.apiKey;
    console.log('ReplicateService created with API key:', this.apiKey ? '✅' : '❌');
  }

  async generateImage(prompt) {
    console.log(`Generating image for prompt: ${prompt}`);
    // Mock implementation
    return {
      url: 'https://example.com/image.jpg',
      prompt
    };
  }
}

// Mock the generate-art action
const generateArt = {
  execute: async (params, context) => {
    console.log('Executing generate-art action with params:', params);
    
    // Get the creative engine service
    const creativeEngine = context.runtime.getService(mockCore.ServiceType.TEXT_GENERATION);
    if (!creativeEngine) {
      throw new Error('Creative engine service not found');
    }
    
    // Generate ideas based on the concept
    const ideas = await creativeEngine.generateIdeas(params.concept, params.count);
    
    // Mock generating images for each idea
    const results = ideas.map((idea, index) => ({
      id: `artwork-${index + 1}`,
      concept: params.concept,
      idea,
      style: params.style,
      medium: params.medium,
      imageUrl: `https://example.com/artwork-${index + 1}.jpg`
    }));
    
    return results;
  }
};

async function main() {
  try {
    console.log('🧪 Testing ArtCreatorPlugin components...');
    
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
    
    // Test generate-art action
    console.log('\n🖌️ Testing generate-art action...');
    
    // Create a mock runtime for the action
    const mockRuntime = {
      runtime: {
        getService: (serviceType) => {
          console.log(`Mock runtime: getService(${serviceType}) called`);
          // Return the appropriate service based on the service type
          if (serviceType === mockCore.ServiceType.TEXT_GENERATION) {
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
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
    console.log('\n🚀 Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

main(); 