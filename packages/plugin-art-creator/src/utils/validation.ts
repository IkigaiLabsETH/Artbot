import { Style, ArtworkIdea } from '../types';

/**
 * Validate style parameters
 */
export function validateStyle(style: Style): void {
  if (!style.name) {
    throw new Error('Style must have a name');
  }

  if (!style.parameters || typeof style.parameters !== 'object') {
    throw new Error('Style must have valid parameters object');
  }

  // Validate numeric parameters are within bounds
  for (const [key, value] of Object.entries(style.parameters)) {
    if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value)) {
        throw new Error(`Invalid numeric parameter: ${key}`);
      }
    }
  }
}

/**
 * Validate artwork idea
 */
export function validateArtworkIdea(idea: ArtworkIdea): void {
  if (!idea.concept) {
    throw new Error('Artwork idea must have a concept');
  }

  if (!idea.style) {
    throw new Error('Artwork idea must have a style');
  }

  if (!idea.medium) {
    throw new Error('Artwork idea must have a medium');
  }

  if (typeof idea.score !== 'number' || isNaN(idea.score)) {
    throw new Error('Artwork idea must have a valid score');
  }
}

/**
 * Validate exploration rate
 */
export function validateExplorationRate(rate: number): void {
  if (typeof rate !== 'number' || isNaN(rate) || rate < 0 || rate > 1) {
    throw new Error('Exploration rate must be a number between 0 and 1');
  }
}

/**
 * Validate style compatibility
 */
export function validateCompatibility(compatibility: number): void {
  if (typeof compatibility !== 'number' || isNaN(compatibility) || compatibility < 0 || compatibility > 1) {
    throw new Error('Compatibility score must be a number between 0 and 1');
  }
}

/**
 * Validate API configuration
 */
export function validateConfig(config: { 
  apiKey?: string; 
  apiUrl?: string; 
  defaultModel?: string;
}): void {
  if (!config.apiKey) {
    throw new Error('API key is required');
  }

  if (config.apiUrl && !isValidUrl(config.apiUrl)) {
    throw new Error('Invalid API URL');
  }
}

/**
 * Validate URL string
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 