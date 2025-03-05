/**
 * Personalized Taste Model for Magritte Art Generator
 * 
 * This module implements a personalized taste model that evaluates generated artwork
 * based on both aesthetic quality and alignment with evolving preferences.
 * It uses an ELO rating system for preference learning and incorporates
 * exploration bonuses to encourage experimentation with unconventional ideas.
 */

const fs = require('fs');
const path = require('path');

class PersonalizedTasteModel {
  constructor(options = {}) {
    // ELO system parameters
    this.K = options.K || 32; // K-factor determines how quickly ratings change
    this.defaultRating = options.defaultRating || 1400;
    
    // Exploration parameters
    this.explorationWeight = options.explorationWeight || 0.3;
    this.decayRate = options.decayRate || 0.95; // How quickly exploration bonus decays
    
    // Storage for artwork ratings and features
    this.artworkRatings = new Map();
    this.artworkFeatures = new Map();
    this.featureWeights = {};
    this.generationCount = new Map(); // Track how often certain features are used
    
    // Initialize feature weights for different aspects
    this._initializeFeatureWeights();
    
    // Load existing model if available
    this.modelPath = options.modelPath || path.join(__dirname, 'taste_model_data.json');
    this._loadModel();
  }
  
  /**
   * Initialize feature weights for different aspects of the artwork
   */
  _initializeFeatureWeights() {
    // Style features
    this.featureWeights.style = {
      'magritte_surrealism': 0.5,
      'oil_painting_technique': 0.5,
      'visible_brushstrokes': 0.5,
      'canvas_texture': 0.5,
      'painterly_quality': 0.5
    };
    
    // Visual elements
    this.featureWeights.visualElements = {
      'bowler_hats': 0.5,
      'floating_objects': 0.5,
      'clouds': 0.5,
      'blue_skies': 0.5,
      'apples': 0.5,
      'pipes': 0.5,
      'windows': 0.5,
      'silhouettes': 0.5,
      'scale_distortion': 0.5,
      'metamorphosis': 0.5
    };
    
    // Color palette
    this.featureWeights.colorPalette = {
      'magritte_blues': 0.5,
      'earthy_browns': 0.5,
      'soft_greens': 0.5,
      'rich_reds': 0.5,
      'high_contrast': 0.5,
      'muted_tones': 0.5
    };
    
    // Composition
    this.featureWeights.composition = {
      'rule_of_thirds': 0.5,
      'central_focus': 0.5,
      'balanced_asymmetry': 0.5,
      'clean_composition': 0.5,
      'depth': 0.5
    };
    
    // Mood and tone
    this.featureWeights.moodAndTone = {
      'mysterious': 0.5,
      'dreamlike': 0.5,
      'contemplative': 0.5,
      'unsettling': 0.5,
      'serene': 0.5
    };
  }
  
  /**
   * Load existing model data if available
   */
  _loadModel() {
    try {
      if (fs.existsSync(this.modelPath)) {
        const data = JSON.parse(fs.readFileSync(this.modelPath, 'utf8'));
        
        // Convert Map data from JSON
        this.artworkRatings = new Map(Object.entries(data.artworkRatings || {}));
        this.artworkFeatures = new Map(Object.entries(data.artworkFeatures || {}));
        this.generationCount = new Map(Object.entries(data.generationCount || {}));
        
        // Load feature weights
        this.featureWeights = data.featureWeights || this.featureWeights;
        
        console.log('Loaded personalized taste model from', this.modelPath);
      }
    } catch (error) {
      console.error('Error loading taste model:', error.message);
      // Continue with default model
    }
  }
  
  /**
   * Save the current model state
   */
  saveModel() {
    try {
      // Convert Maps to objects for JSON serialization
      const data = {
        artworkRatings: Object.fromEntries(this.artworkRatings),
        artworkFeatures: Object.fromEntries(this.artworkFeatures),
        generationCount: Object.fromEntries(this.generationCount),
        featureWeights: this.featureWeights
      };
      
      fs.writeFileSync(this.modelPath, JSON.stringify(data, null, 2), 'utf8');
      console.log('Saved personalized taste model to', this.modelPath);
    } catch (error) {
      console.error('Error saving taste model:', error.message);
    }
  }
  
  /**
   * Extract features from artwork data
   * @param {Object} artworkData - Data about the generated artwork
   * @returns {Object} Extracted features
   */
  extractFeatures(artworkData) {
    const { prompt, negativePrompt, category, parameters } = artworkData;
    
    // Initialize features object
    const features = {
      category,
      styleFeatures: [],
      visualElements: [],
      colorPalette: [],
      composition: [],
      moodAndTone: []
    };
    
    // Extract features from prompt
    const promptLower = prompt.toLowerCase();
    
    // Check for style features
    Object.keys(this.featureWeights.style).forEach(style => {
      const styleNormalized = style.replace(/_/g, ' ');
      if (promptLower.includes(styleNormalized)) {
        features.styleFeatures.push(style);
      }
    });
    
    // Check for visual elements
    Object.keys(this.featureWeights.visualElements).forEach(element => {
      const elementNormalized = element.replace(/_/g, ' ');
      if (promptLower.includes(elementNormalized)) {
        features.visualElements.push(element);
      }
    });
    
    // Check for color palette
    Object.keys(this.featureWeights.colorPalette).forEach(color => {
      const colorNormalized = color.replace(/_/g, ' ');
      if (promptLower.includes(colorNormalized)) {
        features.colorPalette.push(color);
      }
    });
    
    // Check for composition
    Object.keys(this.featureWeights.composition).forEach(comp => {
      const compNormalized = comp.replace(/_/g, ' ');
      if (promptLower.includes(compNormalized)) {
        features.composition.push(comp);
      }
    });
    
    // Check for mood and tone
    Object.keys(this.featureWeights.moodAndTone).forEach(mood => {
      const moodNormalized = mood.replace(/_/g, ' ');
      if (promptLower.includes(moodNormalized)) {
        features.moodAndTone.push(mood);
      }
    });
    
    return features;
  }
  
  /**
   * Register a new artwork in the model
   * @param {string} artworkId - Unique identifier for the artwork
   * @param {Object} artworkData - Data about the generated artwork
   */
  registerArtwork(artworkId, artworkData) {
    // Extract features from artwork data
    const features = this.extractFeatures(artworkData);
    
    // Store features
    this.artworkFeatures.set(artworkId, features);
    
    // Assign initial rating
    this.artworkRatings.set(artworkId, this.defaultRating);
    
    // Update generation counts for exploration bonus calculation
    features.styleFeatures.forEach(feature => {
      this._incrementFeatureCount(`style:${feature}`);
    });
    
    features.visualElements.forEach(feature => {
      this._incrementFeatureCount(`visualElement:${feature}`);
    });
    
    features.colorPalette.forEach(feature => {
      this._incrementFeatureCount(`color:${feature}`);
    });
    
    features.composition.forEach(feature => {
      this._incrementFeatureCount(`composition:${feature}`);
    });
    
    features.moodAndTone.forEach(feature => {
      this._incrementFeatureCount(`mood:${feature}`);
    });
    
    this._incrementFeatureCount(`category:${features.category}`);
    
    return features;
  }
  
  /**
   * Increment the count for a feature
   * @param {string} featureKey - The feature key
   */
  _incrementFeatureCount(featureKey) {
    const currentCount = this.generationCount.get(featureKey) || 0;
    this.generationCount.set(featureKey, currentCount + 1);
  }
  
  /**
   * Update ratings based on comparison between two artworks
   * @param {string} winnerId - ID of the preferred artwork
   * @param {string} loserId - ID of the less preferred artwork
   */
  updateRatings(winnerId, loserId) {
    if (!this.artworkRatings.has(winnerId) || !this.artworkRatings.has(loserId)) {
      console.error('Cannot update ratings: one or both artworks not registered');
      return;
    }
    
    const winnerRating = this.artworkRatings.get(winnerId);
    const loserRating = this.artworkRatings.get(loserId);
    
    // Calculate expected scores
    const expectedWinner = this._getExpectedScore(winnerRating, loserRating);
    const expectedLoser = this._getExpectedScore(loserRating, winnerRating);
    
    // Update ratings
    const newWinnerRating = winnerRating + this.K * (1 - expectedWinner);
    const newLoserRating = loserRating + this.K * (0 - expectedLoser);
    
    this.artworkRatings.set(winnerId, newWinnerRating);
    this.artworkRatings.set(loserId, newLoserRating);
    
    // Update feature weights based on the comparison
    this._updateFeatureWeights(winnerId, loserId);
    
    return {
      winner: {
        oldRating: winnerRating,
        newRating: newWinnerRating,
        change: newWinnerRating - winnerRating
      },
      loser: {
        oldRating: loserRating,
        newRating: newLoserRating,
        change: newLoserRating - loserRating
      }
    };
  }
  
  /**
   * Calculate expected score based on ELO formula
   * @param {number} ratingA - Rating of player A
   * @param {number} ratingB - Rating of player B
   * @returns {number} Expected score for player A
   */
  _getExpectedScore(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }
  
  /**
   * Update feature weights based on comparison between two artworks
   * @param {string} winnerId - ID of the preferred artwork
   * @param {string} loserId - ID of the less preferred artwork
   */
  _updateFeatureWeights(winnerId, loserId) {
    const winnerFeatures = this.artworkFeatures.get(winnerId);
    const loserFeatures = this.artworkFeatures.get(loserId);
    
    if (!winnerFeatures || !loserFeatures) return;
    
    // Learning rate for feature weight updates
    const learningRate = 0.05;
    
    // Update style feature weights
    this._updateCategoryWeights('style', winnerFeatures.styleFeatures, loserFeatures.styleFeatures, learningRate);
    
    // Update visual element weights
    this._updateCategoryWeights('visualElements', winnerFeatures.visualElements, loserFeatures.visualElements, learningRate);
    
    // Update color palette weights
    this._updateCategoryWeights('colorPalette', winnerFeatures.colorPalette, loserFeatures.colorPalette, learningRate);
    
    // Update composition weights
    this._updateCategoryWeights('composition', winnerFeatures.composition, loserFeatures.composition, learningRate);
    
    // Update mood and tone weights
    this._updateCategoryWeights('moodAndTone', winnerFeatures.moodAndTone, loserFeatures.moodAndTone, learningRate);
  }
  
  /**
   * Update weights for a specific category of features
   * @param {string} category - Feature category
   * @param {Array} winnerFeatures - Features present in winner
   * @param {Array} loserFeatures - Features present in loser
   * @param {number} learningRate - How quickly weights should change
   */
  _updateCategoryWeights(category, winnerFeatures, loserFeatures, learningRate) {
    // Increase weights for features in winner
    winnerFeatures.forEach(feature => {
      if (this.featureWeights[category][feature] !== undefined) {
        this.featureWeights[category][feature] += learningRate;
        // Cap at 1.0
        this.featureWeights[category][feature] = Math.min(this.featureWeights[category][feature], 1.0);
      }
    });
    
    // Decrease weights for features in loser that aren't in winner
    loserFeatures.forEach(feature => {
      if (!winnerFeatures.includes(feature) && this.featureWeights[category][feature] !== undefined) {
        this.featureWeights[category][feature] -= learningRate;
        // Floor at 0.0
        this.featureWeights[category][feature] = Math.max(this.featureWeights[category][feature], 0.0);
      }
    });
  }
  
  /**
   * Calculate exploration bonus for a set of features
   * @param {Object} features - Artwork features
   * @returns {number} Exploration bonus score
   */
  calculateExplorationBonus(features) {
    let totalBonus = 0;
    let featureCount = 0;
    
    // Calculate bonus for style features
    features.styleFeatures.forEach(feature => {
      const count = this.generationCount.get(`style:${feature}`) || 0;
      totalBonus += Math.exp(-count * this.decayRate);
      featureCount++;
    });
    
    // Calculate bonus for visual elements
    features.visualElements.forEach(feature => {
      const count = this.generationCount.get(`visualElement:${feature}`) || 0;
      totalBonus += Math.exp(-count * this.decayRate);
      featureCount++;
    });
    
    // Calculate bonus for color palette
    features.colorPalette.forEach(feature => {
      const count = this.generationCount.get(`color:${feature}`) || 0;
      totalBonus += Math.exp(-count * this.decayRate);
      featureCount++;
    });
    
    // Calculate bonus for composition
    features.composition.forEach(feature => {
      const count = this.generationCount.get(`composition:${feature}`) || 0;
      totalBonus += Math.exp(-count * this.decayRate);
      featureCount++;
    });
    
    // Calculate bonus for mood and tone
    features.moodAndTone.forEach(feature => {
      const count = this.generationCount.get(`mood:${feature}`) || 0;
      totalBonus += Math.exp(-count * this.decayRate);
      featureCount++;
    });
    
    // Calculate bonus for category
    const categoryCount = this.generationCount.get(`category:${features.category}`) || 0;
    totalBonus += Math.exp(-categoryCount * this.decayRate);
    featureCount++;
    
    // Normalize bonus
    return featureCount > 0 ? totalBonus / featureCount : 0;
  }
  
  /**
   * Calculate preference score for an artwork based on its features
   * @param {Object} features - Artwork features
   * @returns {number} Preference score between 0 and 1
   */
  calculatePreferenceScore(features) {
    let totalScore = 0;
    let totalWeight = 0;
    
    // Calculate score for style features
    features.styleFeatures.forEach(feature => {
      if (this.featureWeights.style[feature] !== undefined) {
        totalScore += this.featureWeights.style[feature];
        totalWeight += 1;
      }
    });
    
    // Calculate score for visual elements
    features.visualElements.forEach(feature => {
      if (this.featureWeights.visualElements[feature] !== undefined) {
        totalScore += this.featureWeights.visualElements[feature];
        totalWeight += 1;
      }
    });
    
    // Calculate score for color palette
    features.colorPalette.forEach(feature => {
      if (this.featureWeights.colorPalette[feature] !== undefined) {
        totalScore += this.featureWeights.colorPalette[feature];
        totalWeight += 1;
      }
    });
    
    // Calculate score for composition
    features.composition.forEach(feature => {
      if (this.featureWeights.composition[feature] !== undefined) {
        totalScore += this.featureWeights.composition[feature];
        totalWeight += 1;
      }
    });
    
    // Calculate score for mood and tone
    features.moodAndTone.forEach(feature => {
      if (this.featureWeights.moodAndTone[feature] !== undefined) {
        totalScore += this.featureWeights.moodAndTone[feature];
        totalWeight += 1;
      }
    });
    
    // Normalize score
    return totalWeight > 0 ? totalScore / totalWeight : 0.5;
  }
  
  /**
   * Evaluate artwork based on aesthetic quality and evolving preferences
   * @param {string} artworkId - Unique identifier for the artwork
   * @param {Object} aestheticScores - Scores from the aesthetic judgment system
   * @returns {Object} Evaluation results
   */
  evaluateArtwork(artworkId, aestheticScores) {
    if (!this.artworkFeatures.has(artworkId)) {
      throw new Error(`Artwork ${artworkId} not registered in the taste model`);
    }
    
    const features = this.artworkFeatures.get(artworkId);
    
    // Calculate preference score based on learned weights
    const preferenceScore = this.calculatePreferenceScore(features);
    
    // Calculate exploration bonus
    const explorationBonus = this.calculateExplorationBonus(features);
    
    // Combine aesthetic score with preference score
    const aestheticWeight = 0.6; // Weight for aesthetic quality
    const preferenceWeight = 0.4; // Weight for learned preferences
    
    // Get overall aesthetic score
    const overallAestheticScore = aestheticScores.overallScore || 0.5;
    
    // Calculate combined base score
    const baseScore = (aestheticWeight * overallAestheticScore) + 
                      (preferenceWeight * preferenceScore);
    
    // Apply exploration bonus
    const finalScore = baseScore + (this.explorationWeight * explorationBonus);
    
    // Cap final score between 0 and 1
    const normalizedScore = Math.max(0, Math.min(1, finalScore));
    
    return {
      artworkId,
      aestheticScore: overallAestheticScore,
      preferenceScore,
      explorationBonus,
      finalScore: normalizedScore,
      features: {
        category: features.category,
        styleFeatures: features.styleFeatures,
        visualElements: features.visualElements,
        colorPalette: features.colorPalette,
        composition: features.composition,
        moodAndTone: features.moodAndTone
      }
    };
  }
  
  /**
   * Get feature importance analysis
   * @returns {Object} Analysis of feature importance
   */
  getFeatureImportance() {
    const analysis = {
      topStyleFeatures: this._getTopFeatures('style', 5),
      topVisualElements: this._getTopFeatures('visualElements', 5),
      topColorPalette: this._getTopFeatures('colorPalette', 5),
      topComposition: this._getTopFeatures('composition', 5),
      topMoodAndTone: this._getTopFeatures('moodAndTone', 5),
      leastPreferredFeatures: this._getLeastPreferredFeatures(5)
    };
    
    return analysis;
  }
  
  /**
   * Get top N features from a category by weight
   * @param {string} category - Feature category
   * @param {number} n - Number of features to return
   * @returns {Array} Top features with weights
   */
  _getTopFeatures(category, n) {
    return Object.entries(this.featureWeights[category])
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([feature, weight]) => ({ feature, weight }));
  }
  
  /**
   * Get least preferred features across all categories
   * @param {number} n - Number of features to return
   * @returns {Array} Least preferred features with weights
   */
  _getLeastPreferredFeatures(n) {
    const allFeatures = [];
    
    Object.keys(this.featureWeights).forEach(category => {
      Object.entries(this.featureWeights[category]).forEach(([feature, weight]) => {
        allFeatures.push({ category, feature, weight });
      });
    });
    
    return allFeatures
      .sort((a, b) => a.weight - b.weight)
      .slice(0, n);
  }
  
  /**
   * Generate recommendations based on learned preferences
   * @param {number} n - Number of recommendations to generate
   * @returns {Array} Recommended feature combinations
   */
  generateRecommendations(n = 3) {
    const recommendations = [];
    
    for (let i = 0; i < n; i++) {
      // Decide whether to focus on exploitation or exploration for this recommendation
      const exploreMode = Math.random() < this.explorationWeight;
      
      const recommendation = {
        category: this._selectFeature('category', exploreMode),
        styleFeatures: this._selectMultipleFeatures('style', 2, exploreMode),
        visualElements: this._selectMultipleFeatures('visualElements', 3, exploreMode),
        colorPalette: this._selectMultipleFeatures('colorPalette', 2, exploreMode),
        composition: this._selectMultipleFeatures('composition', 1, exploreMode),
        moodAndTone: this._selectMultipleFeatures('moodAndTone', 1, exploreMode),
        isExplorative: exploreMode
      };
      
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }
  
  /**
   * Select a category based on weights or exploration
   * @param {string} featureType - Type of feature to select
   * @param {boolean} exploreMode - Whether to prioritize exploration
   * @returns {string} Selected category
   */
  _selectFeature(featureType, exploreMode) {
    if (featureType === 'category') {
      // Get all categories that have been used
      const categories = Array.from(this.generationCount.keys())
        .filter(key => key.startsWith('category:'))
        .map(key => key.replace('category:', ''));
      
      if (categories.length === 0) return 'classic';
      
      if (exploreMode) {
        // Select least used category
        const categoryCounts = categories.map(category => ({
          category,
          count: this.generationCount.get(`category:${category}`) || 0
        }));
        
        categoryCounts.sort((a, b) => a.count - b.count);
        return categoryCounts[0].category;
      } else {
        // Random selection with preference for categories with higher ratings
        return categories[Math.floor(Math.random() * categories.length)];
      }
    }
    
    return null;
  }
  
  /**
   * Select multiple features from a category based on weights or exploration
   * @param {string} category - Feature category
   * @param {number} count - Number of features to select
   * @param {boolean} exploreMode - Whether to prioritize exploration
   * @returns {Array} Selected features
   */
  _selectMultipleFeatures(category, count, exploreMode) {
    const features = Object.keys(this.featureWeights[category]);
    if (features.length === 0) return [];
    
    if (exploreMode) {
      // Select features that have been used less frequently
      const featureCounts = features.map(feature => ({
        feature,
        count: this.generationCount.get(`${category}:${feature}`) || 0
      }));
      
      featureCounts.sort((a, b) => a.count - b.count);
      return featureCounts.slice(0, count).map(item => item.feature);
    } else {
      // Select features with highest weights
      const weightedFeatures = features.map(feature => ({
        feature,
        weight: this.featureWeights[category][feature]
      }));
      
      weightedFeatures.sort((a, b) => b.weight - a.weight);
      return weightedFeatures.slice(0, count).map(item => item.feature);
    }
  }
}

module.exports = {
  PersonalizedTasteModel
}; 