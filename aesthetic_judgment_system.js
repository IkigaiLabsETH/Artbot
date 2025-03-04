/**
 * Aesthetic Judgment System for Magritte Art Generator
 * 
 * This system provides sophisticated evaluation of generated artwork
 * based on art direction guidelines and aesthetic principles.
 */

/**
 * Initializes the aesthetic judgment system
 * 
 * @returns {Object} The initialized aesthetic judgment system
 */
function initializeAestheticJudgmentSystem() {
  console.log('Initializing the aesthetic judgment system...');
  
  // Create the evaluation criteria
  const evaluationCriteria = {
    styleAdherence: {
      weight: 0.25,
      description: "How well the artwork adheres to Magritte's style and painterly qualities"
    },
    visualElementsPresence: {
      weight: 0.20,
      description: "Presence and quality of category-specific visual elements"
    },
    compositionQuality: {
      weight: 0.15,
      description: "Balance, focus, and overall composition quality"
    },
    colorHarmony: {
      weight: 0.15,
      description: "Appropriate use of color palette and harmony"
    },
    conceptualClarity: {
      weight: 0.15,
      description: "Clarity and strength of the surrealist concept"
    },
    technicalExecution: {
      weight: 0.10,
      description: "Technical quality of the rendering and details"
    }
  };
  
  // Create the judgment system
  const aestheticJudgmentSystem = {
    evaluationCriteria,
    
    /**
     * Evaluates artwork based on art direction and aesthetic principles
     * 
     * @param {Object} artwork - The artwork to evaluate (prompt, parameters, etc.)
     * @param {Object} artDirection - The art direction data
     * @returns {Object} Detailed evaluation results
     */
    evaluateArtwork(artwork, artDirection) {
      console.log('Aesthetic Judgment System: Evaluating artwork...');
      
      // In a real implementation, this would analyze the actual generated image
      // For this example, we'll simulate the evaluation based on the prompt and parameters
      
      // Extract key elements from art direction for evaluation
      const { styleEmphasis, visualElements, colorPalette, compositionGuidelines, references } = artDirection;
      
      // Simulate scores for each criterion (0.0 to 1.0)
      const scores = {
        styleAdherence: this._evaluateStyleAdherence(artwork, styleEmphasis),
        visualElementsPresence: this._evaluateVisualElements(artwork, visualElements),
        compositionQuality: this._evaluateComposition(artwork, compositionGuidelines),
        colorHarmony: this._evaluateColorHarmony(artwork, colorPalette),
        conceptualClarity: this._evaluateConceptualClarity(artwork),
        technicalExecution: this._evaluateTechnicalExecution(artwork)
      };
      
      // Calculate weighted overall score
      let overallScore = 0;
      let totalWeight = 0;
      
      for (const criterion in scores) {
        overallScore += scores[criterion] * this.evaluationCriteria[criterion].weight;
        totalWeight += this.evaluationCriteria[criterion].weight;
      }
      
      overallScore = (totalWeight > 0) ? overallScore / totalWeight : 0;
      
      // Generate qualitative feedback
      const feedback = this._generateFeedback(scores, artwork, artDirection);
      
      // Generate improvement suggestions
      const improvementSuggestions = this._generateImprovementSuggestions(scores, artwork, artDirection);
      
      // Return evaluation results
      return {
        scores,
        overallScore,
        feedback,
        improvementSuggestions,
        artworkDetails: {
          prompt: artwork.finalPrompt,
          negativePrompt: artwork.finalNegativePrompt,
          parameters: artwork.finalParameters
        }
      };
    },
    
    /**
     * Evaluates style adherence
     * 
     * @param {Object} artwork - The artwork to evaluate
     * @param {Array} styleEmphasis - Style emphasis from art direction
     * @returns {number} Score from 0.0 to 1.0
     */
    _evaluateStyleAdherence(artwork, styleEmphasis) {
      // In a real implementation, this would analyze the image for style characteristics
      // For this example, we'll simulate based on the prompt containing style elements
      
      const prompt = artwork.finalPrompt.toLowerCase();
      let matchCount = 0;
      
      for (const style of styleEmphasis) {
        if (prompt.includes(style.toLowerCase())) {
          matchCount++;
        }
      }
      
      // Calculate score based on matches (with some randomness for simulation)
      const baseScore = Math.min(matchCount / Math.max(styleEmphasis.length * 0.7, 1), 1.0);
      return baseScore * (0.9 + Math.random() * 0.1);
    },
    
    /**
     * Evaluates visual elements presence
     * 
     * @param {Object} artwork - The artwork to evaluate
     * @param {Array} visualElements - Visual elements from art direction
     * @returns {number} Score from 0.0 to 1.0
     */
    _evaluateVisualElements(artwork, visualElements) {
      const prompt = artwork.finalPrompt.toLowerCase();
      let matchCount = 0;
      
      for (const element of visualElements) {
        if (prompt.includes(element.toLowerCase())) {
          matchCount++;
        }
      }
      
      // Calculate score based on matches (with some randomness for simulation)
      const baseScore = Math.min(matchCount / Math.max(3, 1), 1.0); // Expect at least 3 elements
      return baseScore * (0.85 + Math.random() * 0.15);
    },
    
    /**
     * Evaluates composition quality
     * 
     * @param {Object} artwork - The artwork to evaluate
     * @param {Array} compositionGuidelines - Composition guidelines from art direction
     * @returns {number} Score from 0.0 to 1.0
     */
    _evaluateComposition(artwork, compositionGuidelines) {
      const prompt = artwork.finalPrompt.toLowerCase();
      const params = artwork.finalParameters;
      
      // Check for composition guidelines in prompt
      let guidelineScore = 0;
      for (const guideline of compositionGuidelines) {
        if (prompt.includes(guideline.toLowerCase())) {
          guidelineScore += 0.2; // Each guideline adds 0.2 to the score
        }
      }
      
      // Check for composition parameters
      const paramScore = params.compositionGuidance ? 0.3 : 0;
      
      // Calculate score (with some randomness for simulation)
      const baseScore = Math.min(guidelineScore + paramScore, 1.0);
      return baseScore * (0.8 + Math.random() * 0.2);
    },
    
    /**
     * Evaluates color harmony
     * 
     * @param {Object} artwork - The artwork to evaluate
     * @param {Array} colorPalette - Color palette from art direction
     * @returns {number} Score from 0.0 to 1.0
     */
    _evaluateColorHarmony(artwork, colorPalette) {
      const prompt = artwork.finalPrompt.toLowerCase();
      let matchCount = 0;
      
      for (const color of colorPalette) {
        if (prompt.includes(color.toLowerCase())) {
          matchCount++;
        }
      }
      
      // Calculate score based on matches (with some randomness for simulation)
      const baseScore = Math.min(matchCount / Math.max(colorPalette.length * 0.5, 1), 1.0);
      return baseScore * (0.85 + Math.random() * 0.15);
    },
    
    /**
     * Evaluates conceptual clarity
     * 
     * @param {Object} artwork - The artwork to evaluate
     * @returns {number} Score from 0.0 to 1.0
     */
    _evaluateConceptualClarity(artwork) {
      // In a real implementation, this would analyze the image for conceptual elements
      // For this example, we'll simulate based on prompt length and structure
      
      const prompt = artwork.finalPrompt;
      
      // Longer prompts might indicate more conceptual detail
      const lengthFactor = Math.min(prompt.length / 200, 1.0) * 0.5;
      
      // Presence of "surreal" or "Magritte" terms indicates conceptual focus
      const conceptTerms = ["surreal", "magritte", "paradox", "juxtaposition", "impossible"];
      let conceptFactor = 0;
      
      for (const term of conceptTerms) {
        if (prompt.toLowerCase().includes(term)) {
          conceptFactor += 0.1;
        }
      }
      
      // Calculate score (with some randomness for simulation)
      const baseScore = Math.min(lengthFactor + conceptFactor, 1.0);
      return baseScore * (0.8 + Math.random() * 0.2);
    },
    
    /**
     * Evaluates technical execution
     * 
     * @param {Object} artwork - The artwork to evaluate
     * @returns {number} Score from 0.0 to 1.0
     */
    _evaluateTechnicalExecution(artwork) {
      // In a real implementation, this would analyze the image for technical quality
      // For this example, we'll simulate based on parameters
      
      const params = artwork.finalParameters;
      let score = 0.7; // Base score
      
      // Painterly quality increases score
      if (params.painterly) score += 0.15;
      
      // Visible brushwork increases score
      if (params.brushworkVisible) score += 0.15;
      
      // Ensure score is in range 0.0 to 1.0
      return Math.min(score, 1.0) * (0.9 + Math.random() * 0.1);
    },
    
    /**
     * Generates qualitative feedback based on scores
     * 
     * @param {Object} scores - Evaluation scores
     * @param {Object} artwork - The artwork
     * @param {Object} artDirection - The art direction data
     * @returns {Object} Qualitative feedback
     */
    _generateFeedback(scores, artwork, artDirection) {
      const feedback = {};
      
      // Style adherence feedback
      if (scores.styleAdherence > 0.8) {
        feedback.styleAdherence = "The artwork excellently incorporates the painterly quality and visible brushstrokes characteristic of Magritte's oil painting technique.";
      } else if (scores.styleAdherence > 0.6) {
        feedback.styleAdherence = "The artwork successfully incorporates the painterly quality and visible brushstrokes characteristic of Magritte's oil painting technique.";
      } else {
        feedback.styleAdherence = "The artwork could better incorporate the painterly quality and visible brushstrokes characteristic of Magritte's oil painting technique.";
      }
      
      // Visual elements feedback
      const elements = artwork.stylingResult.ideationResult.selectedElements.join(', ');
      if (scores.visualElementsPresence > 0.8) {
        feedback.visualElementsPresence = `The artwork masterfully includes the requested visual elements: ${elements}.`;
      } else if (scores.visualElementsPresence > 0.6) {
        feedback.visualElementsPresence = `The artwork effectively includes the requested visual elements: ${elements}.`;
      } else {
        feedback.visualElementsPresence = `The artwork could more clearly incorporate the requested visual elements: ${elements}.`;
      }
      
      // Composition feedback
      if (scores.compositionQuality > 0.8) {
        feedback.compositionQuality = "The composition is exceptionally well-balanced and follows traditional painting principles with great skill.";
      } else if (scores.compositionQuality > 0.6) {
        feedback.compositionQuality = "The composition is well-balanced and follows traditional painting principles.";
      } else {
        feedback.compositionQuality = "The composition could be more balanced and better adhere to traditional painting principles.";
      }
      
      // Overall impression
      const overallScore = (scores.styleAdherence + scores.visualElementsPresence + scores.compositionQuality + scores.colorHarmony + scores.conceptualClarity + scores.technicalExecution) / 6;
      
      if (overallScore > 0.8) {
        feedback.overallImpression = "The artwork brilliantly captures the essence of Magritte's surrealism while incorporating the user's requested elements.";
      } else if (overallScore > 0.6) {
        feedback.overallImpression = "The artwork successfully captures the essence of Magritte's surrealism while incorporating the user's requested elements.";
      } else {
        feedback.overallImpression = "The artwork shows potential but could better capture the essence of Magritte's surrealism while incorporating the user's requested elements.";
      }
      
      // References
      feedback.references = `The artwork shows influences from ${artDirection.references[0]}.`;
      
      return feedback;
    },
    
    /**
     * Generates improvement suggestions based on scores
     * 
     * @param {Object} scores - Evaluation scores
     * @param {Object} artwork - The artwork
     * @param {Object} artDirection - The art direction data
     * @returns {string} Improvement suggestions
     */
    _generateImprovementSuggestions(scores, artwork, artDirection) {
      const suggestions = [];
      
      // Find the lowest scoring criteria
      const lowestCriterion = Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b);
      
      // Generate suggestion based on lowest criterion
      switch (lowestCriterion) {
        case 'styleAdherence':
          suggestions.push("Enhance the painterly quality by emphasizing visible brushstrokes and canvas texture.");
          break;
        case 'visualElementsPresence':
          suggestions.push(`Incorporate more distinctive Magritte elements such as ${artDirection.visualElements[0]} and ${artDirection.visualElements[1]}.`);
          break;
        case 'compositionQuality':
          suggestions.push(`Consider using ${artDirection.compositionGuidelines[0]} to improve the composition.`);
          break;
        case 'colorHarmony':
          suggestions.push(`Adjust the color balance to better utilize ${artDirection.colorPalette[0]} and ${artDirection.colorPalette[1]}.`);
          break;
        case 'conceptualClarity':
          suggestions.push("Strengthen the surrealist concept by creating a more pronounced visual paradox or juxtaposition.");
          break;
        case 'technicalExecution':
          suggestions.push("Refine the technical execution by enhancing the detail and clarity of the focal elements.");
          break;
      }
      
      // Add a general suggestion
      suggestions.push("Consider referencing Magritte's original works more directly for inspiration on style and composition.");
      
      return suggestions.join(" ");
    }
  };
  
  console.log('Aesthetic judgment system initialized.');
  return aestheticJudgmentSystem;
}

module.exports = {
  initializeAestheticJudgmentSystem
}; 