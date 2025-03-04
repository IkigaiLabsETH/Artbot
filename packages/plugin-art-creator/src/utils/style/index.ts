import { Style } from '../../types/social/index.js';

export function interpolateStyles(styleA: Style, styleB: Style, t: number): Style {
  // Simple linear interpolation between two styles
  return {
    name: `Interpolation (${t.toFixed(2)})`,
    description: `Interpolation between ${styleA.name} and ${styleB.name}`,
    parameters: interpolateParameters(styleA.parameters, styleB.parameters, t),
    visualCharacteristics: styleA.visualCharacteristics,
    colorPalette: styleA.colorPalette,
    texture: styleA.texture
  };
}

export function createStyleVariation(style: Style, variationStrength: number = 0.2): Style {
  // Create a variation of the style by adding random noise to parameters
  const variedParameters = { ...style.parameters };
  
  // Add random variation to each parameter
  Object.keys(variedParameters || {}).forEach(key => {
    if (typeof variedParameters[key] === 'number') {
      const variation = (Math.random() * 2 - 1) * variationStrength;
      variedParameters[key] = Math.max(0, Math.min(1, variedParameters[key] + variation));
    }
  });
  
  return {
    name: `${style.name} (Variation)`,
    description: style.description,
    parameters: variedParameters,
    visualCharacteristics: style.visualCharacteristics,
    colorPalette: style.colorPalette,
    texture: style.texture
  };
}

export function convertOutputToStyle(output: any): Style {
  // Convert model output to a Style object
  return {
    name: output.name || 'Extracted Style',
    description: output.description || 'Style extracted from image',
    parameters: output.parameters || {},
    visualCharacteristics: output.visualCharacteristics || [],
    colorPalette: output.colorPalette || [],
    texture: output.texture || ''
  };
}

function interpolateParameters(paramsA: Record<string, any> = {}, paramsB: Record<string, any> = {}, t: number): Record<string, any> {
  const result: Record<string, any> = {};
  
  // Get all keys from both parameter sets
  const allKeys = new Set([...Object.keys(paramsA), ...Object.keys(paramsB)]);
  
  // Interpolate each parameter
  allKeys.forEach(key => {
    if (typeof paramsA?.[key] === 'number' && typeof paramsB?.[key] === 'number') {
      // Linear interpolation for numbers
      result[key] = paramsA[key] * (1 - t) + paramsB[key] * t;
    } else if (key in paramsA && key in paramsB) {
      // For non-numeric values, use one or the other based on t
      result[key] = t < 0.5 ? paramsA[key] : paramsB[key];
    } else if (key in paramsA) {
      result[key] = paramsA[key];
    } else if (key in paramsB) {
      result[key] = paramsB[key];
    }
  });
  
  return result;
} 