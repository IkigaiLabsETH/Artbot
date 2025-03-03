import { Action, ServiceType } from '@elizaos/core';
import { CreativeEngine } from '../services/CreativeEngine';
import { ArtworkIdea, ArtworkMemory } from '../types';

export interface GenerateArtParams {
  concept?: string;
  style?: string;
  medium?: string;
  explorationRate?: number;
}

export const generateArt = {
  name: 'generate-art',
  description: 'Generate artwork using autonomous creative processes',
  
  async execute({ concept, style, medium, explorationRate }, { runtime }) {
    const engine = runtime.getService(ServiceType.TEXT_GENERATION) as CreativeEngine;
    
    // Generate idea if not provided
    let idea: ArtworkIdea;
    if (!concept && !style && !medium) {
      idea = await engine.generateIdea();
    } else {
      idea = {
        id: runtime.generateId(),
        concept: concept || 'Autonomous creation',
        style: style || await engine.suggestStyle(),
        medium: medium || await engine.suggestMedium(),
        score: 0,
        timestamp: Date.now()
      };
    }

    // Adjust exploration rate if provided
    if (typeof explorationRate === 'number') {
      engine.setExplorationRate(explorationRate);
    }

    // Create artwork
    const artwork = await engine.createArtwork(idea);

    // Trigger self-reflection
    await engine.reflect(artwork);

    return artwork;
  }
}; 