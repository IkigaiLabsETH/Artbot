import { Provider, ServiceType, Service } from "@elizaos/core";
import { ArtworkFeedback } from "../types";
import { SocialContextService, CulturalTrend, AudienceFeedback, CommunityInsight } from "../services/social";

interface TrendMetrics {
  positiveRatio: number;
  engagementRate: number;
  viralityScore: number;
}

interface FeedbackMetrics {
  averageRating: number;
  totalFeedback: number;
  sentimentScore: number;
}

// Import the singleton instance directly
import socialContextService from "../services/social";

export const socialContextProvider: Provider = {
  async get(runtime) {
    // Use the singleton instance directly
    const socialService = socialContextService;

    try {
      // Get trending topics
      const trendingTopics: CulturalTrend[] = await socialService.getTrendingTopics();
      const artTrends: CulturalTrend[] = await socialService.getArtTrends();
      
      // Get community insights
      const communityInsights: CommunityInsight[] = await socialService.getCommunityInsights(3);
      
      // Calculate trend metrics
      const trends: TrendMetrics = calculateTrendMetrics(trendingTopics);

      // Get recent feedback (placeholder for now)
      const recentFeedback: ArtworkFeedback[] = []; // TODO: Implement feedback retrieval
      
      // Calculate feedback metrics
      const feedback: FeedbackMetrics = {
        averageRating: 4.2, // Placeholder
        totalFeedback: recentFeedback.length,
        sentimentScore: calculateSentimentScore(trendingTopics)
      };

      return {
        trends,
        feedback,
        recentFeedback,
        trendingTopics: trendingTopics.slice(0, 5),
        artTrends: artTrends.slice(0, 3),
        communityInsights,
        socialInfluence: (trends.viralityScore + feedback.sentimentScore) / 2
      };
    } catch (error) {
      console.error("Error getting social context:", error);
      return getPlaceholderData();
    }
  }
};

function calculateTrendMetrics(trends: CulturalTrend[]): TrendMetrics {
  if (!trends.length) {
    return {
      positiveRatio: 0.5,
      engagementRate: 0.1,
      viralityScore: 0.3
    };
  }

  // Calculate positive ratio (average sentiment)
  const positiveRatio = trends.reduce((sum, trend) => sum + trend.sentiment, 0) / trends.length;
  
  // Calculate engagement rate (average volume normalized to 0-1)
  const maxVolume = Math.max(...trends.map(trend => trend.volume));
  const engagementRate = trends.reduce((sum, trend) => sum + trend.volume / maxVolume, 0) / trends.length;
  
  // Calculate virality score (average momentum)
  const viralityScore = trends.reduce((sum, trend) => sum + trend.momentum, 0) / trends.length;
  
  return {
    positiveRatio,
    engagementRate,
    viralityScore
  };
}

function calculateSentimentScore(trends: CulturalTrend[]): number {
  if (!trends.length) return 0.5;
  
  // Weight art-related trends more heavily
  const artTrends = trends.filter(trend => 
    trend.category === 'art' || 
    trend.relatedTerms.some(term => ['art', 'design', 'creative', 'visual', 'aesthetic'].includes(term))
  );
  
  if (artTrends.length) {
    return artTrends.reduce((sum, trend) => sum + trend.sentiment, 0) / artTrends.length;
  }
  
  return trends.reduce((sum, trend) => sum + trend.sentiment, 0) / trends.length;
}

function getPlaceholderData() {
  // Placeholder data when service is unavailable
  return {
    trends: {
      positiveRatio: 0.8,
      engagementRate: 0.15,
      viralityScore: 0.6
    },
    feedback: {
      averageRating: 4.2,
      totalFeedback: 0,
      sentimentScore: 0.75
    },
    recentFeedback: [],
    trendingTopics: [],
    artTrends: [],
    communityInsights: [],
    socialInfluence: 0.675
  };
} 