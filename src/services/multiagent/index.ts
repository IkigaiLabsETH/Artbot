import { v4 as uuidv4 } from 'uuid';
import { AIService, AIMessage } from '../ai/index.js';

// Agent role definitions
export enum AgentRole {
  DIRECTOR = 'director',
  IDEATOR = 'ideator',
  STYLIST = 'stylist',
  CRITIC = 'critic',
  REFINER = 'refiner'
}

// Agent state interface
export interface AgentState {
  id: string;
  role: AgentRole;
  memory: any[];
  context: Record<string, any>;
  status: 'idle' | 'working' | 'waiting' | 'finished';
}

// Agent message interface
export interface AgentMessage {
  id: string;
  fromAgent: string;
  toAgent: string | null; // null means broadcast to all
  content: any;
  timestamp: Date;
  type: 'request' | 'response' | 'update' | 'feedback';
}

// Agent interface
export interface Agent {
  id: string;
  role: AgentRole;
  state: AgentState;
  initialize(): Promise<void>;
  process(message: AgentMessage): Promise<AgentMessage | null>;
  getState(): AgentState;
}

// Base agent implementation
export abstract class BaseAgent implements Agent {
  id: string;
  role: AgentRole;
  state: AgentState;
  protected aiService: AIService;

  constructor(role: AgentRole, aiService: AIService) {
    this.id = uuidv4();
    this.role = role;
    this.aiService = aiService;
    this.state = {
      id: this.id,
      role: role,
      memory: [],
      context: {},
      status: 'idle'
    };
  }

  async initialize(): Promise<void> {
    // Base initialization
    this.state.status = 'idle';
  }

  abstract process(message: AgentMessage): Promise<AgentMessage | null>;

  getState(): AgentState {
    return this.state;
  }

  protected createMessage(
    toAgent: string | null,
    content: any,
    type: 'request' | 'response' | 'update' | 'feedback'
  ): AgentMessage {
    return {
      id: uuidv4(),
      fromAgent: this.id,
      toAgent,
      content,
      timestamp: new Date(),
      type
    };
  }

  protected addToMemory(item: any): void {
    this.state.memory.push({
      ...item,
      timestamp: new Date()
    });
    
    // Keep memory size manageable
    if (this.state.memory.length > 100) {
      this.state.memory.shift();
    }
  }
}

// Multi-agent system manager
export class MultiAgentSystem {
  private agents: Map<string, Agent> = new Map();
  private messageQueue: AgentMessage[] = [];
  private aiService: AIService;
  
  constructor(config: { aiService?: AIService } = {}) {
    this.aiService = config.aiService || new AIService();
  }
  
  async initialize(): Promise<void> {
    await this.aiService.initialize();
    
    // Initialize all agents
    for (const agent of this.agents.values()) {
      await agent.initialize();
    }
  }
  
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }
  
  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }
  
  getAgentsByRole(role: AgentRole): Agent[] {
    return Array.from(this.agents.values()).filter(agent => agent.role === role);
  }
  
  async sendMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.push(message);
    await this.processQueue();
  }
  
  private async processQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (!message) continue;
      
      // Broadcast message
      if (message.toAgent === null) {
        for (const agent of this.agents.values()) {
          if (agent.id !== message.fromAgent) {
            const response = await agent.process(message);
            if (response) {
              this.messageQueue.push(response);
            }
          }
        }
      } 
      // Direct message
      else {
        const targetAgent = this.agents.get(message.toAgent);
        if (targetAgent) {
          const response = await targetAgent.process(message);
          if (response) {
            this.messageQueue.push(response);
          }
        }
      }
    }
  }
  
  getSystemState(): Record<string, AgentState> {
    const state: Record<string, AgentState> = {};
    for (const [id, agent] of this.agents.entries()) {
      state[id] = agent.getState();
    }
    return state;
  }
} 