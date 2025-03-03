import { Service, ServiceType } from '@elizaos/core';
import { Style } from '../../types';
import { StyleMixer } from './mixer';
import { StyleAnalyzer, StyleAnalysis, StyleMetrics } from './analyzer';
import { ReplicateService, ModelPrediction } from '../replicate';

export class StyleService extends Service {
  private mixer: StyleMixer;
  private analyzer: StyleAnalyzer;
  private replicateService: ReplicateService;

  static get serviceType(): ServiceType {
    return ServiceType.TEXT_GENERATION;
  }

  constructor(config = {}) {
    super();
    this.mixer = new StyleMixer(config);
    this.analyzer = new StyleAnalyzer();
    this.replicateService = new ReplicateService(config);
  }

  async initialize(): Promise<void> {
    // Initialize dependencies
    await this.replicateService.initialize();
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
   * Analyze a style and get detailed metrics
   */
  async analyzeStyle(style: Style): Promise<StyleAnalysis> {
    return this.analyzer.analyzeStyle(style);
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
}

export const styleService = new StyleService(); 