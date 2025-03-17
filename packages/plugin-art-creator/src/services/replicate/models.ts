import { Style } from '../../types/index.js';

export interface ModelConfig {
  version: string;
  defaultParams: Record<string, any>;
  parameterMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  validateInput?: (input: Record<string, any>) => Record<string, any>;
  processOutput?: (output: any) => any;
}

export interface ModelRegistry {
  [key: string]: ModelConfig;
}

// Model-specific parameter mappings and configurations
export const REPLICATE_MODELS: ModelRegistry = {
  'stability-ai/sdxl': {
    version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 7.5,
      negative_prompt: 'low quality, bad quality, sketchy, broken',
      width: 2048,
      height: 2048,
      refine: 'expert_ensemble_refiner',
      scheduler: 'K_EULER',
      lora_scale: 0.6
    },
    parameterMapping: {
      strength: 'prompt_strength',
      steps: 'num_inference_steps',
      guidance: 'guidance_scale',
      seed: 'seed',
      width: 'width',
      height: 'height',
      refiner: 'refine',
      scheduler: 'scheduler'
    },
    outputMapping: {
      image: 'output',
      seed: 'seed',
      prompt_strength: 'strength'
    }
  },

  'stability-ai/stable-diffusion': {
    version: 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
    defaultParams: {
      num_inference_steps: 50,
      guidance_scale: 7.5,
      negative_prompt: 'low quality, bad quality',
      width: 512,
      height: 512,
      scheduler: 'DPMSolverMultistep'
    },
    parameterMapping: {
      strength: 'prompt_strength',
      steps: 'num_inference_steps',
      guidance: 'guidance_scale',
      seed: 'seed'
    },
    outputMapping: {
      image: 'output',
      seed: 'seed'
    }
  },

  'lucataco/sdxl-extract': {
    version: '886e10dcdd0e2d22a3ccc2e108d5c33e14c5a08e65a3b495c6d9ae2150c6b072',
    defaultParams: {},
    parameterMapping: {},
    outputMapping: {
      parameters: 'parameters',
      prompt: 'extracted_prompt'
    },
    processOutput: (output: any) => ({
      ...output,
      parameters: JSON.parse(output.parameters || '{}')
    })
  },

  'replicate/controlnet-canny': {
    version: '5c090faa9c88e53fd23c20c8b914b1a98545da24ea0e6cc96cd661f3f56b9fbe',
    defaultParams: {
      num_inference_steps: 30,
      guidance_scale: 7.5,
      controlnet_conditioning_scale: 0.8,
      control_guidance_start: 0.0,
      control_guidance_end: 1.0
    },
    parameterMapping: {
      strength: 'controlnet_conditioning_scale',
      steps: 'num_inference_steps',
      guidance: 'guidance_scale',
      seed: 'seed'
    },
    outputMapping: {
      image: 'output',
      control_image: 'control_image'
    },
    validateInput: (input: Record<string, any>) => {
      if (!input.image && !input.control_image) {
        throw new Error('Either image or control_image must be provided');
      }
      return input;
    }
  },

  'stability-ai/stable-diffusion-xl-refiner': {
    version: '3b5cee25d1fb5f6488931cc7607f795d56076851cfb6c6c7f0aede9ec36604d2',
    defaultParams: {
      num_inference_steps: 40,
      guidance_scale: 7.5,
      aesthetic_score: 6.0,
      negative_aesthetic_score: 2.5
    },
    parameterMapping: {
      strength: 'prompt_strength',
      steps: 'num_inference_steps',
      guidance: 'guidance_scale',
      seed: 'seed',
      aesthetic: 'aesthetic_score'
    },
    outputMapping: {
      image: 'output',
      seed: 'seed'
    }
  },

  'stability-ai/stable-video-diffusion': {
    version: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
    defaultParams: {
      num_frames: 14,
      num_inference_steps: 25,
      fps: 6,
      motion_bucket_id: 127,
      noise_aug_strength: 0.02
    },
    parameterMapping: {
      frames: 'num_frames',
      steps: 'num_inference_steps',
      fps: 'fps',
      motion: 'motion_bucket_id',
      noise: 'noise_aug_strength'
    },
    outputMapping: {
      video: 'output',
      frames: 'frames'
    },
    validateInput: (input: Record<string, any>) => {
      if (!input.image) {
        throw new Error('Input image is required for video generation');
      }
      return input;
    }
  }
};

export class ModelHandler {
  constructor(private modelId: string) {
    if (!REPLICATE_MODELS[modelId]) {
      throw new Error(`Unsupported model: ${modelId}`);
    }
  }

  getConfig(): ModelConfig {
    return REPLICATE_MODELS[this.modelId];
  }

  prepareInput(style: Style, additionalParams: Record<string, any> = {}): Record<string, any> {
    const config = this.getConfig();
    const input = { ...config.defaultParams };

    // Map style parameters to model parameters
    for (const [styleKey, value] of Object.entries(style.parameters)) {
      const modelKey = config.parameterMapping[styleKey];
      if (modelKey) {
        input[modelKey] = value;
      }
    }

    // Add additional parameters
    Object.assign(input, additionalParams);

    // Validate input if validator exists
    if (config.validateInput) {
      return config.validateInput(input);
    }

    return input;
  }

  processOutput(output: any): any {
    const config = this.getConfig();
    
    // Apply custom output processing if defined
    if (config.processOutput) {
      output = config.processOutput(output);
    }

    // Map output fields according to configuration
    const processed: Record<string, any> = {};
    for (const [resultKey, outputKey] of Object.entries(config.outputMapping)) {
      processed[resultKey] = output[outputKey];
    }

    return processed;
  }

  getDefaultParams(): Record<string, any> {
    return { ...this.getConfig().defaultParams };
  }

  getVersion(): string {
    return this.getConfig().version;
  }
} 