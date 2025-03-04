# Multi-Agent System for Collaborative Art Creation

This directory contains the implementation of a multi-agent system designed for collaborative art creation. The system employs specialized agents that work together to create artwork through a structured workflow.

## Directory Structure

```
multiagent/
├── MultiAgentSystem.ts       # Core system for managing agents and workflow
├── BaseAgent.ts              # Base class for all agents
├── AgentMessage.ts           # Message types for agent communication
├── AgentTypes.ts             # Type definitions for the multi-agent system
├── agents/                   # Specialized agent implementations
│   ├── DirectorAgent.ts      # Coordinates the overall creative process
│   ├── IdeatorAgent.ts       # Generates initial concepts and ideas
│   ├── StylistAgent.ts       # Applies artistic styles to concepts
│   ├── RefinerAgent.ts       # Enhances details and coherence
│   └── CriticAgent.ts        # Evaluates and provides feedback
└── utils/                    # Utility functions for the multi-agent system
    ├── WorkflowUtils.ts      # Utilities for workflow management
    └── MessageUtils.ts       # Utilities for message handling
```

## Core Components

### MultiAgentSystem

The central coordinator that:
- Initializes and manages specialized agents
- Handles message routing between agents
- Manages the workflow state
- Tracks project progress
- Provides status information

### BaseAgent

Abstract base class that all specialized agents extend, providing:
- Common functionality for message handling
- State management
- Task processing
- Error handling

### Agent Message Types

The system uses a structured message format for communication:
- `TASK`: Assigns a task to an agent
- `RESULT`: Returns the result of a completed task
- `FEEDBACK`: Provides feedback on a result
- `STATUS`: Reports agent status
- `STAGE_CHANGE`: Signals a workflow stage transition
- `ERROR`: Reports an error condition

## Specialized Agents

### DirectorAgent

The project coordinator that:
- Initializes the creative process
- Assigns tasks to other agents
- Monitors overall progress
- Makes decisions about workflow transitions
- Finalizes the artwork

### IdeatorAgent

Responsible for conceptualization:
- Generates initial concepts based on project requirements
- Explores creative possibilities
- Provides conceptual foundation for the artwork

### StylistAgent

Focuses on aesthetic aspects:
- Applies artistic styles to concepts
- Ensures visual coherence
- Enhances aesthetic appeal

### RefinerAgent

Enhances and polishes the artwork:
- Adds details to styled concepts
- Improves coherence and consistency
- Resolves visual issues

### CriticAgent

Provides evaluation and feedback:
- Assesses artwork quality
- Identifies areas for improvement
- Ensures alignment with project requirements

## Workflow Process

The system follows a structured workflow:

1. **Planning Stage**
   - Director analyzes project requirements
   - Ideator generates initial concepts
   - Director evaluates concepts

2. **Styling Stage**
   - Stylist applies artistic styles to approved concepts
   - Director reviews styled concepts

3. **Refinement Stage**
   - Refiner enhances details and coherence
   - Director reviews refinements

4. **Critique Stage**
   - Critic evaluates the artwork
   - Director processes feedback
   - Agents make adjustments based on feedback

5. **Completion Stage**
   - Director finalizes the artwork
   - System marks the project as complete

## Usage

To use the multi-agent system:

```typescript
import { MultiAgentSystem } from './services/multiagent/MultiAgentSystem';
import { AIService } from './services/ai/AIService';

// Initialize AI service
const aiService = new AIService();
await aiService.initialize();

// Create multi-agent system
const system = new MultiAgentSystem(aiService);

// Define art project
const project = {
  name: "Neon Cityscape",
  theme: "Futuristic urban environment",
  style: "Cyberpunk with neon lighting",
  elements: ["Skyscrapers", "Flying vehicles", "Holographic advertisements"],
  colorPalette: ["#FF00FF", "#00FFFF", "#FFFF00", "#0000FF"]
};

// Start the project
await system.startProject(project);

// Monitor progress
const checkStatus = setInterval(() => {
  const status = system.getStatus();
  console.log(`Status: ${status.state}`);
  
  if (status.state === 'COMPLETE') {
    console.log("Project completed!");
    console.log("Final artwork:", status.result);
    clearInterval(checkStatus);
  }
}, 5000);
```

## Extending the System

To create a custom agent:

1. Create a new class that extends `BaseAgent`
2. Implement the required methods:
   - `initialize()`: Set up agent-specific resources
   - `processMessage()`: Handle incoming messages
   - `getStatus()`: Report agent status

```typescript
import { BaseAgent } from '../BaseAgent';
import { AgentMessage, AgentMessageType } from '../AgentMessage';

export class CustomAgent extends BaseAgent {
  constructor(aiService) {
    super('CUSTOM', aiService);
  }
  
  async initialize() {
    // Agent-specific initialization
    this.state = 'READY';
  }
  
  async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === AgentMessageType.TASK) {
      // Process task
      const result = await this.performCustomTask(message.content);
      
      // Send result back
      await this.sendMessage({
        from: this.id,
        to: message.from,
        type: AgentMessageType.RESULT,
        content: result
      });
    }
  }
  
  private async performCustomTask(content: any): Promise<any> {
    // Custom task implementation
    return { /* result */ };
  }
}
```

## Testing

Run the multi-agent system tests:

```bash
npm run test:multiagent
```

Or use the validation script for comprehensive testing:

```bash
./validate-multiagent-system.sh
```

## Performance Monitoring

Monitor system performance:

```bash
npm run monitor:performance
```

Generate a detailed performance report:

```bash
./monitor-multiagent-performance.sh
```

## Documentation

For more detailed information, refer to:

- [Multi-Agent System Architecture](../../docs/multiagent-system.md)
- [API Reference](../../docs/multiagent-api-reference.md)
- [User Guide](../../docs/multiagent-user-guide.md)
- [Test Plan](../../docs/multiagent-test-plan.md)
- [Implementation Summary](../../docs/multiagent-implementation-summary.md) 