import { CreativeEngine } from '../services/CreativeEngine.js';
import { StyleService } from '../services/style/index.js';

export const artContextProvider = {
  async get() {
    // Create instances of services
    const creativeEngine = new CreativeEngine();
    const styleService = new StyleService();
    
    // Initialize services
    await creativeEngine.initialize();
    await styleService.initialize();

    // Get recent artworks
    const recentWorks = creativeEngine.getRecentWorks(5);

    // Get style preferences
    const stylePreferences = creativeEngine.getStylePreferences();

    // Analyze recent works
    const recentWorkAnalyses = await Promise.all(
      recentWorks.map(async (work) => {
        // Here we would normally analyze the work's style
        // For now, we'll return a placeholder
        return {
          id: work.id,
          style: work.style || 'Unknown',
          elements: work.elements || [],
          metrics: {
            coherence: 0.8,
            stability: 0.7,
            compatibility: 0.9
          }
        };
      })
    );

    // Get exploration rate
    const explorationRate = creativeEngine.getExplorationRate();

    return {
      recentWorks,
      stylePreferences,
      recentWorkAnalyses,
      explorationRate
    };
  }
}; 