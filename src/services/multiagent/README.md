# Multi-Agent System for Collaborative Art Creation

This module implements a multi-agent system for collaborative art creation through specialized agent roles. The system enables autonomous agents to work together to create artwork, with each agent focusing on a specific aspect of the creative process.

## Architecture

The multi-agent system consists of the following components:

### Core Components

- **MultiAgentSystem**: Manages agent registration, message passing, and system state
- **BaseAgent**: Abstract base class for all agent implementations
- **AgentMessage**: Interface for messages exchanged between agents

### Agent Roles

1. **Director Agent**: Coordinates the creative process and manages workflow
2. **Ideator Agent**: Generates creative ideas based on project requirements
3. **Stylist Agent**: Develops artistic styles based on generated ideas
4. **Refiner Agent**: Refines and improves artwork based on selected styles
5. **Critic Agent**: Evaluates and provides feedback on the artwork

### Workflow

The agents collaborate through a sequential workflow:

1. **Planning Stage**: Director assigns ideation task to Ideator
2. **Styling Stage**: Director passes ideation results to Stylist
3. **Refinement Stage**: Director passes style results to Refiner
4. **Critique Stage**: Director passes refined artwork to Critic
5. **Completion**: Director collects all results and completes the project

## Usage

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
  'Project Title',
  'Project Description',
  ['Requirement 1', 'Requirement 2']
) as AgentMessage;

// Send the message to start the creative process
await system.sendMessage(projectMessage);
```

### Monitoring the System

```typescript
// Get the current system state
const states = system.getSystemState();

// Get agents by role
const directors = system.getAgentsByRole(AgentRole.DIRECTOR);
```

## Extending the System

### Creating a Custom Agent

```typescript
import { BaseAgent, AgentRole, AgentMessage } from './services/multiagent';

export class CustomAgent extends BaseAgent {
  constructor(aiService: AIService) {
    super(AgentRole.CUSTOM, aiService);
    this.state.context = {
      // Custom agent state
    };
  }

  async process(message: AgentMessage): Promise<AgentMessage | null> {
    // Process incoming messages
    return null;
  }
}
```

## Running the Demo

To run the multi-agent system demo:

```bash
# Using npm script
npm run demo:multiagent

# Using shell script
./run-multiagent-demo.sh
```

## Implementation Details

### Message Types

- **request**: Request an agent to perform a task
- **response**: Response to a request with task results
- **update**: Update on agent state or progress
- **feedback**: Feedback on agent performance or output

### Agent State

Each agent maintains its own state, including:

- **memory**: History of processed messages
- **context**: Agent-specific context data
- **status**: Current agent status ('idle', 'working', 'waiting', 'finished')

## Future Enhancements

- **Parallel Processing**: Enable agents to work on multiple tasks simultaneously
- **Learning Capabilities**: Implement learning mechanisms for agents to improve over time
- **Dynamic Role Assignment**: Allow agents to dynamically take on different roles based on project needs
- **External Feedback Integration**: Incorporate feedback from external sources (e.g., human users)
- **Visualization Tools**: Create tools to visualize agent interactions and system state 