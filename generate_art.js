/**
 * Interactive Magritte Art Generator
 * 
 * This script provides a simple way to run the interactive art generator.
 */

const { generateCustomArt } = require('./multi_agent_integration');

console.log('=== Magritte Art Generator ===');
console.log('Starting interactive mode...\n');

// Run the interactive art generator
generateCustomArt().catch(error => {
  console.error('Error running interactive art generator:', error);
}); 