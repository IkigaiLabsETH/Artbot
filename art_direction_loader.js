/**
 * Art Direction Loader
 * 
 * This utility script helps with loading and applying Magritte art direction files
 * to enhance the quality and authenticity of generated artwork.
 */

const fs = require('fs');
const path = require('path');

/**
 * Loads the art direction file for a specific Magritte category
 * 
 * @param {string} category - The Magritte category (e.g., 'classic', 'empire_of_light')
 * @returns {Object} The art direction data
 */
function loadArtDirection(category) {
  try {
    const filePath = path.join(__dirname, `magritte_${category}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading art direction for category '${category}':`, error.message);
    // Return default art direction if specific category file is not found
    return loadDefaultArtDirection();
  }
}

/**
 * Loads the default art direction file
 * 
 * @returns {Object} The default art direction data
 */
function loadDefaultArtDirection() {
  try {
    const filePath = path.join(__dirname, 'magritte_classic.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading default art direction:', error.message);
    return {
      styleEmphasis: [
        "Magritte surrealism",
        "oil painting technique",
        "visible brushstrokes",
        "canvas texture",
        "painterly quality"
      ],
      visualElements: [
        "men in bowler hats",
        "floating objects",
        "impossible scenes",
        "blue skies with clouds"
      ],
      colorPalette: [
        "Magritte blues",
        "earthy browns",
        "soft greens",
        "rich reds for focal objects"
      ],
      compositionGuidelines: [
        "rule of thirds",
        "leading lines",
        "balanced asymmetry",
        "clean compositions with clear subjects"
      ],
      moodAndTone: "dreamlike and contemplative with a sense of mystery",
      references: [
        "René Magritte's classic works"
      ],
      avoidElements: [
        "text",
        "watermarks",
        "photorealistic rendering"
      ]
    };
  }
}

/**
 * Lists all available Magritte categories
 * 
 * @returns {string[]} Array of available category names
 */
function listCategories() {
  try {
    const files = fs.readdirSync(__dirname);
    return files
      .filter(file => file.startsWith('magritte_') && file.endsWith('.json'))
      .map(file => file.replace('magritte_', '').replace('.json', ''));
  } catch (error) {
    console.error('Error listing categories:', error.message);
    return [];
  }
}

/**
 * Builds a prompt based on the art direction and user input
 * 
 * @param {Object} artDirection - The art direction data
 * @param {string} userPrompt - The user's input prompt
 * @returns {string} The enhanced prompt
 */
function buildPrompt(artDirection, userPrompt) {
  // Extract key elements from art direction
  const { styleEmphasis, visualElements, colorPalette, moodAndTone } = artDirection;
  
  // Select a subset of elements to include (to avoid overly long prompts)
  const selectedStyles = getRandomElements(styleEmphasis, 3);
  const selectedVisuals = getRandomElements(visualElements, 3);
  const selectedColors = getRandomElements(colorPalette, 2);
  
  // Construct the enhanced prompt
  const enhancedPrompt = `${userPrompt}, ${selectedStyles.join(', ')}, featuring ${selectedVisuals.join(', ')}, with ${selectedColors.join(', ')}, ${moodAndTone}, in the style of René Magritte`;
  
  return enhancedPrompt;
}

/**
 * Builds negative prompt based on the art direction
 * 
 * @param {Object} artDirection - The art direction data
 * @returns {string} The negative prompt
 */
function buildNegativePrompt(artDirection) {
  // Extract elements to avoid
  const { avoidElements } = artDirection;
  
  // Construct the negative prompt
  return avoidElements.join(', ');
}

/**
 * Gets random elements from an array
 * 
 * @param {Array} array - The source array
 * @param {number} count - Number of elements to select
 * @returns {Array} Array of randomly selected elements
 */
function getRandomElements(array, count) {
  if (!array || array.length === 0) return [];
  if (array.length <= count) return array;
  
  const result = [];
  const copyArray = [...array];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * copyArray.length);
    result.push(copyArray[randomIndex]);
    copyArray.splice(randomIndex, 1);
  }
  
  return result;
}

/**
 * Applies art direction to generation parameters
 * 
 * @param {Object} artDirection - The art direction data
 * @param {Object} params - The generation parameters
 * @returns {Object} The updated parameters
 */
function applyArtDirectionToParams(artDirection, params) {
  // Clone the params to avoid modifying the original
  const updatedParams = { ...params };
  
  // Apply composition guidelines to parameters
  if (artDirection.compositionGuidelines && artDirection.compositionGuidelines.includes('rule of thirds')) {
    updatedParams.compositionGuidance = 'rule_of_thirds';
  }
  
  // Apply color palette influence
  if (artDirection.colorPalette && artDirection.colorPalette.some(color => color.includes('Magritte blues'))) {
    updatedParams.colorEmphasis = 'cool';
  }
  
  // Ensure painterly quality
  updatedParams.painterly = true;
  updatedParams.brushworkVisible = true;
  
  return updatedParams;
}

module.exports = {
  loadArtDirection,
  loadDefaultArtDirection,
  listCategories,
  buildPrompt,
  buildNegativePrompt,
  applyArtDirectionToParams
}; 