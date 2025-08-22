/**
 * ProjectRequirementsList Component - Simple requirements list
 */

import { ProjectComplianceRequirement } from '@/services/contractor/contractorComplianceService';

interface ProjectRequirementsListProps {
  requirements: ProjectComplianceRequirement[];
}

export function ProjectRequirementsList({ requirements }: ProjectRequirementsListProps) {
  return (
    <div className="space-y-4">
      {requirements.map((req) => (
        <div key={req.id} className="bg-white p-4 rounded-lg border">
          <h3 className="font-medium">{req.requirement}</h3>
          <p className="text-sm text-gray-600">Type: {req.requirementType}</p>
        </div>
      ))}
    </div>
  );
}