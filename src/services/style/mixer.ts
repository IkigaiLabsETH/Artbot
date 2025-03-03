import { Style } from '../../types';

export class StyleMixer {
  private config: Record<string, any>;

  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Mix two styles together with a given weight
   */
  async mixStyles(
    styleA: Style,
    styleB: Style,
    weight: number = 0.5
  ): Promise<Style> {
    // Ensure weight is between 0 and 1
    weight = Math.max(0, Math.min(1, weight));
    
    // Create a new style object
    const mixedStyle: Style = {
      name: `Mix of ${styleA.name} and ${styleB.name}`,
      creator: 'ArtBot',
      parameters: {},
      version: 1,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: [...new Set([...styleA.tags, ...styleB.tags])]
    };
    
    // Mix parameters
    const allKeys = new Set([
      ...Object.keys(styleA.parameters),
      ...Object.keys(styleB.parameters)
    ]);
    
    for (const key of allKeys) {
      if (typeof styleA.parameters[key] === 'number' && 
          typeof styleB.parameters[key] === 'number') {
        // Linear interpolation for numeric values
        mixedStyle.parameters[key] = 
          styleA.parameters[key] * (1 - weight) + 
          styleB.parameters[key] * weight;
      } else if (key in styleA.parameters && key in styleB.parameters) {
        // For non-numeric values, use weight to decide which to pick
        mixedStyle.parameters[key] = weight < 0.5 ? 
          styleA.parameters[key] : 
          styleB.parameters[key];
      } else if (key in styleA.parameters) {
        // If only in styleA
        mixedStyle.parameters[key] = styleA.parameters[key];
      } else if (key in styleB.parameters) {
        // If only in styleB
        mixedStyle.parameters[key] = styleB.parameters[key];
      }
    }
    
    return mixedStyle;
  }

  /**
   * Create variations of a style
   */
  async createVariations(
    style: Style,
    count: number = 3,
    variationStrength: number = 0.2
  ): Promise<Style[]> {
    const variations: Style[] = [];
    
    for (let i = 0; i < count; i++) {
      // Create a variation with random adjustments
      const variation: Style = {
        name: `Variation ${i + 1} of ${style.name}`,
        creator: 'ArtBot',
        parameters: { ...style.parameters },
        version: 1,
        created: new Date(),
        modified: new Date(),
        isPublic: false,
        tags: [...style.tags]
      };
      
      // Adjust numeric parameters randomly within variation strength
      for (const key in variation.parameters) {
        if (typeof variation.parameters[key] === 'number') {
          const range = variation.parameters[key] * variationStrength;
          const adjustment = (Math.random() * 2 - 1) * range;
          variation.parameters[key] += adjustment;
        }
      }
      
      variations.push(variation);
    }
    
    return variations;
  }
} 