import * as dotenv from 'dotenv';
import { CreativeEngine } from './services/CreativeEngine';
import { StyleService } from './services/style';
import { artContextProvider } from './providers/artContext';
import { AIService } from './services/ai';

// Load environment variables from .env file
dotenv.config();

async function main() {
  try {
    console.log('🎨 Starting ArtBot...');
    
    // Initialize the AI service to demonstrate fallback
    const aiService = new AIService();
    await aiService.initialize();
    
    // Initialize the creative engine
    const creativeEngine = new CreativeEngine();
    await creativeEngine.initialize();
    console.log('✅ Creative Engine initialized');
    
    // Get art context
    const context = await artContextProvider.get();
    console.log('✅ Art Context loaded');
    
    // Display some information
    console.log('\n🖌️ Current Style Preferences:');
    context.stylePreferences.forEach((style, index) => {
      console.log(`  ${index + 1}. ${style.name}: ${style.score.toFixed(2)}`);
    });
    
    console.log(`\n🔍 Exploration Rate: ${context.explorationRate.toFixed(2)}`);
    console.log(`\n🖼️ Recent Works: ${context.recentWorks.length}`);
    
    // Demonstrate idea generation with AI service
    console.log('\n💡 Generating creative ideas...');
    const ideas = await creativeEngine.generateIdeas('cosmic garden');
    ideas.forEach((idea, index) => {
      console.log(`  ${index + 1}. ${idea}`);
    });
    
    console.log('\n🚀 ArtBot is ready!');
  } catch (error) {
    console.error('Error starting ArtBot:', error);
  }
}

main(); 