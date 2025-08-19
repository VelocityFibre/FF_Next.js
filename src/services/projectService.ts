import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  writeBatch,
  QueryConstraint,
  Unsubscribe
} from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { 
  Project, 
  Phase, 
  Step, 
  Task, 
  ProjectFormData,
  ProjectFilter,
  ProjectSummary,
  ProjectHierarchy,
  PhaseTemplate,
  FIBER_PROJECT_PHASES,
  ProjectStatus,
  PhaseStatus,
  StepStatus,
  TaskStatus
} from '@/types/project.types';

/**
 * Project Service - Handles all project-related operations
 * Manages the 4-level hierarchy: Project > Phase > Step > Task
 */
export const projectService = {
  // Project CRUD Operations
  
  /**
   * Get all projects with optional filtering
   */
  async getAll(filter?: ProjectFilter): Promise<Project[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
      
      if (filter?.status?.length) {
        constraints.push(where('status', 'in', filter.status));
      }
      
      if (filter?.projectType?.length) {
        constraints.push(where('projectType', 'in', filter.projectType));
      }
      
      if (filter?.clientId) {
        constraints.push(where('clientId', '==', filter.clientId));
      }
      
      if (filter?.projectManagerId) {
        constraints.push(where('projectManagerId', '==', filter.projectManagerId));
      }
      
      const q = query(collection(db, 'projects'), ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
    } catch (error) {
      console.error('Error getting projects:', error);
      throw new Error('Failed to fetch projects');
    }
  },

  /**
   * Get project by ID
   */
  async getById(id: string): Promise<Project | null> {
    try {
      const docRef = doc(db, 'projects', id);
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return { 
        id: snapshot.id, 
        ...snapshot.data() 
      } as Project;
    } catch (error) {
      console.error('Error getting project:', error);
      throw new Error('Failed to fetch project');
    }
  },

  /**
   * Create new project
   */
  async create(data: ProjectFormData): Promise<string> {
    try {
      const now = Timestamp.now();
      
      const projectData: Omit<Project, 'id'> = {
        ...data,
        startDate: Timestamp.fromDate(data.startDate),
        expectedEndDate: Timestamp.fromDate(data.expectedEndDate),
        createdAt: now,
        updatedAt: now,
        createdBy: auth.currentUser?.uid || 'unknown',
        lastModifiedBy: auth.currentUser?.uid || 'unknown',
        
        // Initialize client info (would be populated from client selection)
        clientName: '',
        clientOrganization: '',
        clientContact: '',
        clientEmail: '',
        clientPhone: '',
        
        // Initialize project manager info
        projectManagerName: '',
        
        // Initialize financial tracking
        budgetUsed: 0,
        actualCost: 0,
        
        // Initialize progress tracking
        overallProgress: 0,
        activeTasksCount: 0,
        completedTasksCount: 0,
        currentPhase: 'planning',
        currentPhaseProgress: 0,
      };
      
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      
      // Initialize project with phases from template
      await this.initializeProjectPhases(docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  },

  /**
   * Update project
   */
  async update(id: string, data: Partial<ProjectFormData>): Promise<void> {
    try {
      const docRef = doc(db, 'projects', id);
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now(),
        lastModifiedBy: auth.currentUser?.uid || 'unknown',
      };
      
      // Convert dates to Timestamps if provided
      if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(data.startDate);
      }
      if (data.expectedEndDate) {
        updateData.expectedEndDate = Timestamp.fromDate(data.expectedEndDate);
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  },

  /**
   * Delete project and all its phases, steps, tasks
   */
  async delete(id: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete all phases, steps, and tasks
      const phases = await this.getProjectPhases(id);
      
      for (const phase of phases) {
        // Delete phase steps and tasks
        const steps = await this.getPhaseSteps(id, phase.id!);
        
        for (const step of steps) {
          // Delete step tasks
          const tasks = await this.getStepTasks(id, phase.id!, step.id!);
          
          for (const task of tasks) {
            batch.delete(doc(db, 'tasks', task.id!));
          }
          
          batch.delete(doc(db, 'steps', step.id!));
        }
        
        batch.delete(doc(db, 'phases', phase.id!));
      }
      
      // Delete the project
      batch.delete(doc(db, 'projects', id));
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  },

  /**
   * Initialize project with default phases from template
   */
  async initializeProjectPhases(projectId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();
      
      for (const phaseTemplate of FIBER_PROJECT_PHASES) {
        // Create phase
        const phaseRef = doc(collection(db, 'phases'));
        const phaseData: Omit<Phase, 'id'> = {
          projectId,
          type: phaseTemplate.type,
          name: phaseTemplate.name,
          status: PhaseStatus.NOT_STARTED,
          order: phaseTemplate.order,
          progress: 0,
          createdAt: now,
          updatedAt: now,
        };
        batch.set(phaseRef, phaseData);
        
        // Create steps for this phase
        for (const stepTemplate of phaseTemplate.steps) {
          const stepRef = doc(collection(db, 'steps'));
          const stepData: Omit<Step, 'id'> = {
            projectId,
            phaseId: phaseRef.id,
            name: stepTemplate.name,
            description: stepTemplate.description || `${stepTemplate.name} phase step`,
            status: StepStatus.NOT_STARTED,
            order: stepTemplate.order,
            progress: 0,
            estimatedHours: stepTemplate.estimatedHours,
            createdAt: now,
            updatedAt: now,
          };
          batch.set(stepRef, stepData);
          
          // Create tasks for this step
          for (const taskTemplate of stepTemplate.tasks) {
            const taskRef = doc(collection(db, 'tasks'));
            const taskData: Omit<Task, 'id'> = {
              projectId,
              phaseId: phaseRef.id,
              stepId: stepRef.id,
              name: taskTemplate.name,
              description: taskTemplate.description || `${taskTemplate.name} task`,
              status: TaskStatus.TODO,
              priority: taskTemplate.priority,
              estimatedHours: taskTemplate.estimatedHours,
              createdAt: now,
              updatedAt: now,
            };
            batch.set(taskRef, taskData);
          }
        }
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error initializing project phases:', error);
      throw new Error('Failed to initialize project phases');
    }
  },

  // Phase Operations
  
  /**
   * Get all phases for a project
   */
  async getProjectPhases(projectId: string): Promise<Phase[]> {
    try {
      // Simplified query to avoid index issues during deployment
      const q = query(
        collection(db, 'phases'),
        where('projectId', '==', projectId)
      );
      const snapshot = await getDocs(q);
      
      // Sort in memory instead of using orderBy
      const phases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Phase));
      
      return phases.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error getting project phases:', error);
      throw new Error('Failed to fetch project phases');
    }
  },

  // Step Operations
  
  /**
   * Get all steps for a phase
   */
  async getPhaseSteps(projectId: string, phaseId: string): Promise<Step[]> {
    try {
      // Simplified query to avoid index issues during deployment
      const q = query(
        collection(db, 'steps'),
        where('projectId', '==', projectId),
        where('phaseId', '==', phaseId)
      );
      const snapshot = await getDocs(q);
      
      // Sort in memory instead of using orderBy
      const steps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Step));
      
      return steps.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error getting phase steps:', error);
      throw new Error('Failed to fetch phase steps');
    }
  },

  // Task Operations
  
  /**
   * Get all tasks for a step
   */
  async getStepTasks(projectId: string, phaseId: string, stepId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
        where('phaseId', '==', phaseId),
        where('stepId', '==', stepId)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
    } catch (error) {
      console.error('Error getting step tasks:', error);
      throw new Error('Failed to fetch step tasks');
    }
  },

  /**
   * Get all tasks for a project (across all phases/steps)
   */
  async getProjectTasks(projectId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
    } catch (error) {
      console.error('Error getting project tasks:', error);
      throw new Error('Failed to fetch project tasks');
    }
  },

  // Hierarchy Operations
  
  /**
   * Get complete project hierarchy (project with phases, steps, tasks)
   */
  async getProjectHierarchy(projectId: string): Promise<ProjectHierarchy | null> {
    try {
      // Get project
      const project = await this.getById(projectId);
      if (!project) return null;
      
      // Get phases
      const phases = await this.getProjectPhases(projectId);
      
      // Get steps and tasks for each phase
      const phaseHierarchies = await Promise.all(
        phases.map(async (phase) => {
          const steps = await this.getPhaseSteps(projectId, phase.id!);
          
          const stepHierarchies = await Promise.all(
            steps.map(async (step) => {
              const tasks = await this.getStepTasks(projectId, phase.id!, step.id!);
              return {
                ...step,
                tasks
              };
            })
          );
          
          return {
            ...phase,
            steps: stepHierarchies
          };
        })
      );
      
      return {
        ...project,
        phases: phaseHierarchies
      };
    } catch (error) {
      console.error('Error getting project hierarchy:', error);
      throw new Error('Failed to fetch project hierarchy');
    }
  },

  // Summary & Analytics
  
  /**
   * Get project summary statistics
   */
  async getProjectSummary(): Promise<ProjectSummary> {
    try {
      const projects = await this.getAll();
      
      const summary: ProjectSummary = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === ProjectStatus.ACTIVE).length,
        completedProjects: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
        onHoldProjects: projects.filter(p => p.status === ProjectStatus.ON_HOLD).length,
        totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
        budgetUsed: projects.reduce((sum, p) => sum + p.budgetUsed, 0),
        averageProgress: projects.length > 0 
          ? projects.reduce((sum, p) => sum + p.overallProgress, 0) / projects.length 
          : 0,
        projectsByType: {} as any,
        projectsByStatus: {} as any,
      };
      
      // Count by type
      projects.forEach(project => {
        summary.projectsByType[project.projectType] = 
          (summary.projectsByType[project.projectType] || 0) + 1;
      });
      
      // Count by status
      projects.forEach(project => {
        summary.projectsByStatus[project.status] = 
          (summary.projectsByStatus[project.status] || 0) + 1;
      });
      
      return summary;
    } catch (error) {
      console.error('Error getting project summary:', error);
      throw new Error('Failed to fetch project summary');
    }
  },

  // Real-time subscriptions
  
  /**
   * Subscribe to projects changes
   */
  subscribeToProjects(
    callback: (projects: Project[]) => void,
    filter?: ProjectFilter
  ): Unsubscribe {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    
    if (filter?.status?.length) {
      constraints.push(where('status', 'in', filter.status));
    }
    
    const q = query(collection(db, 'projects'), ...constraints);
    
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
      
      callback(projects);
    });
  },

  /**
   * Subscribe to single project changes
   */
  subscribeToProject(
    projectId: string,
    callback: (project: Project | null) => void
  ): Unsubscribe {
    const docRef = doc(db, 'projects', projectId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const project = {
          id: snapshot.id,
          ...snapshot.data()
        } as Project;
        callback(project);
      } else {
        callback(null);
      }
    });
  },

  // Progress tracking helpers
  
  /**
   * Update project progress based on task completion
   */
  async updateProjectProgress(projectId: string): Promise<void> {
    try {
      const tasks = await this.getProjectTasks(projectId);
      const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
      
      const overallProgress = tasks.length > 0 
        ? (completedTasks.length / tasks.length) * 100 
        : 0;
      
      const updateData = {
        overallProgress: Math.round(overallProgress),
        activeTasksCount: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        completedTasksCount: completedTasks.length,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(doc(db, 'projects', projectId), updateData);
    } catch (error) {
      console.error('Error updating project progress:', error);
      throw new Error('Failed to update project progress');
    }
  }
};