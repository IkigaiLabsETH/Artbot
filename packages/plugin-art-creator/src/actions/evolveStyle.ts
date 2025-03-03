import { Action, ServiceType } from '@elizaos/core';
import { StyleService } from '../services/style';
import { Style } from '../types/social';

export interface EvolveStyleParams {
  styleId: string;
  mutationRate?: number;
  preserveTraits?: string[];
}

export const evolveStyle = {
  name: 'evolve-style',
  description: 'Evolve an existing style into a new variation',
  
  async execute({ styleId, mutationRate = 0.2, preserveTraits = [] }, { runtime }) {
    const styleService = runtime.getService(ServiceType.TEXT_GENERATION) as StyleService;
    
    // Get base style
    const baseStyle = await styleService.getStyle(styleId);
    if (!baseStyle) {
      throw new Error(`Style not found: ${styleId}`);
    }

    // Analyze current style
    const analysis = await styleService.analyzeStyle(baseStyle);
    
    // Generate variations
    const variations = await styleService.generateVariations(
      baseStyle,
      4, // number of variations
      mutationRate
    );

    // Select best variation based on analysis and preserved traits
    const selectedVariation = await styleService.selectBestVariation(
      variations,
      analysis,
      preserveTraits
    );

    // Save and return evolved style
    return styleService.saveStyle({
      ...selectedVariation,
      name: `${baseStyle.name} (Evolved)`,
      creator: baseStyle.creator,
      version: baseStyle.version + 1,
      modified: new Date()
    });
  }
}; 