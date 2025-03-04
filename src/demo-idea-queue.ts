import { IdeaQueue } from './services/IdeaQueue.js';
import { AIService, AICompletionRequest, AICompletionResponse } from './services/ai/index.js';

// Create a mock AIService that doesn't make real API calls
class MockAIService extends AIService {
  constructor() {
    super({
      anthropicApiKey: 'mock_key',
      openaiApiKey: 'mock_key',
      defaultModel: 'mock-model'
    });
  }

  async getCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    // Extract the last message content for generating mock responses
    const lastMessage = request.messages[request.messages.length - 1];
    const prompt = lastMessage.content;
    
    console.log(`🧠 Mock AI call with prompt: ${prompt.substring(0, 50)}...`);
    
    // Generate different responses based on the prompt content
    let content = '';
    
    if (prompt.includes('concept')) {
      content = this.generateMockConcept(prompt);
    } else if (prompt.includes('style')) {
      content = this.generateMockStyle(prompt);
    } else {
      content = `Mock response for: ${prompt.substring(0, 30)}...`;
    }
    
    return {
      id: `mock-${Date.now()}`,
      model: request.model || 'mock-model',
      content,
      provider: 'anthropic',
      created: new Date()
    };
  }

  private generateMockConcept(prompt: string): string {
    return JSON.stringify({
      concept: "A creative exploration that blends natural and digital elements, creating a visual narrative that challenges perception and invites contemplation.",
      elements: [
        "Primary focus on central imagery",
        "Secondary elements creating context",
        "Dynamic composition with focal point slightly off-center",
        "Layered textures creating depth and dimension"
      ],
      mood: "Contemplative yet energetic, with a sense of wonder and discovery",
      narrative: "The artwork tells a story of transformation and evolution, where elements undergo a metamorphosis influenced by their environment."
    });
  }

  private generateMockStyle(prompt: string): string {
    return JSON.stringify({
      visualStyle: "A blend of organic and geometric forms that creates a dynamic visual language.",
      colorPalette: [
        "Vibrant teal (#008080)",
        "Coral pink (#FF7F50)",
        "Soft lavender (#E6E6FA)",
        "Deep purple (#800080)"
      ],
      composition: "Asymmetrical balance with a strong focal point and dynamic movement throughout the canvas",
      techniques: [
        "Layered transparency effects",
        "Textural contrasts between smooth and rough elements",
        "Gradient transitions between color zones",
        "Selective use of fine details against broader forms"
      ],
      influences: [
        "Organic patterns and natural forms",
        "Contemporary minimalism",
        "Sacred geometry",
        "Microscopic photography"
      ]
    });
  }
}

// Main demo function
async function runDemo() {
  console.log('🎨 Starting ArtBot Idea Queue Demo');
  console.log('-----------------------------------');

  // Initialize services with mock implementations
  const aiService = new MockAIService();
  console.log('✅ Mock AI Service initialized');

  const ideaQueue = new IdeaQueue({
    maxIdeas: 10,
    maxThreadsPerIdea: 3,
    maxActiveThreads: 2,
    aiService
  });
  
  await ideaQueue.initialize();
  console.log('✅ Idea Queue initialized');

  console.log('\n📝 Adding initial ideas to the queue...');
  
  // Add initial ideas
  const idea1 = await ideaQueue.addIdea(
    'Cosmic Garden',
    'An exploration of cosmic elements intertwined with botanical imagery',
    'Surrealist',
    'Nature and Cosmos',
    3,
    ['space', 'garden', 'surreal'],
    ['Hubble telescope images', 'Botanical illustrations']
  );
  console.log(`✅ Added idea: ${idea1.title} (ID: ${idea1.id})`);
  
  const idea2 = await ideaQueue.addIdea(
    'Digital Dreamscape',
    'A surreal digital landscape blending technology and dreamlike elements',
    'Digital Art',
    'Technology and Dreams',
    2,
    ['digital', 'dream', 'glitch'],
    ['Glitch art', 'Salvador Dali']
  );
  console.log(`✅ Added idea: ${idea2.title} (ID: ${idea2.id})`);
  
  const idea3 = await ideaQueue.addIdea(
    'Urban Jungle',
    'Concrete cityscapes overtaken by lush vegetation and wildlife',
    'Sci-Fi',
    'Urban and Nature',
    1,
    ['city', 'jungle', 'future'],
    ['Solarpunk', 'Blade Runner']
  );
  console.log(`✅ Added idea: ${idea3.title} (ID: ${idea3.id})`);

  console.log('\n🧵 Adding exploration threads...');
  
  // Add specific exploration threads
  const thread1 = await ideaQueue.createExplorationThread(
    idea1.id,
    'Microscopic Perspective',
    'Exploring cosmic garden elements at a microscopic level'
  );
  if (thread1) {
    console.log(`✅ Added thread: ${thread1.direction} for idea: Cosmic Garden`);
  }
  
  const thread2 = await ideaQueue.createExplorationThread(
    idea1.id,
    'Night vs Day',
    'Contrasting cosmic garden elements in nighttime and daytime settings'
  );
  if (thread2) {
    console.log(`✅ Added thread: ${thread2.direction} for idea: Cosmic Garden`);
  }
  
  const thread3 = await ideaQueue.createExplorationThread(
    idea2.id,
    'Nostalgic Technology',
    'Digital dreamscape with elements of retro and vintage technology'
  );
  if (thread3) {
    console.log(`✅ Added thread: ${thread3.direction} for idea: Digital Dreamscape`);
  }

  // Display initial statistics
  console.log('\n📊 Initial Queue Statistics:');
  console.log(JSON.stringify(ideaQueue.getStatistics(), null, 2));

  console.log('\n⏳ Starting exploration of threads...');
  
  // Start exploring threads
  if (thread1) await ideaQueue.exploreThread(thread1.id);
  if (thread2) await ideaQueue.exploreThread(thread2.id);
  if (thread3) await ideaQueue.exploreThread(thread3.id);
  
  // Display active threads
  const displayActiveThreads = () => {
    const activeThreads = ideaQueue.getActiveThreads();
    console.log(`\n🔄 Active Threads (${activeThreads.length}):`);
    
    if (activeThreads.length === 0) {
      console.log('  No active threads');
    } else {
      activeThreads.forEach(thread => {
        const idea = ideaQueue.getIdea(thread.ideaId);
        if (idea) {
          console.log(`  - ${idea.title}: ${thread.direction} (Progress: ${Math.round(thread.progress * 100)}%)`);
        }
      });
    }
  };
  
  // Display active threads
  displayActiveThreads();
  
  // Wait a bit and then display final results
  setTimeout(() => {
    console.log('\n🎉 Exploration completed!');
    
    // Display final statistics
    console.log('\n📊 Final Queue Statistics:');
    console.log(JSON.stringify(ideaQueue.getStatistics(), null, 2));
    
    // Display generated concepts and styles
    console.log('\n🖼️ Generated Concepts and Styles:');
    
    // Display results for each idea
    ideaQueue.getAllIdeas().forEach(idea => {
      console.log(`\n📌 Idea: ${idea.title}`);
      
      idea.explorationThreads.forEach(thread => {
        console.log(`\n  🧵 Thread: ${thread.direction}`);
        console.log(`  📊 Status: ${thread.status}`);
        
        // Display results
        thread.results.forEach(result => {
          console.log(`\n  ${result.type === 'concept' ? '💡' : '🎨'} ${result.type.toUpperCase()}:`);
          
          try {
            const contentObj = JSON.parse(result.content);
            if (result.type === 'concept') {
              console.log(`  ${contentObj.concept.substring(0, 100)}...`);
              console.log(`  Elements: ${contentObj.elements.slice(0, 2).join(', ')}...`);
            } else if (result.type === 'style') {
              console.log(`  ${contentObj.visualStyle.substring(0, 100)}...`);
              console.log(`  Colors: ${contentObj.colorPalette.slice(0, 2).join(', ')}...`);
            }
          } catch (e) {
            console.log(`  ${result.content.substring(0, 100)}...`);
          }
          
          console.log(`  Provider: ${result.metadata.provider} (${result.metadata.model})`);
        });
      });
    });
    
    console.log('\n✨ Demo completed!');
  }, 5000);
}

// Run the demo
runDemo().catch(error => {
  console.error('Error running demo:', error);
}); 