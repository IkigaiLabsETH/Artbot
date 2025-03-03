import { Action, ServiceType } from '@elizaos/core';
import { CreativeEngine } from '../services/CreativeEngine';
import { ArtworkIdea, ArtworkMemory } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
    const engine = await runtime.getService(
      ServiceType.TEXT_GENERATION,
      CreativeEngine
    );
    
    // Create a simplified idea
    const idea: ArtworkIdea = {
      id: uuidv4(),
      concept: concept || 'Autonomous creation',
      style: style || 'Contemporary',
      medium: medium || 'Digital',
      score: 0.8,
      timestamp: Date.now()
    };

    // Adjust exploration rate if provided
    if (typeof explorationRate === 'number') {
      engine.setExplorationRate(explorationRate);
    }

    // Create a simplified artwork
    const artwork: ArtworkMemory = {
      id: uuidv4(),
      imageUrl: `https://placeholder.com/art/${idea.id}`,
      idea: idea,
      feedback: [],
      created: Date.now()
    };

    // Add to completed works (simulating the createArtwork functionality)
    const state = engine.getState();
    state.completedWorks.push(artwork);

    return artwork;
  }
}; 