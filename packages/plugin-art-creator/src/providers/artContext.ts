import { Provider, ServiceType } from '@elizaos/core';
import { ArtworkMemory, CreativeState } from '../types';
import { StyleService } from '../services/style';
import { CreativeEngine } from '../services/CreativeEngine';

export const artContextProvider: Provider = {
  async get(runtime) {
    const styleService = runtime.getService(ServiceType.TEXT_GENERATION) as StyleService;
    const creativeEngine = runtime.getService(ServiceType.TEXT_GENERATION) as CreativeEngine;
    
    // Get recent artworks (last 5 completed works)
    const recentWorks = creativeEngine.getRecentWorks(5);
    
    // Get style preferences
    const stylePreferences = creativeEngine.getStylePreferences();

    // Analyze recent works
    const recentAnalysis = await Promise.all(
      recentWorks.map(async (work: ArtworkMemory) => ({
        style: work.idea.style,
        analysis: await styleService.analyzeStyle({ name: work.idea.style } as any)
      }))
    );

    return {
      recentWorks,
      stylePreferences,
      recentAnalysis,
      explorationRate: creativeEngine.getExplorationRate()
    };
  }
}; 