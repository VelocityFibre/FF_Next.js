import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SOWUploadWizard } from '@/components/sow/SOWUploadWizard';
import { ArrowLeft } from 'lucide-react';

export function SOWImportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || '';
  const projectName = searchParams.get('projectName') || 'Current Project';
  const [showWizard, setShowWizard] = useState(false);

  // Delay showing the wizard to avoid immediate database calls
  useEffect(() => {
    if (projectId) {
      const timer = setTimeout(() => setShowWizard(true), 100);
      return () => clearTimeout(timer);
    }
  }, [projectId]);

  const handleComplete = () => {
    if (projectId) {
      navigate(`/app/projects/${projectId}`);
    } else {
      navigate('/app/sow');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!projectId) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              No project selected. Please select a project from the projects list to import SOW data.
            </p>
          </div>
          <button
            onClick={() => navigate('/app/projects')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Import SOW Data</h1>
          <p className="text-gray-600 mt-1">Upload Excel files containing project scope of work data</p>
        </div>
      </div>

      {showWizard && (
        <SOWUploadWizard
          projectId={projectId}
          projectName={projectName}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}