# Multi-Agent System for Collaborative Art Creation

## Overview

The multi-agent system is a specialized framework designed for collaborative art creation through autonomous agents with distinct roles. This system enables a more sophisticated creative process by breaking down art creation into specialized tasks handled by purpose-built agents.

## Core Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    MultiAgentSystem                         │
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│  │Director │   │Ideator  │   │Stylist  │   │Refiner  │      │
│  │Agent    │<->│Agent    │<->│Agent    │<->│Agent    │<->┐  │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   │  │
│       ^                                                   │  │
│       │                                                   │  │
│       v                                                   v  │
│  ┌─────────┐                                         ┌─────────┐
│  │Message  │                                         │Critic   │
│  │Queue    │<----------------------------------------│Agent    │
│  └─────────┘                                         └─────────┘
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **MultiAgentSystem**: Central coordinator that manages agent registration, message routing, and system state tracking.

2. **BaseAgent**: Abstract class that provides common functionality for all agent types:
   - Message processing
   - State management
   - Task handling
   - Memory management

3. **AgentMessage**: Standardized message format for inter-agent communication:
   ```typescript
   interface AgentMessage {
     id: string;
     type: 'request' | 'response' | 'update' | 'feedback';
     fromAgent: AgentRole;
     toAgent: AgentRole;
     content: any;
     timestamp: number;
     metadata?: Record<string, any>;
   }
   ```

4. **AgentRole**: Enumeration of available agent roles:
   ```typescript
   enum AgentRole {
     DIRECTOR = 'director',
     IDEATOR = 'ideator',
     STYLIST = 'stylist',
     REFINER = 'refiner',
     CRITIC = 'critic'
   }
   ```

## Specialized Agents

### Director Agent

**Purpose**: Coordinates the overall creative process and manages workflow transitions.

**Responsibilities**:
- Project initialization and management
- Task assignment to specialized agents
- Stage transitions (planning → styling → refinement → critique → completion)
- Result collection and integration

**State Structure**:
```typescript
{
  currentProject: {
    id: string;
    title: string;
    description: string;
    requirements: string[];
    status: 'in-progress' | 'completed';
    createdAt: number;
    completedAt?: number;
  };
  projectStage: 'planning' | 'styling' | 'refinement' | 'critique' | 'completed';
  pendingTasks: Array<{
    id: string;
    type: string;
    assignedTo: AgentRole;
    status: 'pending' | 'in-progress' | 'completed';
    createdAt: number;
  }>;
  completedTasks: Array<{
    id: string;
    type: string;
    assignedTo: AgentRole;
    status: 'completed';
    createdAt: number;
    completedAt: number;
    result: any;
  }>;
}
```

### Ideator Agent

**Purpose**: Generates creative ideas based on project requirements.

**Responsibilities**:
- Analyzing project requirements
- Generating diverse artistic concepts
- Structuring ideas with clear elements and emotional impact

**Output Structure**:
```typescript
{
  ideas: Array<{
    title: string;
    description: string;
    elements: string[];
    styles: string[];
    emotionalImpact: string;
    conceptualFramework: string;
  }>
}
```

### Stylist Agent

**Purpose**: Develops artistic styles based on generated ideas.

**Responsibilities**:
- Transforming conceptual ideas into visual styles
- Defining color palettes, textures, and composition approaches
- Creating cohesive style specifications

**Output Structure**:
```typescript
{
  styles: Array<{
    name: string;
    description: string;
    visualCharacteristics: string[];
    colorPalette: string[];
    texture: string;
    composition: string;
    influences: string[];
    technicalApproach: string;
  }>
}
```

### Refiner Agent

**Purpose**: Refines and improves artwork based on selected styles.

**Responsibilities**:
- Integrating style specifications into detailed artwork
- Enhancing visual coherence and impact
- Providing comprehensive artwork specifications

**Output Structure**:
```typescript
{
  title: string;
  description: string;
  visualElements: string[];
  composition: {
    structure: string;
    focalPoints: string[];
    flow: string;
    balance: string;
  };
  colorUsage: {
    palette: string[];
    dominant: string;
    accents: string[];
    transitions: string;
  };
  texture: {
    type: string;
    details: string;
    materials: string;
  };
  emotionalImpact: {
    primary: string;
    secondary: string;
    notes: string;
  };
}
```

### Critic Agent

**Purpose**: Evaluates and provides feedback on artwork.

**Responsibilities**:
- Multi-criteria artwork evaluation
- Identifying strengths and areas for improvement
- Providing actionable recommendations

**Output Structure**:
```typescript
{
  strengths: string[];
  areasForImprovement: string[];
  scores: {
    aesthetics: number;
    originality: number;
    coherence: number;
    technique: number;
    impact: number;
  };
  overallScore: number;
  recommendations: string[];
  analysisNotes: string;
}
```

## Workflow Process

### 1. Project Initialization

```
User/System → Director Agent: Create project with title, description, requirements
```

### 2. Planning Stage

```
Director Agent → Ideator Agent: Request idea generation
Ideator Agent → Director Agent: Return generated ideas
```

### 3. Styling Stage

```
Director Agent → Stylist Agent: Request style development based on ideas
Stylist Agent → Director Agent: Return developed styles
```

### 4. Refinement Stage

```
Director Agent → Refiner Agent: Request artwork refinement based on styles
Refiner Agent → Director Agent: Return refined artwork
```

### 5. Critique Stage

```
Director Agent → Critic Agent: Request artwork evaluation
Critic Agent → Director Agent: Return critique and recommendations
```

### 6. Completion

```
Director Agent: Collect all results and mark project as completed
```

## Implementation Details

### Message Processing Flow

1. Message is sent to the MultiAgentSystem
2. System routes message to appropriate agent(s)
3. Agent processes message and updates its state
4. Agent may generate response message(s)
5. Response messages are routed back through the system

### Agent State Management

Each agent maintains its own state with:
- **memory**: Array of processed messages (with configurable limit)
- **context**: Agent-specific context data
- **status**: Current agent status ('idle', 'working', 'waiting', 'finished')

### Error Handling

- Agents implement error recovery mechanisms
- System monitors agent health and can restart agents if needed
- Failed messages are logged and can be retried

## Usage Examples

### Creating a Multi-Agent System

```typescript
import { createMultiAgentSystem } from './services/multiagent/agents';
import { AIService } from './services/ai';

// Initialize AI service
const aiService = new AIService({
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY
});

// Create multi-agent system
const system = createMultiAgentSystem({ aiService });

// Initialize the system
await system.initialize();
```

### Starting a Project

```typescript
import { createProjectMessage } from './services/multiagent/agents';
import { AgentMessage } from './services/multiagent';

// Create a project message
const projectMessage = createProjectMessage(
  'Cosmic Dreams',
  'An exploration of the intersection between cosmic phenomena and human consciousness',
  [
    'Include celestial elements',
    'Evoke a sense of wonder and contemplation',
    'Balance abstract and recognizable forms',
    'Use a harmonious color palette'
  ]
) as AgentMessage;

// Send the message to start the creative process
await system.sendMessage(projectMessage);
```

### Monitoring the System

```typescript
// Get the current system state
const states = system.getSystemState();

// Log agent states
Object.values(states).forEach(state => {
  console.log(`${state.role}: ${state.status}`);
});

// Find the director agent state
const directorState = Object.values(states).find(state => 
  state.role === 'director'
)?.context;

// Check current project stage
console.log(`Current stage: ${directorState.projectStage}`);
```

## Performance Considerations

- **Memory Management**: Agents limit memory size to prevent excessive resource usage
- **Message Prioritization**: Critical messages are processed before lower-priority ones
- **Asynchronous Processing**: Non-blocking message handling for responsive system behavior
- **Resource Throttling**: AI service calls are throttled to prevent rate limiting

## Extension Guidelines

### Creating a Custom Agent

```typescript
import { BaseAgent, AgentRole, AgentMessage } from './services/multiagent';

export class CustomAgent extends BaseAgent {
  constructor(aiService: AIService) {
    super(AgentRole.CUSTOM, aiService);
    this.state.context = {
      // Custom agent state initialization
    };
  }

  async process(message: AgentMessage): Promise<AgentMessage | null> {
    // Process incoming messages
    if (message.type === 'request' && message.content.task === 'custom-task') {
      // Perform custom task processing
      
      // Return response message
      return {
        id: uuidv4(),
        type: 'response',
        fromAgent: this.role,
        toAgent: message.fromAgent,
        content: {
          taskId: message.content.taskId,
          result: {
            // Custom task result
          }
        },
        timestamp: Date.now()
      };
    }
    
    return null;
  }
}
```

### Registering a Custom Agent

```typescript
// Create custom agent
const customAgent = new CustomAgent(aiService);

// Register with system
system.registerAgent(customAgent);
```

## Future Enhancements

1. **Parallel Processing**: Enable agents to work on multiple tasks simultaneously
2. **Learning Capabilities**: Implement learning mechanisms for agents to improve over time
3. **Dynamic Role Assignment**: Allow agents to dynamically take on different roles
4. **External Feedback Integration**: Incorporate feedback from human users
5. **Visualization Tools**: Create tools to visualize agent interactions and system state
6. **Adaptive Workflow**: Dynamically adjust workflow based on project requirements
7. **Cross-Project Learning**: Apply insights from previous projects to new ones

## Troubleshooting

### Common Issues

1. **Agent Deadlock**: Agents waiting for each other's responses
   - Solution: Implement timeout mechanisms and deadlock detection

2. **Resource Exhaustion**: Excessive memory usage from large projects
   - Solution: Implement memory limits and garbage collection

3. **Message Loss**: Messages not being delivered to agents
   - Solution: Implement message acknowledgment and retry mechanisms

4. **AI Service Failures**: External AI service unavailability
   - Solution: Implement fallback mechanisms and service health checks

### Debugging

The system provides several debugging tools:

1. **System State Inspection**: `system.getSystemState()`
2. **Message Tracing**: Enable with `system.enableMessageTracing()`
3. **Agent Logs**: Access with `system.getAgentLogs(agentRole)`
4. **Performance Metrics**: `system.getPerformanceMetrics()`

## Conclusion

The multi-agent system provides a powerful framework for collaborative art creation through specialized agent roles. By breaking down the creative process into distinct stages handled by purpose-built agents, the system enables more sophisticated and nuanced artwork generation than would be possible with a single-agent approach. 