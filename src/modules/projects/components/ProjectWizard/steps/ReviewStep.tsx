import { UseFormReturn } from 'react-hook-form';
import { CheckCircle } from 'lucide-react';
import type { FormData } from '../types';

interface ReviewStepProps {
  form: UseFormReturn<FormData>;
  clientName: string;
  projectManagerName: string;
}

export function ReviewStep({ 
  form, 
  clientName = 'Unknown', 
  projectManagerName = 'Unassigned' 
}: ReviewStepProps) {
  const formData = form.getValues();

  const reviewSections = [
    {
      title: 'Basic Information',
      items: [
        { label: 'Project Name', value: formData.name || 'Not specified' },
        { label: 'Description', value: formData.description || 'No description' },
        { label: 'Client', value: clientName },
        { label: 'Start Date', value: formData.startDate || 'Not set' },
        { label: 'End Date', value: formData.endDate || 'Not set' }
      ]
    },
    {
      title: 'Project Details',
      items: [
        { label: 'Location', value: formData.location?.city ? `${formData.location.city}, ${formData.location.province}` : 'Not specified' },
        { label: 'Budget', value: formData.budget?.totalBudget ? `R ${Number(formData.budget.totalBudget).toLocaleString()}` : 'Not set' },
        { label: 'Priority', value: formData.priority || 'Medium' },
        { label: 'Project Manager', value: projectManagerName },
        { label: 'Notes', value: formData.description || 'No additional notes' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Review Project Information
        </h3>
        <p className="text-sm text-gray-600">
          Please review all information before creating the project
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        {reviewSections.map((section) => (
          <div key={section.title}>
            <h4 className="font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">
              {section.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.items.map((item) => (
                <div key={item.label} className="flex flex-col">
                  <dt className="text-sm font-medium text-gray-500">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {item.value}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Ready to create project
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Click "Create Project" to proceed. You can upload SOW documents and 
                make additional changes after the project is created.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}