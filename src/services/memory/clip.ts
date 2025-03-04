import fetch from 'node-fetch';
import { ReplicateService } from '../replicate/index.js';

/**
 * CLIP service for generating visual embeddings
 * Uses Replicate's CLIP model to generate embeddings for images
 */
export class CLIPService {
  private replicateService: ReplicateService;
  private clipModel: string = 'openai/clip-vit-base-patch32';
  private embeddingDimension: number = 512;
  private isAvailable: boolean = false;

  constructor(replicateService?: ReplicateService) {
    this.replicateService = replicateService || new ReplicateService();
  }

  /**
   * Initialize the CLIP service
   */
  async initialize(): Promise<void> {
    await this.replicateService.initialize();
    this.isAvailable = !!process.env.REPLICATE_API_KEY;
    
    if (this.isAvailable) {
      console.log('✅ CLIP service initialized with Replicate');
    } else {
      console.warn('⚠️ CLIP service not available - Replicate API key missing');
    }
  }

  /**
   * Generate embedding for an image URL
   */
  async getImageEmbedding(imageUrl: string): Promise<number[]> {
    if (!this.isAvailable) {
      console.warn('⚠️ CLIP service not available, returning random embedding');
      return this.generateRandomEmbedding(imageUrl);
    }

    try {
      console.log(`🖼️ Generating CLIP embedding for image: ${imageUrl}`);
      
      const prediction = await this.replicateService.runPrediction(
        this.clipModel,
        { image: imageUrl }
      );
      
      if (prediction.status === 'success' && prediction.output && Array.isArray(prediction.output)) {
        console.log(`✅ Successfully generated CLIP embedding (${prediction.output.length} dimensions)`);
        return prediction.output as number[];
      } else {
        throw new Error(`Failed to generate CLIP embedding: ${prediction.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating CLIP embedding:', error);
      return this.generateRandomEmbedding(imageUrl);
    }
  }

  /**
   * Generate embedding for a text prompt
   */
  async getTextEmbedding(text: string): Promise<number[]> {
    if (!this.isAvailable) {
      console.warn('⚠️ CLIP service not available, returning random embedding');
      return this.generateRandomEmbedding(text);
    }

    try {
      console.log(`📝 Generating CLIP embedding for text: ${text}`);
      
      const prediction = await this.replicateService.runPrediction(
        this.clipModel,
        { text: text }
      );
      
      if (prediction.status === 'success' && prediction.output && Array.isArray(prediction.output)) {
        console.log(`✅ Successfully generated CLIP embedding (${prediction.output.length} dimensions)`);
        return prediction.output as number[];
      } else {
        throw new Error(`Failed to generate CLIP embedding: ${prediction.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating CLIP embedding:', error);
      return this.generateRandomEmbedding(text);
    }
  }

  /**
   * Calculate similarity between image and text
   */
  async calculateImageTextSimilarity(imageUrl: string, text: string): Promise<number> {
    const imageEmbedding = await this.getImageEmbedding(imageUrl);
    const textEmbedding = await this.getTextEmbedding(text);
    
    return this.calculateCosineSimilarity(imageEmbedding, textEmbedding);
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimension');
    }
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Generate a random embedding (for fallback)
   */
  private generateRandomEmbedding(seed?: string): number[] {
    const embedding: number[] = [];
    let seedValue = 1;
    
    if (seed) {
      // Simple hash function for the seed string
      seedValue = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    }
    
    // Generate pseudo-random values based on seed
    for (let i = 0; i < this.embeddingDimension; i++) {
      const value = Math.sin(seedValue * (i + 1)) * 0.5 + 0.5;
      embedding.push(value);
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }
} 