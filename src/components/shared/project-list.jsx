import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';
import { Icons } from '../ui/icons';
import {useProjects} from "../../hooks/project"
import { Button } from '../ui/button';
export const Projectloading=()=>{
    return (
        <div className="flex w-full flex-wrap justify-center gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="w-80 h-48 flex flex-col overflow-hidden gap-2">
          <div className="p-4 flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <div className="flex flex-col gap-2 h-full">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex items-center justify-end gap-1">
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
    )
}
export const ProjectBlock=({ project, className, index })=>{
  
  
  const navigate = useNavigate();
  const { deleteProject, isDeleting } = useProjects();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  
  const onDelete = async () => {
    try {
      await deleteProject(project.id);
      toast({ title: `Project ${project.name} deleted` });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/projects/${project.id}`);
  };

  return (
    <Card
      className={cn(
        'relative group w-80 hover:border-primary/40 p-4 flex flex-col gap-2',
        className
      )}
    >
      <h2 className="line-clamp-1 text-primary text-lg font-bold">
        {project.name}
      </h2>
      <div className="text-xs text-muted-foreground">
        {new Date(project.updated_at).toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground">
        {project.description}
      </div>
      
      <div className="relative card-actions flex justify-between gap-1 text-xs text-base-content/60">
       
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowPublishDialog((v) => !v)}
          >
            <Icons.share className={cn('w-4 h-4')} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleEdit}
          >
            <Icons.edit className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="hidden absolute top-2 right-2 group-hover:block">
        <Button size="icon" variant="ghost" onClick={onDelete}>
          {isDeleting ? (
            <Icons.spinner className="w-4 h-4 animate-spin text-red-500" />
          ) : (
            <Icons.trash className="w-4 h-4 text-red-500" />
          )}
        </Button>
      </div>
      {showPublishDialog && (
        <ProjectPublish
          show={showPublishDialog}
          projectId={project.id}
          onClose={() => setShowPublishDialog(false)}
        />
      )}
    </Card>
  );
}
export const ProjectList = ({ maxCount }) => {
    const { projects, isLoading, isError } = useProjects();
  
    if (isError) {
      console.warn('Failed to load template');
    }
    if (!projects || projects.length === 0) return null;
  
    const displayProjects = maxCount ? projects.slice(0, maxCount) : projects;
  
    return (
      <div className="flex flex-wrap justify-center gap-4 p-2">
        {displayProjects.map((project, index) => (
          <ProjectBlock key={project.id} project={project} index={index} />
        ))}
      </div>
    );
  }