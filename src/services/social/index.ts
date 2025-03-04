import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AIService, AIMessage } from '../ai/index.js';
import { MemorySystem, MemoryType } from '../memory/index.js';

// Types of social platforms
export enum SocialPlatform {
  TWITTER = 'twitter',
  INSTAGRAM = 'instagram',
  DISCORD = 'discord',
  REDDIT = 'reddit',
  CUSTOM = 'custom'
}

// Types of social feedback
export enum FeedbackType {
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
  SAVE = 'save',
  AWARD = 'award',
  CRITIQUE = 'critique'
}

// Sentiment of feedback
export enum FeedbackSentiment {
  VERY_NEGATIVE = -2,
  NEGATIVE = -1,
  NEUTRAL = 0,
  POSITIVE = 1,
  VERY_POSITIVE = 2
}

// Interface for social feedback
export interface SocialFeedback {
  id: string;
  artworkId: string;
  platform: SocialPlatform;
  type: FeedbackType;
  content?: string; // Text content for comments, critiques
  sentiment?: FeedbackSentiment;
  userId?: string; // ID of the user who provided feedback
  username?: string; // Username of the user who provided feedback
  timestamp: Date;
  metadata?: Record<string, any>; // Additional platform-specific metadata
  processed: boolean; // Whether this feedback has been processed
  tags?: string[]; // Extracted tags/themes from the feedback
}

// Interface for trend data
export interface SocialTrend {
  id: string;
  name: string;
  description: string;
  platform: SocialPlatform;
  strength: number; // 0-1 indicating how strong the trend is
  timestamp: Date;
  relatedTags: string[];
  metadata?: Record<string, any>;
}

// Interface for audience data
export interface AudienceInsight {
  id: string;
  type: string; // demographic, interest, behavior, etc.
  description: string;
  confidence: number; // 0-1 indicating confidence in this insight
  timestamp: Date;
  source: SocialPlatform[];
  metadata?: Record<string, any>;
}

// Configuration for the social engagement service
export interface SocialEngagementConfig {
  baseDir?: string;
  aiService?: AIService;
  memorySystem?: MemorySystem;
  platforms?: SocialPlatform[];
  feedbackThreshold?: number; // Minimum amount of feedback before processing
  trendUpdateInterval?: number; // How often to update trends (in ms)
  autonomyLevel?: number; // 0-1 indicating how much the feedback influences decisions
}

/**
 * SocialEngagementService manages social interactions, feedback processing,
 * and cultural trend analysis to inform the creative process while
 * maintaining artistic independence.
 */
export class SocialEngagementService {
  private feedback: SocialFeedback[] = [];
  private trends: SocialTrend[] = [];
  private audienceInsights: AudienceInsight[] = [];
  private baseDir: string;
  private aiService: AIService;
  private memorySystem: MemorySystem;
  private platforms: SocialPlatform[];
  private feedbackThreshold: number;
  private trendUpdateInterval: number;
  private autonomyLevel: number;
  private lastTrendUpdate: Date = new Date();
  private socialDir: string;
  private feedbackDir: string;
  private trendsDir: string;
  private insightsDir: string;

  constructor(config: SocialEngagementConfig = {}) {
    this.baseDir = config.baseDir || process.cwd();
    this.aiService = config.aiService;
    this.memorySystem = config.memorySystem;
    this.platforms = config.platforms || [SocialPlatform.TWITTER, SocialPlatform.INSTAGRAM];
    this.feedbackThreshold = config.feedbackThreshold || 5;
    this.trendUpdateInterval = config.trendUpdateInterval || 24 * 60 * 60 * 1000; // Default: once a day
    this.autonomyLevel = config.autonomyLevel !== undefined ? config.autonomyLevel : 0.7; // Default: high autonomy
    
    this.socialDir = path.join(this.baseDir, '.artbot', 'social');
    this.feedbackDir = path.join(this.socialDir, 'feedback');
    this.trendsDir = path.join(this.socialDir, 'trends');
    this.insightsDir = path.join(this.socialDir, 'insights');
  }

  /**
   * Initialize the social engagement service
   */
  async initialize(): Promise<void> {
    // Create directories if they don't exist
    await fs.mkdir(this.socialDir, { recursive: true });
    await fs.mkdir(this.feedbackDir, { recursive: true });
    await fs.mkdir(this.trendsDir, { recursive: true });
    await fs.mkdir(this.insightsDir, { recursive: true });

    // Load existing data
    await this.loadFeedback();
    await this.loadTrends();
    await this.loadInsights();

    console.log(`Social engagement service initialized with autonomy level: ${this.autonomyLevel}`);
  }

  /**
   * Record new social feedback
   */
  async recordFeedback(feedback: Omit<SocialFeedback, 'id' | 'timestamp' | 'processed' | 'tags'>): Promise<SocialFeedback> {
    const newFeedback: SocialFeedback = {
      id: uuidv4(),
      timestamp: new Date(),
      processed: false,
      tags: [],
      ...feedback
    };

    this.feedback.push(newFeedback);
    await this.saveFeedback(newFeedback);

    // Process feedback if we've reached the threshold
    const unprocessedFeedback = this.feedback.filter(f => !f.processed && f.artworkId === feedback.artworkId);
    if (unprocessedFeedback.length >= this.feedbackThreshold) {
      await this.processFeedbackBatch(unprocessedFeedback);
    }

    return newFeedback;
  }

  /**
   * Process a batch of feedback to extract insights
   */
  private async processFeedbackBatch(feedbackBatch: SocialFeedback[]): Promise<void> {
    if (!this.aiService) {
      console.warn('AI service not available, skipping feedback processing');
      return;
    }

    // Group feedback by artwork
    const feedbackByArtwork = new Map<string, SocialFeedback[]>();
    for (const feedback of feedbackBatch) {
      if (!feedbackByArtwork.has(feedback.artworkId)) {
        feedbackByArtwork.set(feedback.artworkId, []);
      }
      feedbackByArtwork.get(feedback.artworkId).push(feedback);
    }

    // Process each artwork's feedback
    for (const [artworkId, artworkFeedback] of feedbackByArtwork.entries()) {
      // Analyze sentiment and extract themes
      const feedbackAnalysis = await this.analyzeFeedback(artworkFeedback);
      
      // Store insights in memory
      if (this.memorySystem) {
        const content = {
          artworkId,
          feedback: artworkFeedback,
          analysis: feedbackAnalysis
        };
        
        const metadata = {
          source: 'social_engagement',
          timestamp: new Date(),
          sentimentScore: feedbackAnalysis.overallSentiment,
          tags: feedbackAnalysis.themes
        };
        
        const tags = ['feedback', ...feedbackAnalysis.themes];
        
        await this.memorySystem.storeMemory(
          content,
          MemoryType.FEEDBACK,
          metadata,
          tags
        );
      }

      // Update audience insights based on feedback
      await this.updateAudienceInsights(artworkFeedback, feedbackAnalysis);

      // Mark feedback as processed
      for (const feedback of artworkFeedback) {
        feedback.processed = true;
        feedback.tags = feedbackAnalysis.themes;
        await this.saveFeedback(feedback);
      }
    }

    // Check if we should update trends
    const now = new Date();
    if (now.getTime() - this.lastTrendUpdate.getTime() > this.trendUpdateInterval) {
      await this.updateTrends();
      this.lastTrendUpdate = now;
    }
  }

  /**
   * Analyze feedback to extract sentiment and themes
   */
  private async analyzeFeedback(feedbackItems: SocialFeedback[]): Promise<{
    overallSentiment: number;
    themes: string[];
    keyInsights: string[];
    controversialAspects: string[];
  }> {
    // Prepare feedback for analysis
    const feedbackTexts = feedbackItems
      .filter(f => f.content)
      .map(f => `${f.type.toUpperCase()}: ${f.content}`);
    
    // If no text content, analyze based on feedback types
    if (feedbackTexts.length === 0) {
      const likesCount = feedbackItems.filter(f => f.type === FeedbackType.LIKE).length;
      const sharesCount = feedbackItems.filter(f => f.type === FeedbackType.SHARE).length;
      const savesCount = feedbackItems.filter(f => f.type === FeedbackType.SAVE).length;
      
      // Simple sentiment calculation based on engagement metrics
      const totalItems = feedbackItems.length;
      const engagementScore = (likesCount + sharesCount * 2 + savesCount * 1.5) / totalItems;
      
      return {
        overallSentiment: Math.min(Math.max(engagementScore - 0.5, -1), 1), // Normalize to -1 to 1
        themes: [],
        keyInsights: [`Received ${totalItems} engagements with ${likesCount} likes, ${sharesCount} shares, and ${savesCount} saves`],
        controversialAspects: []
      };
    }

    // Use AI to analyze feedback with text content
    const messages: AIMessage[] = [
      {
        role: 'system' as const,
        content: `Analyze social media feedback for an artwork. 
        Extract the overall sentiment, key themes, important insights, and any controversial aspects.
        Maintain artistic independence by focusing on patterns rather than specific instructions.
        Provide your analysis in JSON format.`
      },
      {
        role: 'user' as const,
        content: `FEEDBACK:\n${feedbackTexts.join('\n')}`
      }
    ];

    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.3,
        maxTokens: 500
      });

      const analysis = JSON.parse(response.content);
      return {
        overallSentiment: analysis.overallSentiment || 0,
        themes: analysis.themes || [],
        keyInsights: analysis.keyInsights || [],
        controversialAspects: analysis.controversialAspects || []
      };
    } catch (error) {
      console.error('Error analyzing feedback:', error);
      return {
        overallSentiment: 0,
        themes: [],
        keyInsights: [],
        controversialAspects: []
      };
    }
  }

  /**
   * Update audience insights based on feedback
   */
  private async updateAudienceInsights(
    feedbackItems: SocialFeedback[],
    analysis: { overallSentiment: number; themes: string[]; keyInsights: string[]; controversialAspects: string[] }
  ): Promise<void> {
    if (!this.aiService) return;

    // Extract usernames for audience analysis
    const usernames = feedbackItems
      .filter(f => f.username)
      .map(f => f.username);
    
    if (usernames.length === 0) return;

    // Use AI to generate audience insights
    const messages: AIMessage[] = [
      {
        role: 'system' as const,
        content: `Based on social media usernames and their feedback themes,
        generate insights about the audience engaging with the artwork.
        Focus on patterns and preferences, not individual users.
        Provide 2-3 audience insights in JSON format.`
      },
      {
        role: 'user' as const,
        content: `USERNAMES: ${usernames.join(', ')}
        FEEDBACK THEMES: ${analysis.themes.join(', ')}
        KEY INSIGHTS: ${analysis.keyInsights.join(', ')}`
      }
    ];

    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.4,
        maxTokens: 500
      });

      const insights = JSON.parse(response.content);
      if (Array.isArray(insights)) {
        for (const insight of insights) {
          const newInsight: AudienceInsight = {
            id: uuidv4(),
            type: insight.type,
            description: insight.description,
            confidence: insight.confidence,
            timestamp: new Date(),
            source: feedbackItems.map(f => f.platform).filter((v, i, a) => a.indexOf(v) === i),
            metadata: {
              relatedThemes: insight.relatedThemes,
              userCount: usernames.length,
              feedbackCount: feedbackItems.length
            }
          };
          
          this.audienceInsights.push(newInsight);
          await this.saveInsight(newInsight);
        }
      }
    } catch (error) {
      console.error('Error generating audience insights:', error);
    }
  }

  /**
   * Update cultural trends based on recent feedback and external data
   */
  private async updateTrends(): Promise<void> {
    if (!this.aiService) return;

    // Get recent feedback (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentFeedback = this.feedback.filter(f => f.timestamp > oneWeekAgo);

    // Extract themes from recent feedback
    const themes = new Map<string, number>();
    for (const feedback of recentFeedback) {
      if (feedback.tags) {
        for (const tag of feedback.tags) {
          themes.set(tag, (themes.get(tag) || 0) + 1);
        }
      }
    }

    // Convert to array and sort by frequency
    const themeEntries = Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([theme, count]) => `${theme} (${count})`);

    // Use AI to identify trends
    const messages: AIMessage[] = [
      {
        role: 'system' as const,
        content: `Based on themes from recent artwork feedback,
        identify 3-5 cultural trends that could inspire future creative work.
        Focus on broader cultural movements rather than specific feedback.
        Provide the trends in JSON format.`
      },
      {
        role: 'user' as const,
        content: `RECENT THEMES: ${themeEntries.join(', ')}`
      }
    ];

    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.6,
        maxTokens: 800
      });

      const trendData = JSON.parse(response.content);
      if (Array.isArray(trendData)) {
        // Clear old trends
        this.trends = [];
        
        // Add new trends
        for (const trend of trendData) {
          const newTrend: SocialTrend = {
            id: uuidv4(),
            name: trend.name,
            description: trend.description,
            platform: SocialPlatform.CUSTOM, // Derived from multiple platforms
            strength: trend.strength,
            timestamp: new Date(),
            relatedTags: trend.relatedTags,
            metadata: {
              source: 'ai_analysis',
              basedOn: themeEntries
            }
          };
          
          this.trends.push(newTrend);
          await this.saveTrend(newTrend);
        }
      }
    } catch (error) {
      console.error('Error updating trends:', error);
    }
  }

  /**
   * Get creative inspiration based on social feedback and trends
   * while maintaining artistic independence
   */
  async getCreativeInspiration(
    context: { currentStyle?: string; currentThemes?: string[] } = {}
  ): Promise<{
    inspirationText: string;
    sourceTrends: SocialTrend[];
    audienceInsights: AudienceInsight[];
    autonomyFactor: number;
  }> {
    // Select relevant trends
    const relevantTrends = this.trends
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3);
    
    // Select relevant audience insights
    const relevantInsights = this.audienceInsights
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
    
    if (!this.aiService || (relevantTrends.length === 0 && relevantInsights.length === 0)) {
      return {
        inspirationText: "Explore your own creative direction.",
        sourceTrends: [],
        audienceInsights: [],
        autonomyFactor: this.autonomyLevel
      };
    }

    // Prepare context for inspiration generation
    const currentStyle = context.currentStyle || "No specific style";
    const currentThemes = context.currentThemes || [];
    
    // Calculate autonomy factor with some randomness
    const autonomyVariation = Math.random() * 0.2 - 0.1; // -0.1 to +0.1
    const autonomyFactor = Math.min(Math.max(this.autonomyLevel + autonomyVariation, 0.1), 0.9);
    
    // Generate inspiration text
    const messages: AIMessage[] = [
      {
        role: 'system' as const,
        content: `As an autonomous AI artist, generate creative inspiration based on social trends and audience insights.
        Maintain artistic independence (${(autonomyFactor * 100).toFixed(0)}% autonomy level) by using these as contextual inspiration rather than direct instructions.`
      },
      {
        role: 'user' as const,
        content: `CURRENT STYLE: ${currentStyle}
        CURRENT THEMES: ${currentThemes.join(', ')}
        
        CULTURAL TRENDS:
        ${relevantTrends.map(t => `- ${t.name}: ${t.description}`).join('\n')}
        
        AUDIENCE INSIGHTS:
        ${relevantInsights.map(i => `- ${i.type}: ${i.description}`).join('\n')}
        
        Provide a paragraph of creative inspiration that maintains your artistic voice while being informed by these social contexts.
        Focus on themes, emotions, and conceptual directions rather than specific techniques or subjects.`
      }
    ];

    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7,
        maxTokens: 300
      });

      return {
        inspirationText: response.content,
        sourceTrends: relevantTrends,
        audienceInsights: relevantInsights,
        autonomyFactor
      };
    } catch (error) {
      console.error('Error generating creative inspiration:', error);
      return {
        inspirationText: "Explore your own creative direction, free from external influences.",
        sourceTrends: [],
        audienceInsights: [],
        autonomyFactor: this.autonomyLevel
      };
    }
  }

  /**
   * Get current cultural trends
   */
  getTrends(): SocialTrend[] {
    return [...this.trends].sort((a, b) => b.strength - a.strength);
  }

  /**
   * Get audience insights
   */
  getAudienceInsights(): AudienceInsight[] {
    return [...this.audienceInsights].sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get feedback for a specific artwork
   */
  getFeedbackForArtwork(artworkId: string): SocialFeedback[] {
    return this.feedback.filter(f => f.artworkId === artworkId);
  }

  /**
   * Generate a social engagement report
   */
  generateSocialReport(): Record<string, any> {
    // Count feedback by type
    const feedbackByType = new Map<FeedbackType, number>();
    for (const feedback of this.feedback) {
      feedbackByType.set(feedback.type, (feedbackByType.get(feedback.type) || 0) + 1);
    }

    // Count feedback by platform
    const feedbackByPlatform = new Map<SocialPlatform, number>();
    for (const feedback of this.feedback) {
      feedbackByPlatform.set(feedback.platform, (feedbackByPlatform.get(feedback.platform) || 0) + 1);
    }

    // Calculate average sentiment
    const sentiments = this.feedback
      .filter(f => f.sentiment !== undefined)
      .map(f => f.sentiment);
    
    const averageSentiment = sentiments.length > 0
      ? sentiments.reduce((sum, val) => sum + val, 0) / sentiments.length
      : 0;

    return {
      totalFeedback: this.feedback.length,
      feedbackByType: Object.fromEntries(feedbackByType),
      feedbackByPlatform: Object.fromEntries(feedbackByPlatform),
      averageSentiment,
      trendCount: this.trends.length,
      topTrends: this.trends.slice(0, 5).map(t => ({
        name: t.name,
        strength: t.strength
      })),
      insightCount: this.audienceInsights.length,
      autonomyLevel: this.autonomyLevel,
      lastTrendUpdate: this.lastTrendUpdate
    };
  }

  /**
   * Load feedback from disk
   */
  private async loadFeedback(): Promise<void> {
    try {
      const files = await fs.readdir(this.feedbackDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.feedbackDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const feedback = JSON.parse(data) as SocialFeedback;
          feedback.timestamp = new Date(feedback.timestamp);
          this.feedback.push(feedback);
        }
      }
      console.log(`Loaded ${this.feedback.length} feedback items`);
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  }

  /**
   * Load trends from disk
   */
  private async loadTrends(): Promise<void> {
    try {
      const files = await fs.readdir(this.trendsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.trendsDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const trend = JSON.parse(data) as SocialTrend;
          trend.timestamp = new Date(trend.timestamp);
          this.trends.push(trend);
        }
      }
      console.log(`Loaded ${this.trends.length} trends`);
    } catch (error) {
      console.error('Error loading trends:', error);
    }
  }

  /**
   * Load audience insights from disk
   */
  private async loadInsights(): Promise<void> {
    try {
      const files = await fs.readdir(this.insightsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.insightsDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const insight = JSON.parse(data) as AudienceInsight;
          insight.timestamp = new Date(insight.timestamp);
          this.audienceInsights.push(insight);
        }
      }
      console.log(`Loaded ${this.audienceInsights.length} audience insights`);
    } catch (error) {
      console.error('Error loading audience insights:', error);
    }
  }

  /**
   * Save feedback to disk
   */
  private async saveFeedback(feedback: SocialFeedback): Promise<void> {
    try {
      const filePath = path.join(this.feedbackDir, `${feedback.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(feedback, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  }

  /**
   * Save trend to disk
   */
  private async saveTrend(trend: SocialTrend): Promise<void> {
    try {
      const filePath = path.join(this.trendsDir, `${trend.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(trend, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving trend:', error);
    }
  }

  /**
   * Save audience insight to disk
   */
  private async saveInsight(insight: AudienceInsight): Promise<void> {
    try {
      const filePath = path.join(this.insightsDir, `${insight.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(insight, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving audience insight:', error);
    }
  }
} 