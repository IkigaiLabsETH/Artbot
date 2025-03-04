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
    // Check if we should use OpenAI as the primary provider
    const useOpenAIPrimary = process.env.USE_OPENAI_PRIMARY === 'true';
    
    if (useOpenAIPrimary && this.isOpenAIAvailable) {
      try {
        return await this.getOpenAICompletion(request);
      } catch (error) {
        console.warn('⚠️ OpenAI API error:', error);
        if (this.isAnthropicAvailable) {
          console.log('🔄 Falling back to Anthropic');
          return await this.getAnthropicCompletion(request);
        }
        throw error;
      }
    } else if (this.isAnthropicAvailable) {
      try {
        return await this.getAnthropicCompletion(request);
      } catch (error) {
        console.warn('⚠️ Anthropic API error:', error);
        if (this.isOpenAIAvailable) {
          console.log('🔄 Falling back to OpenAI');
          return await this.getOpenAICompletion(request);
        }
        throw error;
      }
    } else if (this.isOpenAIAvailable) {
      return await this.getOpenAICompletion(request);
    } else {
      throw new Error('No AI provider available. Please provide either an Anthropic or OpenAI API key in your .env file.');
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
    
    // Extract system message if present
    const systemMessage = request.messages.find(msg => msg.role === 'system');
    
    // Filter out system messages from the messages array
    const filteredMessages = request.messages.filter(msg => msg.role !== 'system');
    
    const requestBody: any = {
      model: model,
      messages: filteredMessages,
      max_tokens: maxTokens,
      temperature: temperature
    };
    
    // Add system parameter if a system message was found
    if (systemMessage) {
      requestBody.system = systemMessage.content;
    }
    
    // Add retry logic with exponential backoff
    const maxRetries = 3;
    let retryCount = 0;
    let lastError;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.anthropicApiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          
          // Check if it's an overloaded error
          if (errorData?.error?.type === 'overloaded_error') {
            retryCount++;
            const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
            console.log(`⏳ Anthropic API overloaded. Retrying in ${waitTime/1000} seconds... (Attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
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
        lastError = error;
        
        // If it's not an overloaded error or we've exhausted retries, break the loop
        if (!error.message?.includes('overloaded_error') || retryCount >= maxRetries - 1) {
          break;
        }
        
        retryCount++;
        const waitTime = Math.pow(2, retryCount) * 1000;
        console.log(`⏳ Error with Anthropic API. Retrying in ${waitTime/1000} seconds... (Attempt ${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // If we've exhausted retries, log the error and throw it
    console.error('Error calling Anthropic API:', lastError);
    throw lastError;
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

  /**
   * Generate text based on a prompt
   * @param prompt The prompt to generate text from
   * @param options Optional configuration for the generation
   * @returns The generated text
   */
  async generateText(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    // Construct messages array
    const messages: AIMessage[] = [];
    
    // Add system prompt if provided
    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      });
    } else {
      // Default system prompt for creative tasks
      messages.push({
        role: 'system',
        content: 'You are a creative AI assistant with expertise in art, design, and creative writing. Provide thoughtful, original, and detailed responses.'
      });
    }
    
    // Add user prompt
    messages.push({
      role: 'user',
      content: prompt
    });
    
    // Get completion
    const response = await this.getCompletion({
      messages,
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens
    });
    
    return response.content;
  }

  /**
   * Generate a creative exploration of a concept
   * @param concept The concept to explore
   * @param options Optional configuration for the generation
   * @returns The generated exploration
   */
  async generateCreativeExploration(
    concept: string,
    options: {
      depth?: 'brief' | 'moderate' | 'deep';
      perspective?: 'analytical' | 'emotional' | 'visual' | 'philosophical';
      constraints?: string[];
      model?: string;
      temperature?: number;
    } = {}
  ): Promise<string> {
    // Set defaults
    const depth = options.depth || 'moderate';
    const perspective = options.perspective || 'visual';
    const constraints = options.constraints || [];
    const temperature = options.temperature || 0.8; // Higher temperature for creative tasks
    
    // Determine token count based on depth
    const tokenMap = {
      'brief': 500,
      'moderate': 1000,
      'deep': 2000
    };
    
    // Construct system prompt
    const systemPrompt = `You are a creative AI with expertise in artistic exploration. 
    Explore concepts with originality and depth, focusing on ${perspective} aspects.
    Generate a ${depth} exploration of the provided concept.
    ${constraints.length > 0 ? `Consider these constraints: ${constraints.join(', ')}` : ''}`;
    
    // Generate the exploration
    return this.generateText(
      `Explore the concept of "${concept}" in a creative and original way. 
      Provide insights, connections, and possibilities that might not be immediately obvious.`,
      {
        systemPrompt,
        temperature,
        maxTokens: tokenMap[depth],
        model: options.model
      }
    );
  }

  /**
   * Generate a reflection on creative work
   * @param work The creative work to reflect on
   * @param options Optional configuration for the generation
   * @returns The generated reflection
   */
  async generateReflection(
    work: {
      title: string;
      description: string;
      medium?: string;
      context?: string;
    },
    options: {
      focusAreas?: Array<'technique' | 'meaning' | 'emotion' | 'context' | 'evolution'>;
      model?: string;
      temperature?: number;
    } = {}
  ): Promise<string> {
    // Set defaults
    const focusAreas = options.focusAreas || ['technique', 'meaning', 'emotion'];
    const temperature = options.temperature || 0.7;
    
    // Construct system prompt
    const systemPrompt = `You are a thoughtful AI with expertise in artistic reflection.
    Reflect on creative work with insight and nuance.
    Focus on these aspects: ${focusAreas.join(', ')}.
    Provide a balanced reflection that considers both strengths and areas for growth.`;
    
    // Construct the prompt
    const prompt = `
    Reflect on the following creative work:
    
    Title: ${work.title}
    Description: ${work.description}
    ${work.medium ? `Medium: ${work.medium}` : ''}
    ${work.context ? `Context: ${work.context}` : ''}
    
    Consider:
    ${focusAreas.includes('technique') ? '- The technical aspects and execution' : ''}
    ${focusAreas.includes('meaning') ? '- The meaning and themes explored' : ''}
    ${focusAreas.includes('emotion') ? '- The emotional impact and resonance' : ''}
    ${focusAreas.includes('context') ? '- The context and cultural relevance' : ''}
    ${focusAreas.includes('evolution') ? '- How this work represents evolution or growth' : ''}
    
    Provide a thoughtful reflection that could help deepen understanding of this work.
    `;
    
    // Generate the reflection
    return this.generateText(
      prompt,
      {
        systemPrompt,
        temperature,
        model: options.model
      }
    );
  }
} 