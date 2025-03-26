/**
 * Example Usage of Art Direction Loader
 * 
 * This script demonstrates how to use the art direction loader
 * to enhance prompts for the Margritte-inspired art generator.
 */

const artDirectionLoader = require('./art_direction_loader');

// Example function to simulate art generation
function generateArt(prompt, negativePrompt, params) {
  console.log('Generating art with:');
  console.log('Prompt:', prompt);
  console.log('Negative Prompt:', negativePrompt);
  console.log('Parameters:', JSON.stringify(params, null, 2));
  console.log('---');
}

// Main example function
function runExamples() {
  console.log('=== Margritte Art Direction Examples ===\n');
  
  // List available categories
  const categories = artDirectionLoader.listCategories();
  console.log('Available categories:', categories.join(', '));
  console.log('---');
  
  // Example 1: Using the Classic category
  console.log('Example 1: Classic Category');
  const classicArtDirection = artDirectionLoader.loadArtDirection('classic');
  const classicPrompt = artDirectionLoader.buildPrompt(
    classicArtDirection, 
    'A businessman standing on a cliff'
  );
  const classicNegativePrompt = artDirectionLoader.buildNegativePrompt(classicArtDirection);
  const classicParams = artDirectionLoader.applyArtDirectionToParams(
    classicArtDirection, 
    { width: 1440, height: 1440 }
  );
  
  generateArt(classicPrompt, classicNegativePrompt, classicParams);
  
  // Example 2: Using the Empire of Light category
  console.log('Example 2: Empire of Light Category');
  const empireArtDirection = artDirectionLoader.loadArtDirection('empire_of_light');
  const empirePrompt = artDirectionLoader.buildPrompt(
    empireArtDirection, 
    'A house by a street lamp'
  );
  const empireNegativePrompt = artDirectionLoader.buildNegativePrompt(empireArtDirection);
  const empireParams = artDirectionLoader.applyArtDirectionToParams(
    empireArtDirection, 
    { width: 1440, height: 1440 }
  );
  
  generateArt(empirePrompt, empireNegativePrompt, empireParams);
  
  // Example 3: Using the Objects category
  console.log('Example 3: Objects Category');
  const objectsArtDirection = artDirectionLoader.loadArtDirection('objects');
  const objectsPrompt = artDirectionLoader.buildPrompt(
    objectsArtDirection, 
    'An apple in a room'
  );
  const objectsNegativePrompt = artDirectionLoader.buildNegativePrompt(objectsArtDirection);
  const objectsParams = artDirectionLoader.applyArtDirectionToParams(
    objectsArtDirection, 
    { width: 1440, height: 1440 }
  );
  
  generateArt(objectsPrompt, objectsNegativePrompt, objectsParams);
  
  // Example 4: Using the Scale category
  console.log('Example 4: Scale Category');
  const scaleArtDirection = artDirectionLoader.loadArtDirection('scale');
  const scalePrompt = artDirectionLoader.buildPrompt(
    scaleArtDirection, 
    'A room with a giant apple'
  );
  const scaleNegativePrompt = artDirectionLoader.buildNegativePrompt(scaleArtDirection);
  const scaleParams = artDirectionLoader.applyArtDirectionToParams(
    scaleArtDirection, 
    { width: 1440, height: 1440 }
  );
  
  generateArt(scalePrompt, scaleNegativePrompt, scaleParams);
  
  // Example 5: Using the Wordplay category
  console.log('Example 5: Wordplay Category');
  const wordplayArtDirection = artDirectionLoader.loadArtDirection('wordplay');
  const wordplayPrompt = artDirectionLoader.buildPrompt(
    wordplayArtDirection, 
    'A pipe with the concept of contradiction'
  );
  const wordplayNegativePrompt = artDirectionLoader.buildNegativePrompt(wordplayArtDirection);
  const wordplayParams = artDirectionLoader.applyArtDirectionToParams(
    wordplayArtDirection, 
    { width: 1440, height: 1440 }
  );
  
  generateArt(wordplayPrompt, wordplayNegativePrompt, wordplayParams);
}

// Run the examples
runExamples(); 