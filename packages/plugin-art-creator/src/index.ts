import { Plugin, ServiceType } from '@elizaos/core';
import { CreativeEngine } from './services/CreativeEngine';
import { StyleService } from './services/style';
import { ReplicateService } from './services/replicate';
import { generateArt } from './actions/generateArt';
import { evolveStyle } from './actions/evolveStyle';
import { artContextProvider, socialContextProvider } from './providers';

export interface ArtCreatorConfig {
  anthropicApiKey: string;
  replicateApiKey: string;
}

export default class ArtCreatorPlugin implements Plugin {
  name = 'art-creator';
  description = 'Autonomous AI art creation plugin inspired by Keke';
  
  private engine: CreativeEngine;
  private styleService: StyleService;
  private replicateService: ReplicateService;

  constructor(config: ArtCreatorConfig) {
    this.engine = new CreativeEngine(config.anthropicApiKey);
    this.styleService = new StyleService();
    this.replicateService = new ReplicateService({ apiKey: config.replicateApiKey });
  }

  async onStart(): Promise<void> {
    // Initialize services
    await this.engine.initialize();
    await this.styleService.initialize();
    await this.replicateService.initialize();
  }

  getServices() {
    return {
      [ServiceType.TEXT_GENERATION]: [
        this.engine,
        this.styleService,
        this.replicateService
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