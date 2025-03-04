import { Action, Content, ServiceType } from '@elizaos/core';
import { CreativeEngine } from '../services/CreativeEngine';
import { StyleService } from '../services/style';
import { ReplicateService } from '../services/replicate';
import { SocialContextService } from '../services/social';
import { ArtworkIdea, SelfDialogue } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Style } from '../types/social';

export interface GenerateArtParams {
  prompt?: string;
  styleId?: string;
  width?: number;
  height?: number;
  includeSocialContext?: boolean;
}

// Define our own creative state for this action
interface ActionCreativeState {
  prompt: string;
  ideas: ArtworkIdea[];
  selectedIdea: ArtworkIdea | null;
  dialogue: any[];
  style: Style | null;
  imageUrl: string | null;
}

// Helper function to extract the final prompt from the dialogue
function extractFinalPrompt(dialogue: any[]): string {
  // Get the last dialogue entry
  const lastEntry = dialogue[dialogue.length - 1];
  
  // If it contains a specific prompt, use that
  if (lastEntry && lastEntry.content && lastEntry.content.includes('FINAL PROMPT:')) {
    const match = lastEntry.content.match(/FINAL PROMPT:([\s\S]*?)($|REASONING:)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Otherwise, use the content of the last dialogue entry
  return lastEntry && lastEntry.content ? lastEntry.content : '';
}

// Export the action with the required Action interface properties
export const generateArt: Action = {
  name: 'generateArt',
  description: 'Generate artwork based on a prompt with optional social context integration',
  similes: ['Create art', 'Generate an image', 'Make artwork'],
  examples: [
    [
      { 
        user: 'user', 
        content: { 
          text: 'Generate art with the prompt "sunset over mountains"' 
        } 
      },
      { 
        user: 'assistant', 
        content: { 
          text: 'I\'ll create artwork based on "sunset over mountains"' 
        } 
      }
    ],
    [
      { 
        user: 'user', 
        content: { 
          text: 'Create art with social context about current trends' 
        } 
      },
      { 
        user: 'assistant', 
        content: { 
          text: 'I\'ll generate artwork incorporating current art trends' 
        } 
      }
    ]
  ],
  handler: async (runtime, message, state) => {
    // Extract parameters from the message
    const params = message.content.action ? 
      JSON.parse(message.content.action) as GenerateArtParams : 
      {} as GenerateArtParams;
    
    const { prompt, styleId, width = 512, height = 512, includeSocialContext = false } = params;
    
    // Get required services
    const engine = runtime.getService(ServiceType.TEXT_GENERATION) as CreativeEngine;
    const styleService = runtime.getService(ServiceType.TEXT_GENERATION) as StyleService;
    const replicateService = runtime.getService(ServiceType.TEXT_GENERATION) as ReplicateService;
    
    // Get social context service if needed
    let socialContextService: SocialContextService | undefined;
    if (includeSocialContext) {
      try {
        socialContextService = runtime.getService(ServiceType.TEXT_GENERATION) as SocialContextService;
      } catch (error) {
        console.warn("Social context service not available:", error);
      }
    }
    
    // Get social context data if available
    let socialContext = null;
    if (socialContextService) {
      try {
        // Get trending art topics
        const artTrends = await socialContextService.getArtTrends();
        // Get community insights
        const communityInsights = await socialContextService.getCommunityInsights(2);
        
        socialContext = {
          artTrends: artTrends.slice(0, 3),
          communityInsights: communityInsights.map(insight => ({
            topic: insight.topic,
            keyOpinions: insight.keyOpinions
          }))
        };
      } catch (error) {
        console.error("Error getting social context:", error);
      }
    }
    
    // Initialize creative state
    const actionState: ActionCreativeState = {
      prompt: prompt || '',
      ideas: [],
      selectedIdea: null,
      dialogue: [],
      style: null,
      imageUrl: null
    };
    
    // If a style ID is provided, retrieve the style
    if (styleId) {
      actionState.style = await styleService.getStyle(styleId);
    }
    
    // Generate ideas based on the prompt
    console.log('Generating ideas based on prompt:', actionState.prompt);
    
    // If social context is available, incorporate it into the prompt
    let enhancedPrompt = actionState.prompt;
    if (socialContext) {
      const trendKeywords = socialContext.artTrends
        .map(trend => trend.keyword)
        .join(', ');
      
      const communityThemes = socialContext.communityInsights
        .map(insight => insight.topic)
        .join(', ');
      
      enhancedPrompt += `\n\nConsider incorporating these trending art concepts: ${trendKeywords}`;
      enhancedPrompt += `\n\nThe art community is currently discussing: ${communityThemes}`;
    }
    
    // Generate ideas
    const ideas = await engine.generateArtIdeas(3);
    actionState.ideas = ideas;
    
    // Select the best idea - we'll implement this ourselves since it doesn't exist
    const selectedIdea = ideas[0]; // Just use the first idea for now
    actionState.selectedIdea = selectedIdea;
    
    // Generate self-dialogue to refine the idea
    console.log('Generating self-dialogue to refine the idea');
    // Create a dialogue manually since we can't access the engine's private selfDialogue
    const selfDialogue = new SelfDialogue();
    const creativeDialogue = await selfDialogue.explore(selectedIdea.concept);
    
    // Convert the creative dialogue to the format expected by the rest of the code
    const dialogue = [
      {
        role: 'system',
        content: `Exploring concept: ${selectedIdea.concept}`
      },
      {
        role: 'assistant',
        content: `FINAL PROMPT: ${enhancedPrompt} ${selectedIdea.concept}`
      }
    ];
    
    actionState.dialogue = dialogue;
    
    // Extract the final prompt from the dialogue
    const finalPrompt = extractFinalPrompt(dialogue);
    
    // Generate the image
    console.log('Generating image with prompt:', finalPrompt);
    let imageUrl: string;
    let prediction;
    
    if (actionState.style) {
      // Use the selected style to generate the image
      console.log('Using style:', actionState.style.name);
      prediction = await replicateService.generateFromStyle(
        actionState.style,
        finalPrompt
      );
      imageUrl = prediction.output[0]; // Assuming output is an array of URLs
    } else {
      // Use default parameters
      prediction = await replicateService.runPrediction(
        replicateService.getAvailableModels()[0], // Use first available model
        { prompt: finalPrompt, width, height }
      );
      imageUrl = prediction.output[0]; // Assuming output is an array of URLs
    }
    
    actionState.imageUrl = imageUrl;
    
    // Create a unique ID for the artwork
    const artworkId = uuidv4();
    
    // Create the response content
    const responseContent: Content = {
      text: `I've created artwork based on "${finalPrompt}"`,
      action: JSON.stringify({
        artworkId,
        prompt: finalPrompt,
        imageUrl,
        width,
        height,
        style: actionState.style,
        creativeProcess: {
          ideas: actionState.ideas,
          selectedIdea: actionState.selectedIdea,
          dialogue: actionState.dialogue
        },
        socialInfluence: socialContext ? {
          incorporatedTrends: socialContext.artTrends.map(trend => trend.keyword),
          communityThemes: socialContext.communityInsights.map(insight => insight.topic)
        } : null
      })
    };
    
    return responseContent;
  },
  validate: async (runtime, message) => {
    try {
      // Extract parameters from the message
      const params = message.content.action ? 
        JSON.parse(message.content.action) as GenerateArtParams : 
        {} as GenerateArtParams;
      
      // Basic validation
      if (!params.prompt && !params.styleId) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error validating generateArt action:", error);
      return false;
    }
  },
  suppressInitialMessage: false
}; 