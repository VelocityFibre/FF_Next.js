/**
 * AssignmentDetail Component - Detailed view of project assignments
 * Following FibreFlow patterns and keeping under 250 lines
 */

import { useState } from 'react';
import { Calendar, DollarSign, Users, FileText, Edit, TrendingUp, Clock } from 'lucide-react';
import { ProjectAssignment, ContractorTeam } from '@/types/contractor.types';
import { log } from '@/lib/logger';

interface AssignmentDetailProps {
  assignment: ProjectAssignment;
  teams: ContractorTeam[];
  onUpdate: () => void;
}

export function AssignmentDetail({ assignment, teams, onUpdate }: AssignmentDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(assignment.progressPercentage);

  const getStatusColor = (status: string) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      on_hold: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAssignmentTypeLabel = (type: string) => {
    const labels = {
      primary: 'Primary Contractor',
      subcontractor: 'Subcontractor',
      consultant: 'Consultant',
      specialist: 'Specialist'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const assignedTeam = teams.find(team => team.id === assignment.teamId);
  const daysToCompletion = Math.ceil(
    (new Date(assignment.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleProgressUpdate = async () => {
    try {
      // In production, this would update via the service
      // await contractorService.assignments.updateProgress(assignment.id, progress);
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      log.error('Failed to update progress:', { data: error }, 'AssignmentDetail');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Assignment Details</h3>
          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(assignment.status)}`}>
            {assignment.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Project Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Project Information</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Project ID:</span>
              <span className="text-sm font-medium text-gray-900">{assignment.projectId}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm font-medium text-gray-900">
                {getAssignmentTypeLabel(assignment.assignmentType)}
              </span>
            </div>
            
            {assignedTeam && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Assigned Team:</span>
                <span className="text-sm font-medium text-gray-900">
                  {assignedTeam.teamName} ({assignedTeam.teamType})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scope of Work */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Scope of Work</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{assignment.scope}</p>
        </div>

        {/* Responsibilities */}
        {assignment.responsibilities && assignment.responsibilities.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Key Responsibilities</h4>
            <ul className="space-y-1">
              {assignment.responsibilities.map((responsibility, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 text-xs mt-1">•</span>
                  <span className="text-sm text-gray-700">{responsibility}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timeline */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Timeline</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Start Date</span>
              </div>
              <p className="text-sm text-blue-700">
                {new Date(assignment.startDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">End Date</span>
              </div>
              <p className="text-sm text-green-700">
                {new Date(assignment.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {daysToCompletion > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">
                  {daysToCompletion} days remaining
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Financial Information */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Financial Details</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Contract Value</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                R {assignment.contractValue.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-700">Paid Amount</span>
              <span className="text-sm font-bold text-green-900">
                R {assignment.paidAmount.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-700">Outstanding</span>
              <span className="text-sm font-bold text-yellow-900">
                R {(assignment.contractValue - assignment.paidAmount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-gray-900">Progress</h4>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion</span>
              <span className="text-sm font-medium text-gray-900">{progress}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {isEditing && (
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={handleProgressUpdate}
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        {(assignment.performanceRating || assignment.qualityScore || assignment.timelinessScore) && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Performance Metrics</h4>
            <div className="grid grid-cols-3 gap-3">
              {assignment.performanceRating && (
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-purple-900">{assignment.performanceRating}</p>
                  <p className="text-xs text-purple-700">Performance</p>
                </div>
              )}
              
              {assignment.qualityScore && (
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-900">{assignment.qualityScore}</p>
                  <p className="text-xs text-green-700">Quality</p>
                </div>
              )}
              
              {assignment.timelinessScore && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-900">{assignment.timelinessScore}</p>
                  <p className="text-xs text-blue-700">Timeliness</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {assignment.assignmentNotes && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Notes</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {assignment.assignmentNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}