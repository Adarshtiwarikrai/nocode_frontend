import { useParams } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import Floweditor from '../reactflow';
import { useProjects } from '../../hooks/project';
import { useEffect } from 'react';
import { Editor } from './resize';

export default function ProjectResize() {
  const { id } = useParams();
  const projectId = parseInt(id, 10);
  const { projects, isLoading, activeProjectId, setActiveProjectId } = useProjects();
  console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",projects,projectId)
  useEffect(() => {
    if (projectId !== activeProjectId) {
      setActiveProjectId(projectId);
    }
  }, [projectId, activeProjectId, setActiveProjectId]);

  if (!isLoading && !projects.find((project) => project.id === projectId)) {
 <p>not found</p>
  }
  
  return (
    <ReactFlowProvider key="agentok-reactflow">
      <Editor projectId={projectId}  />
    </ReactFlowProvider>
  );
}

