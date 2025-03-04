import { Action, ServiceType } from '@elizaos/core';
import { CreativeEngine } from '../services/CreativeEngine';
import { ReplicateService } from '../services/replicate';
import { ArtworkIdea, ArtworkMemory } from '../types';
import { enhancePrompt, generateNegativePrompt } from '../utils';
import { v4 as uuidv4 } from 'uuid';

export interface GenerateArtParams {
  concept?: string;
  style?: string;
  medium?: string;
  explorationRate?: number;
  count?: number;
  model?: string;
}

export const generateArt = {
  name: 'generate-art',
  description: 'Generate artwork using autonomous creative processes',
  
  async execute({ concept, style, medium, explorationRate, count = 1, model }, { runtime }) {
    const engine = await runtime.getService(
      ServiceType.TEXT_GENERATION,
      CreativeEngine
    );
    
    // Get the ReplicateService for image generation
    const replicateService = await runtime.getService(
      ServiceType.TEXT_GENERATION,
      ReplicateService
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
    
    // Create artworks from the ideas with actual image generation
    const artworks: ArtworkMemory[] = [];
    
    for (const idea of ideas) {
      try {
        // Check if we have similar artworks already
        const similarArtworks = await engine.findSimilarArtworks(idea.concept, 3);
        
        // Log if we found similar artworks
        if (similarArtworks.length > 0) {
          console.log(`Found ${similarArtworks.length} similar artworks to "${idea.concept}"`);
        }
        
        // Generate an enhanced prompt using our prompt engineering utilities
        const enhancedPrompt = enhancePrompt(idea);
        const negativePrompt = generateNegativePrompt();
        
        console.log(`Generating image with prompt: ${enhancedPrompt}`);
        
        // Generate the image using Replicate
        const styleObj = {
          name: idea.style,
          parameters: {
            prompt: enhancedPrompt,
            negative_prompt: negativePrompt,
            guidance: 7.5,
            steps: 30
          }
        };
        
        const prediction = await replicateService.generateFromStyle(
          styleObj, 
          enhancedPrompt,
          model || undefined
        );
        
        // Get the image URL from the prediction output
        let imageUrl = '';
        if (prediction.status === 'succeeded' && prediction.output) {
          // Handle different output formats
          if (Array.isArray(prediction.output)) {
            imageUrl = prediction.output[0];
          } else if (typeof prediction.output === 'string') {
            imageUrl = prediction.output;
          } else if (prediction.output.image) {
            imageUrl = prediction.output.image;
          }
        }
        
        // If image generation failed, use a placeholder
        if (!imageUrl) {
          console.warn(`Image generation failed for idea: ${idea.id}. Using placeholder.`);
          imageUrl = `https://placeholder.com/art/${idea.id}`;
        }
        
        // Create the artwork memory
        const artwork: ArtworkMemory = {
          id: uuidv4(),
          imageUrl: imageUrl,
          idea: {
            ...idea,
            // Store the enhanced prompt in the idea for reference
            concept: enhancedPrompt
          },
          feedback: [],
          created: Date.now()
        };
        
        // Add to completed works using the new method
        engine.addCompletedWork(artwork);
        
        artworks.push(artwork);
      } catch (error) {
        console.error(`Error generating image for idea ${idea.id}:`, error);
        // Add with placeholder on error
        const artwork = {
          id: uuidv4(),
          imageUrl: `https://placeholder.com/art/${idea.id}`,
          idea: idea,
          feedback: [],
          created: Date.now()
        };
        
        // Add to completed works using the new method
        engine.addCompletedWork(artwork);
        
        artworks.push(artwork);
      }
    }

    return artworks.length === 1 ? artworks[0] : artworks;
  }
}; 