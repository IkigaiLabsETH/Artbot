import { Service, ServiceType } from '@elizaos/core';
import { ArtworkIdea, ArtworkMemory, CreativeState, SelfDialogue, MemorySystem, ReflectionEngine, Analysis, CreativeDialogue } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ImageService } from './ImageService';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';

export class CreativeEngine extends Service {
  private state: CreativeState;
  private anthropic: Anthropic;
  private imageService: ImageService;
  private selfDialogue: SelfDialogue;
  private memorySystem: MemorySystem;
  private reflectionEngine: ReflectionEngine;
  
  constructor(apiKey: string, baseDir: string = process.cwd()) {
    super();
    this.anthropic = new Anthropic({ apiKey });
    this.imageService = new ImageService(path.join(baseDir, '.artbot'));
    this.selfDialogue = new SelfDialogue();
    this.memorySystem = new MemorySystem();
    this.reflectionEngine = new ReflectionEngine();
    
    this.state = {
      currentIdeas: [],
      completedWorks: [],
      stylePreferences: {},
      explorationRate: 0.2,
      autonomyLevel: 0.8,
      creativityMetrics: {
        novelty: 0,
        coherence: 0,
        influence: 0,
        growth: {
          technical: 0,
          conceptual: 0,
          stylistic: 0
        }
      }
    };
  }

  static get serviceType(): ServiceType {
    return ServiceType.TEXT_GENERATION;
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.memorySystem.initialize(),
      this.reflectionEngine.initialize(),
      this.imageService.initialize()
    ]);
  }

  async generateIdea(): Promise<ArtworkIdea> {
    // Start creative dialogue
    const dialogue = await this.selfDialogue.explore('Generate new artwork concept');
    
    // Gather context from memory
    const memories = await this.memorySystem.retrieve({
      type: 'inspiration',
      limit: 5,
      sortBy: 'relevance'
    });

    const prompt = await this.constructPrompt(dialogue, memories);
    const message = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      temperature: this.calculateTemperature(),
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const response = message.content[0].text;
    const [concept, style, medium] = this.parseIdeaResponse(response);

    // Evaluate idea through reflection
    const reflection = await this.reflectionEngine.analyzeCreation({
      concept,
      style,
      medium,
      context: dialogue
    });

    const idea: ArtworkIdea = {
      id: uuidv4(),
      concept,
      style,
      medium,
      score: this.calculateScore(reflection),
      reflection: reflection,
      timestamp: Date.now()
    };

    // Store in memory system
    await this.memorySystem.store({
      type: 'idea',
      content: idea,
      associations: reflection.conceptualLinks
    });

    this.state.currentIdeas.push(idea);
    return idea;
  }

  private calculateTemperature(): number {
    return this.state.explorationRate * (1 + this.state.autonomyLevel * 0.5);
  }

  private calculateScore(reflection: Analysis): number {
    const {
      novelty,
      coherence,
      technicalFeasibility,
      conceptualDepth
    } = reflection.metrics;

    return (
      novelty * 0.3 +
      coherence * 0.3 +
      technicalFeasibility * 0.2 +
      conceptualDepth * 0.2
    );
  }

  async suggestStyle(): Promise<string> {
    // Implement style suggestion logic
    return 'suggested style';
  }

  async suggestMedium(): Promise<string> {
    // Implement medium suggestion logic
    return 'suggested medium';
  }

  async createArtwork(idea: ArtworkIdea): Promise<ArtworkMemory> {
    // Generate artwork using style-aware image generation
    const imageUrl = await this.imageService.generateImage(idea.concept, idea.style);
    
    const artwork: ArtworkMemory = {
      id: uuidv4(),
      imageUrl,
      idea,
      feedback: [],
      created: Date.now()
    };

    this.state.completedWorks.push(artwork);
    return artwork;
  }

  private parseIdeaResponse(response: string): [string, string, string] {
    // Simple parsing - in real implementation would be more robust
    const parts = response.split(' in ').map(p => p.trim());
    return [
      parts[0] || 'abstract composition',
      parts[1]?.split(' using ')[0] || 'contemporary',
      parts[1]?.split(' using ')[1] || 'digital'
    ];
  }

  async reflect(artwork: ArtworkMemory): Promise<void> {
    const analysis = await this.reflectionEngine.analyzeCreation(artwork);
    
    // Update creativity metrics
    this.state.creativityMetrics = {
      ...this.state.creativityMetrics,
      ...analysis.evolutionaryImpact
    };

    // Store reflection in memory
    await this.memorySystem.store({
      type: 'reflection',
      content: analysis,
      associations: [artwork.id]
    });

    // Adjust creative parameters based on reflection
    this.adjustCreativeParameters(analysis);
  }

  private adjustCreativeParameters(analysis: Analysis): void {
    // Adjust exploration rate based on success
    if (analysis.metrics.novelty > 0.7 && analysis.metrics.coherence > 0.6) {
      this.state.explorationRate = Math.min(0.8, this.state.explorationRate + 0.1);
    } else if (analysis.metrics.coherence < 0.4) {
      this.state.explorationRate = Math.max(0.2, this.state.explorationRate - 0.1);
    }

    // Adjust autonomy level based on overall success
    const overallSuccess = analysis.metrics.technicalFeasibility * analysis.metrics.conceptualDepth;
    if (overallSuccess > 0.7) {
      this.state.autonomyLevel = Math.min(1.0, this.state.autonomyLevel + 0.05);
    }
  }

  async updateStylePreference(style: string, feedback: number) {
    const currentPreference = this.state.stylePreferences[style] || 0.5;
    this.state.stylePreferences[style] = currentPreference * 0.8 + feedback * 0.2;

    // Update the style cluster based on feedback
    await this.imageService.updateStyleCluster(style, feedback);
  }

  setExplorationRate(rate: number): void {
    this.state.explorationRate = Math.max(0, Math.min(1, rate));
  }

  private async constructPrompt(dialogue: CreativeDialogue, memories: any[]): Promise<string> {
    const memoryContext = memories
      .map(m => `Previous work: ${m.content.concept}`)
      .join('\n');

    return `As an autonomous AI artist, generate a creative concept for an artwork.
            Consider this creative context:
            ${dialogue.reasoning.join('\n')}
            
            Previous works for reference:
            ${memoryContext}
            
            Consider current artistic trends and your unique perspective.
            Format: {concept} in {style} using {medium}`;
  }
} 