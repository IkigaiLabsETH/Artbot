/**
 * Multi-Agent Integration for Magritte Art Direction
 * 
 * This script demonstrates how to integrate the Magritte art direction files
 * with a multi-agent system for enhanced art generation.
 */

const artDirectionLoader = require('./art_direction_loader');

/**
 * Director Agent - Coordinates the creative process
 */
class DirectorAgent {
  constructor() {
    this.ideatorAgent = new IdeatorAgent();
    this.stylistAgent = new StylistAgent();
    this.refinerAgent = new RefinerAgent();
    this.criticAgent = new CriticAgent();
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
    const critiqueResult = await this.criticAgent.evaluateArtwork(refinementResult, artDirection);
    console.log('Director: Critique complete');
    
    // Return the final result
    return {
      prompt: refinementResult.finalPrompt,
      negativePrompt: refinementResult.finalNegativePrompt,
      parameters: refinementResult.finalParameters,
      feedback: critiqueResult.feedback
    };
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
   * @returns {Object} The critique result
   */
  async evaluateArtwork(refinementResult, artDirection) {
    console.log('Critic: Evaluating artwork');
    
    // Extract key elements from art direction for evaluation
    const { styleEmphasis, visualElements, references } = artDirection;
    
    // Simulate artwork evaluation
    const feedback = {
      styleAdherence: "The artwork successfully incorporates the painterly quality and visible brushstrokes characteristic of Magritte's oil painting technique.",
      visualElementsPresence: `The artwork effectively includes the requested visual elements: ${refinementResult.stylingResult.ideationResult.selectedElements.join(', ')}.`,
      compositionQuality: "The composition is well-balanced and follows traditional painting principles.",
      overallImpression: "The artwork successfully captures the essence of Magritte's surrealism while incorporating the user's requested elements.",
      references: `The artwork shows influences from ${references[0]}.`,
      improvementSuggestions: "Consider adjusting the color balance to better emphasize the focal elements."
    };
    
    // Return critique result
    return {
      feedback: feedback,
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
  console.log('\nExample 1: Classic Category');
  const result1 = await director.processRequest('A businessman standing on a cliff', 'classic');
  console.log('Final Result:');
  console.log('Prompt:', result1.prompt);
  console.log('Negative Prompt:', result1.negativePrompt);
  console.log('Parameters:', JSON.stringify(result1.parameters, null, 2));
  console.log('Feedback:', result1.feedback.overallImpression);
  
  // Example 2: Empire of Light category
  console.log('\nExample 2: Empire of Light Category');
  const result2 = await director.processRequest('A house by a street lamp', 'empire_of_light');
  console.log('Final Result:');
  console.log('Prompt:', result2.prompt);
  console.log('Negative Prompt:', result2.negativePrompt);
  console.log('Parameters:', JSON.stringify(result2.parameters, null, 2));
  console.log('Feedback:', result2.feedback.overallImpression);
}

// Run the multi-agent example
runMultiAgentExample().catch(error => {
  console.error('Error running multi-agent example:', error);
}); 