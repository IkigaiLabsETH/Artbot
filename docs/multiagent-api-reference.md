# Multi-Agent System API Reference

This document provides a comprehensive reference for the Multi-Agent System API.

## Core Components

### MultiAgentSystem

The central coordinator for the multi-agent system.

#### Constructor

```typescript
constructor(options: {
  maxMemorySize?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
})
```

#### Methods

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| `initialize(options?: { initialState?: Record<AgentRole, AgentState> })` | Initializes the system | Optional initial state | `Promise<void>` |
| `registerAgent(agent: BaseAgent)` | Registers an agent with the system | Agent instance | `void` |
| `sendMessage(message: AgentMessage)` | Sends a message to the appropriate agent | Message object | `Promise<void>` |
| `getSystemState()` | Returns the current state of all agents | None | `Record<string, AgentState>` |
| `getAgentsByRole(role: AgentRole)` | Returns all agents with the specified role | Agent role | `BaseAgent[]` |
| `enableMessageTracing()` | Enables detailed message tracing | None | `void` |
| `setLogLevel(level: 'debug' \| 'info' \| 'warn' \| 'error')` | Sets the log level | Log level | `void` |
| `getAgentLogs(role: AgentRole)` | Gets logs for a specific agent | Agent role | `LogEntry[]` |
| `getPerformanceMetrics()` | Gets performance metrics for the system | None | `PerformanceMetrics` |

#### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `messageProcessed` | Fired when a message is processed | `{ message: AgentMessage, agent: AgentRole }` |
| `taskCompleted` | Fired when a task is completed | `{ task: Task, result: any }` |
| `projectCompleted` | Fired when a project is completed | `Project` |
| `error` | Fired when an error occurs | `Error` |

### BaseAgent

Abstract base class for all agent implementations.

#### Constructor

```typescript
constructor(role: AgentRole, aiService: AIService, options?: {
  maxMemorySize?: number;
  processingDelay?: number;
})
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `role` | `AgentRole` | The role of the agent |
| `state` | `AgentState` | The current state of the agent |

#### Methods

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| `initialize()` | Initializes the agent | None | `Promise<void>` |
| `process(message: AgentMessage)` | Processes an incoming message | Message object | `Promise<AgentMessage \| null>` |
| `getState()` | Returns the current state of the agent | None | `AgentState` |
| `updateStatus(status: AgentStatus)` | Updates the agent's status | New status | `void` |
| `addToMemory(message: AgentMessage)` | Adds a message to the agent's memory | Message object | `void` |
| `clearMemory()` | Clears the agent's memory | None | `void` |

### AgentMessage

Interface for messages exchanged between agents.

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

### AgentState

Interface for agent state.

```typescript
interface AgentState {
  role: AgentRole;
  status: 'idle' | 'working' | 'waiting' | 'finished';
  memory: AgentMessage[];
  context: Record<string, any>;
}
```

## Specialized Agents

### DirectorAgent

Coordinates the creative process and manages workflow.

#### Constructor

```typescript
constructor(aiService: AIService, options?: {
  maxMemorySize?: number;
  processingDelay?: number;
})
```

#### Methods

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| `createProject(title: string, description: string, requirements: string[])` | Creates a new project | Project details | `Project` |
| `assignTask(taskType: string, assignee: AgentRole, data: any)` | Assigns a task to an agent | Task details | `Task` |
| `completeTask(taskId: string, result: any)` | Marks a task as completed | Task ID and result | `void` |
| `advanceStage()` | Advances to the next project stage | None | `void` |
| `completeProject()` | Marks the current project as completed | None | `void` |

### IdeatorAgent

Generates creative ideas based on project requirements.

#### Constructor

```typescript
constructor(aiService: AIService, options?: {
  maxMemorySize?: number;
  processingDelay?: number;
  diversityFactor?: number;
  explorationDepth?: number;
  maxIdeas?: number;
})
```

#### Methods

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| `generateIdeas(requirements: string[], count: number)` | Generates creative ideas | Requirements and count | `Promise<Idea[]>` |
| `evaluateIdea(idea: Idea)` | Evaluates an idea's potential | Idea object | `Promise<IdeaEvaluation>` |
| `refineIdea(idea: Idea, feedback: string)` | Refines an idea based on feedback | Idea and feedback | `Promise<Idea>` |

### StylistAgent

Develops artistic styles based on generated ideas.

#### Constructor

```typescript
constructor(aiService: AIService, options?: {
  maxMemorySize?: number;
  processingDelay?: number;
  referenceLibrary?: string[];
  colorPaletteSize?: number;
  detailLevel?: 'low' | 'medium' | 'high';
})
```

#### Methods

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| `developStyles(ideas: Idea[], count: number)` | Develops artistic styles | Ideas and count | `Promise<Style[]>` |
| `generateColorPalette(theme: string, size: number)` | Generates a color palette | Theme and size | `Promise<string[]>` |
| `suggestComposition(style: Style)` | Suggests composition approaches | Style object | `Promise<CompositionSuggestion>` |

### RefinerAgent

Refines and improves artwork based on selected styles.

#### Constructor

```typescript
constructor(aiService: AIService, options?: {
  maxMemorySize?: number;
  processingDelay?: number;
  iterationCount?: number;
  refinementStrength?: number;
  focusAreas?: string[];
})
```

#### Methods

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| `refineArtwork(styles: Style[], requirements: string[])` | Refines artwork based on styles | Styles and requirements | `Promise<Artwork>` |
| `enhanceDetail(artwork: Artwork, area: string)` | Enhances detail in a specific area | Artwork and area | `Promise<Artwork>` |
| `balanceComposition(artwork: Artwork)` | Balances the composition | Artwork object | `Promise<Artwork>` |

### CriticAgent

Evaluates and provides feedback on artwork.

#### Constructor

```typescript
constructor(aiService: AIService, options?: {
  maxMemorySize?: number;
  processingDelay?: number;
  criteriaWeights?: Record<string, number>;
  detailedFeedback?: boolean;
  recommendationCount?: number;
})
```

#### Methods

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| `evaluateArtwork(artwork: Artwork, requirements: string[])` | Evaluates artwork | Artwork and requirements | `Promise<Critique>` |
| `identifyStrengths(artwork: Artwork)` | Identifies strengths | Artwork object | `Promise<string[]>` |
| `suggestImprovements(artwork: Artwork)` | Suggests improvements | Artwork object | `Promise<string[]>` |
| `scoreArtwork(artwork: Artwork)` | Scores artwork on multiple criteria | Artwork object | `Promise<Record<string, number>>` |

## Utility Functions

### createMultiAgentSystem

Creates and configures a multi-agent system with all required agents.

```typescript
function createMultiAgentSystem(options: {
  aiService: AIService;
  config?: {
    ideator?: IdeatorAgentOptions;
    stylist?: StylistAgentOptions;
    refiner?: RefinerAgentOptions;
    critic?: CriticAgentOptions;
  };
}): MultiAgentSystem
```

### createProjectMessage

Creates a message to start a new project.

```typescript
function createProjectMessage(
  title: string,
  description: string,
  requirements: string[]
): AgentMessage
```

## Type Definitions

### Project

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  status: 'in-progress' | 'completed';
  createdAt: number;
  completedAt?: number;
}
```

### Task

```typescript
interface Task {
  id: string;
  type: string;
  assignedTo: AgentRole;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: number;
  completedAt?: number;
  result?: any;
}
```

### Idea

```typescript
interface Idea {
  title: string;
  description: string;
  elements: string[];
  styles: string[];
  emotionalImpact: string;
  conceptualFramework: string;
}
```

### Style

```typescript
interface Style {
  name: string;
  description: string;
  visualCharacteristics: string[];
  colorPalette: string[];
  texture: string;
  composition: string;
  influences: string[];
  technicalApproach: string;
}
```

### Artwork

```typescript
interface Artwork {
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

### Critique

```typescript
interface Critique {
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

## Error Handling

The multi-agent system defines several error types:

### AgentError

Base class for all agent-related errors.

```typescript
class AgentError extends Error {
  constructor(message: string, public agentRole: AgentRole) {
    super(message);
    this.name = 'AgentError';
  }
}
```

### MessageProcessingError

Error that occurs during message processing.

```typescript
class MessageProcessingError extends AgentError {
  constructor(message: string, agentRole: AgentRole, public originalMessage: AgentMessage) {
    super(message, agentRole);
    this.name = 'MessageProcessingError';
  }
}
```

### TaskExecutionError

Error that occurs during task execution.

```typescript
class TaskExecutionError extends AgentError {
  constructor(message: string, agentRole: AgentRole, public taskId: string) {
    super(message, agentRole);
    this.name = 'TaskExecutionError';
  }
}
```

## Configuration Options

### System Configuration

```typescript
interface SystemOptions {
  maxMemorySize?: number;  // Maximum number of messages to keep in memory
  logLevel?: 'debug' | 'info' | 'warn' | 'error';  // Log level
}
```

### Agent Configuration

```typescript
interface AgentOptions {
  maxMemorySize?: number;  // Maximum number of messages to keep in memory
  processingDelay?: number;  // Delay between processing messages (ms)
}
```

### Ideator Agent Configuration

```typescript
interface IdeatorAgentOptions extends AgentOptions {
  diversityFactor?: number;  // 0-1, higher means more diverse ideas
  explorationDepth?: number;  // 1-5, higher means more detailed exploration
  maxIdeas?: number;  // Maximum number of ideas to generate
}
```

### Stylist Agent Configuration

```typescript
interface StylistAgentOptions extends AgentOptions {
  referenceLibrary?: string[];  // Art styles to reference
  colorPaletteSize?: number;  // Number of colors in generated palettes
  detailLevel?: 'low' | 'medium' | 'high';  // Level of detail in style specifications
}
```

### Refiner Agent Configuration

```typescript
interface RefinerAgentOptions extends AgentOptions {
  iterationCount?: number;  // Number of refinement iterations
  refinementStrength?: number;  // 0-1, higher means more aggressive refinement
  focusAreas?: string[];  // Areas to focus on during refinement
}
```

### Critic Agent Configuration

```typescript
interface CriticAgentOptions extends AgentOptions {
  criteriaWeights?: {  // Weights for different evaluation criteria
    aesthetics?: number;
    originality?: number;
    coherence?: number;
    technique?: number;
    impact?: number;
  };
  detailedFeedback?: boolean;  // Whether to provide detailed feedback
  recommendationCount?: number;  // Number of recommendations to provide
}
```

## Performance Metrics

```typescript
interface PerformanceMetrics {
  messageCount: number;  // Total number of messages processed
  averageProcessingTime: number;  // Average time to process a message (ms)
  agentMetrics: Record<AgentRole, {
    messageCount: number;  // Number of messages processed by this agent
    averageProcessingTime: number;  // Average time for this agent to process a message (ms)
    taskCount: number;  // Number of tasks completed by this agent
    averageTaskTime: number;  // Average time to complete a task (ms)
  }>;
  memoryUsage: {
    total: number;  // Total memory usage (bytes)
    byAgent: Record<AgentRole, number>;  // Memory usage by agent (bytes)
  };
}
``` 