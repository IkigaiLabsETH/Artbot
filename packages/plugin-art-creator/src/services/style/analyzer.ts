import { Style } from '../../types';

export interface StyleMetrics {
  complexity: number;
  diversity: number;
  coherence: number;
  stability: number;
  compatibility: number;
}

export interface StyleAnalysis {
  metrics: StyleMetrics;
  parameterStats: Record<string, ParameterStats>;
  dominantFeatures: string[];
  suggestedOptimizations: string[];
  compatibilityScore?: number;
}

interface ParameterStats {
  mean?: number;
  variance?: number;
  range?: [number, number];
  distribution?: 'uniform' | 'normal' | 'clustered';
  importance: number;
}

export class StyleAnalyzer {
  /**
   * Perform comprehensive analysis of a style
   */
  analyzeStyle(style: Style): StyleAnalysis {
    const parameterStats = this.analyzeParameters(style);
    const metrics = this.calculateMetrics(style, parameterStats);
    
    return {
      metrics,
      parameterStats,
      dominantFeatures: this.identifyDominantFeatures(parameterStats),
      suggestedOptimizations: this.suggestOptimizations(metrics, parameterStats)
    };
  }

  /**
   * Analyze compatibility between styles for mixing
   */
  analyzeCompatibility(styleA: Style, styleB: Style): number {
    const statsA = this.analyzeParameters(styleA);
    const statsB = this.analyzeParameters(styleB);
    
    let compatibilityScore = 0;
    let totalWeight = 0;
    
    // Compare parameter distributions and ranges
    const allParams = new Set([
      ...Object.keys(styleA.parameters),
      ...Object.keys(styleB.parameters)
    ]);

    for (const param of allParams) {
      const paramA = statsA[param];
      const paramB = statsB[param];
      
      if (paramA && paramB) {
        const weight = (paramA.importance + paramB.importance) / 2;
        compatibilityScore += weight * this.calculateParameterCompatibility(paramA, paramB);
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? compatibilityScore / totalWeight : 0;
  }

  /**
   * Find optimal interpolation path between styles
   */
  findOptimalPath(styles: Style[]): Style[] {
    if (styles.length <= 2) return styles;

    // Use compatibility scores to find optimal ordering
    const ordered: Style[] = [styles[0]];
    const remaining = new Set(styles.slice(1));

    while (remaining.size > 0) {
      const current = ordered[ordered.length - 1];
      let bestNext: Style | null = null;
      let bestScore = -1;

      for (const candidate of remaining) {
        const score = this.analyzeCompatibility(current, candidate);
        if (score > bestScore) {
          bestScore = score;
          bestNext = candidate;
        }
      }

      if (bestNext) {
        ordered.push(bestNext);
        remaining.delete(bestNext);
      }
    }

    return ordered;
  }

  private analyzeParameters(style: Style): Record<string, ParameterStats> {
    const stats: Record<string, ParameterStats> = {};
    
    for (const [key, value] of Object.entries(style.parameters)) {
      if (typeof value === 'number') {
        stats[key] = this.analyzeNumericParameter(value);
      } else if (Array.isArray(value)) {
        stats[key] = this.analyzeArrayParameter(value);
      } else {
        stats[key] = { importance: 0.5 }; // Default importance for non-numeric
      }
    }

    return stats;
  }

  private analyzeNumericParameter(value: number): ParameterStats {
    return {
      mean: value,
      variance: 0,
      range: [value, value],
      distribution: 'uniform',
      importance: this.calculateParameterImportance(value)
    };
  }

  private analyzeArrayParameter(values: any[]): ParameterStats {
    const numericValues = values.filter(v => typeof v === 'number');
    
    if (numericValues.length === 0) {
      return { importance: 0.7 }; // Default importance for non-numeric arrays
    }

    const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    const variance = numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericValues.length;
    const range: [number, number] = [
      Math.min(...numericValues),
      Math.max(...numericValues)
    ];

    return {
      mean,
      variance,
      range,
      distribution: this.determineDistribution(numericValues),
      importance: 0.8 // Higher importance for array parameters
    };
  }

  private calculateMetrics(
    style: Style,
    stats: Record<string, ParameterStats>
  ): StyleMetrics {
    return {
      complexity: this.calculateComplexity(stats),
      diversity: this.calculateDiversity(stats),
      coherence: this.calculateCoherence(stats),
      stability: this.calculateStability(stats),
      compatibility: this.calculateOverallCompatibility(stats)
    };
  }

  private calculateComplexity(stats: Record<string, ParameterStats>): number {
    let complexity = 0;
    let totalWeight = 0;

    for (const stat of Object.values(stats)) {
      if (stat.variance !== undefined) {
        complexity += stat.importance * (1 + Math.log(1 + (stat.variance || 0)));
        totalWeight += stat.importance;
      }
    }

    return totalWeight > 0 ? complexity / totalWeight : 0;
  }

  private calculateDiversity(stats: Record<string, ParameterStats>): number {
    const distributions = Object.values(stats)
      .map(s => s.distribution)
      .filter(Boolean);
    
    return distributions.length > 0 
      ? new Set(distributions).size / distributions.length
      : 0;
  }

  private calculateCoherence(stats: Record<string, ParameterStats>): number {
    // Measure how well parameters work together
    const values = Object.values(stats);
    if (values.length < 2) return 1;

    let coherence = 0;
    let count = 0;

    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        coherence += this.calculateParameterCompatibility(values[i], values[j]);
        count++;
      }
    }

    return count > 0 ? coherence / count : 0;
  }

  private calculateStability(stats: Record<string, ParameterStats>): number {
    // Measure resistance to small parameter changes
    return Object.values(stats).reduce(
      (stability, stat) => stability + (
        stat.variance !== undefined 
          ? 1 / (1 + (stat.variance || 0))
          : 1
      ),
      0
    ) / Object.keys(stats).length;
  }

  private calculateOverallCompatibility(stats: Record<string, ParameterStats>): number {
    // Measure how well the style might mix with others
    return Object.values(stats).reduce(
      (sum, stat) => sum + (stat.importance || 0),
      0
    ) / Object.keys(stats).length;
  }

  private calculateParameterImportance(value: number): number {
    // Higher importance for values in a meaningful range
    return Math.min(1, Math.max(0.1, Math.abs(value) / 100));
  }

  private calculateParameterCompatibility(
    statA: ParameterStats,
    statB: ParameterStats
  ): number {
    if (!statA.range || !statB.range) return 0.5;

    const rangeOverlap = Math.min(
      statA.range[1] - statB.range[0],
      statB.range[1] - statA.range[0]
    ) / Math.max(
      statA.range[1] - statA.range[0],
      statB.range[1] - statB.range[0]
    );

    const distributionMatch = statA.distribution === statB.distribution ? 1 : 0.5;

    return (rangeOverlap + distributionMatch) / 2;
  }

  private determineDistribution(values: number[]): 'uniform' | 'normal' | 'clustered' {
    if (values.length < 3) return 'uniform';

    const sorted = [...values].sort((a, b) => a - b);
    const gaps = sorted.slice(1).map((v, i) => v - sorted[i]);
    const meanGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const gapVariance = gaps.reduce((a, g) => a + Math.pow(g - meanGap, 2), 0) / gaps.length;

    if (gapVariance < 0.1) return 'uniform';
    if (gapVariance < 0.5) return 'normal';
    return 'clustered';
  }

  private identifyDominantFeatures(stats: Record<string, ParameterStats>): string[] {
    return Object.entries(stats)
      .filter(([_, stat]) => stat.importance > 0.7)
      .map(([key]) => key)
      .sort();
  }

  private suggestOptimizations(
    metrics: StyleMetrics,
    stats: Record<string, ParameterStats>
  ): string[] {
    const suggestions: string[] = [];

    if (metrics.complexity > 0.8) {
      suggestions.push('Consider simplifying complex parameters');
    }
    if (metrics.coherence < 0.4) {
      suggestions.push('Parameters may need better coordination');
    }
    if (metrics.stability < 0.3) {
      suggestions.push('Style might be too sensitive to parameter changes');
    }

    // Add parameter-specific suggestions
    for (const [key, stat] of Object.entries(stats)) {
      if (stat.variance && stat.variance > 1) {
        suggestions.push(`High variance in parameter "${key}"`);
      }
    }

    return suggestions;
  }
} 