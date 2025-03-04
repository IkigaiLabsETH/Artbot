import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Define concept categories
const ConceptCategory = {
  CINEMATIC: 'cinematic',
  SURREAL: 'surreal',
  CYBERPUNK: 'cyberpunk',
  NATURE: 'nature',
  URBAN: 'urban',
  ABSTRACT: 'abstract',
  NOSTALGIC: 'nostalgic',
  FUTURISTIC: 'futuristic',
  FANTASY: 'fantasy',
  DYSTOPIAN: 'dystopian'
};

// Sample concepts for each category (as a fallback if API calls fail)
const sampleConcepts = {
  [ConceptCategory.CINEMATIC]: [
    "abandoned lighthouse at dawn",
    "neon-lit alleyway after rain",
    "ancient temple reclaimed by jungle",
    "solitary figure on endless dunes",
    "cybernetic garden under binary stars"
  ],
  [ConceptCategory.SURREAL]: [
    "melting clocks on desert branches",
    "floating islands of library books",
    "doorways opening into ocean depths",
    "staircases leading to nowhere",
    "mechanical birds with cloud wings"
  ],
  [ConceptCategory.CYBERPUNK]: [
    "neon market beneath data highways",
    "augmented street performer in rain",
    "corporate towers piercing digital clouds",
    "back-alley cybernetic clinic glowing",
    "holographic advertisements reflecting in puddles"
  ],
  [ConceptCategory.NATURE]: [
    "ancient redwood forest in fog",
    "lightning storm over mountain peaks",
    "desert bloom after rare rainfall",
    "arctic ice caves glowing blue",
    "volcanic eruption against night sky"
  ],
  [ConceptCategory.URBAN]: [
    "rooftop garden overlooking skyscrapers",
    "subway station at empty midnight",
    "century-old apartments beside glass towers",
    "street food vendors under lanterns",
    "abandoned factory reclaimed by artists"
  ],
  [ConceptCategory.ABSTRACT]: [
    "fractured light through crystal prisms",
    "geometric patterns dissolving into chaos",
    "layered textures of rust and patina",
    "flowing ribbons of complementary colors",
    "mathematical sequences visualized in space"
  ],
  [ConceptCategory.NOSTALGIC]: [
    "drive-in theater under starry sky",
    "vinyl records stacked in dusty light",
    "childhood treehouse rediscovered years later",
    "polaroid photographs scattered on attic floor",
    "vintage arcade machines glowing in darkness"
  ],
  [ConceptCategory.FUTURISTIC]: [
    "vertical farm towers dominating cityscape",
    "quantum computer laboratory humming",
    "solar sail ships departing orbital station",
    "neural interface meditation garden",
    "automated construction swarms building habitat"
  ],
  [ConceptCategory.FANTASY]: [
    "dragon perched on ancient library tower",
    "fairy market hidden in mushroom forest",
    "wizard's observatory under aurora sky",
    "crystal castle reflecting impossible colors",
    "phoenix rebirth amid sacred ruins"
  ],
  [ConceptCategory.DYSTOPIAN]: [
    "abandoned megacity reclaimed by nature",
    "last library protected by volunteers",
    "water rationing station in endless drought",
    "surveillance drones monitoring empty streets",
    "luxury bunker amid devastated landscape"
  ]
};

// Simple function to get multiple concepts
function getMultipleConcepts(category, count) {
  const concepts = sampleConcepts[category];
  
  // If requesting more concepts than we have samples, repeat some
  if (count > concepts.length) {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(concepts[i % concepts.length]);
    }
    return result;
  }
  
  // Otherwise return a random subset
  return concepts.slice(0, count);
}

async function generateConceptIdeas() {
  try {
    console.log('🎨 ArtBot Concept Generator');
    console.log('---------------------------');
    
    // Get category from command line arguments (if provided)
    const categoryArg = process.argv[2];
    const countArg = process.argv[3] || '5';
    const count = parseInt(countArg, 10);
    
    if (isNaN(count) || count < 1 || count > 20) {
      throw new Error('Count must be a number between 1 and 20');
    }
    
    // Determine which category to use
    let category;
    
    if (categoryArg) {
      // Try to match the category argument to a valid category
      const categoryKey = Object.keys(ConceptCategory).find(
        key => key.toLowerCase() === categoryArg.toLowerCase()
      );
      
      if (categoryKey) {
        category = ConceptCategory[categoryKey];
        console.log(`🎬 Generating ${count} ${category} concepts...\n`);
      } else {
        console.log(`⚠️ Unknown category: "${categoryArg}". Using default cinematic category.\n`);
        category = ConceptCategory.CINEMATIC;
      }
      
      // Generate concepts for the specified category
      const concepts = getMultipleConcepts(category, count);
      
      // Display the concepts
      console.log(`Category: ${category}`);
      concepts.forEach((concept, i) => {
        console.log(`  ${i+1}. ${concept}`);
      });
      
      // Save the results to a file
      const outputDir = path.join(__dirname, 'output');
      ensureDirectoryExists(outputDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputPath = path.join(outputDir, `concept-ideas-${category}-${timestamp}.json`);
      
      fs.writeFileSync(outputPath, JSON.stringify({ [category]: concepts }, null, 2));
      console.log(`\n✅ Concept ideas saved to: ${outputPath}`);
      
    } else {
      // If no category specified, show concepts from all categories
      console.log(`🎬 Generating ${count} concepts from each category...\n`);
      
      const results = {};
      
      // Generate concepts for each category
      for (const cat of Object.values(ConceptCategory)) {
        console.log(`Category: ${cat}`);
        const concepts = getMultipleConcepts(cat, count);
        
        results[cat] = concepts;
        
        // Display the concepts
        concepts.forEach((concept, i) => {
          console.log(`  ${i+1}. ${concept}`);
        });
        console.log('');
      }
      
      // Save the results to a file
      const outputDir = path.join(__dirname, 'output');
      ensureDirectoryExists(outputDir);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputPath = path.join(outputDir, `concept-ideas-${timestamp}.json`);
      
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      console.log(`✅ Concept ideas saved to: ${outputPath}`);
    }
    
  } catch (error) {
    console.error('❌ Error generating concept ideas:', error);
  }
}

// Run the function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateConceptIdeas().catch(console.error);
}

// Export the function for use in other modules
export { generateConceptIdeas }; 