import { Style } from '../../types/social/index.js';

interface StyleMixerConfig {
  interpolationSteps: number;
  mixingStrength: number;
  preserveKeyAttributes: string[];
}

export class StyleMixer {
  private readonly defaultConfig: StyleMixerConfig = {
    interpolationSteps: 10,
    mixingStrength: 0.5,
    preserveKeyAttributes: ['creator', 'name', 'isPublic']
  };

  constructor(private config: Partial<StyleMixerConfig> = {}) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * Interpolate between two styles with configurable steps
   */
  interpolateStyles(styleA: Style, styleB: Style, steps?: number): Style[] {
    const numSteps = steps || this.config.interpolationSteps;
    const results: Style[] = [];

    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      results.push(this.interpolateAt(styleA, styleB, t));
    }

    return results;
  }

  /**
   * Mix multiple styles with weighted contributions
   */
  mixStyles(styles: Array<{ style: Style; weight: number }>): Style {
    if (!styles.length) throw new Error('No styles provided for mixing');
    
    // Normalize weights
    const totalWeight = styles.reduce((sum, { weight }) => sum + weight, 0);
    const normalizedStyles = styles.map(({ style, weight }) => ({
      style,
      weight: weight / totalWeight
    }));

    // Initialize with first style's parameters
    const mixedParams: Record<string, any> = { ...normalizedStyles[0].style.parameters };

    // Mix parameters based on weights
    for (let i = 1; i < normalizedStyles.length; i++) {
      const { style, weight } = normalizedStyles[i];
      for (const [key, value] of Object.entries(style.parameters)) {
        if (typeof value === 'number') {
          mixedParams[key] = (mixedParams[key] || 0) * (1 - weight) + value * weight;
        } else if (Array.isArray(value)) {
          mixedParams[key] = this.interpolateArrays(
            mixedParams[key] || [],
            value,
            weight
          );
        }
      }
    }

    // Create mixed style
    return {
      name: `Mixed Style (${styles.length} sources)`,
      description: `A style created by mixing ${styles.length} different styles`,
      creator: 'StyleMixer',
      parameters: mixedParams,
      version: 1,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: this.getMixedTags(normalizedStyles.map(s => s.style))
    };
  }

  /**
   * Create a style variation with controlled randomness
   */
  createVariation(style: Style, variationStrength: number = 0.2): Style {
    const variation: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(style.parameters)) {
      if (typeof value === 'number') {
        // Add controlled random variation to numeric parameters
        variation[key] = value * (1 + (Math.random() * 2 - 1) * variationStrength);
      } else if (Array.isArray(value)) {
        // Add noise to array parameters
        variation[key] = value.map(v => 
          typeof v === 'number' 
            ? v * (1 + (Math.random() * 2 - 1) * variationStrength)
            : v
        );
      } else {
        variation[key] = value;
      }
    }

    return {
      ...style,
      name: `${style.name} (Variation)`,
      description: style.description ? `Variation of "${style.description}"` : `A variation of the "${style.name}" style`,
      parameters: variation,
      version: style.version + 1,
      modified: new Date()
    };
  }

  private interpolateAt(styleA: Style, styleB: Style, t: number): Style {
    const params: Record<string, any> = {};

    // Interpolate numeric and array parameters
    for (const key of new Set([
      ...Object.keys(styleA.parameters),
      ...Object.keys(styleB.parameters)
    ])) {
      const valueA = styleA.parameters[key];
      const valueB = styleB.parameters[key];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        params[key] = valueA * (1 - t) + valueB * t;
      } else if (Array.isArray(valueA) && Array.isArray(valueB)) {
        params[key] = this.interpolateArrays(valueA, valueB, t);
      } else {
        params[key] = t < 0.5 ? valueA : valueB;
      }
    }

    return {
      name: `Interpolated Style (${Math.round(t * 100)}%)`,
      description: `Interpolation between styles at ${Math.round(t * 100)}%`,
      creator: 'StyleMixer',
      parameters: params,
      version: 1,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: this.getMixedTags([styleA, styleB])
    };
  }

  private interpolateArrays(arrA: any[], arrB: any[], t: number): any[] {
    const maxLength = Math.max(arrA.length, arrB.length);
    const result = new Array(maxLength);

    for (let i = 0; i < maxLength; i++) {
      const a = arrA[i] ?? arrB[i];
      const b = arrB[i] ?? arrA[i];

      if (typeof a === 'number' && typeof b === 'number') {
        result[i] = a * (1 - t) + b * t;
      } else {
        result[i] = t < 0.5 ? a : b;
      }
    }

    return result;
  }

  private getMixedTags(styles: Style[]): string[] {
    const tagSet = new Set<string>();
    styles.forEach(style => style.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }
} 