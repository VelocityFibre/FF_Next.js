import { FileText, Upload, Download, Eye, File } from 'lucide-react';
import { Project, SOWDocumentType } from '../../types/project.types';

interface ProjectDocumentsProps {
  project: Project;
}

const documentTypeLabels: Record<SOWDocumentType, string> = {
  [SOWDocumentType.PROPOSAL]: 'Proposal',
  [SOWDocumentType.CONTRACT]: 'Contract',
  [SOWDocumentType.SOW]: 'SOW',
  [SOWDocumentType.TECHNICAL_SPEC]: 'Technical Spec',
  [SOWDocumentType.BUDGET]: 'Budget',
  [SOWDocumentType.SCHEDULE]: 'Schedule',
  [SOWDocumentType.REPORT]: 'Report',
  [SOWDocumentType.OTHER]: 'Other',
};

const documentTypeColors: Record<SOWDocumentType, string> = {
  [SOWDocumentType.PROPOSAL]: 'bg-blue-100 text-blue-700',
  [SOWDocumentType.CONTRACT]: 'bg-purple-100 text-purple-700',
  [SOWDocumentType.SOW]: 'bg-green-100 text-green-700',
  [SOWDocumentType.TECHNICAL_SPEC]: 'bg-orange-100 text-orange-700',
  [SOWDocumentType.BUDGET]: 'bg-yellow-100 text-yellow-700',
  [SOWDocumentType.SCHEDULE]: 'bg-pink-100 text-pink-700',
  [SOWDocumentType.REPORT]: 'bg-indigo-100 text-indigo-700',
  [SOWDocumentType.OTHER]: 'bg-gray-100 text-gray-700',
};

export function ProjectDocuments({ project }: ProjectDocumentsProps) {
  const documents = project.documents || [];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-8">
        <div className="text-center">
          <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-neutral-900 mb-1">No Documents</h3>
          <p className="text-neutral-600 mb-4">No documents have been uploaded for this project yet.</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Upload className="h-4 w-4" />
            Upload Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Project Documents</h3>
          <p className="text-sm text-neutral-600 mt-1">
            {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Upload className="h-4 w-4" />
          Upload
        </button>
      </div>
      
      <div className="divide-y divide-neutral-200">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <File className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-neutral-900">{doc.name}</h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      documentTypeColors[doc.type as SOWDocumentType] || documentTypeColors[SOWDocumentType.OTHER]
                    }`}>
                      {documentTypeLabels[doc.type as SOWDocumentType] || 'Other'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-neutral-600">
                    <span>{formatFileSize(doc.size || 0)}</span>
                    <span>•</span>
                    <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                    {doc.uploadedBy && (
                      <>
                        <span>•</span>
                        <span>by {doc.uploadedBy}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Eye className="h-4 w-4 text-neutral-600" />
                </button>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Download className="h-4 w-4 text-neutral-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}