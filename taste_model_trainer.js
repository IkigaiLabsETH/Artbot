/**
 * Taste Model Trainer
 * 
 * This script provides a user interface for training the personalized taste model
 * by comparing pairs of artworks and updating the model based on user preferences.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');
const { PersonalizedTasteModel } = require('./personalized_taste_model');
const artDirectionLoader = require('./art_direction_loader');

// Create a taste model instance
const tasteModel = new PersonalizedTasteModel();

// Simulated artwork database (in a real system, this would be a database of generated images)
const artworkDatabase = [];

/**
 * Generate a simulated artwork for training purposes
 * @param {string} category - The Margritte category
 * @returns {Object} The generated artwork data
 */
function generateSimulatedArtwork(category) {
  // Get art direction for the category
  const artDirection = artDirectionLoader.loadArtDirection(category);
  
  // Create a simple prompt
  const basePrompts = [
    "A surreal scene with",
    "A Margritte-inspired painting featuring",
    "A dreamlike composition with",
    "A mysterious landscape with",
    "A surrealist portrait with"
  ];
  
  const basePrompt = basePrompts[Math.floor(Math.random() * basePrompts.length)];
  
  // Select random visual elements
  const visualElements = artDirection.visualElements || [];
  const selectedElements = [];
  for (let i = 0; i < Math.min(2, visualElements.length); i++) {
    const randomIndex = Math.floor(Math.random() * visualElements.length);
    selectedElements.push(visualElements[randomIndex]);
  }
  
  // Create prompt
  const prompt = `${basePrompt} ${selectedElements.join(' and ')}`;
  
  // Create negative prompt
  const negativePrompt = (artDirection.avoidElements || []).join(', ');
  
  // Create artwork data
  const artworkId = uuidv4();
  const artworkData = {
    id: artworkId,
    prompt,
    negativePrompt,
    category,
    parameters: {
      width: 1024,
      height: 1024,
      steps: 30,
      guidance_scale: 7.5
    },
    // In a real system, this would be the path to the generated image
    imagePath: `simulated_artwork_${artworkId}.jpg`
  };
  
  // Register artwork with the taste model
  tasteModel.registerArtwork(artworkId, artworkData);
  
  return artworkData;
}

/**
 * Generate a set of artworks for training
 * @param {number} count - Number of artworks to generate
 */
function generateTrainingSet(count) {
  console.log(`Generating ${count} artworks for training...`);
  
  // Get available categories
  const categories = artDirectionLoader.listCategories();
  
  // Generate artworks
  for (let i = 0; i < count; i++) {
    // Select random category
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Generate artwork
    const artwork = generateSimulatedArtwork(category);
    
    // Add to database
    artworkDatabase.push(artwork);
    
    // Log progress
    if ((i + 1) % 10 === 0) {
      console.log(`Generated ${i + 1} artworks`);
    }
  }
  
  console.log(`Generated ${count} artworks for training`);
}

/**
 * Display artwork information
 * @param {Object} artwork - The artwork data
 * @param {string} label - Label for the artwork (e.g., "A" or "B")
 */
function displayArtwork(artwork, label) {
  console.log(`\n=== Artwork ${label} ===`);
  console.log(`Category: ${artwork.category}`);
  console.log(`Prompt: ${artwork.prompt}`);
  console.log(`Negative Prompt: ${artwork.negativePrompt}`);
  console.log(`Image: ${artwork.imagePath}`);
}

/**
 * Run a training session with the user
 * @param {number} comparisons - Number of comparisons to make
 */
async function runTrainingSession(comparisons) {
  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Function to ask a question and get a response
  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  };
  
  console.log('\n=== Taste Model Training Session ===');
  console.log('You will be shown pairs of artworks and asked to choose which one you prefer.');
  console.log('This will help train the personalized taste model to match your preferences.');
  
  try {
    // Make comparisons
    for (let i = 0; i < comparisons; i++) {
      console.log(`\n--- Comparison ${i + 1} of ${comparisons} ---`);
      
      // Select two random artworks
      const artworkA = artworkDatabase[Math.floor(Math.random() * artworkDatabase.length)];
      let artworkB;
      do {
        artworkB = artworkDatabase[Math.floor(Math.random() * artworkDatabase.length)];
      } while (artworkB.id === artworkA.id);
      
      // Display artworks
      displayArtwork(artworkA, 'A');
      displayArtwork(artworkB, 'B');
      
      // Get user preference
      const preference = await askQuestion('\nWhich artwork do you prefer? (A/B/S for skip): ');
      
      // Update model based on preference
      if (preference.toUpperCase() === 'A') {
        const result = tasteModel.updateRatings(artworkA.id, artworkB.id);
        console.log('\nUpdated ratings:');
        console.log(`Artwork A: ${result.winner.oldRating.toFixed(1)} → ${result.winner.newRating.toFixed(1)} (${result.winner.change > 0 ? '+' : ''}${result.winner.change.toFixed(1)})`);
        console.log(`Artwork B: ${result.loser.oldRating.toFixed(1)} → ${result.loser.newRating.toFixed(1)} (${result.loser.change > 0 ? '+' : ''}${result.loser.change.toFixed(1)})`);
      } else if (preference.toUpperCase() === 'B') {
        const result = tasteModel.updateRatings(artworkB.id, artworkA.id);
        console.log('\nUpdated ratings:');
        console.log(`Artwork B: ${result.winner.oldRating.toFixed(1)} → ${result.winner.newRating.toFixed(1)} (${result.winner.change > 0 ? '+' : ''}${result.winner.change.toFixed(1)})`);
        console.log(`Artwork A: ${result.loser.oldRating.toFixed(1)} → ${result.loser.newRating.toFixed(1)} (${result.loser.change > 0 ? '+' : ''}${result.loser.change.toFixed(1)})`);
      } else {
        console.log('Skipped comparison');
      }
      
      // Save model after each comparison
      tasteModel.saveModel();
    }
    
    // Show feature importance
    console.log('\n=== Feature Importance Analysis ===');
    const analysis = tasteModel.getFeatureImportance();
    
    console.log('\nTop Style Features:');
    analysis.topStyleFeatures.forEach(item => {
      console.log(`- ${item.feature.replace(/_/g, ' ')}: ${(item.weight * 100).toFixed(1)}%`);
    });
    
    console.log('\nTop Visual Elements:');
    analysis.topVisualElements.forEach(item => {
      console.log(`- ${item.feature.replace(/_/g, ' ')}: ${(item.weight * 100).toFixed(1)}%`);
    });
    
    console.log('\nTop Color Palette:');
    analysis.topColorPalette.forEach(item => {
      console.log(`- ${item.feature.replace(/_/g, ' ')}: ${(item.weight * 100).toFixed(1)}%`);
    });
    
    console.log('\nLeast Preferred Features:');
    analysis.leastPreferredFeatures.forEach(item => {
      console.log(`- ${item.category}.${item.feature.replace(/_/g, ' ')}: ${(item.weight * 100).toFixed(1)}%`);
    });
    
    // Generate recommendations
    console.log('\n=== Recommendations Based on Your Preferences ===');
    const recommendations = tasteModel.generateRecommendations(3);
    
    recommendations.forEach((rec, index) => {
      console.log(`\nRecommendation ${index + 1}${rec.isExplorative ? ' (Explorative)' : ' (Exploitative)'}:`);
      console.log(`Category: ${rec.category}`);
      console.log(`Style: ${rec.styleFeatures.map(f => f.replace(/_/g, ' ')).join(', ')}`);
      console.log(`Visual Elements: ${rec.visualElements.map(f => f.replace(/_/g, ' ')).join(', ')}`);
      console.log(`Color Palette: ${rec.colorPalette.map(f => f.replace(/_/g, ' ')).join(', ')}`);
      console.log(`Composition: ${rec.composition.map(f => f.replace(/_/g, ' ')).join(', ')}`);
      console.log(`Mood: ${rec.moodAndTone.map(f => f.replace(/_/g, ' ')).join(', ')}`);
    });
    
  } finally {
    rl.close();
  }
}

/**
 * Main function
 */
async function main() {
  console.log('=== Margritte Art Generator: Taste Model Trainer ===');
  
  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Function to ask a question and get a response
  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  };
  
  try {
    // Check if we need to generate a training set
    if (artworkDatabase.length === 0) {
      const generateCount = parseInt(await askQuestion('How many artworks would you like to generate for training? (recommended: 50): '));
      if (!isNaN(generateCount) && generateCount > 0) {
        generateTrainingSet(generateCount);
      } else {
        console.log('Invalid input. Generating 50 artworks by default.');
        generateTrainingSet(50);
      }
    }
    
    // Run training session
    const comparisons = parseInt(await askQuestion('How many comparisons would you like to make? (recommended: 20): '));
    if (!isNaN(comparisons) && comparisons > 0) {
      await runTrainingSession(comparisons);
    } else {
      console.log('Invalid input. Running 20 comparisons by default.');
      await runTrainingSession(20);
    }
    
  } finally {
    rl.close();
  }
}

// Run the main function
main().catch(error => {
  console.error('Error running taste model trainer:', error);
}); 