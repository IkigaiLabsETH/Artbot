import { Style } from '../../types';
import { StyleMixer } from './mixer';
import { StyleAnalyzer, StyleAnalysis, StyleMetrics } from './analyzer';
import { ReplicateService, ModelPrediction } from '../replicate';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

// Extend the ModelPrediction interface to include parameters
interface ExtendedModelPrediction extends ModelPrediction {
  parameters?: Record<string, any>;
}

// Extend the StyleAnalysis interface to include traits
interface ExtendedStyleAnalysis extends StyleAnalysis {
  traits: string[];
}

export class StyleService {
  private mixer: StyleMixer;
  private analyzer: StyleAnalyzer;
  private replicateService: ReplicateService;
  private styles: Map<string, Style> = new Map();
  private stylesDir: string;

  constructor(config = {}, baseDir: string = process.cwd()) {
    this.mixer = new StyleMixer(config);
    this.analyzer = new StyleAnalyzer();
    this.replicateService = new ReplicateService(config);
    this.stylesDir = path.join(baseDir, '.artbot', 'styles');
  }

  async initialize(): Promise<void> {
    // Initialize dependencies
    await this.replicateService.initialize();
    
    // Create styles directory if it doesn't exist
    try {
      await fs.mkdir(this.stylesDir, { recursive: true });
      
      // Load existing styles
      const files = await fs.readdir(this.stylesDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.stylesDir, file), 'utf-8');
          const style = JSON.parse(content) as Style;
          this.styles.set(style.id!, style);
        }
      }
    } catch (error) {
      console.error('Error initializing style service:', error);
    }
  }

  /**
   * Get a style by ID
   */
  async getStyle(styleId: string): Promise<Style | null> {
    return this.styles.get(styleId) || null;
  }

  /**
   * Save a style
   */
  async saveStyle(style: Style): Promise<Style> {
    // Ensure style has an ID
    if (!style.id) {
      style.id = uuidv4();
    }
    
    // Save to memory
    this.styles.set(style.id, style);
    
    // Save to disk
    try {
      await fs.writeFile(
        path.join(this.stylesDir, `${style.id}.json`),
        JSON.stringify(style, null, 2)
      );
    } catch (error) {
      console.error('Error saving style:', error);
    }
    
    return style;
  }

  /**
   * Select the best variation from a set of variations
   */
  async selectBestVariation(
    variations: ExtendedModelPrediction[],
    analysis: StyleAnalysis,
    preserveTraits: string[] = []
  ): Promise<Style> {
    // Convert predictions to styles
    const styles = variations.map(prediction => ({
      id: uuidv4(),
      name: `Variation ${uuidv4().slice(0, 8)}`,
      creator: 'ArtBot',
      parameters: prediction.parameters || {},
      version: 1,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: []
    }));
    
    // Score each style
    const scores = await Promise.all(styles.map(async style => {
      const styleAnalysis = await this.analyzer.analyzeStyle(style) as ExtendedStyleAnalysis;
      
      // Calculate base score
      let score = (
        styleAnalysis.metrics.coherence * 0.3 +
        styleAnalysis.metrics.stability * 0.3 +
        styleAnalysis.metrics.compatibility * 0.4
      );
      
      // Bonus for preserving traits
      if (preserveTraits.length > 0) {
        const preservedTraitScore = preserveTraits.reduce((acc, trait) => {
          // Check if trait is preserved in the style
          const isPreserved = styleAnalysis.traits?.includes(trait) || false;
          return acc + (isPreserved ? 0.1 : 0);
        }, 0);
        
        score += preservedTraitScore;
      }
      
      return { style, score };
    }));
    
    // Return the style with the highest score
    scores.sort((a, b) => b.score - a.score);
    return scores[0].style;
  }

  /**
   * Analyze a style
   */
  async analyzeStyle(style: Style): Promise<StyleAnalysis> {
    return this.analyzer.analyzeStyle(style);
  }

  /**
   * Mix two styles
   */
  async mixStyles(styleA: Style, styleB: Style, weight: number = 0.5): Promise<Style> {
    return this.mixer.mixStyles(styleA, styleB, weight);
  }

  /**
   * Create variations of a style
   */
  async createVariations(
    style: Style,
    count: number = 3,
    variationStrength: number = 0.2
  ): Promise<Style[]> {
    return this.mixer.createVariations(style, count, variationStrength);
  }
} 