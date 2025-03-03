import { v4 as uuidv4 } from 'uuid';

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
    
    // For development/testing, consider any non-empty string as valid
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
    // In a real implementation, this would call the Anthropic API
    // For now, we'll simulate a successful response
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful response
    return {
      id: uuidv4(),
      model: request.model || this.defaultModel,
      content: this.mockCompletion(request.messages),
      provider: 'anthropic',
      created: new Date()
    };
  }

  /**
   * Get a completion from OpenAI
   */
  private async getOpenAICompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    // In a real implementation, this would call the OpenAI API
    // For now, we'll simulate a successful response
    
    // Map Anthropic model to OpenAI model if needed
    const model = this.mapAnthropicToOpenAIModel(request.model || this.defaultModel);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful response
    return {
      id: uuidv4(),
      model,
      content: this.mockCompletion(request.messages, 'openai'),
      provider: 'openai',
      created: new Date()
    };
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

  /**
   * Generate a mock completion
   */
  private mockCompletion(messages: AIMessage[], provider: 'anthropic' | 'openai' = 'anthropic'): string {
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    
    if (!lastUserMessage) {
      return 'I don\'t have a specific question to respond to. How can I help you?';
    }
    
    // Generate a simple response based on the user's message
    const userMessage = lastUserMessage.content.toLowerCase();
    const providerPrefix = provider === 'anthropic' ? '[Anthropic] ' : '[OpenAI] ';
    
    if (userMessage.includes('hello') || userMessage.includes('hi')) {
      return providerPrefix + 'Hello! How can I assist you with your creative project today?';
    } else if (userMessage.includes('style')) {
      return providerPrefix + 'I can help you explore different artistic styles. Would you like me to suggest some styles that might work for your project?';
    } else if (userMessage.includes('generate') || userMessage.includes('create')) {
      return providerPrefix + 'I\'d be happy to help generate creative ideas. Could you tell me more about what you\'re looking to create?';
    } else {
      return providerPrefix + `I understand you're interested in "${lastUserMessage.content}". Let me think about how I can help with that.`;
    }
  }
} 