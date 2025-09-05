import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { BOQList } from '../../../src/modules/procurement/boq/components/BOQList';
import { BOQProvider } from '../../../src/modules/procurement/boq/context/BOQContext';
import type { BOQItem } from '../../../src/types/procurement/boq.types';

interface BOQPageProps {
  projectId?: string;
  projectName?: string;
  initialData?: BOQItem[];
}

export default function BOQPage({ projectId, projectName, initialData = [] }: BOQPageProps) {
  const router = useRouter();
  const [boqItems, setBoqItems] = useState<BOQItem[]>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData.length);

  useEffect(() => {
    if (!initialData.length) {
      loadBOQData();
    }
  }, [projectId]);

  const loadBOQData = async () => {
    setIsLoading(true);
    try {
      const url = projectId 
        ? `/api/procurement/boq?projectId=${projectId}`
        : '/api/procurement/boq';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load BOQ data');
      const data = await response.json();
      setBoqItems(data.items || []);
    } catch (error) {
      console.error('Error loading BOQ data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBOQ = () => {
    router.push('/procurement/boq/new');
  };

  const handleEditBOQ = (id: string) => {
    router.push(`/procurement/boq/${id}/edit`);
  };

  const handleViewBOQ = (id: string) => {
    router.push(`/procurement/boq/${id}`);
  };

  return (
    <BOQProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bill of Quantities</h1>
            {projectName && (
              <p className="mt-2 text-gray-600">Project: {projectName}</p>
            )}
          </div>

          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {boqItems.length} BOQ item{boqItems.length !== 1 ? 's' : ''} found
            </div>
            <button
              onClick={handleCreateBOQ}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create New BOQ
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading BOQ data...</div>
            </div>
          ) : (
            <BOQList
              items={boqItems}
              onView={handleViewBOQ}
              onEdit={handleEditBOQ}
            />
          )}
        </div>
      </div>
    </BOQProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const projectId = query.projectId as string | undefined;
  const projectName = query.projectName as string | undefined;
  
  // Optionally fetch initial data on the server side
  let initialData: BOQItem[] = [];
  
  try {
    // You can fetch initial data here if needed
    // const response = await fetch(`${process.env.API_URL}/api/procurement/boq`);
    // initialData = await response.json();
  } catch (error) {
    console.error('Error fetching initial BOQ data:', error);
  }
  
  return {
    props: {
      projectId: projectId || null,
      projectName: projectName || null,
      initialData
    }
  };
};