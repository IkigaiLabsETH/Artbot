import dotenv from 'dotenv';
import { SocialEngagementService, SocialPlatform, FeedbackType, FeedbackSentiment } from './services/social/index.js';
import { AIService } from './services/ai/index.js';
import { MemorySystem } from './services/memory/index.js';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Mock artwork data
const mockArtworks = [
  {
    id: uuidv4(),
    title: 'Cosmic Garden',
    description: 'A vibrant garden with cosmic elements',
    imageUrl: 'https://example.com/cosmic-garden.jpg'
  },
  {
    id: uuidv4(),
    title: 'Digital Dreams',
    description: 'Abstract digital landscape with neon elements',
    imageUrl: 'https://example.com/digital-dreams.jpg'
  }
];

// Mock feedback data
const mockFeedback = [
  // Positive feedback for Cosmic Garden
  {
    artworkId: mockArtworks[0].id,
    platform: SocialPlatform.TWITTER,
    type: FeedbackType.COMMENT,
    content: 'Love the vibrant colors in this piece!',
    sentiment: FeedbackSentiment.POSITIVE,
    userId: uuidv4(),
    username: 'artlover42'
  },
  {
    artworkId: mockArtworks[0].id,
    platform: SocialPlatform.INSTAGRAM,
    type: FeedbackType.LIKE,
    sentiment: FeedbackSentiment.POSITIVE,
    userId: uuidv4(),
    username: 'creative_mind'
  },
  {
    artworkId: mockArtworks[0].id,
    platform: SocialPlatform.TWITTER,
    type: FeedbackType.SHARE,
    sentiment: FeedbackSentiment.POSITIVE,
    userId: uuidv4(),
    username: 'digital_dreamer'
  },
  {
    artworkId: mockArtworks[0].id,
    platform: SocialPlatform.DISCORD,
    type: FeedbackType.COMMENT,
    content: 'The composition is absolutely stunning.',
    sentiment: FeedbackSentiment.POSITIVE,
    userId: uuidv4(),
    username: 'abstract_thinker'
  },
  // Constructive feedback for Cosmic Garden
  {
    artworkId: mockArtworks[0].id,
    platform: SocialPlatform.REDDIT,
    type: FeedbackType.COMMENT,
    content: 'The color palette feels a bit overwhelming in some areas.',
    sentiment: FeedbackSentiment.NEUTRAL,
    userId: uuidv4(),
    username: 'color_explorer'
  },
  // Thematic comments about color theory
  {
    artworkId: mockArtworks[0].id,
    platform: SocialPlatform.TWITTER,
    type: FeedbackType.COMMENT,
    content: 'The use of complementary colors creates a fascinating tension in this piece.',
    sentiment: FeedbackSentiment.POSITIVE,
    userId: uuidv4(),
    username: 'color_theory_expert'
  },
  {
    artworkId: mockArtworks[0].id,
    platform: SocialPlatform.INSTAGRAM,
    type: FeedbackType.COMMENT,
    content: 'I see influences of both digital art movements and traditional color field painting here.',
    sentiment: FeedbackSentiment.POSITIVE,
    userId: uuidv4(),
    username: 'art_historian'
  },
  // Feedback for Digital Dreams
  {
    artworkId: mockArtworks[1].id,
    platform: SocialPlatform.TWITTER,
    type: FeedbackType.LIKE,
    sentiment: FeedbackSentiment.POSITIVE,
    userId: uuidv4(),
    username: 'tech_artist'
  },
  {
    artworkId: mockArtworks[1].id,
    platform: SocialPlatform.INSTAGRAM,
    type: FeedbackType.COMMENT,
    content: 'This evokes such a powerful emotional response.',
    sentiment: FeedbackSentiment.POSITIVE,
    userId: uuidv4(),
    username: 'future_vision'
  },
  {
    artworkId: mockArtworks[1].id,
    platform: SocialPlatform.DISCORD,
    type: FeedbackType.COMMENT,
    content: "I'm fascinated by the contrast between organic and digital elements.",
    sentiment: FeedbackSentiment.POSITIVE,
    userId: uuidv4(),
    username: 'pattern_seeker'
  }
];

async function runDemo() {
  console.log('Starting Social Engagement Demo...');
  console.log('===================================\n');
  
  // Initialize services
  const aiService = new AIService({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.DEFAULT_MODEL || 'claude-3-sonnet-20240229'
  });
  
  const memorySystem = new MemorySystem({
    baseDir: process.cwd()
  });
  
  await memorySystem.initialize();
  
  const socialService = new SocialEngagementService({
    baseDir: process.cwd(),
    aiService,
    memorySystem,
    feedbackThreshold: 3, // Lower threshold for demo purposes
    autonomyLevel: 0.7
  });
  
  await socialService.initialize();
  
  console.log('Services initialized successfully.\n');
  
  // Step 1: Record feedback for artworks
  console.log('Step 1: Recording social feedback for artworks...');
  
  for (const feedback of mockFeedback) {
    await socialService.recordFeedback(feedback);
    process.stdout.write('.');
  }
  
  console.log('\nAll feedback recorded successfully.\n');
  
  // Step 2: Get social report
  console.log('Step 2: Generating social engagement report...');
  const socialReport = socialService.generateSocialReport();
  
  console.log('\nSocial Engagement Report:');
  console.log('------------------------');
  console.log(`Total Feedback: ${socialReport.totalFeedback}`);
  console.log('Feedback by Type:');
  for (const [type, count] of Object.entries(socialReport.feedbackByType)) {
    console.log(`  - ${type}: ${count}`);
  }
  
  console.log(`Average Sentiment: ${socialReport.averageSentiment.toFixed(2)}`);
  console.log(`Trend Count: ${socialReport.trendCount}`);
  console.log(`Insight Count: ${socialReport.insightCount}`);
  console.log(`Autonomy Level: ${socialReport.autonomyLevel.toFixed(2)}`);
  console.log('');
  
  // Step 3: Get creative inspiration
  console.log('Step 3: Getting creative inspiration from social context...');
  
  const inspiration = await socialService.getCreativeInspiration({
    currentStyle: 'Digital Abstract',
    currentThemes: ['cosmic', 'nature', 'technology']
  });
  
  console.log('\nCreative Inspiration:');
  console.log('--------------------');
  console.log(inspiration.inspirationText);
  console.log('');
  
  console.log(`Autonomy Factor: ${inspiration.autonomyFactor.toFixed(2)}`);
  console.log('');
  
  if (inspiration.sourceTrends.length > 0) {
    console.log('Source Trends:');
    for (const trend of inspiration.sourceTrends) {
      console.log(`  - ${trend.name}: ${trend.description.substring(0, 100)}...`);
    }
    console.log('');
  }
  
  if (inspiration.audienceInsights.length > 0) {
    console.log('Audience Insights:');
    for (const insight of inspiration.audienceInsights) {
      console.log(`  - ${insight.type}: ${insight.description.substring(0, 100)}...`);
    }
    console.log('');
  }
  
  // Step 4: Demonstrate artistic independence
  console.log('Step 4: Demonstrating artistic independence...');
  
  // Generate multiple inspirations to show variation in autonomy
  console.log('\nGenerating multiple inspirations with varying autonomy levels:');
  
  for (let i = 0; i < 3; i++) {
    const variedInspiration = await socialService.getCreativeInspiration({
      currentStyle: 'Surrealist',
      currentThemes: ['dreams', 'memory', 'ocean']
    });
    
    console.log(`\nInspiration ${i+1} (Autonomy: ${variedInspiration.autonomyFactor.toFixed(2)}):`);
    console.log(variedInspiration.inspirationText);
  }
  
  console.log('\nSocial Engagement Demo completed successfully!');
  console.log('This demonstrates how ArtBot can absorb social feedback as contextual inspiration');
  console.log('while maintaining artistic independence in the creative process.');
}

// Run the demo
runDemo().catch(error => {
  console.error('Error running demo:', error);
}); 