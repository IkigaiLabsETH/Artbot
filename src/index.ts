import { CreativeEngine } from './services/CreativeEngine';
import { StyleService } from './services/style';
import { artContextProvider } from './providers/artContext';

// Initialize global namespace for Eliza
declare global {
  namespace NodeJS {
    interface Global {
      eliza: {
        getService: <T>(serviceType: any, serviceClass: any) => Promise<T>;
      }
    }
  }
}

// Mock the global eliza object for development
if (!global.eliza) {
  global.eliza = {
    getService: async <T>(serviceType: any, serviceClass: any): Promise<T> => {
      if (serviceClass === CreativeEngine) {
        return new CreativeEngine() as unknown as T;
      } else if (serviceClass === StyleService) {
        return new StyleService() as unknown as T;
      }
      throw new Error(`Service not found: ${serviceClass.name}`);
    }
  };
}

async function main() {
  try {
    console.log('🎨 Starting ArtBot...');
    
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
    
    console.log('\n🚀 ArtBot is ready!');
  } catch (error) {
    console.error('Error starting ArtBot:', error);
  }
}

main(); 