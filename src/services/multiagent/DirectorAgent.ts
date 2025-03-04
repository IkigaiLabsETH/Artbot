import { BaseAgent, AgentRole, AgentMessage, MultiAgentSystem } from './index.js';
import { AIService, AIMessage } from '../ai/index.js';

// Director agent is responsible for coordinating the creative process
export class DirectorAgent extends BaseAgent {
  private multiAgentSystem: MultiAgentSystem;

  constructor(aiService: AIService, multiAgentSystem: MultiAgentSystem) {
    super(AgentRole.DIRECTOR, aiService);
    this.multiAgentSystem = multiAgentSystem;
    this.state.context = {
      currentProject: null,
      projectStage: 'planning',
      assignedTasks: {},
      completedTasks: []
    };
  }

  async initialize(): Promise<void> {
    await super.initialize();
    // Director-specific initialization
  }

  async process(message: AgentMessage): Promise<AgentMessage | null> {
    console.log(`DirectorAgent ${this.id} processing message from ${message.fromAgent}`);
    
    // Parse the message content
    let content: any;
    if (typeof message.content === 'string') {
      try {
        content = JSON.parse(message.content);
      } catch (e) {
        content = { text: message.content };
      }
    } else {
      content = message.content;
    }
    
    // Handle different message types
    if (content.type === 'start_project' || content.action === 'create_project') {
      return this.handleStartProject(message, content);
    } else if (message.type === 'response') {
      return this.handleAgentResponse(message);
    }
    
    return null;
  }

  private async handleStartProject(message: AgentMessage, content: any): Promise<AgentMessage | null> {
    console.log(`DirectorAgent ${this.id} starting project: ${content.project.title}`);
    
    // Store the project in the agent's context
    this.state.context.currentProject = content.project;
    this.state.context.sessionId = content.sessionId || `session-${Date.now()}`;
    this.state.context.projectStage = 'planning';
    this.state.context.useFlux = content.project.useFlux || false;
    
    // Log the project details
    console.log(`Project: ${content.project.title}`);
    console.log(`Description: ${content.project.description}`);
    console.log(`Using FLUX: ${this.state.context.useFlux ? 'Yes' : 'No'}`);
    
    // Create a response message
    const response: AgentMessage = {
      id: `${this.id}-response-${Date.now()}`,
      fromAgent: this.id,
      toAgent: message.fromAgent,
      content: `Project "${content.project.title}" started. I'll coordinate the creative process.`,
      timestamp: new Date(),
      type: 'response'
    };
    
    // Start the ideation phase
    setTimeout(() => this.startIdeationPhase(), 1000);
    
    return response;
  }

  private async handleAgentResponse(message: AgentMessage): Promise<AgentMessage | null> {
    const { content } = message;
    
    // Handle task completion
    if (content.action === 'task_completed') {
      const taskId = content.taskId;
      const task = this.state.context.assignedTasks[taskId];
      
      if (task) {
        // Mark task as completed
        task.status = 'completed';
        task.result = content.result;
        this.state.context.completedTasks.push(task);
        delete this.state.context.assignedTasks[taskId];
        
        // Determine next steps based on project stage
        switch (this.state.context.projectStage) {
          case 'planning':
            // Move to styling stage
            this.state.context.projectStage = 'styling';
            
            // Create styling task
            const stylingTask = {
              id: `task-styling-${Date.now()}`,
              type: 'styling',
              description: `Develop style for project: ${this.state.context.currentProject.title}`,
              ideas: task.result, // Pass ideation results
              status: 'pending'
            };
            
            this.state.context.assignedTasks[stylingTask.id] = stylingTask;
            
            // Send task to Stylist agent
            return this.createMessage(
              null, // broadcast to all
              {
                action: 'assign_task',
                task: stylingTask,
                targetRole: AgentRole.STYLIST,
                project: this.state.context.currentProject
              },
              'request'
            );
            
          case 'styling':
            // Move to refinement stage
            this.state.context.projectStage = 'refinement';
            
            // Create refinement task
            const refinementTask = {
              id: `task-refinement-${Date.now()}`,
              type: 'refinement',
              description: `Refine artwork for project: ${this.state.context.currentProject.title}`,
              style: task.result, // Pass styling results
              status: 'pending'
            };
            
            this.state.context.assignedTasks[refinementTask.id] = refinementTask;
            
            // Send task to Refiner agent
            return this.createMessage(
              null, // broadcast to all
              {
                action: 'assign_task',
                task: refinementTask,
                targetRole: AgentRole.REFINER,
                project: this.state.context.currentProject
              },
              'request'
            );
            
          case 'refinement':
            // Move to critique stage
            this.state.context.projectStage = 'critique';
            
            // Create critique task
            const critiqueTask = {
              id: `task-critique-${Date.now()}`,
              type: 'critique',
              description: `Critique artwork for project: ${this.state.context.currentProject.title}`,
              artwork: task.result, // Pass refinement results
              status: 'pending'
            };
            
            this.state.context.assignedTasks[critiqueTask.id] = critiqueTask;
            
            // Send task to Critic agent
            return this.createMessage(
              null, // broadcast to all
              {
                action: 'assign_task',
                task: critiqueTask,
                targetRole: AgentRole.CRITIC,
                project: this.state.context.currentProject
              },
              'request'
            );
            
          case 'critique':
            // Project is complete
            this.state.context.projectStage = 'completed';
            this.state.context.currentProject.status = 'completed';
            this.state.context.currentProject.feedback = task.result;
            
            // Notify all agents of project completion
            return this.createMessage(
              null, // broadcast to all
              {
                action: 'project_completed',
                project: this.state.context.currentProject,
                results: this.collectProjectResults()
              },
              'update'
            );
            
          default:
            return null;
        }
      }
    }
    
    return null;
  }
  
  private async handleUpdate(message: AgentMessage): Promise<AgentMessage | null> {
    // Handle status updates from other agents
    return null;
  }
  
  private async handleFeedback(message: AgentMessage): Promise<AgentMessage | null> {
    // Handle feedback from other agents or external sources
    return null;
  }
  
  private collectProjectResults(): any {
    // Collect all results from completed tasks
    const results: Record<string, any> = {};
    
    for (const task of this.state.context.completedTasks) {
      results[task.type] = task.result;
    }
    
    return results;
  }

  private async startIdeationPhase(): Promise<void> {
    console.log(`DirectorAgent ${this.id} starting ideation phase`);
    
    // Update the project stage
    this.state.context.projectStage = 'ideation';
    
    // Create ideation task
    const ideationTask = {
      id: `task-ideation-${Date.now()}`,
      type: 'ideation',
      description: `Generate ideas for project: ${this.state.context.currentProject.title}`,
      status: 'pending'
    };
    
    this.state.context.assignedTasks = this.state.context.assignedTasks || {};
    this.state.context.assignedTasks[ideationTask.id] = ideationTask;
    
    // Send task to Ideator agent
    const message = this.createMessage(
      null, // broadcast to all
      {
        action: 'assign_task',
        task: ideationTask,
        targetRole: AgentRole.IDEATOR,
        project: this.state.context.currentProject
      },
      'request'
    );
    
    // Send the message using the multiAgentSystem
    this.multiAgentSystem.sendMessage(message);
  }

  private async startRefinementPhase(): Promise<void> {
    console.log(`DirectorAgent ${this.id} starting refinement phase`);
    
    // Update the project stage
    this.state.context.projectStage = 'refinement';
    
    // Get the selected style from the previous phase
    const style = this.state.context.selectedStyle;
    console.log(`Selected style: ${JSON.stringify(style)}`);
    
    // Determine the refiner agent to use based on the useFlux flag
    let refinerAgents;
    let refinerRole;
    
    if (this.state.context.useFlux) {
      console.log('Using FLUX refiner agent');
      refinerRole = 'flux_refiner';
      // Find the FluxRefinerAgent by its constructor name
      refinerAgents = Array.from(this.multiAgentSystem.getAgentsByRole(AgentRole.REFINER)).filter(
        agent => agent.constructor.name === 'FluxRefinerAgent'
      );
      console.log(`Found ${refinerAgents.length} FLUX refiner agents`);
    } else {
      // For standard refinement, use the REFINER role
      console.log('Using standard refiner agent');
      refinerRole = AgentRole.REFINER;
      refinerAgents = this.multiAgentSystem.getAgentsByRole(AgentRole.REFINER);
      console.log(`Found ${refinerAgents.length} standard refiner agents`);
    }
    
    if (!refinerAgents || refinerAgents.length === 0) {
      console.error(`No ${refinerRole} agent found`);
      return;
    }
    
    const refinerAgent = refinerAgents[0];
    console.log(`Selected refiner agent: ${refinerAgent.id}`);
    
    // Create a task assignment message
    const message: AgentMessage = {
      id: `${this.id}-refine-task-${Date.now()}`,
      fromAgent: this.id,
      toAgent: refinerAgent.id,
      content: JSON.stringify({
        task_assignment: 'refine_artwork',
        refine_artwork: true,
        project: this.state.context.currentProject,
        style: style,
        sessionId: this.state.context.sessionId,
        outputFilename: this.state.context.currentProject.outputFilename
      }),
      timestamp: new Date(),
      type: 'request'
    };
    
    console.log(`Sending refinement task to ${refinerAgent.id}`);
    console.log(`Message content: ${typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}`);
    
    // Send the message to the refiner agent
    this.multiAgentSystem.sendMessage(message);
    
    // Store the task assignment
    this.state.context.assignedTasks[refinerAgent.id] = {
      task: 'refine_artwork',
      assignedAt: new Date()
    };
    
    console.log(`Refinement task assigned to ${refinerAgent.id}`);
  }
} 