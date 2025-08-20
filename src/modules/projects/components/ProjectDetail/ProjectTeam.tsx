import { Users, Mail, Phone, Shield } from 'lucide-react';
import { Project } from '../../types/project.types';

interface ProjectTeamProps {
  project: Project;
}

export function ProjectTeam({ project }: ProjectTeamProps) {
  const teamMembers = project.teamMembers || [];

  if (teamMembers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-8">
        <div className="text-center">
          <Users className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-neutral-900 mb-1">No Team Members</h3>
          <p className="text-neutral-600">No team members have been assigned to this project yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      <div className="p-6 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">Team Members</h3>
        <p className="text-sm text-neutral-600 mt-1">
          {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} assigned to this project
        </p>
      </div>
      
      <div className="divide-y divide-neutral-200">
        {teamMembers.map((member) => (
          <div key={member.id} className="p-6 hover:bg-neutral-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-semibold text-lg">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">{member.name}</h4>
                  <p className="text-sm text-neutral-600 mt-1">{member.role}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    {member.email && (
                      <a 
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-primary-600"
                      >
                        <Mail className="h-4 w-4" />
                        {member.email}
                      </a>
                    )}
                    {member.phone && (
                      <a 
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-primary-600"
                      >
                        <Phone className="h-4 w-4" />
                        {member.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {member.isLead && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  <Shield className="h-3.5 w-3.5" />
                  Team Lead
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}