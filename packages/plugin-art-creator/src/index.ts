import { Plugin, ServiceType } from '@elizaos/core';
import { CreativeEngine } from './services/CreativeEngine';
import { StyleService } from './services/style';
import { ReplicateService } from './services/replicate';
import { StyleEvolutionService } from './services/evolution';
import { generateArt } from './actions/generateArt';
import { evolveStyle } from './actions/evolveStyle';
import { artContextProvider, socialContextProvider } from './providers';

export interface ArtCreatorConfig {
  openaiApiKey?: string;
  anthropicApiKey: string;
  replicateApiKey: string;
}

export default class ArtCreatorPlugin implements Plugin {
  name = 'art-creator';
  description = 'Autonomous AI art creation plugin inspired by Keke';
  
  private engine: CreativeEngine;
  private styleService: StyleService;
  private replicateService: ReplicateService;
  private evolutionService: StyleEvolutionService;
  private runtime: any;

  constructor(config: ArtCreatorConfig) {
    this.engine = new CreativeEngine({
      openaiApiKey: config.openaiApiKey,
      anthropicApiKey: config.anthropicApiKey
    });
    this.styleService = new StyleService();
    this.replicateService = new ReplicateService({ apiKey: config.replicateApiKey });
    this.evolutionService = new StyleEvolutionService();
  }

  async onStart(runtime: any): Promise<void> {
    // Store the runtime for later use
    this.runtime = runtime;
    
    // Initialize services
    await this.engine.initialize(runtime);
    await this.styleService.initialize();
    await this.replicateService.initialize();
    await this.evolutionService.initialize(runtime);
    
    // Set the style service for the evolution service
    this.evolutionService.setStyleService(this.styleService);
  }

  getServices() {
    return {
      [ServiceType.TEXT_GENERATION]: [
        this.engine,
        this.styleService,
        this.replicateService,
        this.evolutionService
      ]
    };
  }

  getActions() {
    return {
      'generate-art': generateArt,
      'evolve-style': evolveStyle
    };
  }

  getProviders() {
    return {
      'art-context': artContextProvider,
      'social-context': socialContextProvider
    };
  }
} 