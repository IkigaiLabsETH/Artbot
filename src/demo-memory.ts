import dotenv from 'dotenv';
import { CreativeEngine } from './services/CreativeEngine.js';
import { MemoryType } from './services/memory/index.js';

// Load environment variables
dotenv.config();

/**
 * Demo script to showcase the memory system
 */
async function runDemo() {
  console.log('🧠 Starting Memory System Demo');
  console.log('-----------------------------');

  try {
    // Initialize the creative engine
    const artBot = new CreativeEngine();
    await artBot.initialize();
    
    console.log('\n📚 Storing memories...');
    
    // Store some example artworks
    const artwork1 = await artBot.storeArtwork({
      title: 'Cosmic Garden',
      description: 'A vibrant garden with cosmic elements and ethereal textures',
      imageUrl: 'https://example.com/cosmic-garden.jpg',
      style: {
        name: 'Ethereal',
        category: 'Digital Art',
        attributes: ['vibrant', 'cosmic', 'ethereal'],
        techniques: ['digital painting', 'texture layering']
      },
      prompt: 'Create a vibrant garden with cosmic elements and ethereal textures'
    }, ['garden', 'cosmic', 'ethereal']);
    
    console.log(`✅ Stored artwork: ${artwork1.metadata.title}`);
    
    const artwork2 = await artBot.storeArtwork({
      title: 'Urban Dreamscape',
      description: 'A surreal cityscape with floating buildings and neon accents',
      imageUrl: 'https://example.com/urban-dreamscape.jpg',
      style: {
        name: 'Neo-Surrealism',
        category: 'Digital Art',
        attributes: ['surreal', 'urban', 'neon'],
        techniques: ['photo manipulation', 'digital painting']
      },
      prompt: 'Create a surreal cityscape with floating buildings and neon accents'
    }, ['city', 'surreal', 'neon']);
    
    console.log(`✅ Stored artwork: ${artwork2.metadata.title}`);
    
    const artwork3 = await artBot.storeArtwork({
      title: 'Quantum Reflections',
      description: 'Abstract patterns inspired by quantum physics and mirror reflections',
      imageUrl: 'https://example.com/quantum-reflections.jpg',
      style: {
        name: 'Abstract',
        category: 'Digital Art',
        attributes: ['abstract', 'geometric', 'reflective'],
        techniques: ['fractal generation', 'mirror effects']
      },
      prompt: 'Create abstract patterns inspired by quantum physics and mirror reflections'
    }, ['abstract', 'quantum', 'reflective']);
    
    console.log(`✅ Stored artwork: ${artwork3.metadata.title}`);
    
    // Store some feedback
    await artBot.storeFeedback(
      artwork1.id,
      'Love the vibrant colors and cosmic elements!',
      8.5,
      'user'
    );
    
    await artBot.storeFeedback(
      artwork2.id,
      'The neon accents are striking, but the composition could be improved.',
      7.2,
      'critic'
    );
    
    await artBot.storeFeedback(
      artwork3.id,
      'The abstract patterns are mesmerizing and technically impressive.',
      9.0,
      'user'
    );
    
    console.log('\n🔍 Retrieving similar artworks...');
    
    // Find similar artworks
    const similarArtworks = await artBot.findSimilarArtworks('cosmic garden with vibrant colors');
    
    console.log(`Found ${similarArtworks.length} similar artworks:`);
    for (const artwork of similarArtworks) {
      console.log(`- ${artwork.metadata.title} (Relevance: ${artwork.relevanceScore?.toFixed(2)})`);
    }
    
    console.log('\n🎨 Finding matching styles...');
    
    // Find matching styles
    const matchingStyles = await artBot.findMatchingStyles('abstract geometric patterns');
    
    console.log(`Found ${matchingStyles.length} matching styles:`);
    for (const style of matchingStyles) {
      console.log(`- ${style.metadata.title} (Relevance: ${style.relevanceScore?.toFixed(2)})`);
    }
    
    console.log('\n✨ Enhancing a prompt with memory...');
    
    // Enhance a prompt with memory
    const originalPrompt = 'Create a cosmic garden with floating elements';
    const enhancedPrompt = await artBot.enhancePromptWithMemory(originalPrompt);
    
    console.log('Original prompt:');
    console.log(originalPrompt);
    console.log('\nEnhanced prompt:');
    console.log(enhancedPrompt);
    
    console.log('\n📊 Evolving style preferences...');
    
    // Show initial style preferences
    console.log('Initial style preferences:');
    console.log(artBot.getStylePreferences());
    
    // Evolve style preferences based on feedback
    await artBot.evolveStylePreferences();
    
    // Show updated style preferences
    console.log('\nUpdated style preferences:');
    console.log(artBot.getStylePreferences());
    
    console.log('\n📈 Memory system statistics:');
    console.log(artBot.getMemoryStatistics());
    
    console.log('\n🧪 Testing memory associations...');
    
    // Store some related memories
    const textMemory1 = await artBot.storeMemory(
      'The cosmic garden concept reminds me of celestial bodies in bloom',
      MemoryType.TEXTUAL,
      { source: 'reflection' },
      ['cosmic', 'garden', 'reflection']
    );
    
    const textMemory2 = await artBot.storeMemory(
      'Gardens in space would require special adaptations for plants to survive',
      MemoryType.TEXTUAL,
      { source: 'research' },
      ['cosmic', 'garden', 'research']
    );
    
    const socialMemory = await artBot.storeMemory(
      'Users on social media are increasingly interested in cosmic and ethereal art styles',
      MemoryType.SOCIAL,
      { source: 'trend analysis' },
      ['cosmic', 'ethereal', 'trend']
    );
    
    // Retrieve memories by tag
    const cosmicMemories = await artBot.retrieveMemories('cosmic', {
      tags: ['cosmic'],
      sortBy: 'relevance'
    });
    
    console.log(`Found ${cosmicMemories.length} memories with 'cosmic' tag:`);
    for (const memory of cosmicMemories) {
      console.log(`- Type: ${memory.type}, Relevance: ${memory.relevanceScore?.toFixed(2)}`);
      if (memory.type === MemoryType.VISUAL) {
        console.log(`  Title: ${memory.metadata.title}`);
      } else if (memory.type === MemoryType.TEXTUAL || memory.type === MemoryType.SOCIAL) {
        console.log(`  Content: ${memory.content}`);
      }
    }
    
    console.log('\n🎭 Memory-based creative exploration:');
    
    // Use memory to generate new creative ideas
    const newIdeas = await artBot.generateIdeas('cosmic garden evolution', 3);
    
    console.log('Generated ideas based on memory:');
    for (const idea of newIdeas) {
      console.log(`- ${idea}`);
    }
    
    console.log('\n✅ Memory System Demo completed successfully!');
    
  } catch (error) {
    console.error('Error running memory system demo:', error);
  }
}

// Run the demo
runDemo().catch(console.error); 