import { useState, useEffect } from 'react';
import { SOW, SOWFilterType } from '../types/sow.types';

export function useSOWData() {
  const [sows, setSOWs] = useState<SOW[]>([]);
  const [filter, setFilter] = useState<SOWFilterType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSOWData();
  }, []);

  const fetchSOWData = async () => {
    try {
      setLoading(true);
      
      // Fetch all projects first
      const projectsResponse = await fetch('http://localhost:3001/api/projects');
      const projectsResult = await projectsResponse.json();
      const projects = projectsResult.data || [];
      
      // For each project, fetch SOW data
      const sowPromises = projects.map(async (project: any) => {
        try {
          // Fetch poles, drops, and fibre data for each project
          const [polesRes, dropsRes, fibreRes, statusRes] = await Promise.all([
            fetch(`http://localhost:3001/api/sow/poles?projectId=${project.id}`),
            fetch(`http://localhost:3001/api/sow/drops?projectId=${project.id}`),
            fetch(`http://localhost:3001/api/sow/fibre?projectId=${project.id}`),
            fetch(`http://localhost:3001/api/sow/import-status/${project.id}`)
          ]);
          
          const [polesData, dropsData, fibreData, statusData] = await Promise.all([
            polesRes.json(),
            dropsRes.json(),
            fibreRes.json(),
            statusRes.json()
          ]);
          
          // Calculate totals and completion
          const totalPoles = polesData.data?.length || 0;
          const totalDrops = dropsData.data?.length || 0;
          const totalFibre = fibreData.data?.length || 0;
          
          // Calculate houses vs spares
          // LAW.ONT.DRxxxxxx = actual house drops (connected homes)
          // "Spare" in address = spare drops (not yet connected)
          const houses = dropsData.data?.filter((d: any) => 
            d.address && d.address.startsWith('LAW.ONT.DR')
          ).length || 0;
          const spares = dropsData.data?.filter((d: any) => 
            d.address && (d.address === 'Spare' || d.address.toLowerCase().includes('spare'))
          ).length || 0;
          
          // Calculate total fibre distance
          const totalFibreDistance = fibreData.data?.reduce((sum: number, segment: any) => 
            sum + (segment.distance || 0), 0) || 0;
          
          // Determine SOW status based on import status
          const importStatuses = statusData.data || [];
          const allCompleted = importStatuses.length === 3 && 
            importStatuses.every((s: any) => s.status === 'completed');
          const hasData = totalPoles > 0 || totalDrops > 0 || totalFibre > 0;
          
          if (!hasData) return null;
          
          // Create SOW object from actual data
          const sow: SOW = {
            id: project.id,
            sowNumber: `SOW-${project.project_code || project.id.substring(0, 8)}`,
            projectName: project.project_name || project.name || 'Unnamed Project',
            clientName: project.client_name || 'Unknown Client',
            status: allCompleted ? 'active' : 'draft',
            version: '1.0',
            value: project.budget || 0,
            currency: project.currency || 'USD',
            startDate: project.start_date || new Date().toISOString(),
            endDate: project.end_date || new Date().toISOString(),
            scope: [
              `${totalPoles} poles installed`,
              `${houses} houses connected`,
              `${spares} spare drops available`,
              `${totalFibre} fibre segments (${(totalFibreDistance / 1000).toFixed(2)}km total)`
            ],
            deliverables: [
              'Network infrastructure data',
              'Poles and drops mapping',
              'Fibre route documentation'
            ],
            milestones: importStatuses.map((status: any, index: number) => ({
              id: `m${index + 1}`,
              name: `Import ${status.step_type}`,
              description: `Import ${status.step_type} data`,
              dueDate: status.completed_at || new Date().toISOString(),
              value: 0,
              status: status.status === 'completed' ? 'completed' : 
                     status.status === 'in_progress' ? 'in_progress' : 'pending',
              deliverables: [`${status.records_imported || 0} ${status.step_type} records`]
            })),
            approvals: [],
            documents: [],
            createdDate: project.created_at || new Date().toISOString(),
            lastModified: project.updated_at || new Date().toISOString(),
            createdBy: 'System Import',
            
            // Add custom fields for actual data
            importedData: {
              poles: totalPoles,
              drops: totalDrops,
              houses: houses,
              spares: spares,
              fibre: totalFibre,
              fibreDistance: totalFibreDistance
            }
          };
          
          return sow;
        } catch (err) {
          console.error(`Error fetching SOW data for project ${project.id}:`, err);
          return null;
        }
      });
      
      const sowResults = await Promise.all(sowPromises);
      const validSOWs = sowResults.filter(sow => sow !== null) as SOW[];
      
      setSOWs(validSOWs);
      setError(null);
    } catch (err) {
      console.error('Error fetching SOW data:', err);
      setError('Failed to load SOW data');
      setSOWs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSOWs = filter === 'all' 
    ? sows 
    : sows.filter(sow => sow.status === filter);

  return {
    sows,
    filteredSOWs,
    filter,
    setFilter,
    loading,
    error,
    refetch: fetchSOWData
  };
}