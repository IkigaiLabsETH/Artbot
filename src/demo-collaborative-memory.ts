import 'dotenv/config';
import * as path from 'path';
import { MemorySystem, MemoryType, Memory } from './services/memory/index.js';
import { CollaborativeMemory } from './services/memory/collaborative.js';
import { MemoryVisualization } from './services/memory/visualization.js';
import { EmotionalMemory } from './services/memory/emotional.js';
import { CreativeEngine } from './services/CreativeEngine.js';
import { AIService } from './services/ai/index.js';

/**
 * Run the collaborative memory demo
 */
async function runDemo() {
  console.log('🧠 Starting Collaborative Memory Demo');
  console.log('====================================');
  
  try {
    // Initialize memory systems for two different ArtBot instances
    console.log('\n📋 Initializing memory systems for two ArtBot instances...');
    
    const artBot1MemoryPath = path.join(process.cwd(), '.artbot', 'memory-artbot1');
    const artBot2MemoryPath = path.join(process.cwd(), '.artbot', 'memory-artbot2');
    
    const memorySystem1 = new MemorySystem({
      baseDir: artBot1MemoryPath,
      maxMemories: 1000
    });
    
    const memorySystem2 = new MemorySystem({
      baseDir: artBot2MemoryPath,
      maxMemories: 1000
    });
    
    await memorySystem1.initialize();
    await memorySystem2.initialize();
    
    // Initialize collaborative memory
    console.log('\n🤝 Initializing collaborative memory service...');
    const collaborativeMemory = new CollaborativeMemory();
    await collaborativeMemory.initialize();
    
    // Initialize emotional memory
    console.log('\n😊 Initializing emotional memory service...');
    const emotionalMemory = new EmotionalMemory();
    await emotionalMemory.initialize();
    
    // Initialize creative engine for generating content
    console.log('\n🎨 Initializing creative engine...');
    const creativeEngine = new CreativeEngine({});
    const aiService = new AIService();
    await aiService.initialize();
    
    // Create memories for ArtBot 1 (Abstract Art Focus)
    console.log('\n🖼️ Creating memories for ArtBot 1 (Abstract Art Focus)...');
    
    // Artwork memories
    const abstractArtwork1 = await memorySystem1.storeMemory(
      {
        title: 'Geometric Harmony',
        description: 'A composition of intersecting geometric shapes in vibrant colors',
        imageUrl: 'https://example.com/geometric-harmony.jpg',
        style: 'Abstract Geometric',
        prompt: 'Geometric shapes in vibrant colors with clean lines and mathematical precision'
      },
      MemoryType.VISUAL,
      {},
      ['abstract', 'geometric', 'vibrant', 'harmony']
    );
    
    const abstractArtwork2 = await memorySystem1.storeMemory(
      {
        title: 'Fluid Expressions',
        description: 'Flowing organic forms in cool blue and purple tones',
        imageUrl: 'https://example.com/fluid-expressions.jpg',
        style: 'Abstract Expressionism',
        prompt: 'Flowing organic forms in cool blue and purple tones with fluid movement'
      },
      MemoryType.VISUAL,
      {},
      ['abstract', 'expressionism', 'fluid', 'cool-tones']
    );
    
    // Style memories
    await memorySystem1.storeMemory(
      {
        name: 'Geometric Minimalism',
        description: 'Clean geometric shapes with minimal color palette',
        elements: ['geometric shapes', 'minimal colors', 'precise lines'],
        influences: ['Mondrian', 'Bauhaus']
      },
      MemoryType.STYLE,
      {},
      ['geometric', 'minimalism', 'clean']
    );
    
    // Feedback memories
    await memorySystem1.storeMemory(
      {
        artworkId: abstractArtwork1.id,
        rating: 4.5,
        comments: 'The geometric precision is impressive, but could use more contrast',
        source: 'gallery curator'
      },
      MemoryType.FEEDBACK,
      {},
      ['feedback', 'geometric', 'contrast']
    );
    
    // Add emotional context to memories
    await emotionalMemory.addEmotionalContext(abstractArtwork1);
    await emotionalMemory.addEmotionalContext(abstractArtwork2);
    
    // Create memories for ArtBot 2 (Nature-Inspired Focus)
    console.log('\n🌿 Creating memories for ArtBot 2 (Nature-Inspired Focus)...');
    
    // Artwork memories
    const natureArtwork1 = await memorySystem2.storeMemory(
      {
        title: 'Forest Whispers',
        description: 'Dense forest scene with dappled light filtering through leaves',
        imageUrl: 'https://example.com/forest-whispers.jpg',
        style: 'Naturalistic',
        prompt: 'Dense forest with sunlight filtering through leaves, creating dappled light patterns'
      },
      MemoryType.VISUAL,
      {},
      ['nature', 'forest', 'light', 'organic']
    );
    
    const natureArtwork2 = await memorySystem2.storeMemory(
      {
        title: 'Ocean Depths',
        description: 'Abstract representation of deep ocean currents in blue and teal',
        imageUrl: 'https://example.com/ocean-depths.jpg',
        style: 'Abstract Naturalism',
        prompt: 'Deep ocean currents in flowing patterns of blue and teal with organic movement'
      },
      MemoryType.VISUAL,
      {},
      ['nature', 'ocean', 'blue', 'flowing']
    );
    
    // Style memories
    await memorySystem2.storeMemory(
      {
        name: 'Organic Fluidity',
        description: 'Flowing organic forms inspired by natural patterns',
        elements: ['organic shapes', 'flowing lines', 'natural color palette'],
        influences: ['Art Nouveau', 'natural patterns']
      },
      MemoryType.STYLE,
      {},
      ['organic', 'fluid', 'natural']
    );
    
    // Feedback memories
    await memorySystem2.storeMemory(
      {
        artworkId: natureArtwork1.id,
        rating: 4.8,
        comments: 'The light effects are stunning, creates a real sense of being in the forest',
        source: 'art collector'
      },
      MemoryType.FEEDBACK,
      {},
      ['feedback', 'light', 'immersive']
    );
    
    // Add emotional context to memories
    await emotionalMemory.addEmotionalContext(natureArtwork1);
    await emotionalMemory.addEmotionalContext(natureArtwork2);
    
    // Export memories from ArtBot 1
    console.log('\n📤 Exporting memories from ArtBot 1...');
    // Get all memories from ArtBot 1
    const artBot1Memories = Array.from(memorySystem1.getMemories().values()) as Memory[];
    const exportPath = await collaborativeMemory.exportMemories(artBot1Memories, {
      includeEmbeddings: true
    });
    console.log(`Exported ${artBot1Memories.length} memories to ${exportPath}`);
    
    // Import memories to ArtBot 2
    console.log('\n📥 Importing memories from ArtBot 1 to ArtBot 2...');
    const importResult = await collaborativeMemory.importMemories(exportPath, {
      importTags: ['imported', 'abstract-collection'],
      validateMemories: true
    });
    
    console.log(`Import results:
    - Total memories: ${importResult.totalMemories}
    - Imported: ${importResult.importedMemories}
    - Skipped: ${importResult.skippedMemories}
    - Errors: ${importResult.errors.length}`);
    
    // Import the memories into ArtBot 2's memory system
    console.log('\n🔄 Adding imported memories to ArtBot 2 memory system...');
    
    // Read the import file to get the memories
    const fs = await import('fs/promises');
    const importFileContent = await fs.readFile(exportPath, 'utf-8');
    const importData = JSON.parse(importFileContent);
    
    // Store each imported memory in ArtBot 2's memory system
    for (const memory of importData.memories) {
      // Skip if already exists (simple check by title for artwork)
      if (memory.type === MemoryType.VISUAL) {
        const existingMemories = await memorySystem2.retrieveMemories(
          memory.content.title,
          {
            type: MemoryType.VISUAL,
            limit: 1,
            threshold: 0.95
          }
        );
        
        if (existingMemories.length > 0) {
          console.log(`Skipping already existing memory: ${memory.content.title}`);
          continue;
        }
      }
      
      // Add imported tag
      memory.tags = [...new Set([...memory.tags, 'imported'])];
      
      // Store in memory system
      await memorySystem2.storeMemory(memory.content, memory.type, memory.metadata, memory.tags);
    }
    
    // Generate a creative fusion using both memory sets
    console.log('\n🔀 Generating creative fusion using combined memories...');
    
    // Get all memories from ArtBot 2 (now includes imported memories)
    const combinedMemories = Array.from(memorySystem2.getMemories().values()) as Memory[];
    console.log(`ArtBot 2 now has ${combinedMemories.length} memories`);
    
    // Find abstract and nature memories
    const abstractMemories = combinedMemories.filter(m => 
      m.tags.includes('abstract') || m.tags.includes('geometric')
    );
    
    const natureMemories = combinedMemories.filter(m => 
      m.tags.includes('nature') || m.tags.includes('organic')
    );
    
    console.log(`Found ${abstractMemories.length} abstract memories and ${natureMemories.length} nature memories`);
    
    // Generate a fusion prompt
    const fusionPromptRequest = {
      prompt: `Create an art prompt that fuses geometric abstract art with organic nature-inspired elements. 
      The abstract elements include: ${abstractMemories.slice(0, 3).map(m => 
        m.type === MemoryType.VISUAL ? m.content.description : JSON.stringify(m.content)
      ).join(', ')}
      
      The nature elements include: ${natureMemories.slice(0, 3).map(m => 
        m.type === MemoryType.VISUAL ? m.content.description : JSON.stringify(m.content)
      ).join(', ')}
      
      Create a detailed prompt for an artwork that combines these styles in a harmonious way.`,
      maxTokens: 300
    };
    
    const fusionPromptResponse = await aiService.getCompletion({
      messages: [
        { role: 'system', content: 'You are a creative art director specializing in fusion art styles.' },
        { role: 'user', content: fusionPromptRequest.prompt }
      ],
      maxTokens: fusionPromptRequest.maxTokens
    });
    
    const fusionPrompt = fusionPromptResponse.content;
    
    console.log('\n🎨 Fusion Prompt:');
    console.log(fusionPrompt);
    
    // Store the fusion as a new memory
    const fusionMemory = await memorySystem2.storeMemory(
      {
        title: 'Geometric Nature Fusion',
        description: 'A fusion of geometric abstract art with organic nature-inspired elements',
        prompt: fusionPrompt,
        elements: ['geometric', 'organic', 'nature', 'abstract'],
        fusion: true
      },
      MemoryType.TEXTUAL,
      {},
      ['fusion', 'geometric', 'organic', 'collaborative']
    );
    
    // Add emotional context to the fusion
    await emotionalMemory.addEmotionalContext(fusionMemory);
    
    // Visualize the memory network
    console.log('\n📊 Generating memory visualization...');
    const visualization = await MemoryVisualization.generateMemoryGraph(
      combinedMemories,
      {
        format: 'json',
        includeContent: true,
        minSimilarity: 0.3,
        maxNodes: 20
      }
    );
    
    // Save visualization to file
    const visualizationPath = path.join(process.cwd(), '.artbot', 'memory-visualization.json');
    await fs.writeFile(visualizationPath, JSON.stringify(visualization, null, 2), 'utf-8');
    console.log(`Memory visualization saved to ${visualizationPath}`);
    
    // List available export files
    console.log('\n📋 Listing available memory export files:');
    const exportFiles = await collaborativeMemory.listExportFiles();
    for (const file of exportFiles) {
      console.log(`- ${file.filename} (${file.date.toLocaleString()})`);
    }
    
    console.log('\n✅ Collaborative Memory Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in Collaborative Memory Demo:', error);
  }
}

// Run the demo
runDemo().catch(console.error); 