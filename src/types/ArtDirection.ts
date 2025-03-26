/// <reference path="./StyleConfig.ts" />
import { StyleConfig } from './StyleConfig.js';

export interface ModelConfig {
  prompt_prefix: string;
  prompt_suffix: string;
  negative_prompt: string;
  num_inference_steps: number;
  guidance_scale: number;
}

export interface ArtDirection {
  styleEmphasis?: string[];
  visualElements?: string[];
  colorPalette?: string[];
  compositionGuidelines?: string[];
  moodAndTone?: string;
  references?: string[];
  avoidElements?: string[];
  modelConfig?: StyleConfig;

  // Enhanced Context Awareness
  historicalContext?: {
    period: string;
    movement: string;
    influences: string[];
    keyWorks: string[];
    innovations: string[];
  };

  culturalContext?: {
    socialInfluences: string[];
    contemporaryEvents: string[];
    culturalMovements: string[];
    geographicalContext: string;
    societalImpact: string[];
  };

  technicalContext?: {
    materials: string[];
    techniques: string[];
    workingMethods: string[];
    innovations: string[];
    limitations: string[];
    toolsUsed: string[];
  };

  philosophicalContext?: {
    beliefs: string[];
    theories: string[];
    manifestos: string[];
    conceptualFrameworks: string[];
    intellectualInfluences: string[];
  };

  evolutionaryContext?: {
    earlyPeriod: {
      characteristics: string[];
      influences: string[];
      keyWorks: string[];
    };
    maturePeriod: {
      characteristics: string[];
      innovations: string[];
      masterWorks: string[];
    };
    latePeriod: {
      characteristics: string[];
      developments: string[];
      finalWorks: string[];
    };
    transitions: {
      from: string;
      to: string;
      catalysts: string[];
      significance: string;
    }[];
  };

  // Margritte-specific Contexts
  MargritteContext?: {
    philosophicalFramework: {
      beliefs: string[];
      theories: string[];
      conceptualFrameworks: string[];
      paradoxes: string[];
      visualDialectics: string[];
    };
    visualCategories: {
      category: 'object_displacement' | 'window_paradox' | 'scale_distortion' | 
                'time_paradox' | 'identity_concealment' | 'word_image_paradox' | 
                'metamorphosis' | 'spatial_illusion' | 'mirror_paradox' | 'object_multiplication';
      characteristics: string[];
      keyElements: string[];
      technicalRequirements: string[];
    }[];
    technicalExecution: {
      renderingTechniques: string[];
      materialPreparation: string[];
      workingMethodology: string[];
      qualityMetrics: string[];
    };
    creativeMetrics: {
      metaphysicalDepth: {
        philosophicalResonance: number;
        conceptualComplexity: number;
        paradoxicalImpact: number;
      };
      technicalExecution: {
        objectPrecision: number;
        edgeControl: number;
        perspectiveAccuracy: number;
      };
      compositionBalance: {
        spatialHarmony: number;
        objectPlacement: number;
        scaleRelationships: number;
      };
      symbolicPower: {
        objectSymbolism: number;
        narrativeDepth: number;
        metaphoricalResonance: number;
      };
    };
  };

  styles?: {
    [key: string]: ArtDirection;
  };
  defaultStyle?: string;
} 