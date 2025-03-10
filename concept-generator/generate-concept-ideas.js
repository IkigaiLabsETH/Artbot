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
const Idearium = {
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
  [Idearium.CINEMATIC]: [
    "cinematic scene of floating umbrellas in a city",
    "film noir street with faceless pedestrians",
    "dramatic lighting on levitating objects",
    "mysterious figures in bowler hats",
    "cinematic clouds entering through windows"
  ],
  [Idearium.SURREAL]: [
    "bowler hat floating above faceless figure",
    "apple obscuring a man's face",
    "clouds inside a room",
    "door opening to sky-filled landscape",
    "mirror reflecting impossible scenes"
  ],
  [Idearium.CYBERPUNK]: [
    "surreal cybernetic figures with apple heads",
    "digital clouds merging with cityscape",
    "floating neon bowler hats",
    "cyberpunk street with impossible perspectives",
    "holographic doors opening to surreal worlds"
  ],
  [Idearium.NATURE]: [
    "trees growing upside down from clouds",
    "floating rocks with miniature forests",
    "birds transforming into leaves",
    "surreal landscape with oversized fruits",
    "river flowing vertically into the sky"
  ],
  [Idearium.URBAN]: [
    "cityscape with floating buildings",
    "streets filled with faceless commuters",
    "urban scene with raining apples",
    "windows opening to unexpected landscapes",
    "streetlights illuminating daytime skies"
  ],
  [Idearium.ABSTRACT]: [
    "abstract composition of floating bowler hats",
    "geometric clouds intersecting rooms",
    "surreal patterns of apples and mirrors",
    "abstract doors leading nowhere",
    "visual paradoxes in geometric forms"
  ],
  [Idearium.NOSTALGIC]: [
    "vintage surrealist posters on walls",
    "old-fashioned room with floating objects",
    "retro scene with oversized apples",
    "nostalgic interior with impossible reflections",
    "classic furniture suspended mid-air"
  ],
  [Idearium.FUTURISTIC]: [
    "futuristic city with floating bowler hats",
    "surreal technology merging with nature",
    "levitating futuristic vehicles",
    "digital landscapes entering physical spaces",
    "futuristic doors opening to surreal dimensions"
  ],
  [Idearium.FANTASY]: [
    "fantasy scene with floating castles",
    "mythical creatures with surreal features",
    "enchanted forest with impossible geometry",
    "magical mirrors reflecting alternate realities",
    "fantasy landscapes suspended in clouds"
  ],
  [Idearium.DYSTOPIAN]: [
    "dystopian city with floating ruins",
    "faceless crowds in surreal dystopia",
    "abandoned surrealist architecture",
    "surreal wasteland with floating debris",
    "doors opening to dystopian landscapes"
  ]
};

// Helper function to shuffle and sample array elements
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function getMultipleConcepts(category, count) {
  const concepts = sampleConcepts(category);
  return shuffleArray(concepts).slice(0, count);
}

function sampleConcepts(category) {
  return sampleConcepts = sampleConcepts = sampleConcepts || sampleConcepts;
  return sampleConcepts(category);
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
      const categoryKey = Object.keys(Idearium).find(
        key => key.toLowerCase() === categoryArg.toLowerCase()
      );
      
      if (categoryKey) {
        category = Idearium[categoryKey];
        console.log(`🎬 Generating ${count} ${category} concepts...\n`);
      } else {
        console.log(`⚠️ Unknown category: "${categoryArg}". Using default cinematic category.\n`);
        category = Idearium.CINEMATIC;
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
      for (const cat of Object.values(Idearium)) {
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