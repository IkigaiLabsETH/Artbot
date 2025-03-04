import { v4 as uuidv4 } from 'uuid';
import { ModelPrediction } from '../../types.js';
import fetch from 'node-fetch';

export { ModelPrediction };

export class ReplicateService {
  private apiKey: string;
  private baseUrl: string = 'https://api.replicate.com/v1';
  private defaultModel: string;
  private imageWidth: number;
  private imageHeight: number;
  
  constructor(config: Record<string, any> = {}) {
    this.apiKey = config.apiKey || process.env.REPLICATE_API_KEY || '';
    this.defaultModel = process.env.DEFAULT_IMAGE_MODEL || 'stability-ai/sdxl';
    this.imageWidth = parseInt(process.env.IMAGE_WIDTH || '1024', 10);
    this.imageHeight = parseInt(process.env.IMAGE_HEIGHT || '1024', 10);
  }
  
  async initialize(): Promise<void> {
    if (!this.apiKey) {
      console.warn('Replicate API key not provided. Service will not work properly.');
    } else {
      console.log(`✅ Replicate API key found: ${this.apiKey.substring(0, 5)}...`);
      console.log(`🖼️ Default image model: ${this.defaultModel}`);
      console.log(`📐 Image dimensions: ${this.imageWidth}x${this.imageHeight}`);
    }
  }
  
  /**
   * Run a prediction on a model
   */
  async runPrediction(
    model: string = this.defaultModel,
    input: Record<string, any>
  ): Promise<ModelPrediction> {
    // Create a prediction object
    const prediction: ModelPrediction = {
      id: uuidv4(),
      model,
      input,
      output: null,
      created: new Date(),
      status: 'pending'
    };
    
    try {
      if (!this.apiKey) {
        throw new Error('Replicate API key not provided');
      }
      
      // If this is an image generation model, add default parameters if not provided
      if (model.includes('stability-ai') || model.includes('sdxl')) {
        input.width = input.width || this.imageWidth;
        input.height = input.height || this.imageHeight;
        input.num_outputs = input.num_outputs || 1;
      }
      
      console.log(`🔄 Running prediction on model: ${model}`);
      console.log(`📝 Input: ${JSON.stringify(input, null, 2)}`);
      
      // Make the actual API call to Replicate
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: model,
          input: input
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Replicate API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      prediction.id = data.id;
      
      // Poll for the prediction result
      const result = await this.pollPrediction(data.id);
      
      // Map Replicate status to our status format
      prediction.status = result.status === 'succeeded' ? 'success' : result.status === 'failed' ? 'failed' : 'pending';
      prediction.output = result.output;
      
      console.log(`✅ Prediction completed: ${prediction.id}`);
      console.log(`🖼️ Output: ${JSON.stringify(prediction.output, null, 2)}`);
      
      return prediction;
    } catch (error) {
      // Handle error
      console.error(`❌ Prediction failed: ${error}`);
      prediction.status = 'failed';
      prediction.error = error instanceof Error ? error.message : String(error);
      return prediction;
    }
  }
  
  /**
   * Poll for a prediction result
   */
  private async pollPrediction(id: string, maxAttempts = 30, interval = 2000): Promise<any> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const result = await this.getPredictionRaw(id);
      
      if (!result) {
        throw new Error(`Prediction ${id} not found`);
      }
      
      // Use the raw Replicate status values
      if (result.status === 'succeeded') {
        return result;
      }
      
      if (result.status === 'failed' || result.status === 'canceled') {
        throw new Error(`Prediction ${id} ${result.status}: ${result.error || 'Unknown error'}`);
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }
    
    throw new Error(`Prediction ${id} timed out after ${maxAttempts} attempts`);
  }
  
  /**
   * Get a raw prediction by ID directly from Replicate API
   */
  private async getPredictionRaw(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/predictions/${id}`, {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Replicate API error: ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting prediction ${id}: ${error}`);
      return null;
    }
  }
  
  /**
   * Get a prediction by ID
   */
  async getPrediction(id: string): Promise<ModelPrediction | null> {
    try {
      const data = await this.getPredictionRaw(id);
      
      if (!data) {
        return null;
      }
      
      // Map Replicate status to our status format
      const status = data.status === 'succeeded' ? 'success' : 
                     data.status === 'failed' ? 'failed' : 'pending';
      
      return {
        id: data.id,
        model: data.version,
        input: data.input,
        output: data.output,
        created: new Date(data.created_at),
        status: status,
        error: data.error
      };
    } catch (error) {
      console.error(`Error getting prediction ${id}: ${error}`);
      return null;
    }
  }
  
  /**
   * Generate an image using the default model
   */
  async generateImage(prompt: string, options: Record<string, any> = {}): Promise<string | null> {
    const input = {
      prompt: prompt,
      ...options
    };
    
    const prediction = await this.runPrediction(this.defaultModel, input);
    
    if (prediction.status === 'success' && prediction.output && Array.isArray(prediction.output)) {
      return prediction.output[0]; // Return the first image URL
    }
    
    return null;
  }
} 