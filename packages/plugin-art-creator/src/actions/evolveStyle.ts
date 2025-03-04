import { Action, ServiceType } from '@elizaos/core';
import { StyleService } from '../services/style/index.js';
import { StyleEvolutionService, StyleGenome } from '../services/evolution/index.js';
import { Style } from '../types/social/index.js';
import { v4 as uuidv4 } from 'uuid';

export interface EvolveStyleParams {
  seedStyleId?: string;
  populationSize?: number;
  mutationRate?: number;
  crossoverRate?: number;
  elitismCount?: number;
  generations?: number;
  feedbackMap?: Record<string, number>;
}

export const evolveStyle = {
  name: 'evolve-style',
  description: 'Evolve art styles using genetic algorithms',
  
  async execute({ 
    seedStyleId, 
    populationSize = 10,
    mutationRate = 0.1,
    crossoverRate = 0.7,
    elitismCount = 2,
    generations = 1,
    feedbackMap = {}
  }: EvolveStyleParams, { runtime }) {
    // Get the StyleService
    const styleService = await runtime.getService(
      ServiceType.TEXT_GENERATION,
      StyleService
    );
    
    // Get or create the StyleEvolutionService
    let evolutionService = await runtime.getService(
      ServiceType.TEXT_GENERATION,
      StyleEvolutionService
    );
    
    if (!evolutionService) {
      // Create a new evolution service if it doesn't exist
      evolutionService = new StyleEvolutionService({
        populationSize,
        mutationRate,
        crossoverRate,
        elitismCount,
        maxGenerations: 20
      });
      
      // Initialize the service
      await evolutionService.initialize(runtime);
    }
    
    // Set the style service
    evolutionService.setStyleService(styleService);
    
    // Get the seed style
    let seedStyle: Style;
    if (seedStyleId) {
      // Get the style by ID
      const style = await styleService.getStyle(seedStyleId);
      if (!style) {
        throw new Error(`Style with ID ${seedStyleId} not found`);
      }
      seedStyle = style;
    } else {
      // Get a random style
      const styles = await styleService.getStyles();
      if (styles.length === 0) {
        throw new Error('No styles available to evolve');
      }
      seedStyle = styles[Math.floor(Math.random() * styles.length)];
    }
    
    // Initialize the population if needed
    let population = evolutionService.getPopulation();
    if (population.length === 0) {
      console.log(`Initializing population with seed style: ${seedStyle.name}`);
      population = await evolutionService.initializePopulation(seedStyle);
    }
    
    // Convert feedbackMap from Record to Map
    const feedbackMapObj = new Map<string, number>();
    for (const [id, feedback] of Object.entries(feedbackMap)) {
      feedbackMapObj.set(id, feedback);
    }
    
    // If we have feedback, evaluate the population
    if (feedbackMapObj.size > 0) {
      console.log(`Evaluating population with ${feedbackMapObj.size} feedback entries`);
      await evolutionService.evaluatePopulation(feedbackMapObj);
    }
    
    // Evolve for the specified number of generations
    let evolvedPopulation: StyleGenome[] = [...population];
    for (let i = 0; i < generations; i++) {
      console.log(`Evolving generation ${i + 1} of ${generations}`);
      evolvedPopulation = await evolutionService.evolvePopulation();
    }
    
    // Get the best genome
    const bestGenome = evolutionService.getBestGenome();
    
    // Create a new evolved style if we have enough generations
    let evolvedStyle: Style | null = null;
    if (evolutionService.getCurrentGeneration() >= 3) {
      evolvedStyle = await evolutionService.createEvolvedStyle();
      
      // Save the evolved style
      if (evolvedStyle) {
        await styleService.saveStyle(evolvedStyle);
      }
    }
    
    // Return the results
    return {
      currentGeneration: evolutionService.getCurrentGeneration(),
      population: evolvedPopulation,
      bestGenome: bestGenome,
      evolvedStyle: evolvedStyle,
      seedStyle: seedStyle
    };
  }
}; 