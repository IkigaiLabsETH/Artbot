import { Style } from '../../types.js';
import { StyleMixer } from './mixer.js';
import { StyleAnalyzer, StyleAnalysis, StyleMetrics } from './analyzer.js';
import { ReplicateService, ModelPrediction } from '../replicate/index.js';
import { AestheticJudgment } from './aesthetic.js';
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
  private aestheticJudgment: AestheticJudgment;
  private styles: Map<string, Style> = new Map();
  private stylesDir: string;

  constructor(config = {}, baseDir: string = process.cwd()) {
    this.mixer = new StyleMixer(config);
    this.analyzer = new StyleAnalyzer();
    this.replicateService = new ReplicateService(config);
    this.aestheticJudgment = new AestheticJudgment({ baseDir });
    this.stylesDir = path.join(baseDir, '.artbot', 'styles');
  }

  async initialize(): Promise<void> {
    // Initialize dependencies
    await this.replicateService.initialize();
    await this.aestheticJudgment.initialize();
    
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
   * Select the best variation from a set of variations using aesthetic judgment
   */
  async selectBestVariation(
    variations: ExtendedModelPrediction[],
    analysis: StyleAnalysis,
    preserveTraits: string[] = []
  ): Promise<Style> {
    // Convert predictions to styles
    const styles = await Promise.all(variations.map(async prediction => {
      const style = {
        id: uuidv4(),
        name: `Variation ${uuidv4().slice(0, 8)}`,
        creator: 'ArtBot',
        parameters: prediction.parameters || {},
        version: 1,
        created: new Date(),
        modified: new Date(),
        isPublic: false,
        tags: []
      };
      
      // Analyze the style to extract tags
      const styleAnalysis = await this.analyzer.analyzeStyle(style) as ExtendedStyleAnalysis;
      
      // Add traits as tags
      if (styleAnalysis.traits) {
        style.tags = [...styleAnalysis.traits];
      }
      
      // Add preserved traits as tags if they're not already included
      for (const trait of preserveTraits) {
        if (!style.tags.includes(trait)) {
          style.tags.push(trait);
        }
      }
      
      return style;
    }));
    
    // Use aesthetic judgment to select the best style
    const selectedStyle = await this.aestheticJudgment.selectBestStyle(styles);
    
    // Save the selected style
    await this.saveStyle(selectedStyle);
    
    return selectedStyle;
  }

  /**
   * Record a preference between two styles
   */
  async recordStylePreference(preferredStyleId: string, lessPreferredStyleId: string): Promise<void> {
    await this.aestheticJudgment.updateRatings(preferredStyleId, lessPreferredStyleId);
  }

  /**
   * Get the rating for a style
   */
  getStyleRating(styleId: string): number {
    return this.aestheticJudgment.getRating(styleId);
  }

  /**
   * Get top style preferences
   */
  getStylePreferences(limit: number = 10): any[] {
    return this.aestheticJudgment.getTopPreferences(limit);
  }

  /**
   * Generate an aesthetic report
   */
  generateAestheticReport(): Record<string, any> {
    return this.aestheticJudgment.generateAestheticReport();
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

  /**
   * Select the best style from a set of candidates using aesthetic judgment
   */
  async selectBestStyle(candidates: Style[]): Promise<Style> {
    return this.aestheticJudgment.selectBestStyle(candidates);
  }
} 