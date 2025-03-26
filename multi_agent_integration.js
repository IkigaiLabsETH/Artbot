/**
 * Multi-Agent Integration for Margritte Art Direction
 * 
 * This script demonstrates how to integrate the Margritte art direction files
 * with a multi-agent system for enhanced art generation.
 */

const artDirectionLoader = require('./art_direction_loader');
const { initializeAestheticJudgmentSystem } = require('./aesthetic_judgment_system');
const { PersonalizedTasteModel } = require('./personalized_taste_model');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

// Initialize the aesthetic judgment system
const aestheticJudgmentSystem = initializeAestheticJudgmentSystem();

// Initialize the personalized taste model
const tasteModel = new PersonalizedTasteModel();

/**
 * Display aesthetic evaluation scores in a visually appealing way
 * @param {Object} result - The evaluation result
 * @param {Object} aestheticJudgmentSystem - The aesthetic judgment system
 */
function displayAestheticScores(result, aestheticJudgmentSystem) {
  const { scores, overallScore, improvementSuggestions } = result;
  
  console.log('\n=== Aesthetic Evaluation Scores ===');
  
  // Header
  console.log('Criterion'.padEnd(25) + 'Score'.padEnd(10) + 'Weight'.padEnd(10) + 'Visual');
  console.log('─'.repeat(60));
  
  // Display scores for each criterion
  Object.keys(scores).forEach(criterion => {
    const score = scores[criterion];
    const weight = aestheticJudgmentSystem.weights[criterion];
    const visualBar = createVisualBar(score);
    
    console.log(
      criterion.padEnd(25) + 
      score.toFixed(2).padEnd(10) + 
      (weight * 100).toFixed(0).padEnd(8) + '%  ' + 
      visualBar
    );
  });
  
  // Display overall score
  console.log('─'.repeat(60));
  console.log(
    'OVERALL'.padEnd(25) + 
    overallScore.toFixed(2).padEnd(10) + 
    '100'.padEnd(8) + '%  ' + 
    createVisualBar(overallScore)
  );
  
  // Display improvement suggestions
  if (improvementSuggestions && improvementSuggestions.length > 0) {
    console.log('\nImprovement Suggestions:');
    improvementSuggestions.forEach(suggestion => {
      console.log(`- ${suggestion}`);
    });
  }
}

/**
 * Create a visual bar representation of a score
 * @param {number} score - The score (0.0 to 1.0)
 * @returns {string} Visual bar
 */
function createVisualBar(score) {
  const barLength = 10;
  const filledLength = Math.round(score * barLength);
  const emptyLength = barLength - filledLength;
  
  return '█'.repeat(filledLength) + '░'.repeat(emptyLength);
}

/**
 * Director Agent - Coordinates the art generation process
 */
class DirectorAgent {
  /**
   * Constructor
   */
  constructor() {
    this.ideator = new IdeatorAgent();
    this.stylist = new StylistAgent();
    this.refiner = new RefinerAgent();
    this.critic = new CriticAgent();
    this.tasteAgent = new TasteAgent();
  }
  
  /**
   * Process a user request to generate artwork
   * @param {string} userPrompt - The user's input prompt
   * @param {string} category - The Margritte category to use
   * @returns {Object} The generated artwork and evaluation
   */
  async processRequest(userPrompt, category) {
    console.log(`\nProcessing request for category: ${category}`);
    
    // Load art direction for the category
    const artDirection = artDirectionLoader.loadArtDirection(category);
    
    // Step 1: Generate ideas based on the prompt and art direction
    console.log('Step 1: Generating ideas...');
    const ideationResult = await this.ideator.generateIdeas(userPrompt, artDirection);
    
    // Step 2: Develop style based on the ideas and art direction
    console.log('Step 2: Developing style...');
    const stylingResult = await this.stylist.developStyle(ideationResult, artDirection);
    
    // Step 3: Refine the artwork based on the style and art direction
    console.log('Step 3: Refining artwork...');
    const refinementResult = await this.refiner.refineArtwork(stylingResult, artDirection);
    
    // Step 4: Evaluate the artwork
    console.log('Step 4: Evaluating artwork...');
    const evaluationResult = await this.critic.evaluateArtwork(
      refinementResult, 
      artDirection,
      aestheticJudgmentSystem
    );
    
    // Step 5: Apply personalized taste model
    console.log('Step 5: Applying personalized taste model...');
    const artworkId = uuidv4();
    const tasteResult = await this.tasteAgent.evaluateArtwork(
      artworkId,
      refinementResult,
      evaluationResult,
      category
    );
    
    // Log the final result
    console.log('\n=== Final Result ===');
    console.log(`Final Prompt: ${refinementResult.prompt}`);
    console.log(`Negative Prompt: ${refinementResult.negativePrompt}`);
    console.log(`Parameters: ${JSON.stringify(refinementResult.parameters, null, 2)}`);
    
    // Display aesthetic scores
    displayAestheticScores(evaluationResult, aestheticJudgmentSystem);
    
    // Display taste model evaluation
    this.tasteAgent.displayTasteEvaluation(tasteResult);
    
    // Return the complete result
    return {
      prompt: refinementResult.prompt,
      negativePrompt: refinementResult.negativePrompt,
      parameters: refinementResult.parameters,
      feedback: evaluationResult.feedback,
      scores: evaluationResult.scores,
      overallScore: evaluationResult.overallScore,
      improvementSuggestions: evaluationResult.improvementSuggestions,
      tasteEvaluation: tasteResult
    };
  }
}

/**
 * Ideator Agent - Generates creative ideas based on the prompt and art direction
 */
class IdeatorAgent {
  /**
   * Generate ideas based on the prompt and art direction
   * @param {string} userPrompt - The user's input prompt
   * @param {Object} artDirection - The art direction data
   * @returns {Object} The ideation result
   */
  async generateIdeas(userPrompt, artDirection) {
    // In a real implementation, this would use an LLM to generate creative ideas
    // For this demo, we'll use a simplified approach
    
    // Extract key elements from art direction
    const { visualElements } = artDirection;
    
    // Select complementary elements based on the user prompt
    const selectedElements = this._selectComplementaryElements(userPrompt, visualElements);
    
    // Combine user prompt with selected elements
    const enhancedPrompt = `${userPrompt}, featuring ${selectedElements.join(', ')}`;
    
    // Return the ideation result
    return {
      originalPrompt: userPrompt,
      enhancedPrompt,
      selectedElements,
      artDirection
    };
  }
  
  /**
   * Select complementary visual elements based on the user prompt
   * @param {string} userPrompt - The user's input prompt
   * @param {Array} visualElements - Available visual elements
   * @returns {Array} Selected visual elements
   */
  _selectComplementaryElements(userPrompt, visualElements) {
    // In a real implementation, this would use an LLM to select complementary elements
    // For this demo, we'll select random elements
    
    // Select 2-3 random elements
    const count = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const selectedElements = [];
    
    for (let i = 0; i < Math.min(count, visualElements.length); i++) {
      const randomIndex = Math.floor(Math.random() * visualElements.length);
      const element = visualElements[randomIndex];
      
      if (!selectedElements.includes(element)) {
        selectedElements.push(element);
      }
    }
    
    return selectedElements;
  }
}

/**
 * Stylist Agent - Develops artistic style based on the ideas and art direction
 */
class StylistAgent {
  /**
   * Develop style based on the ideas and art direction
   * @param {Object} ideationResult - The result from the Ideator Agent
   * @param {Object} artDirection - The art direction data
   * @returns {Object} The styling result
   */
  async developStyle(ideationResult, artDirection) {
    // In a real implementation, this would use an LLM to develop the style
    // For this demo, we'll use a simplified approach
    
    // Extract key elements from art direction
    const { styleEmphasis, colorPalette, moodAndTone } = artDirection;
    
    // Select style elements
    const selectedStyles = styleEmphasis.slice(0, 2);
    const selectedColors = colorPalette.slice(0, 2);
    
    // Build the styled prompt
    const styledPrompt = `${ideationResult.enhancedPrompt}, with ${selectedStyles.join(', ')}, using ${selectedColors.join(', ')}, ${moodAndTone}, in the style of Studio Margritte`;
    
    // Build negative prompt
    const negativePrompt = (artDirection.avoidElements || []).join(', ');
    
    // Return the styling result
    return {
      originalPrompt: ideationResult.originalPrompt,
      enhancedPrompt: ideationResult.enhancedPrompt,
      styledPrompt,
      negativePrompt,
      selectedStyles,
      selectedColors,
      moodAndTone,
      artDirection
    };
  }
}

/**
 * Refiner Agent - Refines the artwork based on the style and art direction
 */
class RefinerAgent {
  /**
   * Refine the artwork based on the style and art direction
   * @param {Object} stylingResult - The result from the Stylist Agent
   * @param {Object} artDirection - The art direction data
   * @returns {Object} The refinement result
   */
  async refineArtwork(stylingResult, artDirection) {
    // In a real implementation, this would use an LLM to refine the artwork
    // For this demo, we'll use a simplified approach
    
    // Extract key elements from art direction
    const { compositionGuidelines } = artDirection;
    
    // Select composition guidelines
    const selectedComposition = compositionGuidelines.slice(0, 2);
    
    // Refine the prompt
    const refinedPrompt = `${stylingResult.styledPrompt}, with composition: ${selectedComposition.join(', ')}`;
    
    // Set parameters appropriate for Margritte-style generation
    const parameters = {
      width: 1024,
      height: 1024,
      steps: 30,
      guidance_scale: 7.5,
      sampler: "DPM++ 2M Karras"
    };
    
    // Return the refinement result
    return {
      originalPrompt: stylingResult.originalPrompt,
      enhancedPrompt: stylingResult.enhancedPrompt,
      styledPrompt: stylingResult.styledPrompt,
      prompt: refinedPrompt,
      negativePrompt: stylingResult.negativePrompt,
      parameters,
      selectedComposition,
      artDirection
    };
  }
}

/**
 * Critic Agent - Evaluates the artwork and provides feedback
 */
class CriticAgent {
  /**
   * Evaluate the artwork and provide feedback
   * @param {Object} refinementResult - The result from the Refiner Agent
   * @param {Object} artDirection - The art direction data
   * @param {Object} aestheticJudgmentSystem - The aesthetic judgment system
   * @returns {Object} The evaluation result
   */
  async evaluateArtwork(refinementResult, artDirection, aestheticJudgmentSystem) {
    // In a real implementation, this would analyze the generated image
    // For this demo, we'll simulate the evaluation
    
    // Evaluate the artwork using the aesthetic judgment system
    const evaluation = aestheticJudgmentSystem.evaluateArtwork(
      refinementResult.prompt,
      refinementResult.negativePrompt,
      artDirection
    );
    
    // Return the evaluation result
    return {
      prompt: refinementResult.prompt,
      negativePrompt: refinementResult.negativePrompt,
      parameters: refinementResult.parameters,
      scores: evaluation.scores,
      overallScore: evaluation.overallScore,
      feedback: evaluation.feedback,
      improvementSuggestions: evaluation.improvementSuggestions
    };
  }
}

/**
 * Taste Agent - Applies personalized taste model to evaluate artwork
 */
class TasteAgent {
  /**
   * Evaluate artwork using the personalized taste model
   * @param {string} artworkId - Unique identifier for the artwork
   * @param {Object} refinementResult - The result from the Refiner Agent
   * @param {Object} evaluationResult - The result from the Critic Agent
   * @param {string} category - The Margritte category
   * @returns {Object} The taste evaluation result
   */
  async evaluateArtwork(artworkId, refinementResult, evaluationResult, category) {
    // Create artwork data
    const artworkData = {
      prompt: refinementResult.prompt,
      negativePrompt: refinementResult.negativePrompt,
      category,
      parameters: refinementResult.parameters
    };
    
    // Register artwork with the taste model
    tasteModel.registerArtwork(artworkId, artworkData);
    
    // Evaluate artwork using the taste model
    const tasteEvaluation = tasteModel.evaluateArtwork(artworkId, evaluationResult);
    
    // Save the model
    tasteModel.saveModel();
    
    return tasteEvaluation;
  }
  
  /**
   * Display taste model evaluation in a visually appealing way
   * @param {Object} tasteResult - The taste evaluation result
   */
  displayTasteEvaluation(tasteResult) {
    console.log('\n=== Personalized Taste Evaluation ===');
    
    // Display scores
    console.log('Aesthetic Score:'.padEnd(25) + tasteResult.aestheticScore.toFixed(2).padEnd(10) + createVisualBar(tasteResult.aestheticScore));
    console.log('Preference Score:'.padEnd(25) + tasteResult.preferenceScore.toFixed(2).padEnd(10) + createVisualBar(tasteResult.preferenceScore));
    console.log('Exploration Bonus:'.padEnd(25) + tasteResult.explorationBonus.toFixed(2).padEnd(10) + createVisualBar(tasteResult.explorationBonus));
    console.log('─'.repeat(60));
    console.log('FINAL SCORE:'.padEnd(25) + tasteResult.finalScore.toFixed(2).padEnd(10) + createVisualBar(tasteResult.finalScore));
    
    // Display feature analysis
    console.log('\nFeature Analysis:');
    
    // Display category
    console.log(`Category: ${tasteResult.features.category}`);
    
    // Display style features
    if (tasteResult.features.styleFeatures.length > 0) {
      console.log(`Style Features: ${tasteResult.features.styleFeatures.join(', ')}`);
    }
    
    // Display visual elements
    if (tasteResult.features.visualElements.length > 0) {
      console.log(`Visual Elements: ${tasteResult.features.visualElements.join(', ')}`);
    }
    
    // Display color palette
    if (tasteResult.features.colorPalette.length > 0) {
      console.log(`Color Palette: ${tasteResult.features.colorPalette.join(', ')}`);
    }
  }
}

/**
 * Run a multi-agent example
 */
async function runMultiAgentExample() {
  // Create the Director agent
  const director = new DirectorAgent();
  
  // Example 1: Classic Margritte
  console.log('\n=== Generating Classic Margritte Artwork ===');
  await director.processRequest(
    "A man with a bowler hat and an apple",
    "classic"
  );
  
  // Example 2: Empire of Light
  console.log('\n=== Generating Empire of Light Artwork ===');
  await director.processRequest(
    "A house at dusk with a bright blue sky",
    "empire_of_light"
  );
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
  console.log('\nAvailable Margritte categories:');
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
  console.log('=== Margritte Art Generator ===');
  console.log('1. Run examples');
  console.log('2. Generate custom art');
  console.log('3. Train taste model');
  
  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\nSelect an option (1, 2, or 3): ', async (answer) => {
    rl.close();
    
    if (answer === '1') {
      await runMultiAgentExample();
    } else if (answer === '2') {
      await generateCustomArt();
    } else if (answer === '3') {
      // Load the taste model trainer dynamically
      const tasteModelTrainer = require('./taste_model_trainer');
      // The trainer will run automatically when required
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
  TasteAgent,
  displayAestheticScores
}; 