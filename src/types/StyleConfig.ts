/**
 * Configuration interface for artistic style parameters
 */
export interface StyleConfig {
  prompt_prefix: string;
  prompt_suffix: string;
  negative_prompt: string;
  num_inference_steps: number;
  guidance_scale: number;
  style_emphasis?: {
    [key: string]: number;
  };
} 