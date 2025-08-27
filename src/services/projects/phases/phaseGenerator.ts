import { 
  collection, 
  doc, 
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { log } from '@/lib/logger';
import { 
  FIBER_PROJECT_PHASES,
  PhaseStatus,
  StepStatus
} from '@/types/project.types';

/**
 * Generate phases for a new project based on project type
 */
export async function generateProjectPhases(projectId: string, projectType: string): Promise<void> {
  try {
    const templates = projectType === 'fiber' ? FIBER_PROJECT_PHASES : [];
    const batch = writeBatch(db);
    
    for (const template of templates) {
      const phaseData = {
        name: template.name,
        description: template.description,
        order: template.order,
        status: PhaseStatus.NOT_STARTED,
        progress: 0,
        startDate: null,
        endDate: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const phaseRef = doc(collection(db, 'projects', projectId, 'phases'));
      batch.set(phaseRef, phaseData);
      
      // Generate steps for each phase
      if (template.defaultSteps) {
        for (const stepTemplate of template.defaultSteps) {
          const stepData = {
            name: stepTemplate.name,
            description: stepTemplate.description,
            order: stepTemplate.order,
            status: StepStatus.NOT_STARTED,
            progress: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          const stepRef = doc(collection(db, 'projects', projectId, 'phases', phaseRef.id, 'steps'));
          batch.set(stepRef, stepData);
        }
      }
    }
    
    await batch.commit();
  } catch (error) {
    log.error('Error generating project phases:', { data: error }, 'phaseGenerator');
    throw new Error('Failed to generate project phases');
  }
}