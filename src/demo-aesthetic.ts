import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { AestheticJudgment } from './services/style/aesthetic.js';
import { StyleService } from './services/style/index.js';
import { CreativeEngine } from './services/CreativeEngine.js';
import { ReplicateService } from './services/replicate/index.js';

// Load environment variables
dotenv.config();

// Mock styles for demonstration
const mockStyles = [
  {
    id: uuidv4(),
    name: 'Vibrant Abstract',
    creator: 'ArtBot',
    parameters: {
      prompt: 'Vibrant abstract painting with bold geometric shapes and bright colors',
      negative_prompt: 'dull, monochrome, realistic',
      guidance_scale: 7.5,
      num_inference_steps: 50
    },
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: true,
    tags: ['abstract', 'vibrant', 'geometric', 'colorful']
  },
  {
    id: uuidv4(),
    name: 'Minimalist Landscape',
    creator: 'ArtBot',
    parameters: {
      prompt: 'Minimalist landscape with simple shapes and limited color palette',
      negative_prompt: 'detailed, complex, busy',
      guidance_scale: 7.0,
      num_inference_steps: 50
    },
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: true,
    tags: ['minimalist', 'landscape', 'simple', 'calm']
  },
  {
    id: uuidv4(),
    name: 'Surrealist Dream',
    creator: 'ArtBot',
    parameters: {
      prompt: 'Surrealist dreamscape with floating objects and impossible architecture',
      negative_prompt: 'realistic, ordinary, mundane',
      guidance_scale: 8.0,
      num_inference_steps: 50
    },
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: true,
    tags: ['surrealist', 'dreamlike', 'imaginative', 'strange']
  },
  {
    id: uuidv4(),
    name: 'Digital Glitch',
    creator: 'ArtBot',
    parameters: {
      prompt: 'Digital glitch art with distorted pixels and vibrant colors',
      negative_prompt: 'smooth, clean, realistic',
      guidance_scale: 7.5,
      num_inference_steps: 50
    },
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: true,
    tags: ['glitch', 'digital', 'distorted', 'vibrant']
  },
  {
    id: uuidv4(),
    name: 'Ethereal Portrait',
    creator: 'ArtBot',
    parameters: {
      prompt: 'Ethereal portrait with soft lighting and dreamy atmosphere',
      negative_prompt: 'harsh, realistic, detailed',
      guidance_scale: 7.0,
      num_inference_steps: 50
    },
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: true,
    tags: ['portrait', 'ethereal', 'dreamy', 'soft']
  },
  {
    id: uuidv4(),
    name: 'Cyberpunk City',
    creator: 'ArtBot',
    parameters: {
      prompt: 'Cyberpunk cityscape with neon lights and futuristic architecture',
      negative_prompt: 'natural, rural, historical',
      guidance_scale: 7.5,
      num_inference_steps: 50
    },
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: true,
    tags: ['cyberpunk', 'city', 'futuristic', 'neon']
  },
  {
    id: uuidv4(),
    name: 'Watercolor Nature',
    creator: 'ArtBot',
    parameters: {
      prompt: 'Watercolor painting of natural landscape with soft edges and flowing colors',
      negative_prompt: 'digital, sharp, defined',
      guidance_scale: 7.0,
      num_inference_steps: 50
    },
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: true,
    tags: ['watercolor', 'nature', 'soft', 'flowing']
  },
  {
    id: uuidv4(),
    name: 'Geometric Pattern',
    creator: 'ArtBot',
    parameters: {
      prompt: 'Geometric pattern with repeating shapes and bold colors',
      negative_prompt: 'organic, natural, random',
      guidance_scale: 7.5,
      num_inference_steps: 50
    },
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: true,
    tags: ['geometric', 'pattern', 'bold', 'repetitive']
  },
  {
    id: uuidv4(),
    name: 'Dark Fantasy',
    creator: 'ArtBot',
    parameters: {
      prompt: 'Dark fantasy scene with mysterious creatures and foggy atmosphere',
      negative_prompt: 'bright, cheerful, clear',
      guidance_scale: 8.0,
      num_inference_steps: 50
    },
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: true,
    tags: ['dark', 'fantasy', 'mysterious', 'foggy']
  },
  {
    id: uuidv4(),
    name: 'Pop Art Portrait',
    creator: 'ArtBot',
    parameters: {
      prompt: 'Pop art style portrait with bold colors and halftone patterns',
      negative_prompt: 'subtle, realistic, detailed',
      guidance_scale: 7.5,
      num_inference_steps: 50
    },
    version: 1,
    created: new Date(),
    modified: new Date(),
    isPublic: true,
    tags: ['pop art', 'portrait', 'bold', 'halftone']
  }
];

// Mock user feedback for demonstration
const mockFeedback = [
  { winner: 0, loser: 1 }, // Vibrant Abstract > Minimalist Landscape
  { winner: 2, loser: 3 }, // Surrealist Dream > Digital Glitch
  { winner: 0, loser: 4 }, // Vibrant Abstract > Ethereal Portrait
  { winner: 2, loser: 5 }, // Surrealist Dream > Cyberpunk City
  { winner: 6, loser: 7 }, // Watercolor Nature > Geometric Pattern
  { winner: 8, loser: 9 }, // Dark Fantasy > Pop Art Portrait
  { winner: 0, loser: 2 }, // Vibrant Abstract > Surrealist Dream
  { winner: 6, loser: 8 }, // Watercolor Nature > Dark Fantasy
  { winner: 0, loser: 6 }, // Vibrant Abstract > Watercolor Nature
  { winner: 3, loser: 5 }, // Digital Glitch > Cyberpunk City
  { winner: 4, loser: 7 }, // Ethereal Portrait > Geometric Pattern
  { winner: 1, loser: 9 }, // Minimalist Landscape > Pop Art Portrait
  { winner: 3, loser: 4 }, // Digital Glitch > Ethereal Portrait
  { winner: 1, loser: 8 }, // Minimalist Landscape > Dark Fantasy
  { winner: 3, loser: 1 }  // Digital Glitch > Minimalist Landscape
];

// Function to simulate style generation
async function generateStyles(count: number, baseStyle: any = null): Promise<any[]> {
  // In a real implementation, this would use the CreativeEngine to generate actual styles
  // For demo purposes, we'll create variations of the mock styles
  
  const styles = [];
  
  for (let i = 0; i < count; i++) {
    // Select a random base style if none provided
    const template = baseStyle || mockStyles[Math.floor(Math.random() * mockStyles.length)];
    
    // Create a variation
    const style = {
      id: uuidv4(),
      name: `${template.name} Variation`,
      creator: 'ArtBot',
      parameters: { ...template.parameters },
      version: 1,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: [...template.tags]
    };
    
    // Add some random variation
    if (Math.random() > 0.7) {
      style.tags.push(['vibrant', 'muted', 'dark', 'light', 'complex', 'simple'][Math.floor(Math.random() * 6)]);
    }
    
    styles.push(style);
  }
  
  return styles;
}

// Main demo function
async function runDemo() {
  console.log('🎨 Starting ArtBot Aesthetic Judgment Demo');
  console.log('------------------------------------------');
  
  try {
    // Initialize the aesthetic judgment system
    const aestheticJudgment = new AestheticJudgment({
      baseDir: process.cwd(),
      initialRating: 1400,
      kFactor: 32,
      explorationBonus: 0.2
    });
    
    await aestheticJudgment.initialize();
    console.log('✅ Aesthetic judgment system initialized');
    
    // Process mock feedback to build initial preferences
    console.log('\n📊 Processing initial feedback to build preference model...');
    for (const feedback of mockFeedback) {
      const winnerId = mockStyles[feedback.winner].id;
      const loserId = mockStyles[feedback.loser].id;
      
      await aestheticJudgment.updateRatings(winnerId, loserId);
      console.log(`  • ${mockStyles[feedback.winner].name} preferred over ${mockStyles[feedback.loser].name}`);
    }
    
    // Display initial ratings
    console.log('\n🏆 Initial Style Ratings:');
    for (const style of mockStyles) {
      const rating = aestheticJudgment.getRating(style.id);
      console.log(`  • ${style.name}: ${Math.round(rating)} points`);
    }
    
    // Display top preferences
    console.log('\n💖 Learned Style Preferences:');
    const preferences = aestheticJudgment.getTopPreferences(5);
    for (const pref of preferences) {
      const sentiment = pref.weight > 0 ? 'Likes' : 'Dislikes';
      console.log(`  • ${sentiment} "${pref.attribute}" (confidence: ${Math.round(pref.confidence * 100)}%, weight: ${pref.weight.toFixed(2)})`);
    }
    
    // Simulate a creative session with style selection
    console.log('\n🖌️ Simulating a creative session with aesthetic judgment...');
    
    // Generate candidate styles
    const candidates = await generateStyles(5);
    console.log(`  Generated ${candidates.length} candidate styles:`);
    for (const style of candidates) {
      console.log(`  • ${style.name} (tags: ${style.tags.join(', ')})`);
    }
    
    // Select the best style using the aesthetic judgment system
    console.log('\n🔍 Selecting the best style based on learned preferences...');
    const selectedStyle = await aestheticJudgment.selectBestStyle(candidates);
    console.log(`  ✨ Selected: ${selectedStyle.name} (tags: ${selectedStyle.tags.join(', ')})`);
    
    // Demonstrate exploration vs. exploitation
    console.log('\n🧭 Demonstrating exploration vs. exploitation:');
    
    // Create styles with varying degrees of alignment to preferences
    const alignedStyle = {
      id: uuidv4(),
      name: 'Aligned with Preferences',
      creator: 'ArtBot',
      parameters: {},
      version: 1,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: preferences.filter(p => p.weight > 0).map(p => p.attribute)
    };
    
    const novelStyle = {
      id: uuidv4(),
      name: 'Novel Exploration',
      creator: 'ArtBot',
      parameters: {},
      version: 1,
      created: new Date(),
      modified: new Date(),
      isPublic: false,
      tags: ['innovative', 'experimental', 'unique', 'novel']
    };
    
    // Run multiple selection rounds to demonstrate the exploration bonus
    console.log('  Running 10 selection rounds between aligned and novel styles:');
    let alignedCount = 0;
    let novelCount = 0;
    
    for (let i = 0; i < 10; i++) {
      const selected = await aestheticJudgment.selectBestStyle([alignedStyle, novelStyle]);
      if (selected.id === alignedStyle.id) {
        alignedCount++;
        process.stdout.write('A');
      } else {
        novelCount++;
        process.stdout.write('N');
      }
    }
    
    console.log(`\n  Results: Aligned style selected ${alignedCount} times, Novel style selected ${novelCount} times`);
    console.log('  This demonstrates how the system balances exploitation (using known preferences) with exploration (trying new things)');
    
    // Generate a report
    console.log('\n📈 Generating aesthetic preference report...');
    const report = aestheticJudgment.generateAestheticReport();
    
    console.log(`  • Total comparisons: ${report.totalComparisons}`);
    console.log(`  • Rating range: ${Math.round(report.ratingStats.min)} to ${Math.round(report.ratingStats.max)}`);
    console.log(`  • Average rating: ${Math.round(report.ratingStats.average)}`);
    
    console.log('\n✅ Aesthetic Judgment Demo completed successfully!');
    console.log('--------------------------------------------------');
    
  } catch (error) {
    console.error('❌ Error in Aesthetic Judgment Demo:', error);
  }
}

// Run the demo
runDemo().catch(console.error); 