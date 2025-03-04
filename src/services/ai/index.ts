import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

// Define interfaces for the AI service
export interface AIServiceConfig {
  anthropicApiKey?: string;
  openaiApiKey?: string;
  defaultModel?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AICompletionResponse {
  id: string;
  model: string;
  content: string;
  provider: 'anthropic' | 'openai';
  created: Date;
}

export class AIService {
  private anthropicApiKey: string;
  private openaiApiKey: string;
  private defaultModel: string;
  private isAnthropicAvailable: boolean = false;
  private isOpenAIAvailable: boolean = false;

  constructor(config: AIServiceConfig = {}) {
    this.anthropicApiKey = config.anthropicApiKey || process.env.ANTHROPIC_API_KEY || '';
    this.openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY || '';
    this.defaultModel = config.defaultModel || process.env.DEFAULT_MODEL || 'claude-3-sonnet-20240229';
    
    // Check if API keys are available
    this.isAnthropicAvailable = !!this.anthropicApiKey;
    this.isOpenAIAvailable = !!this.openaiApiKey;
  }

  async initialize(): Promise<void> {
    // Check if Anthropic API key is available
    if (this.isAnthropicAvailable) {
      console.log('✅ Anthropic API key found:', this.anthropicApiKey.substring(0, 5) + '...');
    } else {
      console.warn('⚠️ Anthropic API key not found');
    }

    // Check if OpenAI API key is available
    if (this.isOpenAIAvailable) {
      console.log('✅ OpenAI API key found (fallback):', this.openaiApiKey.substring(0, 5) + '...');
    } else if (!this.isAnthropicAvailable) {
      console.warn('⚠️ OpenAI API key not found. No AI providers available.');
    }
  }

  /**
   * Get a completion from the AI service
   */
  async getCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    // Try Anthropic first if available
    if (this.isAnthropicAvailable) {
      try {
        return await this.getAnthropicCompletion(request);
      } catch (error) {
        console.warn('⚠️ Anthropic API error:', error);
        
        // If OpenAI is available, try it as fallback
        if (this.isOpenAIAvailable) {
          console.log('🔄 Falling back to OpenAI');
          return await this.getOpenAICompletion(request);
        }
        
        // If no fallback is available, throw the error
        throw error;
      }
    } 
    // If Anthropic is not available but OpenAI is, use OpenAI
    else if (this.isOpenAIAvailable) {
      return await this.getOpenAICompletion(request);
    } 
    // If no providers are available, throw an error
    else {
      throw new Error('No AI providers available. Please provide either an Anthropic or OpenAI API key.');
    }
  }

  /**
   * Get a completion from Anthropic
   */
  private async getAnthropicCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model || this.defaultModel;
    const temperature = request.temperature || 0.7;
    const maxTokens = request.maxTokens || 4096;
    
    console.log(`🧠 Calling Anthropic API with model: ${model}`);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          messages: request.messages,
          max_tokens: maxTokens,
          temperature: temperature
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      
      return {
        id: data.id,
        model: data.model,
        content: data.content[0].text,
        provider: 'anthropic',
        created: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw error;
    }
  }

  /**
   * Get a completion from OpenAI
   */
  private async getOpenAICompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    // Map Anthropic model to OpenAI model if needed
    const model = this.mapAnthropicToOpenAIModel(request.model || this.defaultModel);
    const temperature = request.temperature || 0.7;
    const maxTokens = request.maxTokens || 4096;
    
    console.log(`🧠 Calling OpenAI API with model: ${model}`);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: request.messages,
          max_tokens: maxTokens,
          temperature: temperature
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      
      return {
        id: data.id,
        model: data.model,
        content: data.choices[0].message.content,
        provider: 'openai',
        created: new Date(data.created)
      };
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  /**
   * Map Anthropic model to OpenAI model
   */
  private mapAnthropicToOpenAIModel(anthropicModel: string): string {
    // Map Anthropic models to equivalent OpenAI models
    const modelMap: Record<string, string> = {
      'claude-3-opus-20240229': 'gpt-4-turbo',
      'claude-3-sonnet-20240229': 'gpt-4',
      'claude-3-haiku-20240307': 'gpt-3.5-turbo',
      'claude-2.1': 'gpt-4',
      'claude-2.0': 'gpt-4',
      'claude-instant-1.2': 'gpt-3.5-turbo'
    };
    
    return modelMap[anthropicModel] || 'gpt-4';
  }
} 