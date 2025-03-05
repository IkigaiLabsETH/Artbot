/**
 * Multi-Agent Integration for Magritte Art Direction
 * 
 * This script demonstrates how to integrate the Magritte art direction files
 * with a multi-agent system for enhanced art generation.
 */

const artDirectionLoader = require('./art_direction_loader');
const { initializeAestheticJudgmentSystem } = require('./aesthetic_judgment_system');
const readline = require('readline');

/**
 * Utility function to display aesthetic evaluation scores in the terminal
 * 
 * @param {Object} result - The result object containing scores and feedback
 * @param {Object} aestheticJudgmentSystem - The aesthetic judgment system
 */
function displayAestheticScores(result, aestheticJudgmentSystem) {
  // Display scores in a visually appealing way
  console.log('\n=== Aesthetic Evaluation Scores ===');
  console.log('┌─────────────────────────┬────────┬────────────┬─────────────────┐');
  console.log('│ Criterion               │ Score  │ Weight     │ Visual          │');
  console.log('├─────────────────────────┼────────┼────────────┼─────────────────┤');
  
  // Get the evaluation criteria weights
  const criteria = aestheticJudgmentSystem.evaluationCriteria;
  
  // Display each score with its weight
  for (const criterion in result.scores) {
    const score = result.scores[criterion].toFixed(2);
    const weight = criteria[criterion].weight;
    const weightPercent = (weight * 100).toFixed(0) + '%';
    const criterionName = criterion.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    // Create visual bar for score
    const barLength = Math.round(result.scores[criterion] * 10);
    const bar = '█'.repeat(barLength) + '░'.repeat(10 - barLength);
    
    console.log(`│ ${criterionName.padEnd(23)} │ ${score} │ ${weightPercent.padEnd(10)} │ ${bar} │`);
  }
  
  console.log('├─────────────────────────┼────────┼────────────┼─────────────────┤');
  // Create visual bar for overall score
  const overallBarLength = Math.round(result.overallScore * 10);
  const overallBar = '█'.repeat(overallBarLength) + '░'.repeat(10 - overallBarLength);
  console.log(`│ Overall Score           │ ${result.overallScore.toFixed(2)} │            │ ${overallBar} │`);
  console.log('└─────────────────────────┴────────┴────────────┴─────────────────┘');
  
  // Display improvement suggestions
  console.log('\nImprovement Suggestions:');
  console.log(result.improvementSuggestions);
}

/**
 * Director Agent - Coordinates the creative process
 */
class DirectorAgent {
  constructor() {
    this.ideatorAgent = new IdeatorAgent();
    this.stylistAgent = new StylistAgent();
    this.refinerAgent = new RefinerAgent();
    this.criticAgent = new CriticAgent();
    
    // Initialize the aesthetic judgment system
    console.log('Director: Initializing the aesthetic judgment system');
    this.aestheticJudgmentSystem = initializeAestheticJudgmentSystem();
  }

  /**
   * Processes a user request to generate Magritte-inspired artwork
   * 
   * @param {string} userPrompt - The user's input prompt
   * @param {string} category - The Magritte category
   * @returns {Object} The generation result
   */
  async processRequest(userPrompt, category) {
    console.log(`Director: Processing request for "${userPrompt}" in category "${category}"`);
    
    // Load art direction for the specified category
    const artDirection = artDirectionLoader.loadArtDirection(category);
    
    // Step 1: Ideation - Generate creative concepts based on the prompt and art direction
    const ideationResult = await this.ideatorAgent.generateIdeas(userPrompt, artDirection);
    console.log('Director: Ideation complete');
    
    // Step 2: Styling - Develop artistic style based on the ideas and art direction
    const stylingResult = await this.stylistAgent.developStyle(ideationResult, artDirection);
    console.log('Director: Styling complete');
    
    // Step 3: Refinement - Refine the artwork based on the style and art direction
    const refinementResult = await this.refinerAgent.refineArtwork(stylingResult, artDirection);
    console.log('Director: Refinement complete');
    
    // Step 4: Critique - Evaluate the artwork and provide feedback
    const critiqueResult = await this.criticAgent.evaluateArtwork(refinementResult, artDirection, this.aestheticJudgmentSystem);
    console.log('Director: Critique complete');
    
    // Simulate image generation (in a real implementation, this would generate the actual image)
    console.log('\n=== Generating Image ===');
    console.log('Prompt:', refinementResult.finalPrompt);
    console.log('Negative Prompt:', refinementResult.finalNegativePrompt);
    console.log('Parameters:', JSON.stringify(refinementResult.finalParameters, null, 2));
    console.log('=== Image Generated ===');
    
    // Display aesthetic scores immediately after image generation
    const result = {
      prompt: refinementResult.finalPrompt,
      negativePrompt: refinementResult.finalNegativePrompt,
      parameters: refinementResult.finalParameters,
      feedback: critiqueResult.feedback,
      scores: critiqueResult.scores,
      overallScore: critiqueResult.overallScore,
      improvementSuggestions: critiqueResult.improvementSuggestions
    };
    
    // Display the scores
    displayAestheticScores(result, this.aestheticJudgmentSystem);
    
    // Return the final result
    return result;
  }
}

/**
 * Ideator Agent - Generates creative ideas
 */
class IdeatorAgent {
  /**
   * Generates creative ideas based on the prompt and art direction
   * 
   * @param {string} userPrompt - The user's input prompt
   * @param {Object} artDirection - The art direction data
   * @returns {Object} The ideation result
   */
  async generateIdeas(userPrompt, artDirection) {
    console.log('Ideator: Generating ideas');
    
    // Extract key elements from art direction for ideation
    const { visualElements, moodAndTone } = artDirection;
    
    // Select visual elements that complement the user prompt
    const selectedElements = this._selectComplementaryElements(userPrompt, visualElements);
    
    // Generate conceptual ideas
    const concepts = [
      `${userPrompt} with ${selectedElements[0]}`,
      `${userPrompt} featuring ${selectedElements[1]}`,
      `${userPrompt} in a scene with ${selectedElements[2]}`
    ];
    
    // Return ideation result
    return {
      originalPrompt: userPrompt,
      concepts: concepts,
      selectedMood: moodAndTone,
      selectedElements: selectedElements
    };
  }
  
  /**
   * Selects visual elements that complement the user prompt
   * 
   * @param {string} userPrompt - The user's input prompt
   * @param {Array} visualElements - Available visual elements
   * @returns {Array} Selected visual elements
   */
  _selectComplementaryElements(userPrompt, visualElements) {
    // In a real implementation, this would use NLP to find complementary elements
    // For this example, we'll just select random elements
    return artDirectionLoader.getRandomElements(visualElements, 3);
  }
}

/**
 * Stylist Agent - Develops artistic style
 */
class StylistAgent {
  /**
   * Develops artistic style based on the ideas and art direction
   * 
   * @param {Object} ideationResult - The result from the Ideator
   * @param {Object} artDirection - The art direction data
   * @returns {Object} The styling result
   */
  async developStyle(ideationResult, artDirection) {
    console.log('Stylist: Developing style');
    
    // Extract key elements from art direction for styling
    const { styleEmphasis, colorPalette } = artDirection;
    
    // Select style elements
    const selectedStyles = artDirectionLoader.getRandomElements(styleEmphasis, 3);
    
    // Select color palette
    const selectedColors = artDirectionLoader.getRandomElements(colorPalette, 2);
    
    // Choose the best concept from ideation
    const selectedConcept = ideationResult.concepts[0]; // In a real implementation, this would be more sophisticated
    
    // Develop style description
    const styleDescription = `${selectedConcept}, ${selectedStyles.join(', ')}, with ${selectedColors.join(', ')}, ${ideationResult.selectedMood}`;
    
    // Return styling result
    return {
      selectedConcept: selectedConcept,
      styleDescription: styleDescription,
      selectedStyles: selectedStyles,
      selectedColors: selectedColors,
      ideationResult: ideationResult
    };
  }
}

/**
 * Refiner Agent - Refines the artwork
 */
class RefinerAgent {
  /**
   * Refines the artwork based on the style and art direction
   * 
   * @param {Object} stylingResult - The result from the Stylist
   * @param {Object} artDirection - The art direction data
   * @returns {Object} The refinement result
   */
  async refineArtwork(stylingResult, artDirection) {
    console.log('Refiner: Refining artwork');
    
    // Extract key elements from art direction for refinement
    const { compositionGuidelines, avoidElements } = artDirection;
    
    // Build the final prompt
    const finalPrompt = `${stylingResult.styleDescription}, in the style of René Magritte, ${compositionGuidelines[0]}`;
    
    // Build the final negative prompt
    const finalNegativePrompt = avoidElements.join(', ');
    
    // Build the final parameters
    const finalParameters = {
      width: 768,
      height: 768,
      painterly: true,
      brushworkVisible: true,
      compositionGuidance: compositionGuidelines.includes('rule of thirds') ? 'rule_of_thirds' : 'balanced'
    };
    
    // Return refinement result
    return {
      finalPrompt: finalPrompt,
      finalNegativePrompt: finalNegativePrompt,
      finalParameters: finalParameters,
      stylingResult: stylingResult
    };
  }
}

/**
 * Critic Agent - Evaluates the artwork
 */
class CriticAgent {
  /**
   * Evaluates the artwork and provides feedback
   * 
   * @param {Object} refinementResult - The result from the Refiner
   * @param {Object} artDirection - The art direction data
   * @param {Object} aestheticJudgmentSystem - The aesthetic judgment system
   * @returns {Object} The critique result
   */
  async evaluateArtwork(refinementResult, artDirection, aestheticJudgmentSystem) {
    console.log('Critic: Evaluating artwork');
    
    // Use the aesthetic judgment system for evaluation
    const evaluationResult = aestheticJudgmentSystem.evaluateArtwork(refinementResult, artDirection);
    
    console.log('Critic: Evaluation complete');
    console.log(`Critic: Overall score: ${evaluationResult.overallScore.toFixed(2)}`);
    
    // Return critique result
    return {
      feedback: evaluationResult.feedback,
      improvementSuggestions: evaluationResult.improvementSuggestions,
      scores: evaluationResult.scores,
      overallScore: evaluationResult.overallScore,
      refinementResult: refinementResult
    };
  }
}

/**
 * Example function to demonstrate the multi-agent system
 */
async function runMultiAgentExample() {
  console.log('=== Multi-Agent System for Magritte Art Generation ===\n');
  
  // Create the Director agent
  const director = new DirectorAgent();
  
  // Example 1: Classic category
  console.log('\n=== Example 1: Classic Category ===');
  const result1 = await director.processRequest('A businessman standing on a cliff', 'classic');
  
  // Example 2: Empire of Light category
  console.log('\n=== Example 2: Empire of Light Category ===');
  const result2 = await director.processRequest('A house by a street lamp', 'empire_of_light');
}

/**
 * Function to allow users to generate art with a custom prompt and category
 */
async function generateCustomArt() {
  // Create the Director agent
  const director = new DirectorAgent();
  
  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // List available categories
  const categories = artDirectionLoader.listCategories();
  console.log('\nAvailable Magritte categories:');
  categories.forEach((category, index) => {
    console.log(`${index + 1}. ${category}`);
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
    // Get category selection from user
    const categoryIndex = parseInt(await askQuestion('\nSelect a category (enter number): ')) - 1;
    if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= categories.length) {
      console.log('Invalid category selection. Using "classic" as default.');
      var selectedCategory = 'classic';
    } else {
      var selectedCategory = categories[categoryIndex];
    }
    
    // Get prompt from user
    const userPrompt = await askQuestion(`\nEnter your prompt for the ${selectedCategory} category: `);
    
    // Generate the artwork
    console.log(`\nGenerating artwork for "${userPrompt}" in the ${selectedCategory} category...\n`);
    await director.processRequest(userPrompt, selectedCategory);
    
    // Ask if the user wants to generate another artwork
    const generateAnother = await askQuestion('\nGenerate another artwork? (y/n): ');
    if (generateAnother.toLowerCase() === 'y') {
      await generateCustomArt();
    }
  } catch (error) {
    console.error('Error generating custom art:', error);
  } finally {
    rl.close();
  }
}

/**
 * Main function to run the application
 */
async function main() {
  console.log('=== Magritte Art Generator ===');
  console.log('1. Run examples');
  console.log('2. Generate custom art');
  
  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\nSelect an option (1 or 2): ', async (answer) => {
    rl.close();
    
    if (answer === '1') {
      await runMultiAgentExample();
    } else if (answer === '2') {
      await generateCustomArt();
    } else {
      console.log('Invalid option. Running examples by default.');
      await runMultiAgentExample();
    }
  });
}

// Run the main function
main().catch(error => {
  console.error('Error running application:', error);
});

// Export functions for external use
module.exports = {
  generateCustomArt,
  runMultiAgentExample,
  DirectorAgent,
  IdeatorAgent,
  StylistAgent,
  RefinerAgent,
  CriticAgent,
  displayAestheticScores
}; 