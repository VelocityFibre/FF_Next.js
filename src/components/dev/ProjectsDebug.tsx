import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/config/firebase';

interface Project {
  id: string;
  name?: string;
  [key: string]: unknown;
}

export function ProjectsDebug() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const snapshot = await getDocs(collection(db, 'projects'));
        
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project));
        
        setProjects(projectsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Projects Debug</h2>
      <p className="mb-2">Total projects found: {projects.length}</p>
      
      {projects.length === 0 ? (
        <div className="bg-yellow-100 p-4 rounded">
          No projects found in Firebase. Please check:
          <ul className="list-disc ml-5 mt-2">
            <li>Firebase configuration is correct</li>
            <li>The 'projects' collection exists</li>
            <li>You have read permissions</li>
            <li>There are documents in the collection</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(project => (
            <div key={project.id} className="bg-gray-100 p-3 rounded">
              <div className="font-semibold">ID: {project.id}</div>
              <div className="text-sm text-gray-600">
                Name: {project.name || 'No name'}
              </div>
              <div className="text-xs text-gray-500">
                <pre>{JSON.stringify(project, null, 2)}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}