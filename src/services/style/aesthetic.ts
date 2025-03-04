import { Style } from '../../types.js';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Interface for style rating history
 */
export interface StyleRating {
  id: string;
  styleId: string;
  rating: number;
  timestamp: Date;
  comparedTo?: string; // ID of the style it was compared against
  won: boolean; // Whether this style won the comparison
}

/**
 * Interface for style preference
 */
export interface StylePreference {
  id: string;
  attribute: string; // e.g., "vibrant", "minimalist", "abstract"
  weight: number; // -1.0 to 1.0, where 1.0 is strong preference
  confidence: number; // 0.0 to 1.0, how confident we are in this preference
  examples: string[]; // Style IDs that exemplify this preference
  lastUpdated: Date;
}

/**
 * Interface for aesthetic judgment configuration
 */
export interface AestheticJudgmentConfig {
  baseDir?: string;
  initialRating?: number;
  kFactor?: number; // ELO K-factor, controls rating volatility
  explorationBonus?: number; // Bonus for exploring new styles
  recencyWeight?: number; // Weight for recency in style selection
  minRatingDifference?: number; // Minimum rating difference to consider significant
}

/**
 * Class for aesthetic judgment and selection
 */
export class AestheticJudgment {
  private styleRatings: Map<string, number> = new Map(); // Style ID -> current rating
  private ratingHistory: StyleRating[] = [];
  private preferences: StylePreference[] = [];
  private baseDir: string;
  private initialRating: number;
  private kFactor: number;
  private explorationBonus: number;
  private recencyWeight: number;
  private minRatingDifference: number;
  private styleAccessCount: Map<string, number> = new Map(); // Track how often styles are accessed
  private lastExplorationTime: Date = new Date();

  constructor(config: AestheticJudgmentConfig = {}) {
    this.baseDir = config.baseDir || process.cwd();
    this.initialRating = config.initialRating || 1400;
    this.kFactor = config.kFactor || 32;
    this.explorationBonus = config.explorationBonus || 0.2;
    this.recencyWeight = config.recencyWeight || 0.1;
    this.minRatingDifference = config.minRatingDifference || 100;
  }

  /**
   * Initialize the aesthetic judgment system
   */
  async initialize(): Promise<void> {
    const aestheticDir = path.join(this.baseDir, '.artbot', 'aesthetic');
    
    try {
      // Create directory if it doesn't exist
      await fs.mkdir(aestheticDir, { recursive: true });
      
      // Load ratings
      try {
        const ratingsFile = path.join(aestheticDir, 'ratings.json');
        const ratingsData = await fs.readFile(ratingsFile, 'utf-8');
        const ratings = JSON.parse(ratingsData);
        
        // Load ratings map
        if (ratings.currentRatings) {
          for (const [styleId, rating] of Object.entries(ratings.currentRatings)) {
            this.styleRatings.set(styleId, rating as number);
          }
        }
        
        // Load rating history
        if (ratings.history) {
          this.ratingHistory = ratings.history.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
        }
      } catch (error) {
        // It's okay if the file doesn't exist yet
        console.log('No existing ratings found, starting fresh');
      }
      
      // Load preferences
      try {
        const preferencesFile = path.join(aestheticDir, 'preferences.json');
        const preferencesData = await fs.readFile(preferencesFile, 'utf-8');
        this.preferences = JSON.parse(preferencesData).map((pref: any) => ({
          ...pref,
          lastUpdated: new Date(pref.lastUpdated)
        }));
      } catch (error) {
        // It's okay if the file doesn't exist yet
        console.log('No existing preferences found, starting fresh');
      }
    } catch (error) {
      console.error('Error initializing aesthetic judgment system:', error);
    }
  }

  /**
   * Save the current state to disk
   */
  private async saveState(): Promise<void> {
    const aestheticDir = path.join(this.baseDir, '.artbot', 'aesthetic');
    
    try {
      // Save ratings
      const ratingsFile = path.join(aestheticDir, 'ratings.json');
      const ratingsData = {
        currentRatings: Object.fromEntries(this.styleRatings),
        history: this.ratingHistory
      };
      await fs.writeFile(ratingsFile, JSON.stringify(ratingsData, null, 2));
      
      // Save preferences
      const preferencesFile = path.join(aestheticDir, 'preferences.json');
      await fs.writeFile(preferencesFile, JSON.stringify(this.preferences, null, 2));
    } catch (error) {
      console.error('Error saving aesthetic judgment state:', error);
    }
  }

  /**
   * Get the current rating for a style
   */
  getRating(styleId: string): number {
    return this.styleRatings.get(styleId) || this.initialRating;
  }

  /**
   * Update ratings based on a comparison between two styles
   * @param winnerId ID of the winning style
   * @param loserId ID of the losing style
   */
  async updateRatings(winnerId: string, loserId: string): Promise<void> {
    // Get current ratings
    const winnerRating = this.getRating(winnerId);
    const loserRating = this.getRating(loserId);
    
    // Calculate expected scores (probability of winning)
    const expectedWinner = this.calculateExpectedScore(winnerRating, loserRating);
    const expectedLoser = this.calculateExpectedScore(loserRating, winnerRating);
    
    // Calculate new ratings
    const newWinnerRating = winnerRating + this.kFactor * (1 - expectedWinner);
    const newLoserRating = loserRating + this.kFactor * (0 - expectedLoser);
    
    // Update ratings
    this.styleRatings.set(winnerId, newWinnerRating);
    this.styleRatings.set(loserId, newLoserRating);
    
    // Record history
    this.ratingHistory.push({
      id: uuidv4(),
      styleId: winnerId,
      rating: newWinnerRating,
      timestamp: new Date(),
      comparedTo: loserId,
      won: true
    });
    
    this.ratingHistory.push({
      id: uuidv4(),
      styleId: loserId,
      rating: newLoserRating,
      timestamp: new Date(),
      comparedTo: winnerId,
      won: false
    });
    
    // Save state
    await this.saveState();
    
    // Update preferences based on this comparison
    await this.updatePreferencesFromComparison(winnerId, loserId);
  }

  /**
   * Calculate expected score (probability of winning) using ELO formula
   */
  private calculateExpectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  /**
   * Select the best style from a set of candidates using ratings and exploration
   */
  async selectBestStyle(candidates: Style[]): Promise<Style> {
    if (candidates.length === 0) {
      throw new Error('No candidate styles provided');
    }
    
    if (candidates.length === 1) {
      return candidates[0];
    }
    
    // Calculate scores for each candidate
    const scores = candidates.map(style => {
      const styleId = style.id!;
      const baseRating = this.getRating(styleId);
      
      // Calculate exploration bonus
      let explorationBonus = 0;
      const accessCount = this.styleAccessCount.get(styleId) || 0;
      
      // More bonus for less frequently accessed styles
      if (accessCount === 0) {
        explorationBonus = this.explorationBonus;
      } else {
        explorationBonus = this.explorationBonus / Math.sqrt(accessCount);
      }
      
      // Calculate recency bonus
      let recencyBonus = 0;
      const lastRating = this.getLastRating(styleId);
      if (lastRating) {
        const daysSinceLastRating = (new Date().getTime() - lastRating.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        recencyBonus = this.recencyWeight * Math.min(daysSinceLastRating, 30) / 30;
      }
      
      // Calculate preference alignment
      const preferenceScore = this.calculatePreferenceAlignment(style);
      
      // Calculate final score
      const finalScore = baseRating + (explorationBonus * this.initialRating) + (recencyBonus * this.initialRating) + preferenceScore;
      
      return { style, score: finalScore };
    });
    
    // Sort by score
    scores.sort((a, b) => b.score - a.score);
    
    // Update access count for the selected style
    const selectedStyle = scores[0].style;
    const accessCount = this.styleAccessCount.get(selectedStyle.id!) || 0;
    this.styleAccessCount.set(selectedStyle.id!, accessCount + 1);
    
    // Check if we should force exploration
    const timeSinceLastExploration = new Date().getTime() - this.lastExplorationTime.getTime();
    const shouldExplore = timeSinceLastExploration > 1000 * 60 * 60 * 24; // 24 hours
    
    if (shouldExplore && candidates.length > 1) {
      // Randomly select from the top 3 candidates (or fewer if less available)
      const topN = Math.min(3, candidates.length);
      const randomIndex = Math.floor(Math.random() * topN);
      this.lastExplorationTime = new Date();
      return scores[randomIndex].style;
    }
    
    return selectedStyle;
  }

  /**
   * Get the last rating entry for a style
   */
  private getLastRating(styleId: string): StyleRating | undefined {
    // Filter ratings for this style and sort by timestamp (newest first)
    const styleRatings = this.ratingHistory
      .filter(rating => rating.styleId === styleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return styleRatings[0];
  }

  /**
   * Calculate how well a style aligns with current preferences
   */
  private calculatePreferenceAlignment(style: Style): number {
    if (!style.tags || style.tags.length === 0) {
      return 0;
    }
    
    let alignmentScore = 0;
    let totalWeight = 0;
    
    // Check each preference against the style's tags
    for (const preference of this.preferences) {
      // Check if the style has this attribute as a tag
      const hasAttribute = style.tags.includes(preference.attribute);
      
      // Add to the score based on preference weight and confidence
      if (hasAttribute) {
        alignmentScore += preference.weight * preference.confidence;
      }
      
      totalWeight += preference.confidence;
    }
    
    // Normalize the score
    return totalWeight > 0 ? (alignmentScore / totalWeight) * 100 : 0;
  }

  /**
   * Update preferences based on a comparison between two styles
   */
  private async updatePreferencesFromComparison(winnerId: string, loserId: string): Promise<void> {
    // Get the styles (this would need to be implemented or passed in)
    const winnerStyle = await this.getStyleById(winnerId);
    const loserStyle = await this.getStyleById(loserId);
    
    if (!winnerStyle || !loserStyle) {
      return;
    }
    
    // Find unique tags in the winner that aren't in the loser
    const uniqueWinnerTags = winnerStyle.tags.filter(tag => !loserStyle.tags.includes(tag));
    
    // Find unique tags in the loser that aren't in the winner
    const uniqueLoserTags = loserStyle.tags.filter(tag => !winnerStyle.tags.includes(tag));
    
    // Update preferences for winner's unique tags (positive reinforcement)
    for (const tag of uniqueWinnerTags) {
      await this.updatePreference(tag, 0.1, winnerId);
    }
    
    // Update preferences for loser's unique tags (negative reinforcement)
    for (const tag of uniqueLoserTags) {
      await this.updatePreference(tag, -0.1, loserId);
    }
  }

  /**
   * Update a specific preference
   */
  private async updatePreference(attribute: string, adjustment: number, exampleId: string): Promise<void> {
    // Find existing preference or create a new one
    let preference = this.preferences.find(p => p.attribute === attribute);
    
    if (!preference) {
      preference = {
        id: uuidv4(),
        attribute,
        weight: 0,
        confidence: 0,
        examples: [],
        lastUpdated: new Date()
      };
      this.preferences.push(preference);
    }
    
    // Update weight (bounded between -1 and 1)
    preference.weight = Math.max(-1, Math.min(1, preference.weight + adjustment));
    
    // Increase confidence (bounded between 0 and 1)
    preference.confidence = Math.min(1, preference.confidence + Math.abs(adjustment) * 0.1);
    
    // Add example if not already present
    if (!preference.examples.includes(exampleId)) {
      preference.examples.push(exampleId);
      
      // Keep only the 5 most recent examples
      if (preference.examples.length > 5) {
        preference.examples.shift();
      }
    }
    
    preference.lastUpdated = new Date();
    
    // Save state
    await this.saveState();
  }

  /**
   * Get all current style preferences
   */
  getPreferences(): StylePreference[] {
    return [...this.preferences];
  }

  /**
   * Get top preferences (most confident and strongest)
   */
  getTopPreferences(limit: number = 10): StylePreference[] {
    // Sort by confidence * abs(weight) to get the strongest, most confident preferences
    return [...this.preferences]
      .sort((a, b) => (b.confidence * Math.abs(b.weight)) - (a.confidence * Math.abs(a.weight)))
      .slice(0, limit);
  }

  /**
   * Get style by ID (placeholder - would need to be implemented)
   */
  private async getStyleById(styleId: string): Promise<Style | null> {
    // This would need to be implemented to fetch styles from storage
    // For now, return a mock style
    return {
      id: styleId,
      name: `Style ${styleId.slice(0, 8)}`,
      creator: 'ArtBot',
      parameters: {},
      version: 1,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: ['abstract', 'vibrant', 'geometric'] // Mock tags
    };
  }

  /**
   * Generate a report of the current aesthetic preferences and ratings
   */
  generateAestheticReport(): Record<string, any> {
    // Get top rated styles
    const styleRatingsArray = Array.from(this.styleRatings.entries())
      .map(([styleId, rating]) => ({ styleId, rating }))
      .sort((a, b) => b.rating - a.rating);
    
    const topRatedStyles = styleRatingsArray.slice(0, 10);
    
    // Get bottom rated styles
    const bottomRatedStyles = styleRatingsArray.slice(-10).reverse();
    
    // Get top preferences
    const topPreferences = this.getTopPreferences(10);
    
    // Calculate rating distribution
    const ratings = Array.from(this.styleRatings.values());
    const ratingStats = {
      count: ratings.length,
      min: Math.min(...ratings),
      max: Math.max(...ratings),
      average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      median: ratings.sort((a, b) => a - b)[Math.floor(ratings.length / 2)]
    };
    
    // Return the report
    return {
      topRatedStyles,
      bottomRatedStyles,
      topPreferences,
      ratingStats,
      totalRatings: this.ratingHistory.length,
      totalComparisons: this.ratingHistory.length / 2,
      lastUpdated: new Date()
    };
  }
} 