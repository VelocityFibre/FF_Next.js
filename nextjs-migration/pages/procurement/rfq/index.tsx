import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { RFQList } from '../../../src/modules/procurement/rfq/components/RFQList';
import { RFQProvider } from '../../../src/modules/procurement/rfq/context/RFQContext';
import type { RFQ } from '../../../src/types/procurement/rfq.types';

interface RFQPageProps {
  projectId?: string;
  projectName?: string;
  initialData?: RFQ[];
}

export default function RFQPage({ projectId, projectName, initialData = [] }: RFQPageProps) {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<RFQ[]>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData.length);

  useEffect(() => {
    if (!initialData.length) {
      loadRFQData();
    }
  }, [projectId]);

  const loadRFQData = async () => {
    setIsLoading(true);
    try {
      const url = projectId 
        ? `/api/procurement/rfq?projectId=${projectId}`
        : '/api/procurement/rfq';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load RFQ data');
      const data = await response.json();
      setRfqs(data.rfqs || []);
    } catch (error) {
      console.error('Error loading RFQ data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRFQ = () => {
    router.push('/procurement/rfq/new');
  };

  const handleEditRFQ = (id: string) => {
    router.push(`/procurement/rfq/${id}/edit`);
  };

  const handleViewRFQ = (id: string) => {
    router.push(`/procurement/rfq/${id}`);
  };

  return (
    <RFQProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Request for Quotations</h1>
            {projectName && (
              <p className="mt-2 text-gray-600">Project: {projectName}</p>
            )}
          </div>

          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {rfqs.length} RFQ{rfqs.length !== 1 ? 's' : ''} found
            </div>
            <button
              onClick={handleCreateRFQ}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create New RFQ
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading RFQ data...</div>
            </div>
          ) : (
            <RFQList
              rfqs={rfqs}
              onView={handleViewRFQ}
              onEdit={handleEditRFQ}
            />
          )}
        </div>
      </div>
    </RFQProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const projectId = query.projectId as string | undefined;
  const projectName = query.projectName as string | undefined;
  
  return {
    props: {
      projectId: projectId || null,
      projectName: projectName || null,
      initialData: []
    }
  };
};