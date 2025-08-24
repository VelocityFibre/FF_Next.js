import { ProjectForm } from './components/ProjectForm';
import { useNavigate } from 'react-router-dom';

export function ProjectCreatePage() {
  const navigate = useNavigate();
  
  const handleSubmit = () => {
    // TODO: Implement project creation
    navigate('/app/projects');
  };
  
  const handleCancel = () => {
    navigate('/app/projects');
  };
  
  return (
    <div className="p-6">
      <ProjectForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}