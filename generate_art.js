/**
 * Interactive Art Generator
 * 
 * This script provides a user-friendly interface for generating
 * Margritte-inspired artwork using the multi-agent system.
 */

const readline = require('readline');
const { v4: uuidv4 } = require('uuid');
const { DirectorAgent } = require('./multi_agent_integration');
const artDirectionLoader = require('./art_direction_loader');

// Initialize the readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Available categories
const categories = [
  'Classic',
  'Empire of Light',
  'Landscapes',
  'Metamorphosis',
  'Mystery',
  'Objects',
  'Scale',
  'Silhouettes',
  'Skies',
  'Windows',
  'Wordplay'
];

// Initialize the Director Agent
const directorAgent = new DirectorAgent();

/**
 * Display the welcome message and menu
 */
function displayWelcome() {
  console.log('\n==============================================');
  console.log('   Margritte ART GENERATOR - INTERACTIVE MODE');
  console.log('==============================================\n');
  console.log('Generate surrealist artwork in the style of Studio Margritte\n');
}

/**
 * Display the available categories
 */
function displayCategories() {
  console.log('Available categories:');
  categories.forEach((category, index) => {
    console.log(`${index + 1}. ${category}`);
  });
  console.log('0. Custom prompt (no specific category)\n');
}

/**
 * Process the user's category selection
 * @param {string} input - The user's input
 */
function processCategory(input) {
  const selection = parseInt(input.trim());
  
  if (selection === 0) {
    // Custom prompt
    rl.question('\nEnter your custom prompt: ', (prompt) => {
      generateArtwork(prompt, null);
    });
  } else if (selection >= 1 && selection <= categories.length) {
    // Selected category
    const category = categories[selection - 1];
    rl.question(`\nEnter additional prompt elements for ${category} (or press Enter for none): `, (additionalPrompt) => {
      const prompt = additionalPrompt.trim() ? additionalPrompt : category;
      generateArtwork(prompt, category);
    });
  } else {
    console.log('\nInvalid selection. Please try again.');
    askForCategory();
  }
}

/**
 * Ask the user to select a category
 */
function askForCategory() {
  displayCategories();
  rl.question('Select a category (0-' + categories.length + '): ', processCategory);
}

/**
 * Generate artwork based on the prompt and category
 * @param {string} prompt - The user's prompt
 * @param {string|null} category - The selected category (if any)
 */
async function generateArtwork(prompt, category) {
  console.log('\nGenerating artwork...');
  
  try {
    // Generate a unique ID for this artwork
    const artworkId = uuidv4();
    
    // Prepare the request
    const request = {
      prompt,
      category,
      artworkId
    };
    
    // Process the request through the Director Agent
    const result = await directorAgent.processRequest(request);
    
    // Ask if the user wants to generate another artwork
    askForAnotherArtwork();
  } catch (error) {
    console.error('Error generating artwork:', error);
    askForAnotherArtwork();
  }
}

/**
 * Ask if the user wants to generate another artwork
 */
function askForAnotherArtwork() {
  rl.question('\nWould you like to generate another artwork? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      askForCategory();
    } else {
      console.log('\nThank you for using the Margritte Art Generator!');
      rl.close();
    }
  });
}

// Start the interactive session
displayWelcome();
askForCategory(); 