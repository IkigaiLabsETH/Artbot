import dotenv from 'dotenv';
import { CreativeEngine } from './services/CreativeEngine.js';
import { StyleService } from './services/style/index.js';
import { artContextProvider } from './providers/artContext.js';
import { AIService } from './services/ai/index.js';
import { MemorySystem, MemoryType } from './services/memory/index.js';
import { MultiAgentSystem, AgentRole } from './services/multiagent/index.js';
import { SocialEngagementService } from './services/social/index.js';

// Export all components
export {
  CreativeEngine,
  StyleService,
  AIService,
  MemorySystem,
  MemoryType,
  MultiAgentSystem,
  AgentRole,
  SocialEngagementService
};

// Load environment variables
dotenv.config();

/**
 * Main function to run the ArtBot
 */
async function main() {
  console.log('🎨 Starting ArtBot');
  console.log('------------------');

  try {
    // Initialize services
    const artBot = new CreativeEngine({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY
    });
    
    await artBot.initialize();
    console.log('✅ ArtBot initialized');

    // Get art context
    const artContext = await artContextProvider.get();
    console.log('✅ Art context retrieved');

    // Display style preferences
    const stylePreferences = artBot.getStylePreferences();
    console.log('\n🎭 Style Preferences:');
    stylePreferences.forEach(style => {
      console.log(`  - ${style.name}: ${style.score.toFixed(2)}`);
    });

    // Generate creative ideas
    console.log('\n💡 Generating ideas for "cosmic garden"...');
    const ideas = await artBot.generateIdeas('cosmic garden');
    console.log('✅ Generated ideas:');
    ideas.forEach(idea => console.log(`  - ${idea}`));

    // Display idea queue statistics
    console.log('\n📊 Idea Queue Statistics:');
    console.log(JSON.stringify(artBot.getIdeaQueueStatistics(), null, 2));

    // Monitor active threads
    console.log('\n⏳ Monitoring active threads...');
    
    // Function to display active threads
    const displayActiveThreads = () => {
      const activeThreads = artBot.getActiveThreads();
      console.log(`\n🔄 Active Threads (${activeThreads.length}):`);
      
      if (activeThreads.length === 0) {
        console.log('  No active threads');
      } else {
        activeThreads.forEach(thread => {
          const idea = artBot.getIdea(thread.ideaId);
          if (idea) {
            console.log(`  - ${idea.title}: ${thread.direction} (Progress: ${Math.round(thread.progress * 100)}%)`);
          }
        });
      }
    };
    
    // Display active threads initially
    displayActiveThreads();
    
    // Set up an interval to display active threads
    const monitorInterval = setInterval(() => {
      displayActiveThreads();
      
      // Check if all threads are completed
      const stats = artBot.getIdeaQueueStatistics();
      if (stats.threadsByStatus.active === 0 && stats.threadsByStatus.paused === 0) {
        clearInterval(monitorInterval);
        displayResults(artBot);
      }
    }, 5000);
    
    // Generate more ideas with different themes
    setTimeout(async () => {
      console.log('\n💡 Generating ideas for "digital dreamscape"...');
      const moreIdeas = await artBot.generateIdeas('digital dreamscape');
      console.log('✅ Generated more ideas:');
      moreIdeas.forEach(idea => console.log(`  - ${idea}`));
      
      // Display updated statistics
      console.log('\n📊 Updated Idea Queue Statistics:');
      console.log(JSON.stringify(artBot.getIdeaQueueStatistics(), null, 2));
    }, 10000);
    
    // Generate even more ideas with a third theme
    setTimeout(async () => {
      console.log('\n💡 Generating ideas for "urban jungle"...');
      const evenMoreIdeas = await artBot.generateIdeas('urban jungle');
      console.log('✅ Generated even more ideas:');
      evenMoreIdeas.forEach(idea => console.log(`  - ${idea}`));
      
      // Display updated statistics
      console.log('\n📊 Updated Idea Queue Statistics:');
      console.log(JSON.stringify(artBot.getIdeaQueueStatistics(), null, 2));
    }, 20000);
    
  } catch (error) {
    console.error('Error running ArtBot:', error);
  }
}

/**
 * Display the final results
 */
function displayResults(artBot: CreativeEngine) {
  console.log('\n🎉 All threads completed!');
  console.log('\n📊 Final Idea Queue Statistics:');
  console.log(JSON.stringify(artBot.getIdeaQueueStatistics(), null, 2));
  
  console.log('\n🖼️ Generated Concepts and Styles:');
  
  // Display results for each idea
  artBot.getAllIdeas().forEach(idea => {
    console.log(`\n📌 Idea: ${idea.title}`);
    
    idea.explorationThreads.forEach(thread => {
      console.log(`\n  🧵 Thread: ${thread.direction}`);
      console.log(`  📊 Status: ${thread.status}`);
      
      // Display results
      thread.results.forEach(result => {
        console.log(`\n  ${result.type === 'concept' ? '💡' : '🎨'} ${result.type.toUpperCase()}:`);
        console.log(`  ${result.content.substring(0, 150)}...`);
        
        if (result.metadata.provider) {
          console.log(`  Provider: ${result.metadata.provider} (${result.metadata.model})`);
        }
      });
    });
  });
  
  console.log('\n✨ ArtBot completed!');
  process.exit(0);
}

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
} 