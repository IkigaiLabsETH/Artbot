import { BaseAgent, AgentRole, AgentMessage } from './index';
import { AIService, AIMessage } from '../ai';

// Director agent is responsible for coordinating the creative process
export class DirectorAgent extends BaseAgent {
  constructor(aiService: AIService) {
    super(AgentRole.DIRECTOR, aiService);
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
    // Add message to memory
    this.addToMemory(message);
    
    // Update state based on message
    this.state.status = 'working';
    
    try {
      switch (message.type) {
        case 'request':
          return await this.handleRequest(message);
        case 'response':
          return await this.handleResponse(message);
        case 'update':
          return await this.handleUpdate(message);
        case 'feedback':
          return await this.handleFeedback(message);
        default:
          return null;
      }
    } finally {
      this.state.status = 'idle';
    }
  }
  
  private async handleRequest(message: AgentMessage): Promise<AgentMessage | null> {
    const { content } = message;
    
    // Handle project creation request
    if (content.action === 'create_project') {
      // Create a new project
      const project = {
        id: content.id || `project-${Date.now()}`,
        title: content.title || 'Untitled Project',
        description: content.description || '',
        requirements: content.requirements || [],
        createdAt: new Date(),
        status: 'planning'
      };
      
      // Update context
      this.state.context.currentProject = project;
      this.state.context.projectStage = 'planning';
      
      // Create tasks for other agents
      const ideationTask = {
        id: `task-ideation-${Date.now()}`,
        type: 'ideation',
        description: `Generate creative ideas for project: ${project.title}`,
        requirements: project.requirements,
        status: 'pending'
      };
      
      this.state.context.assignedTasks[ideationTask.id] = ideationTask;
      
      // Send task to Ideator agent
      return this.createMessage(
        null, // broadcast to all
        {
          action: 'assign_task',
          task: ideationTask,
          targetRole: AgentRole.IDEATOR,
          project
        },
        'request'
      );
    }
    
    return null;
  }
  
  private async handleResponse(message: AgentMessage): Promise<AgentMessage | null> {
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
} 