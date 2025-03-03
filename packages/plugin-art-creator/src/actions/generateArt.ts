import { Action, ServiceType } from '@elizaos/core';
import { CreativeEngine } from '../services/CreativeEngine';
import { ArtworkIdea, ArtworkMemory } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface GenerateArtParams {
  concept?: string;
  style?: string;
  medium?: string;
  explorationRate?: number;
  count?: number;
}

export const generateArt = {
  name: 'generate-art',
  description: 'Generate artwork using autonomous creative processes',
  
  async execute({ concept, style, medium, explorationRate, count = 1 }, { runtime }) {
    const engine = await runtime.getService(
      ServiceType.TEXT_GENERATION,
      CreativeEngine
    );
    
    // Log the provider being used
    console.log(`Using provider: ${engine.getProvider()}`);
    
    // Adjust exploration rate if provided
    if (typeof explorationRate === 'number') {
      engine.setExplorationRate(explorationRate);
    }

    // Generate ideas using the appropriate API
    let ideas: ArtworkIdea[];
    if (concept) {
      // Create a specific idea based on the provided concept
      const idea: ArtworkIdea = {
        id: uuidv4(),
        concept: concept,
        style: style || 'Contemporary',
        medium: medium || 'Digital',
        score: 0.8,
        timestamp: Date.now()
      };
      ideas = [idea];
    } else {
      // Generate ideas using the AI
      ideas = await engine.generateArtIdeas(count);
    }
    
    // Create artworks from the ideas
    const artworks: ArtworkMemory[] = ideas.map(idea => ({
      id: uuidv4(),
      imageUrl: `https://placeholder.com/art/${idea.id}`,
      idea: idea,
      feedback: [],
      created: Date.now()
    }));
    
    // Add to completed works
    const state = engine.getState();
    artworks.forEach(artwork => {
      state.completedWorks.push(artwork);
    });

    return artworks.length === 1 ? artworks[0] : artworks;
  }
}; 