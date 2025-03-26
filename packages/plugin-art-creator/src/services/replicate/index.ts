import { Service, ServiceType } from '@elizaos/core';
import { Style } from '../../types/index.js';
import { ModelHandler, REPLICATE_MODELS } from './models.js';
import { validateConfig, interpolateStyles, createStyleVariation, convertOutputToStyle } from '../../utils/index.js';

// Define the models
const FLUX_PRO_MODEL = 'black-forest-labs/flux-1.1-pro';
const FLUX_MODEL_BASE = 'adirik/flux-cinestill';
const FALLBACK_MODEL = 'minimax/image-01';

export interface ModelPrediction {
  id: string;
  status: string;
  output: any;
  error?: string;
}

export interface ReplicateConfig {
  apiKey?: string;
  apiUrl?: string;
  defaultModel?: string;
}

export class ReplicateService extends Service {
  private readonly defaultConfig: ReplicateConfig = {
    apiUrl: 'https://api.replicate.com/v1',
    defaultModel: 'black-forest-labs/flux-1.1-pro'
  };

  private config: ReplicateConfig;
  private modelHandlers: Map<string, ModelHandler> = new Map();
  private apiKey: string;
  private baseUrl: string = 'https://api.replicate.com/v1';
  private defaultModel: string;
  private defaultWidth: number;
  private defaultHeight: number;
  private defaultNumInferenceSteps: number;
  private defaultGuidanceScale: number;

  static get serviceType(): ServiceType {
    return ServiceType.TEXT_GENERATION;
  }

  constructor(config: Record<string, any> = {}) {
    super();
    this.apiKey = config.apiKey || process.env.REPLICATE_API_KEY || '';
    this.defaultModel = config.defaultModel || process.env.DEFAULT_IMAGE_MODEL || FLUX_PRO_MODEL;
    this.defaultWidth = config.defaultWidth || parseInt(process.env.IMAGE_WIDTH || '1440', 10);
    this.defaultHeight = config.defaultHeight || parseInt(process.env.IMAGE_HEIGHT || '1440', 10);
    this.defaultNumInferenceSteps = config.defaultNumInferenceSteps || parseInt(process.env.NUM_INFERENCE_STEPS || '200', 10);
    this.defaultGuidanceScale = config.defaultGuidanceScale || parseFloat(process.env.GUIDANCE_SCALE || '35.0');
  }

  async initialize(): Promise<void> {
    validateConfig(this.config);
  }

  /**
   * Run style-based image generation
   */
  async generateFromStyle(
    style: Style,
    prompt?: string,
    modelId: string = this.config.defaultModel
  ): Promise<ModelPrediction> {
    const handler = this.getModelHandler(modelId);
    const input = handler.prepareInput(style, { prompt: prompt || style.name });
    const prediction = await this.runPrediction(modelId, input);
    return {
      ...prediction,
      output: handler.processOutput(prediction.output)
    };
  }

  /**
   * Run style interpolation through image generation
   */
  async generateInterpolation(
    styleA: Style,
    styleB: Style,
    steps: number = 5,
    prompt?: string,
    modelId: string = this.config.defaultModel
  ): Promise<ModelPrediction[]> {
    const predictions: ModelPrediction[] = [];
    const handler = this.getModelHandler(modelId);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const interpolatedStyle = interpolateStyles(styleA, styleB, t);
      const input = handler.prepareInput(interpolatedStyle, { prompt });
      const prediction = await this.runPrediction(modelId, input);
      predictions.push({
        ...prediction,
        output: handler.processOutput(prediction.output)
      });
    }

    return predictions;
  }

  /**
   * Run batch style variations
   */
  async generateVariations(
    style: Style,
    count: number = 4,
    variationStrength: number = 0.2,
    modelId: string = this.config.defaultModel
  ): Promise<ModelPrediction[]> {
    const predictions: ModelPrediction[] = [];
    const handler = this.getModelHandler(modelId);

    for (let i = 0; i < count; i++) {
      const variedStyle = createStyleVariation(style, variationStrength);
      const input = handler.prepareInput(variedStyle);
      const prediction = await this.runPrediction(modelId, input);
      predictions.push({
        ...prediction,
        output: handler.processOutput(prediction.output)
      });
    }

    return predictions;
  }

  /**
   * Extract style from generated image
   */
  async extractStyleFromImage(
    imageUrl: string,
    modelId: string = 'lucataco/sdxl-extract'
  ): Promise<Style> {
    const handler = this.getModelHandler(modelId);
    const input = handler.prepareInput({ parameters: {} } as Style, { image: imageUrl });
    const prediction = await this.runPrediction(modelId, input);
    const output = handler.processOutput(prediction.output);

    return convertOutputToStyle(output);
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return Object.keys(REPLICATE_MODELS);
  }

  /**
   * Get model configuration
   */
  getModelConfig(modelId: string) {
    return this.getModelHandler(modelId).getConfig();
  }

  private getModelHandler(modelId: string): ModelHandler {
    if (!this.modelHandlers.has(modelId)) {
      this.modelHandlers.set(modelId, new ModelHandler(modelId));
    }
    return this.modelHandlers.get(modelId)!;
  }

  async runPrediction(modelId: string, input: any): Promise<ModelPrediction> {
    if (!this.apiKey) {
      throw new Error('Replicate API key is required');
    }

    const modelHandler = this.getModelHandler(modelId);
    const version = modelHandler.getVersion();
    
    try {
      // Create prediction
      const createResponse = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version,
          input
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(`Failed to create prediction: ${JSON.stringify(errorData)}`);
      }

      const prediction = await createResponse.json();
      let status = prediction.status;
      let predictionId = prediction.id;

      // Poll for completion
      while (status === 'starting' || status === 'processing') {
        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!statusResponse.ok) {
          throw new Error(`Failed to check prediction status: ${statusResponse.statusText}`);
        }

        const updatedPrediction = await statusResponse.json();
        status = updatedPrediction.status;
        
        if (status === 'succeeded') {
          return {
            id: predictionId,
            status,
            output: updatedPrediction.output
          };
        } else if (status === 'failed' || status === 'canceled') {
          return {
            id: predictionId,
            status,
            output: null,
            error: updatedPrediction.error || 'Prediction failed'
          };
        }
      }

      return {
        id: predictionId,
        status,
        output: prediction.output
      };
    } catch (error) {
      console.error('Error running prediction:', error);
      return {
        id: '',
        status: 'failed',
        output: null,
        error: error.message || 'Unknown error'
      };
    }
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }
} 