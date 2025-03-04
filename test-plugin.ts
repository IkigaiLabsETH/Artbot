// @ts-check
// Use ESM imports instead of CommonJS
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

async function main() {
  console.log('Testing ArtCreatorPlugin...');
  
  try {
    // Check if API keys are set
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Not Set');
    console.log('Anthropic API Key:', process.env.ANTHROPIC_API_KEY ? 'Set' : 'Not Set');
    console.log('Replicate API Key:', process.env.REPLICATE_API_KEY ? 'Set' : 'Not Set');
    
    // Dynamically import the plugin to avoid ESM issues
    const pluginPath = path.resolve(__dirname, 'packages/plugin-art-creator/dist/index.js');
    console.log('Loading plugin from:', pluginPath);
    const ArtCreatorPlugin = (await import(pluginPath)).default;
    
    // Initialize the plugin
    const plugin = new ArtCreatorPlugin({
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
      replicateApiKey: process.env.REPLICATE_API_KEY || ''
    });
    
    // Initialize the plugin
    console.log('Starting plugin...');
    await plugin.onStart();
    console.log('Plugin started successfully');
    
    // Log available services, actions, and providers
    logAvailableServices(plugin);
    logAvailableActions(plugin);
    logAvailableProviders(plugin);
    
    // Test generate-art action
    console.log('\nTesting generate-art action...');
    const actions = plugin.getActions();
    const generateArt = actions['generate-art'];
    
    if (generateArt) {
      console.log('Executing generate-art action...');
      const artwork = await generateArt.execute({
        concept: 'cosmic garden',
        count: 2,
        style: 'minimalist',
        medium: 'digital',
        explorationRate: 0.5
      }, mockRuntime());
      
      console.log('Generated artwork:', artwork);
      console.log('Is array:', Array.isArray(artwork));
      if (Array.isArray(artwork)) {
        console.log('Count:', artwork.length);
      }
    } else {
      console.error('generate-art action not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

function logAvailableServices(plugin) {
  console.log('\nAvailable Services:');
  const services = plugin.getServices();
  Object.keys(services).forEach(serviceId => {
    console.log(`- ${serviceId}: ${services[serviceId].length} service(s)`);
  });
}

function logAvailableActions(plugin) {
  console.log('\nAvailable Actions:');
  const actions = plugin.getActions();
  Object.keys(actions).forEach(actionId => {
    console.log(`- ${actionId}`);
  });
}

function logAvailableProviders(plugin) {
  console.log('\nAvailable Providers:');
  const providers = plugin.getProviders();
  Object.keys(providers).forEach(providerId => {
    console.log(`- ${providerId}`);
  });
}

function mockRuntime() {
  return {
    runtime: {
      getService: (serviceId) => {
        console.log(`Mock runtime: getService(${serviceId}) called`);
        return null;
      }
    }
  };
}

main().catch(error => {
  console.error('Error:', error);
}); 