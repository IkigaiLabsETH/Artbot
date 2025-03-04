import { Service, ServiceType, IAgentRuntime } from '@elizaos/core';
import { Style } from '../../types/social';
import { StyleService } from '../style';
import { v4 as uuidv4 } from 'uuid';

export interface StyleGene {
  name: string;
  value: number;
  mutationRate: number;
  min: number;
  max: number;
}

export interface StyleGenome {
  id: string;
  genes: StyleGene[];
  fitness: number;
  style: Style;
  generation: number;
  parentIds: string[];
}

export interface EvolutionConfig {
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  elitismCount: number;
  maxGenerations: number;
}

/**
 * StyleEvolutionService - Handles the evolution of art styles using genetic algorithms
 */
export class StyleEvolutionService extends Service {
  private styleService: StyleService | null = null;
  private config: EvolutionConfig;
  private population: StyleGenome[] = [];
  private currentGeneration: number = 0;
  private bestGenomes: StyleGenome[] = [];
  
  // Default configuration
  private readonly defaultConfig: EvolutionConfig = {
    populationSize: 10,
    mutationRate: 0.1,
    crossoverRate: 0.7,
    elitismCount: 2,
    maxGenerations: 20
  };

  constructor(config: Partial<EvolutionConfig> = {}) {
    super();
    this.config = { ...this.defaultConfig, ...config };
  }

  static get serviceType(): ServiceType {
    return ServiceType.TEXT_GENERATION;
  }

  /**
   * Initialize the evolution service
   */
  async initialize(runtime: IAgentRuntime): Promise<void> {
    // We'll set the styleService later using setStyleService method
    console.log('StyleEvolutionService initialized');
  }

  /**
   * Set the style service to use for evolution
   */
  setStyleService(styleService: StyleService): void {
    this.styleService = styleService;
  }

  /**
   * Convert a Style to a StyleGenome
   */
  private styleToGenome(style: Style, generation: number = 0, parentIds: string[] = []): StyleGenome {
    // Extract style parameters and convert to genes
    const genes: StyleGene[] = [];
    
    // Extract numerical parameters from style
    if (style.parameters) {
      for (const [key, value] of Object.entries(style.parameters)) {
        if (typeof value === 'number') {
          genes.push({
            name: key,
            value,
            mutationRate: this.config.mutationRate,
            min: this.getParameterMin(key, value),
            max: this.getParameterMax(key, value)
          });
        }
      }
    }
    
    return {
      id: uuidv4(),
      genes,
      fitness: 0,
      style,
      generation,
      parentIds
    };
  }

  /**
   * Get the minimum value for a parameter
   */
  private getParameterMin(name: string, value: number): number {
    // Define parameter-specific minimums
    const mins: Record<string, number> = {
      'guidance': 1,
      'steps': 10,
      'seed': 0,
      'strength': 0,
      'noise': 0,
      'scale': 1
    };
    
    return name in mins ? mins[name] : Math.max(0, value * 0.5);
  }

  /**
   * Get the maximum value for a parameter
   */
  private getParameterMax(name: string, value: number): number {
    // Define parameter-specific maximums
    const maxs: Record<string, number> = {
      'guidance': 30,
      'steps': 150,
      'seed': 999999999,
      'strength': 1,
      'noise': 1,
      'scale': 20
    };
    
    return name in maxs ? maxs[name] : value * 2;
  }

  /**
   * Initialize a population from a seed style
   */
  async initializePopulation(seedStyle: Style): Promise<StyleGenome[]> {
    if (!this.styleService) {
      throw new Error('StyleEvolutionService not initialized with StyleService');
    }
    
    this.population = [];
    this.currentGeneration = 0;
    
    // Add the seed style as the first genome
    const seedGenome = this.styleToGenome(seedStyle);
    this.population.push(seedGenome);
    
    // Generate variations to fill the population
    while (this.population.length < this.config.populationSize) {
      try {
        // Create a variation of the seed style
        const variation = await this.styleService.createVariation(
          seedStyle, 
          0.1 + (this.population.length / this.config.populationSize) * 0.4
        );
        
        // Convert to genome and add to population
        const genome = this.styleToGenome(variation, 0, [seedGenome.id]);
        this.population.push(genome);
      } catch (error) {
        console.error('Error creating style variation:', error);
        // If we can't create enough variations, break out of the loop
        if (this.population.length > 0) break;
      }
    }
    
    console.log(`Initialized population with ${this.population.length} genomes`);
    return this.population;
  }

  /**
   * Evaluate the fitness of a genome
   */
  async evaluateGenome(genome: StyleGenome, feedback: number): Promise<number> {
    // Update the fitness based on feedback (0-1 scale)
    genome.fitness = feedback;
    return feedback;
  }

  /**
   * Evaluate the entire population
   */
  async evaluatePopulation(feedbackMap: Map<string, number>): Promise<StyleGenome[]> {
    for (const genome of this.population) {
      if (feedbackMap.has(genome.id)) {
        await this.evaluateGenome(genome, feedbackMap.get(genome.id)!);
      }
    }
    
    // Sort by fitness (descending)
    this.population.sort((a, b) => b.fitness - a.fitness);
    
    // Store the best genome from this generation
    if (this.population.length > 0) {
      this.bestGenomes.push(this.population[0]);
    }
    
    return this.population;
  }

  /**
   * Select a genome using tournament selection
   */
  private selectGenome(tournamentSize: number = 3): StyleGenome {
    // Select random genomes for the tournament
    const tournament: StyleGenome[] = [];
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[randomIndex]);
    }
    
    // Return the genome with the highest fitness
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best, 
      tournament[0]
    );
  }

  /**
   * Create a new genome by crossing over two parent genomes
   */
  private crossover(parentA: StyleGenome, parentB: StyleGenome): StyleGenome {
    if (!this.styleService) {
      throw new Error('StyleEvolutionService not initialized with StyleService');
    }
    
    // Create a new set of genes by combining parents
    const childGenes: StyleGene[] = [];
    
    // Get the union of all gene names from both parents
    const geneNames = new Set([
      ...parentA.genes.map(g => g.name),
      ...parentB.genes.map(g => g.name)
    ]);
    
    // For each gene name, select from either parent or blend
    for (const name of geneNames) {
      const geneA = parentA.genes.find(g => g.name === name);
      const geneB = parentB.genes.find(g => g.name === name);
      
      if (geneA && geneB) {
        // Both parents have this gene, blend them
        const crossPoint = Math.random();
        const value = geneA.value * crossPoint + geneB.value * (1 - crossPoint);
        
        childGenes.push({
          name,
          value,
          mutationRate: (geneA.mutationRate + geneB.mutationRate) / 2,
          min: Math.min(geneA.min, geneB.min),
          max: Math.max(geneA.max, geneB.max)
        });
      } else if (geneA) {
        // Only parent A has this gene
        childGenes.push({ ...geneA });
      } else if (geneB) {
        // Only parent B has this gene
        childGenes.push({ ...geneB });
      }
    }
    
    // Create a new style by blending the parent styles
    const newStyle: Style = {
      id: uuidv4(),
      name: `Evolved Style Gen ${this.currentGeneration + 1}`,
      creator: 'ArtBot',
      parameters: {},
      version: 1,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: ['evolved', 'generation-' + (this.currentGeneration + 1)]
    };
    
    // Apply the genes to the new style
    for (const gene of childGenes) {
      newStyle.parameters[gene.name] = gene.value;
    }
    
    // Create the child genome
    return {
      id: uuidv4(),
      genes: childGenes,
      fitness: 0,
      style: newStyle,
      generation: this.currentGeneration + 1,
      parentIds: [parentA.id, parentB.id]
    };
  }

  /**
   * Mutate a genome
   */
  private mutate(genome: StyleGenome): StyleGenome {
    // Clone the genome to avoid modifying the original
    const mutatedGenes = [...genome.genes];
    
    // Mutate each gene with probability based on mutation rate
    for (let i = 0; i < mutatedGenes.length; i++) {
      if (Math.random() < mutatedGenes[i].mutationRate) {
        // Apply mutation
        const gene = mutatedGenes[i];
        const range = gene.max - gene.min;
        const mutationAmount = (Math.random() * 2 - 1) * range * 0.1; // +/- 10% of range
        
        // Update the gene value, keeping within bounds
        gene.value = Math.max(gene.min, Math.min(gene.max, gene.value + mutationAmount));
      }
    }
    
    // Create a new style with the mutated genes
    const mutatedStyle: Style = {
      ...genome.style,
      id: uuidv4(),
      name: `Mutated ${genome.style.name}`,
      modified: new Date(),
      parameters: { ...genome.style.parameters }
    };
    
    // Apply the mutated genes to the style
    for (const gene of mutatedGenes) {
      mutatedStyle.parameters[gene.name] = gene.value;
    }
    
    // Return the mutated genome
    return {
      ...genome,
      id: uuidv4(),
      genes: mutatedGenes,
      style: mutatedStyle,
      fitness: 0 // Reset fitness
    };
  }

  /**
   * Evolve the population to the next generation
   */
  async evolvePopulation(): Promise<StyleGenome[]> {
    if (!this.styleService) {
      throw new Error('StyleEvolutionService not initialized with StyleService');
    }
    
    // Increment generation counter
    this.currentGeneration++;
    
    // Keep track of the new population
    const newPopulation: StyleGenome[] = [];
    
    // Apply elitism - keep the best genomes
    for (let i = 0; i < this.config.elitismCount && i < this.population.length; i++) {
      newPopulation.push(this.population[i]);
    }
    
    // Fill the rest of the population with crossover and mutation
    while (newPopulation.length < this.config.populationSize) {
      // Select parents
      const parentA = this.selectGenome();
      const parentB = this.selectGenome();
      
      // Perform crossover with probability based on crossover rate
      let offspring: StyleGenome;
      if (Math.random() < this.config.crossoverRate && parentA.id !== parentB.id) {
        offspring = this.crossover(parentA, parentB);
      } else {
        // No crossover, clone a parent
        offspring = { ...parentA, id: uuidv4(), fitness: 0 };
      }
      
      // Perform mutation with probability based on mutation rate
      if (Math.random() < this.config.mutationRate) {
        offspring = this.mutate(offspring);
      }
      
      // Add to new population
      newPopulation.push(offspring);
    }
    
    // Replace the old population
    this.population = newPopulation;
    
    console.log(`Evolved to generation ${this.currentGeneration} with ${this.population.length} genomes`);
    return this.population;
  }

  /**
   * Get the current population
   */
  getPopulation(): StyleGenome[] {
    return this.population;
  }

  /**
   * Get the best genomes from each generation
   */
  getBestGenomes(): StyleGenome[] {
    return this.bestGenomes;
  }

  /**
   * Get the current generation number
   */
  getCurrentGeneration(): number {
    return this.currentGeneration;
  }

  /**
   * Get the best genome from the current population
   */
  getBestGenome(): StyleGenome | null {
    if (this.population.length === 0) return null;
    
    // Sort by fitness (descending) and return the best
    return [...this.population].sort((a, b) => b.fitness - a.fitness)[0];
  }

  /**
   * Create a new style by evolving the best genomes
   */
  async createEvolvedStyle(): Promise<Style | null> {
    if (!this.styleService || this.bestGenomes.length === 0) {
      return null;
    }
    
    // Get the top 3 best genomes (or fewer if not available)
    const topGenomes = this.bestGenomes
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, Math.min(3, this.bestGenomes.length));
    
    // Blend their styles
    const styles = topGenomes.map(genome => genome.style);
    
    try {
      // Use the StyleService to blend the styles
      return await this.styleService.blend(styles, 'weighted');
    } catch (error) {
      console.error('Error creating evolved style:', error);
      return null;
    }
  }
} 