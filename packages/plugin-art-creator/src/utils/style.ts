import { Style } from '../types';

/**
 * Interpolate between two styles with a given ratio
 */
export function interpolateStyles(styleA: Style, styleB: Style, t: number): Style {
  const params: Record<string, any> = {};

  // Interpolate numeric parameters
  for (const key of new Set([...Object.keys(styleA.parameters), ...Object.keys(styleB.parameters)])) {
    const a = styleA.parameters[key];
    const b = styleB.parameters[key];

    if (typeof a === 'number' && typeof b === 'number') {
      params[key] = a * (1 - t) + b * t;
    } else {
      params[key] = t < 0.5 ? a : b;
    }
  }

  return {
    name: `Interpolated Style (${Math.round(t * 100)}%)`,
    creator: 'System',
    parameters: params,
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: false,
    tags: [...new Set([...(styleA.tags || []), ...(styleB.tags || [])])]
  };
}

/**
 * Create a variation of a style with given strength
 */
export function createStyleVariation(style: Style, strength: number): Style {
  const params: Record<string, any> = {};

  for (const [key, value] of Object.entries(style.parameters)) {
    if (typeof value === 'number') {
      params[key] = value * (1 + (Math.random() * 2 - 1) * strength);
    } else {
      params[key] = value;
    }
  }

  return {
    ...style,
    name: `${style.name} (Variation)`,
    parameters: params,
    version: style.version + 1,
    modified: new Date()
  };
}

/**
 * Calculate weighted average of style metrics
 */
export function calculateStyleWeight(metrics: { 
  coherence: number; 
  stability: number; 
  compatibility: number; 
}): number {
  return (
    metrics.coherence * 0.4 +
    metrics.stability * 0.3 +
    metrics.compatibility * 0.3
  );
}

/**
 * Convert model output to a Style object
 */
export function convertOutputToStyle(output: any, name: string = 'Extracted Style'): Style {
  return {
    name,
    creator: 'System',
    parameters: output.parameters || {},
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: false,
    tags: output.tags || []
  };
} 