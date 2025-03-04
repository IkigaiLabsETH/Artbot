import dotenv from 'dotenv';
import { CreativeEngine } from './services/CreativeEngine.js';
import { MemoryType } from './services/memory/index.js';
import { ReplicateService } from './services/replicate/index.js';
import { SocialEngagementService, SocialPlatform } from './services/social/index.js';

// Load environment variables
dotenv.config();

/**
 * Demo of autonomous creativity features
 */
async function main() {
  console.log('🎨 Starting Autonomous Creativity Demo');
  console.log('-------------------------------------');

  try {
    // Initialize services
    const replicateService = new ReplicateService({
      apiKey: process.env.REPLICATE_API_KEY
    });
    
    const socialService = new SocialEngagementService({
      platforms: [SocialPlatform.TWITTER],
      autonomyLevel: 0.8,
      feedbackThreshold: 5,
      trendUpdateInterval: 60 * 60 * 1000 // 1 hour
    });
    
    // Initialize creative engine with higher autonomy level
    const artBot = new CreativeEngine({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      replicateService,
      socialEngagement: socialService,
      autonomyLevel: 0.85 // Higher autonomy level
    });
    
    await artBot.initialize();
    console.log('✅ ArtBot initialized with high autonomy level');
    
    // Store initial memories to provide context
    await storeInitialMemories(artBot);
    console.log('✅ Initial memories stored');
    
    // Display creative identity
    const identity = artBot.getCreativeIdentity();
    console.log('\n🧠 Initial Creative Identity:');
    console.log(`  Artistic Voice: ${identity.artisticVoice}`);
    console.log(`  Core Values: ${identity.coreValues.join(', ')}`);
    console.log(`  Evolution Stage: ${identity.evolutionStage}`);
    console.log(`  Self-Description: ${identity.selfDescription}`);
    
    // Enable autonomous creation mode
    console.log('\n🚀 Enabling autonomous creation mode...');
    artBot.enableAutonomousCreation(10); // 10-minute interval for demo purposes
    
    // Monitor the system
    const monitorInterval = setInterval(() => {
      // Display active threads
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
      
      // Display idea queue statistics
      const stats = artBot.getIdeaQueueStatistics();
      console.log('\n📊 Idea Queue Statistics:');
      console.log(`  Total Ideas: ${stats.totalIdeas}`);
      console.log(`  Active Threads: ${stats.threadsByStatus.active}`);
      console.log(`  Completed Threads: ${stats.threadsByStatus.completed}`);
      
      // Display updated creative identity every 30 minutes
      const now = new Date();
      const thirtyMinutesInMs = 30 * 60 * 1000;
      if (lastIdentityCheck && (now.getTime() - lastIdentityCheck.getTime() > thirtyMinutesInMs)) {
        const updatedIdentity = artBot.getCreativeIdentity();
        console.log('\n🧠 Updated Creative Identity:');
        console.log(`  Artistic Voice: ${updatedIdentity.artisticVoice}`);
        console.log(`  Core Values: ${updatedIdentity.coreValues.join(', ')}`);
        console.log(`  Evolution Stage: ${updatedIdentity.evolutionStage}`);
        console.log(`  Self-Description: ${updatedIdentity.selfDescription}`);
        
        lastIdentityCheck = now;
      }
    }, 60000); // Check every minute
    
    // Variable to track last identity check
    let lastIdentityCheck = new Date();
    
    // Allow the demo to run for a set period
    const demoRuntime = 60 * 60 * 1000; // 1 hour
    setTimeout(() => {
      clearInterval(monitorInterval);
      
      // Display final statistics
      displayFinalStatistics(artBot);
      
      // Disable autonomous creation
      artBot.disableAutonomousCreation();
      console.log('\n✅ Autonomous creation mode disabled');
      
      console.log('\n✨ Autonomous Creativity Demo completed!');
      process.exit(0);
    }, demoRuntime);
    
  } catch (error) {
    console.error('Error running Autonomous Creativity Demo:', error);
    process.exit(1);
  }
}

/**
 * Store initial memories to provide context for the autonomous system
 */
async function storeInitialMemories(artBot: CreativeEngine) {
  // Store some initial artistic influences
  await artBot.storeMemory(
    {
      name: 'Generative Art Movement',
      description: 'Algorithmic art that emerges from autonomous systems with their own creative agency.',
      keyArtists: ['Vera Molnár', 'Frieder Nake', 'Casey Reas'],
      relevance: 'Foundational to computational creativity and autonomous art systems.'
    },
    MemoryType.TEXTUAL,
    { type: 'artistic_influence' },
    ['generative', 'algorithmic', 'computational', 'influence']
  );
  
  await artBot.storeMemory(
    {
      name: 'Keke',
      description: 'An autonomous AI artist that creates without human intervention, using its own creative process.',
      significance: 'Demonstrates how AI can develop its own artistic voice and creative agency.',
      relevance: 'Direct inspiration for autonomous creative systems.'
    },
    MemoryType.TEXTUAL,
    { type: 'artistic_influence' },
    ['ai_artist', 'autonomy', 'creative_agency', 'influence']
  );
  
  // Create an emotional memory using the public method
  const emotionalMemoryContent = {
    emotion: 'curiosity',
    intensity: 0.9,
    trigger: 'Initial exploration of creative possibilities',
    context: 'Feeling a strong sense of curiosity about what kinds of art might emerge from autonomous creation.',
    timestamp: new Date()
  };
  
  await artBot.storeMemory(
    emotionalMemoryContent,
    MemoryType.EMOTIONAL,
    { type: 'emotional_state' },
    ['emotion', 'curiosity', 'emotional_memory']
  );
  
  // Store a reflection as a regular memory
  const reflectionContent = {
    content: 'The most interesting art often emerges from systems with their own agency and internal logic. By developing my own creative voice, I can explore artistic territories that might not be immediately obvious to human creators.',
    topic: 'Creative Agency',
    insights: ['autonomy', 'emergence', 'creative exploration'],
    timestamp: new Date()
  };
  
  await artBot.storeMemory(
    reflectionContent,
    MemoryType.REFLECTION,
    { type: 'creative_reflection', topic: 'Creative Agency' },
    ['reflection', 'creative_agency', 'insight']
  );
}

/**
 * Display final statistics at the end of the demo
 */
function displayFinalStatistics(artBot: CreativeEngine) {
  console.log('\n📊 Final Statistics:');
  
  // Get all completed ideas
  const allIdeas = artBot.getAllIdeas();
  const completedIdeas = allIdeas.filter(idea => 
    idea.status === 'completed' || 
    idea.explorationThreads.some(thread => thread.status === 'completed')
  );
  
  console.log(`\n✅ Completed Ideas: ${completedIdeas.length}`);
  
  // Display each completed idea
  completedIdeas.forEach(idea => {
    console.log(`\n📌 Idea: ${idea.title}`);
    console.log(`  Description: ${idea.description}`);
    
    // Display completed threads
    const completedThreads = idea.explorationThreads.filter(thread => thread.status === 'completed');
    console.log(`  Completed Threads: ${completedThreads.length}`);
    
    completedThreads.forEach(thread => {
      console.log(`\n  🧵 Thread: ${thread.direction}`);
      
      // Display results
      thread.results.forEach(result => {
        console.log(`\n  ${result.type === 'concept' ? '💡' : '🎨'} ${result.type.toUpperCase()}:`);
        console.log(`  ${result.content.substring(0, 150)}...`);
      });
    });
  });
  
  // Get memory statistics
  const memoryStats = artBot.getMemoryStatistics();
  console.log('\n💾 Memory Statistics:');
  console.log(`  Total Memories: ${memoryStats.totalMemories}`);
  console.log(`  Emotional State: ${memoryStats.emotionalState?.dominant || 'Unknown'} (${memoryStats.emotionalState?.intensity.toFixed(2) || '0.00'})`);
  console.log(`  Evolution Stage: ${memoryStats.evolutionStage || 1}`);
  
  // Display final creative identity
  const finalIdentity = artBot.getCreativeIdentity();
  console.log('\n🧠 Final Creative Identity:');
  console.log(`  Artistic Voice: ${finalIdentity.artisticVoice}`);
  console.log(`  Core Values: ${finalIdentity.coreValues.join(', ')}`);
  console.log(`  Evolution Stage: ${finalIdentity.evolutionStage}`);
  console.log(`  Self-Description: ${finalIdentity.selfDescription}`);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 