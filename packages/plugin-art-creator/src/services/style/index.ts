import { Service, ServiceType } from '@elizaos/core';
import { Style } from '../../types/social/index.js';
import { StyleMixer } from './mixer.js';
import { StyleAnalyzer, StyleAnalysis, StyleMetrics } from './analyzer.js';
import { ReplicateService, ModelPrediction } from '../replicate/index.js';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

// Extend the ModelPrediction interface to include parameters
interface ExtendedModelPrediction extends ModelPrediction {
  parameters?: Record<string, any>;
}

// Define a complete StyleAnalysis interface
interface ExtendedStyleAnalysis {
  id?: string;
  style?: string;
  traits: string[];
  metrics: StyleMetrics;
}

export class StyleService extends Service {
  private mixer: StyleMixer;
  private analyzer: StyleAnalyzer;
  private replicateService: ReplicateService;
  private styles: Map<string, Style> = new Map();
  private stylesDir: string;
  private styleLibraries: Map<string, Style[]> = new Map();
  private styleCategories: Map<string, string[]> = new Map();

  static get serviceType(): ServiceType {
    return ServiceType.TEXT_GENERATION;
  }

  constructor(config = {}, baseDir: string = process.cwd()) {
    super();
    this.mixer = new StyleMixer(config);
    this.analyzer = new StyleAnalyzer();
    this.replicateService = new ReplicateService(config);
    this.stylesDir = path.join(baseDir, '.artbot', 'styles');
  }

  async initialize(): Promise<void> {
    // Initialize dependencies
    await this.replicateService.initialize();
    
    // Create styles directory if it doesn't exist
    try {
      await fs.mkdir(this.stylesDir, { recursive: true });
      
      // Load existing styles
      const files = await fs.readdir(this.stylesDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.stylesDir, file), 'utf-8');
          const style = JSON.parse(content) as Style;
          this.styles.set(style.id!, style);
        }
      }
    } catch (error) {
      console.error('Error initializing style service:', error);
    }
  }

  /**
   * Analyze a style to extract its characteristics
   */
  async analyzeStyle(style: Style): Promise<ExtendedStyleAnalysis> {
    // In a real implementation, this would use the analyzer
    // For now, we'll return a placeholder
    return {
      id: style.id || uuidv4(),
      style: style.name,
      traits: style.tags || [],
      metrics: {
        coherence: 0.8,
        stability: 0.7,
        compatibility: 0.9,
        complexity: 0.6,
        diversity: 0.5
      }
    };
  }

  /**
   * Get a style by ID
   */
  async getStyle(styleId: string): Promise<Style | null> {
    return this.styles.get(styleId) || null;
  }

  /**
   * Save a style
   */
  async saveStyle(style: Style): Promise<Style> {
    // Ensure style has an ID
    if (!style.id) {
      style.id = uuidv4();
    }
    
    // Save to memory
    this.styles.set(style.id, style);
    
    // Save to disk
    try {
      await fs.writeFile(
        path.join(this.stylesDir, `${style.id}.json`),
        JSON.stringify(style, null, 2)
      );
    } catch (error) {
      console.error('Error saving style:', error);
    }
    
    return style;
  }

  /**
   * Select the best variation from a set of variations
   */
  async selectBestVariation(
    variations: ExtendedModelPrediction[],
    analysis: StyleAnalysis,
    preserveTraits: string[] = []
  ): Promise<Style> {
    // Convert predictions to styles
    const styles = variations.map(prediction => ({
      id: uuidv4(),
      name: `Variation ${uuidv4().slice(0, 8)}`,
      creator: 'ArtBot',
      parameters: prediction.parameters || {},
      version: 1,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: []
    }));
    
    // Score each style
    const scores = await Promise.all(styles.map(async style => {
      const styleAnalysis = await this.analyzeStyle(style);
      
      // Calculate base score
      let score = (
        styleAnalysis.metrics.coherence * 0.3 +
        styleAnalysis.metrics.stability * 0.3 +
        styleAnalysis.metrics.compatibility * 0.4
      );
      
      // Bonus for preserving traits
      if (preserveTraits.length > 0) {
        const preservedTraitScore = preserveTraits.reduce((acc, trait) => {
          // Check if trait is preserved in the style
          const isPreserved = styleAnalysis.traits.includes(trait);
          return acc + (isPreserved ? 0.1 : 0);
        }, 0);
        
        score += preservedTraitScore;
      }
      
      return { style, score };
    }));
    
    // Return the style with the highest score
    scores.sort((a, b) => b.score - a.score);
    return scores[0].style;
  }

  /**
   * Create a smooth transition between two styles
   */
  async interpolate(styleA: Style, styleB: Style, steps = 10): Promise<Style[]> {
    const compatibility = this.analyzer.analyzeCompatibility(styleA, styleB);
    if (compatibility < 0.3) {
      console.warn('Low compatibility between styles, interpolation may produce unexpected results');
    }
    return this.mixer.interpolateStyles(styleA, styleB, steps);
  }

  /**
   * Combine multiple styles with different weights
   */
  async mix(styles: Array<{ style: Style; weight: number }>): Promise<Style> {
    // Analyze all styles first
    const analyses = styles.map(({ style }) => this.analyzer.analyzeStyle(style));
    
    // Adjust weights based on compatibility
    const adjustedStyles = styles.map(({ style, weight }, i) => ({
      style,
      weight: weight * (1 + analyses[i].metrics.compatibility)
    }));

    return this.mixer.mixStyles(adjustedStyles);
  }

  /**
   * Generate a variation of an existing style
   */
  async createVariation(style: Style, strength?: number): Promise<Style> {
    const analysis = this.analyzer.analyzeStyle(style);
    
    // Adjust variation strength based on style stability
    const adjustedStrength = strength !== undefined
      ? strength
      : Math.max(0.1, 0.3 * (1 - analysis.metrics.stability));

    return this.mixer.createVariation(style, adjustedStrength);
  }

  /**
   * Create a transition sequence between multiple styles
   */
  async createStyleSequence(styles: Style[], stepsPerTransition = 5): Promise<Style[]> {
    if (styles.length <= 2) return styles;

    // Find optimal path based on style compatibility
    const optimizedOrder = this.analyzer.findOptimalPath(styles);
    
    const sequence: Style[] = [];
    for (let i = 0; i < optimizedOrder.length - 1; i++) {
      const transition = await this.interpolate(
        optimizedOrder[i],
        optimizedOrder[i + 1],
        stepsPerTransition
      );
      sequence.push(...transition);
    }

    return sequence;
  }

  /**
   * Create a style blend using multiple source styles
   */
  async blend(styles: Style[], blendMode: 'average' | 'weighted' = 'average'): Promise<Style> {
    if (styles.length === 0) throw new Error('No styles provided for blending');
    if (styles.length === 1) return styles[0];

    if (blendMode === 'average') {
      const weight = 1 / styles.length;
      return this.mix(styles.map(style => ({ style, weight })));
    } else {
      // Use analyzed metrics for weighted blending
      const analyses = styles.map(style => this.analyzer.analyzeStyle(style));
      const weights = analyses.map(analysis => 
        (analysis.metrics.coherence + analysis.metrics.stability) / 2
      );
      
      return this.mix(styles.map((style, i) => ({
        style,
        weight: weights[i]
      })));
    }
  }

  /**
   * Check compatibility between styles
   */
  async checkCompatibility(styleA: Style, styleB: Style): Promise<number> {
    return this.analyzer.analyzeCompatibility(styleA, styleB);
  }

  /**
   * Get optimization suggestions for a style
   */
  async getOptimizationSuggestions(style: Style): Promise<string[]> {
    const analysis = this.analyzer.analyzeStyle(style);
    return analysis.suggestedOptimizations;
  }

  private calculateStyleWeight(style: Style): number {
    const analysis = this.analyzer.analyzeStyle(style);
    return (
      analysis.metrics.coherence * 0.4 +
      analysis.metrics.stability * 0.3 +
      analysis.metrics.compatibility * 0.3
    );
  }

  /**
   * Generate image from style using Replicate
   */
  async generateImage(style: Style, prompt?: string): Promise<ModelPrediction> {
    const analysis = await this.analyzeStyle(style);
    
    // Optimize style based on analysis if needed
    if (analysis.metrics.stability < 0.4) {
      console.warn('Style has low stability, results may be inconsistent');
    }

    return this.replicateService.generateFromStyle(style, prompt);
  }

  /**
   * Generate interpolated image sequence between styles
   */
  async generateInterpolationSequence(
    styleA: Style,
    styleB: Style,
    steps: number = 5,
    prompt?: string
  ): Promise<ModelPrediction[]> {
    const compatibility = await this.checkCompatibility(styleA, styleB);
    
    if (compatibility < 0.3) {
      console.warn('Low style compatibility, interpolation may produce unexpected results');
      steps = Math.max(steps, 8); // Increase steps for smoother transition
    }

    return this.replicateService.generateInterpolation(styleA, styleB, steps, prompt);
  }

  /**
   * Generate variations of a style
   */
  async generateVariations(
    style: Style,
    count: number = 4,
    variationStrength?: number
  ): Promise<ModelPrediction[]> {
    const analysis = await this.analyzeStyle(style);
    
    // Adjust variation strength based on style stability
    const adjustedStrength = variationStrength ?? Math.max(0.1, 0.3 * (1 - analysis.metrics.stability));
    
    return this.replicateService.generateVariations(style, count, adjustedStrength);
  }

  /**
   * Extract style from an existing image
   */
  async extractStyleFromImage(imageUrl: string): Promise<Style> {
    const extractedStyle = await this.replicateService.extractStyleFromImage(imageUrl);
    const analysis = await this.analyzeStyle(extractedStyle);

    // Enhance extracted style based on analysis
    if (analysis.metrics.coherence < 0.5) {
      console.warn('Extracted style has low coherence, consider manual adjustment');
    }

    return extractedStyle;
  }

  /**
   * Create an optimized style sequence for animation
   */
  async createAnimationSequence(
    styles: Style[],
    framesPerTransition: number = 10
  ): Promise<ModelPrediction[]> {
    // Find optimal path through style space
    const optimizedOrder = this.analyzer.findOptimalPath(styles);
    
    const sequence: ModelPrediction[] = [];
    for (let i = 0; i < optimizedOrder.length - 1; i++) {
      const transition = await this.generateInterpolationSequence(
        optimizedOrder[i],
        optimizedOrder[i + 1],
        framesPerTransition
      );
      sequence.push(...transition);
    }

    return sequence;
  }

  /**
   * Create a style library with categorization
   */
  async createStyleLibrary(name: string, styles: Style[], categories: string[] = []): Promise<string> {
    const libraryId = uuidv4();
    this.styleLibraries.set(libraryId, styles);
    this.styleCategories.set(libraryId, categories);
    
    // Save library metadata
    try {
      const libraryDir = path.join(this.stylesDir, 'libraries');
      await fs.mkdir(libraryDir, { recursive: true });
      
      await fs.writeFile(
        path.join(libraryDir, `${libraryId}.json`),
        JSON.stringify({
          id: libraryId,
          name,
          styles: styles.map(s => s.id),
          categories,
          created: new Date()
        }, null, 2)
      );
    } catch (error) {
      console.error('Error saving style library:', error);
    }
    
    return libraryId;
  }

  /**
   * Get styles by category
   */
  async getStylesByCategory(category: string): Promise<Style[]> {
    const result: Style[] = [];
    
    // Search through all libraries
    for (const [libraryId, categories] of this.styleCategories.entries()) {
      if (categories.includes(category)) {
        const libraryStyles = this.styleLibraries.get(libraryId) || [];
        result.push(...libraryStyles);
      }
    }
    
    // Also search through individual styles with tags
    for (const style of this.styles.values()) {
      if (style.tags && style.tags.includes(category)) {
        result.push(style);
      }
    }
    
    return result;
  }

  /**
   * Advanced style transfer with fine-grained control
   */
  async transferStyleFeatures(
    sourceStyle: Style,
    targetStyle: Style,
    features: Array<{feature: string, weight: number}>
  ): Promise<Style> {
    // Create a new style object
    const newStyle: Style = {
      ...targetStyle,
      id: uuidv4(),
      name: `${sourceStyle.name} × ${targetStyle.name}`,
      creator: 'ArtBot',
      parameters: { ...targetStyle.parameters },
      version: 1,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: [...(targetStyle.tags || []), ...(sourceStyle.tags || [])]
    };
    
    // Apply feature transfers with weights
    for (const {feature, weight} of features) {
      if (
        sourceStyle.parameters && 
        targetStyle.parameters && 
        feature in sourceStyle.parameters && 
        feature in targetStyle.parameters
      ) {
        const sourceValue = sourceStyle.parameters[feature];
        const targetValue = targetStyle.parameters[feature];
        
        // If both values are numbers, interpolate
        if (typeof sourceValue === 'number' && typeof targetValue === 'number') {
          newStyle.parameters![feature] = targetValue * (1 - weight) + sourceValue * weight;
        } 
        // If both are strings, use source if weight > 0.5, otherwise target
        else if (typeof sourceValue === 'string' && typeof targetValue === 'string') {
          newStyle.parameters![feature] = weight > 0.5 ? sourceValue : targetValue;
        }
        // If both are arrays, blend them
        else if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
          newStyle.parameters![feature] = weight > 0.5 ? 
            [...sourceValue, ...targetValue.slice(0, Math.floor(targetValue.length * (1 - weight)))] :
            [...targetValue, ...sourceValue.slice(0, Math.floor(sourceValue.length * weight))];
        }
      }
    }
    
    return this.saveStyle(newStyle);
  }

  /**
   * Get style recommendations based on user preferences
   */
  async getStyleRecommendations(
    userPreferences: Record<string, number>,
    count: number = 5
  ): Promise<Style[]> {
    const styles = Array.from(this.styles.values());
    
    // Score each style based on user preferences
    const scoredStyles = styles.map(style => {
      let score = 0;
      
      // Score based on tags
      if (style.tags) {
        for (const tag of style.tags) {
          if (tag in userPreferences) {
            score += userPreferences[tag];
          }
        }
      }
      
      return { style, score };
    });
    
    // Sort by score and return top styles
    scoredStyles.sort((a, b) => b.score - a.score);
    return scoredStyles.slice(0, count).map(s => s.style);
  }

  async findOptimalStyle(baseStyles: Style[], preserveTraits: string[] = []): Promise<Style> {
    // Generate variations of each style
    const styles = baseStyles.flatMap(style => [
      style,
      ...Array(3).fill(0).map(() => ({
        id: `${style.id}-variation-${Math.random().toString(36).substring(2, 9)}`,
        name: `${style.name} Variation`,
        description: `A variation of the ${style.name} style`,
        creator: style.creator,
        parameters: { ...style.parameters },
        version: style.version,
        created: new Date(),
        modified: new Date(),
        isPublic: false,
        tags: []
      }))
    ]);
    
    // Score each style
    const scores = await Promise.all(styles.map(async style => {
      const styleAnalysis = await this.analyzeStyle(style);
      
      // Calculate base score
      let score = (
        styleAnalysis.metrics.coherence * 0.3 +
        styleAnalysis.metrics.stability * 0.3 +
        styleAnalysis.metrics.compatibility * 0.4
      );
      
      // Bonus for preserving traits
      if (preserveTraits.length > 0) {
        const preservedTraitScore = preserveTraits.reduce((acc, trait) => {
          // Check if trait is preserved in the style
          const isPreserved = styleAnalysis.traits.includes(trait);
          return acc + (isPreserved ? 0.1 : 0);
        }, 0);
        
        score += preservedTraitScore;
      }
      
      return { style, score };
    }));
    
    // Return the style with the highest score
    scores.sort((a, b) => b.score - a.score);
    return scores[0].style;
  }
}

export const styleService = new StyleService(); 