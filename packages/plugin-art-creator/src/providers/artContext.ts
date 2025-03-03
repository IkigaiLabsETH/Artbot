import { Provider, ServiceType } from '@elizaos/core';
import { ArtworkMemory, CreativeState } from '../types';
import { StyleService } from '../services/style';

export const artContextProvider: Provider = {
  async get(runtime) {
    const styleService = runtime.getService(ServiceType.TEXT_GENERATION) as StyleService;
    const creativeEngine = runtime.getService(ServiceType.TEXT_GENERATION);
    
    // Get current creative state
    const state = creativeEngine.getState() as CreativeState;
    
    // Get recent artworks
    const recentWorks = state.completedWorks.slice(-5);
    
    // Get style preferences
    const stylePreferences = Object.entries(state.stylePreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([style]) => style);

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
      explorationRate: state.explorationRate
    };
  }
}; 