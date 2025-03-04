import { AIService } from '../ai/index.js';
import { Memory, MemoryType } from './index.js';

/**
 * Emotion categories for memories
 */
export enum EmotionCategory {
  JOY = 'joy',
  SADNESS = 'sadness',
  ANGER = 'anger',
  FEAR = 'fear',
  SURPRISE = 'surprise',
  DISGUST = 'disgust',
  TRUST = 'trust',
  ANTICIPATION = 'anticipation',
  NEUTRAL = 'neutral'
}

/**
 * Emotion intensity levels
 */
export enum EmotionIntensity {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  EXTREME = 4
}

/**
 * Interface for emotion data
 */
export interface Emotion {
  category: EmotionCategory;
  intensity: EmotionIntensity;
  confidence: number;
}

/**
 * Interface for emotional memory metadata
 */
export interface EmotionalMemoryMetadata {
  emotions: Emotion[];
  dominantEmotion?: EmotionCategory;
  emotionalValence: number; // -1 (negative) to 1 (positive)
  emotionalArousal: number; // 0 (calm) to 1 (excited)
}

/**
 * Emotional memory service
 * Adds emotional context to memories
 */
export class EmotionalMemory {
  private aiService: AIService;
  
  constructor(aiService?: AIService) {
    this.aiService = aiService || new AIService();
  }
  
  /**
   * Initialize the emotional memory service
   */
  async initialize(): Promise<void> {
    await this.aiService.initialize();
  }
  
  /**
   * Add emotional context to a memory
   */
  async addEmotionalContext(memory: Memory): Promise<Memory> {
    // Skip if memory already has emotional context
    if (memory.metadata.emotions) {
      return memory;
    }
    
    let content: string;
    
    // Extract content based on memory type
    switch (memory.type) {
      case MemoryType.VISUAL:
        content = memory.metadata.title + '. ' + memory.metadata.description;
        break;
      case MemoryType.TEXTUAL:
      case MemoryType.SOCIAL:
      case MemoryType.EXPERIENCE:
        content = typeof memory.content === 'string' ? memory.content : JSON.stringify(memory.content);
        break;
      case MemoryType.FEEDBACK:
        content = memory.content + '. Rating: ' + memory.metadata.rating;
        break;
      case MemoryType.STYLE:
        content = memory.metadata.title + '. ' + 
          (typeof memory.content === 'object' ? 
            Object.entries(memory.content).map(([k, v]) => `${k}: ${v}`).join(', ') : 
            memory.content);
        break;
      default:
        content = typeof memory.content === 'string' ? memory.content : JSON.stringify(memory.content);
    }
    
    // Analyze emotional content
    const emotions = await this.analyzeEmotions(content);
    
    // Calculate emotional valence and arousal
    const { valence, arousal } = this.calculateEmotionalDimensions(emotions);
    
    // Find dominant emotion
    const dominantEmotion = this.findDominantEmotion(emotions);
    
    // Add emotional context to memory metadata
    memory.metadata.emotions = emotions;
    memory.metadata.dominantEmotion = dominantEmotion;
    memory.metadata.emotionalValence = valence;
    memory.metadata.emotionalArousal = arousal;
    
    // Add emotional tags
    if (dominantEmotion && dominantEmotion !== EmotionCategory.NEUTRAL) {
      memory.tags.push(`emotion:${dominantEmotion}`);
      
      // Add valence tag
      if (valence > 0.3) {
        memory.tags.push('emotion:positive');
      } else if (valence < -0.3) {
        memory.tags.push('emotion:negative');
      }
      
      // Add arousal tag
      if (arousal > 0.7) {
        memory.tags.push('emotion:high-arousal');
      } else if (arousal < 0.3) {
        memory.tags.push('emotion:low-arousal');
      }
    }
    
    return memory;
  }
  
  /**
   * Analyze emotions in content
   */
  private async analyzeEmotions(content: string): Promise<Emotion[]> {
    try {
      // Prepare prompt for emotion analysis
      const prompt = `
Analyze the emotional content of the following text and identify the emotions present.
For each emotion category (joy, sadness, anger, fear, surprise, disgust, trust, anticipation, neutral),
provide an intensity level (0=none, 1=low, 2=medium, 3=high, 4=extreme) and a confidence score (0.0-1.0).

Text: "${content}"

Respond with a JSON array of emotions in the following format:
[
  {
    "category": "emotion_category",
    "intensity": intensity_level,
    "confidence": confidence_score
  },
  ...
]
`;

      // Get completion from AI service
      const response = await this.aiService.getCompletion({
        messages: [
          { role: 'system', content: 'You are an emotion analysis assistant that responds only with valid JSON.' },
          { role: 'user', content: prompt }
        ]
      });
      
      // Parse response
      try {
        const emotions = JSON.parse(response.content) as Emotion[];
        
        // Validate and filter emotions
        return emotions.filter(emotion => {
          // Check if category is valid
          const isValidCategory = Object.values(EmotionCategory).includes(emotion.category as EmotionCategory);
          
          // Check if intensity is valid
          const isValidIntensity = Number.isInteger(emotion.intensity) && 
            emotion.intensity >= EmotionIntensity.NONE && 
            emotion.intensity <= EmotionIntensity.EXTREME;
          
          // Check if confidence is valid
          const isValidConfidence = typeof emotion.confidence === 'number' && 
            emotion.confidence >= 0 && 
            emotion.confidence <= 1;
          
          return isValidCategory && isValidIntensity && isValidConfidence;
        });
      } catch (error) {
        console.error('Error parsing emotion analysis response:', error);
        return this.getDefaultEmotions();
      }
    } catch (error) {
      console.error('Error analyzing emotions:', error);
      return this.getDefaultEmotions();
    }
  }
  
  /**
   * Calculate emotional valence and arousal
   */
  private calculateEmotionalDimensions(emotions: Emotion[]): { valence: number, arousal: number } {
    // Define valence and arousal values for each emotion category
    const emotionDimensions: Record<EmotionCategory, { valence: number, arousal: number }> = {
      [EmotionCategory.JOY]: { valence: 0.8, arousal: 0.6 },
      [EmotionCategory.SADNESS]: { valence: -0.8, arousal: 0.3 },
      [EmotionCategory.ANGER]: { valence: -0.7, arousal: 0.8 },
      [EmotionCategory.FEAR]: { valence: -0.8, arousal: 0.7 },
      [EmotionCategory.SURPRISE]: { valence: 0.4, arousal: 0.9 },
      [EmotionCategory.DISGUST]: { valence: -0.6, arousal: 0.5 },
      [EmotionCategory.TRUST]: { valence: 0.6, arousal: 0.3 },
      [EmotionCategory.ANTICIPATION]: { valence: 0.5, arousal: 0.6 },
      [EmotionCategory.NEUTRAL]: { valence: 0.0, arousal: 0.1 }
    };
    
    // Calculate weighted average of valence and arousal
    let totalValence = 0;
    let totalArousal = 0;
    let totalWeight = 0;
    
    for (const emotion of emotions) {
      const weight = emotion.intensity * emotion.confidence;
      const dimensions = emotionDimensions[emotion.category as EmotionCategory];
      
      totalValence += dimensions.valence * weight;
      totalArousal += dimensions.arousal * weight;
      totalWeight += weight;
    }
    
    // Normalize values
    const valence = totalWeight > 0 ? totalValence / totalWeight : 0;
    const arousal = totalWeight > 0 ? totalArousal / totalWeight : 0;
    
    return { valence, arousal };
  }
  
  /**
   * Find the dominant emotion
   */
  private findDominantEmotion(emotions: Emotion[]): EmotionCategory {
    if (emotions.length === 0) {
      return EmotionCategory.NEUTRAL;
    }
    
    // Calculate weighted score for each emotion
    const weightedEmotions = emotions.map(emotion => ({
      category: emotion.category,
      score: emotion.intensity * emotion.confidence
    }));
    
    // Sort by score (descending)
    weightedEmotions.sort((a, b) => b.score - a.score);
    
    // If highest score is very low, return neutral
    if (weightedEmotions[0].score < 0.5) {
      return EmotionCategory.NEUTRAL;
    }
    
    return weightedEmotions[0].category as EmotionCategory;
  }
  
  /**
   * Get default emotions (neutral)
   */
  private getDefaultEmotions(): Emotion[] {
    return [
      {
        category: EmotionCategory.NEUTRAL,
        intensity: EmotionIntensity.MEDIUM,
        confidence: 1.0
      }
    ];
  }
  
  /**
   * Filter memories by emotional criteria
   */
  filterMemoriesByEmotion(
    memories: Memory[],
    criteria: {
      category?: EmotionCategory,
      minIntensity?: EmotionIntensity,
      minValence?: number,
      maxValence?: number,
      minArousal?: number,
      maxArousal?: number
    }
  ): Memory[] {
    return memories.filter(memory => {
      // Skip memories without emotional context
      if (!memory.metadata.emotions) {
        return false;
      }
      
      // Filter by category
      if (criteria.category && memory.metadata.dominantEmotion !== criteria.category) {
        return false;
      }
      
      // Filter by intensity
      if (criteria.minIntensity !== undefined) {
        const emotion = memory.metadata.emotions.find(e => 
          e.category === (criteria.category || memory.metadata.dominantEmotion)
        );
        
        if (!emotion || emotion.intensity < criteria.minIntensity) {
          return false;
        }
      }
      
      // Filter by valence
      if (criteria.minValence !== undefined && memory.metadata.emotionalValence < criteria.minValence) {
        return false;
      }
      
      if (criteria.maxValence !== undefined && memory.metadata.emotionalValence > criteria.maxValence) {
        return false;
      }
      
      // Filter by arousal
      if (criteria.minArousal !== undefined && memory.metadata.emotionalArousal < criteria.minArousal) {
        return false;
      }
      
      if (criteria.maxArousal !== undefined && memory.metadata.emotionalArousal > criteria.maxArousal) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Get emotional mood from a set of memories
   */
  calculateEmotionalMood(memories: Memory[]): { valence: number, arousal: number, dominantEmotion: EmotionCategory } {
    // Filter memories with emotional context
    const emotionalMemories = memories.filter(memory => memory.metadata.emotions);
    
    if (emotionalMemories.length === 0) {
      return {
        valence: 0,
        arousal: 0,
        dominantEmotion: EmotionCategory.NEUTRAL
      };
    }
    
    // Calculate average valence and arousal
    let totalValence = 0;
    let totalArousal = 0;
    
    for (const memory of emotionalMemories) {
      totalValence += memory.metadata.emotionalValence || 0;
      totalArousal += memory.metadata.emotionalArousal || 0;
    }
    
    const valence = totalValence / emotionalMemories.length;
    const arousal = totalArousal / emotionalMemories.length;
    
    // Count dominant emotions
    const emotionCounts: Record<EmotionCategory, number> = {
      [EmotionCategory.JOY]: 0,
      [EmotionCategory.SADNESS]: 0,
      [EmotionCategory.ANGER]: 0,
      [EmotionCategory.FEAR]: 0,
      [EmotionCategory.SURPRISE]: 0,
      [EmotionCategory.DISGUST]: 0,
      [EmotionCategory.TRUST]: 0,
      [EmotionCategory.ANTICIPATION]: 0,
      [EmotionCategory.NEUTRAL]: 0
    };
    
    for (const memory of emotionalMemories) {
      if (memory.metadata.dominantEmotion) {
        emotionCounts[memory.metadata.dominantEmotion] += 1;
      }
    }
    
    // Find most common dominant emotion
    let maxCount = 0;
    let dominantEmotion = EmotionCategory.NEUTRAL;
    
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion as EmotionCategory;
      }
    }
    
    return { valence, arousal, dominantEmotion };
  }
} 