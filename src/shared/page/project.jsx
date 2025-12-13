import { useNavigate, Link } from 'react-router-dom';
import { ProjectList } from '../../components/shared/project-list';
import { initialEdges, initialNodes, useProjects } from '../../hooks/project';
import { toast } from '../../hooks/toast';
import { Icons } from '../../components/ui/icons';
import { useEffect } from 'react';
import { Button } from '../../components/ui/button';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { createProject, setActiveProjectId } = useProjects();
  
  useEffect(() => {
    console.log(setActiveProjectId)
    setActiveProjectId(-1);
  }, [setActiveProjectId]);
  
  const onCreateProject = async () => {
    const project = await createProject({
      id: -1,
      name: 'New Project',
      description: 'A new project with sample flow.',
      flow: {
        nodes: initialNodes,
        edges: initialEdges,
      },
    });
    if (!project) {
      toast({ title: 'Failed to create this this project' });
      return;
    }
    console.log(project)
    toast({ title: 'Project created. Now jumping to project page.' });
    navigate(`/projects/${project.id}`);
  };
  
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex flex-col items-center justify-center gap-4 text-sm p-2">
        <span className="text-4xl font-bold font-arial p-4">
          Build Agentic Apps
        </span>
        <span className="text-lg">
          Create and manage your AI agent projects with Agentok Studio.
        </span>
        <Button size="lg" onClick={onCreateProject}>
          <Icons.project />
          Create New Project
        </Button>
        <ProjectList />
      </div>
     
    </div>
  );
}

