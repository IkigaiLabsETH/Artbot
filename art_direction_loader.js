/**
 * Art Direction Loader
 * 
 * Enhanced utility for loading and applying art direction files
 * supporting multiple artistic styles and advanced configuration options.
 * 
 * @module art_direction_loader
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * @typedef {Object} ArtStyle
 * @property {string[]} styleEmphasis - Key style elements to emphasize
 * @property {string[]} visualElements - Visual elements to include
 * @property {string[]} colorPalette - Color palette to use
 * @property {string[]} compositionGuidelines - Guidelines for composition
 * @property {string} moodAndTone - Overall mood and tone description
 * @property {string[]} references - Artistic references
 * @property {string[]} avoidElements - Elements to avoid
 * @property {Object} [weights] - Optional weights for style mixing
 */

/**
 * @typedef {Object} GenerationParams
 * @property {string} [compositionGuidance] - Guidance for composition
 * @property {string} [colorEmphasis] - Color emphasis mode
 * @property {boolean} [painterly] - Whether to use painterly style
 * @property {boolean} [dramaticLighting] - Whether to use dramatic lighting
 * @property {boolean} [geometricElements] - Whether to include geometric elements
 * @property {number} [styleWeight] - Weight for style mixing (0-1)
 */

// Cache for loaded art direction files
const artDirectionCache = new Map();

/**
 * Configuration options for the art direction loader
 */
const config = {
  cacheEnabled: true,
  defaultStyle: 'classic',
  maxCacheSize: 100,
  promptMaxLength: 500,
  weightingEnabled: true
};

/**
 * Loads the art direction file for a specific style category
 * 
 * @param {string} category - The style category (e.g., 'magritte_classic', 'kandinsky_abstract')
 * @param {Object} [options] - Loading options
 * @param {boolean} [options.useCache=true] - Whether to use cache
 * @param {boolean} [options.validate=true] - Whether to validate the loaded data
 * @returns {Promise<ArtStyle>} The art direction data
 * @throws {Error} If the file cannot be loaded or is invalid
 */
async function loadArtDirection(category, options = {}) {
  const { useCache = true, validate = true } = options;

  // Check cache first if enabled
  if (useCache && config.cacheEnabled && artDirectionCache.has(category)) {
    return artDirectionCache.get(category);
  }

  try {
    const filePath = path.join(__dirname, `${category}.json`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const artStyle = JSON.parse(fileContent);

    if (validate) {
      validateArtStyle(artStyle);
    }

    // Cache the result if caching is enabled
    if (useCache && config.cacheEnabled) {
      maintainCache();
      artDirectionCache.set(category, artStyle);
    }

    return artStyle;
  } catch (error) {
    console.error(`Error loading art direction for category '${category}':`, error.message);
    return loadDefaultArtDirection();
  }
}

/**
 * Validates an art style object
 * 
 * @param {ArtStyle} artStyle - The art style to validate
 * @throws {Error} If the art style is invalid
 */
function validateArtStyle(artStyle) {
  const requiredArrayProps = ['styleEmphasis', 'visualElements', 'colorPalette', 'compositionGuidelines', 'references', 'avoidElements'];
  const requiredStringProps = ['moodAndTone'];

  for (const prop of requiredArrayProps) {
    if (!Array.isArray(artStyle[prop]) || artStyle[prop].length === 0) {
      throw new Error(`Invalid art style: ${prop} must be a non-empty array`);
    }
  }

  for (const prop of requiredStringProps) {
    if (typeof artStyle[prop] !== 'string' || !artStyle[prop]) {
      throw new Error(`Invalid art style: ${prop} must be a non-empty string`);
    }
  }
}

/**
 * Maintains the cache size within limits
 */
function maintainCache() {
  if (artDirectionCache.size >= config.maxCacheSize) {
    const oldestKey = artDirectionCache.keys().next().value;
    artDirectionCache.delete(oldestKey);
  }
}

/**
 * Lists all available art style categories
 * 
 * @returns {Promise<string[]>} Array of available category names
 */
async function listCategories() {
  try {
    const files = await fs.readdir(__dirname);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('Error listing categories:', error.message);
    return [];
  }
}

/**
 * Builds a prompt based on the art direction and user input
 * 
 * @param {ArtStyle} artStyle - The art direction data
 * @param {string} userPrompt - The user's input prompt
 * @param {Object} [options] - Prompt building options
 * @param {number} [options.styleCount=3] - Number of style elements to include
 * @param {number} [options.visualCount=3] - Number of visual elements to include
 * @param {number} [options.colorCount=2] - Number of colors to include
 * @returns {string} The enhanced prompt
 */
function buildPrompt(artStyle, userPrompt, options = {}) {
  const {
    styleCount = 3,
    visualCount = 3,
    colorCount = 2
  } = options;

  // Extract and select elements
  const selectedStyles = getRandomElements(artStyle.styleEmphasis, styleCount);
  const selectedVisuals = getRandomElements(artStyle.visualElements, visualCount);
  const selectedColors = getRandomElements(artStyle.colorPalette, colorCount);

  // Build the prompt with weights if enabled
  let enhancedPrompt = `${userPrompt}, ${selectedStyles.join(', ')}, featuring ${selectedVisuals.join(', ')}, with ${selectedColors.join(', ')}, ${artStyle.moodAndTone}`;

  if (config.weightingEnabled && artStyle.weights) {
    enhancedPrompt = applyStyleWeights(enhancedPrompt, artStyle.weights);
  }

  // Ensure prompt doesn't exceed maximum length
  if (enhancedPrompt.length > config.promptMaxLength) {
    enhancedPrompt = truncatePrompt(enhancedPrompt);
  }

  return enhancedPrompt;
}

/**
 * Applies style weights to the prompt
 * 
 * @param {string} prompt - The original prompt
 * @param {Object} weights - Style weights
 * @returns {string} The weighted prompt
 */
function applyStyleWeights(prompt, weights) {
  let weightedPrompt = prompt;
  for (const [style, weight] of Object.entries(weights)) {
    weightedPrompt += `, (${style}:${weight})`;
  }
  return weightedPrompt;
}

/**
 * Truncates a prompt to the maximum length while maintaining coherence
 * 
 * @param {string} prompt - The prompt to truncate
 * @returns {string} The truncated prompt
 */
function truncatePrompt(prompt) {
  const words = prompt.split(' ');
  let truncated = '';
  
  for (const word of words) {
    if ((truncated + word).length <= config.promptMaxLength) {
      truncated += (truncated ? ' ' : '') + word;
    } else {
      break;
    }
  }
  
  return truncated;
}

/**
 * Gets random elements from an array with optional weighting
 * 
 * @param {Array} array - The source array
 * @param {number} count - Number of elements to select
 * @param {Object} [weights] - Optional weights for elements
 * @returns {Array} Array of randomly selected elements
 */
function getRandomElements(array, count, weights = null) {
  if (!array?.length) return [];
  if (array.length <= count) return [...array];

  const result = [];
  const copyArray = [...array];
  const copyWeights = weights ? [...weights] : null;

  for (let i = 0; i < count; i++) {
    const index = weights 
      ? getWeightedRandomIndex(copyWeights)
      : Math.floor(Math.random() * copyArray.length);
    
    result.push(copyArray[index]);
    copyArray.splice(index, 1);
    if (copyWeights) copyWeights.splice(index, 1);
  }

  return result;
}

/**
 * Gets a random index based on weights
 * 
 * @param {number[]} weights - Array of weights
 * @returns {number} The selected index
 */
function getWeightedRandomIndex(weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * sum;
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i;
  }
  
  return weights.length - 1;
}

/**
 * Applies art direction to generation parameters
 * 
 * @param {ArtStyle} artStyle - The art direction data
 * @param {GenerationParams} params - The generation parameters
 * @returns {GenerationParams} The updated parameters
 */
function applyArtDirectionToParams(artStyle, params) {
  const updatedParams = { ...params };

  // Apply composition guidelines
  if (artStyle.compositionGuidelines?.includes('paradoxical placement')) {
    updatedParams.compositionGuidance = 'surreal_composition';
  }

  // Apply color palette influence
  if (artStyle.colorPalette?.some(color => color.includes('belgian sky blue'))) {
    updatedParams.colorEmphasis = 'magritte';
  }

  // Apply style weights if available
  if (config.weightingEnabled && artStyle.weights) {
    updatedParams.styleWeight = artStyle.weights.default || 1.0;
  }

  // Ensure base quality parameters
  updatedParams.painterly = true;
  updatedParams.dramaticLighting = true;
  updatedParams.geometricElements = true;

  return updatedParams;
}

/**
 * Updates the configuration options
 * 
 * @param {Object} newConfig - New configuration options
 */
function updateConfig(newConfig) {
  Object.assign(config, newConfig);
  
  // Clear cache if cache is disabled
  if (!config.cacheEnabled) {
    artDirectionCache.clear();
  }
}

export {
  loadArtDirection,
  listCategories,
  buildPrompt,
  buildNegativePrompt,
  applyArtDirectionToParams,
  updateConfig,
  config
}; 