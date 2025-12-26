import { useState, useCallback, useEffect, useRef } from 'react';
import useUserStore from '../store/user';
import useProjectStore from '../store/project';
import useSWR from 'swr';//what does this do ??
export const initialEdges = [
    {
      id: '1001-1',
      source: '1001',
      target: '1',
    },
    {
      id: '1-2',
      source: '1',
      target: '2',
      animated: true,
      type: 'converse',
    },
    // New node edges
    {
      id: '2-text',
      source: '2',
      target: 'text-1',
    },
    {
      id: 'text-input',
      source: 'text-1',
      target: 'input-1',
    },
    {
      id: 'input-delay',
      source: 'input-1',
      target: 'delay-1',
    },
    {
      id: 'delay-assistant',
      source: 'delay-1',
      target: 'assistant-1',
    },
    {
      id: 'assistant-condition',
      source: 'assistant-1',
      target: 'condition-1',
    },
    {
      id: 'condition-quickreply',
      source: 'condition-1',
      target: 'quickreply-1',
      sourceHandle: 'if',
    },
    {
      id: 'quickreply-container',
      source: 'quickreply-1',
      target: 'container-1',
      sourceHandle: 'option-0',
    },
    {
      id: 'container-branch',
      source: 'container-1',
      target: 'branch-1',
      sourceHandle: 'option-0',
    },
  ];
export const initialNodes = [
    {
      id: '1001',
      type: 'initializer',
      data: {
        name: 'Initializer',
        id: 'initializer',
        class_type: 'Initializer',
        sample_messages: [
          'Write a poem based on recent headlines about Vancouver.',
        ],
      },
      position: { x: -133, y: 246 },
    },
    {
      id: '1',
      type: 'user',
      data: {
        name: 'User',
        id: 'user',
        class_type: 'User',
        human_input_mode: 'NEVER',
        termination_msg: 'TERMINATE',
        enable_code_execution: true,
        max_consecutive_auto_reply: 10,
        tools: [],
      },
      position: { x: 271, y: 222 },
    },
    {
      id: '2',
      type: 'conversable',
      data: {
        name: 'Conversable',
        id: 'conversable',
        class_type: 'ConversableAgent',
        max_consecutive_auto_reply: 10,
        tools: [],
      },
      position: { x: 811, y: 216 },
    },
    {
      id: '3',
      type: 'conversable',
      data: {
        name: 'Conversable',
        id: 'conversable',
        class_type: 'ConversableAgent',
        max_consecutive_auto_reply: 10,
        tools: [],
      },
      position: { x: 811, y: 214 },
    },
    {
      id: '4',
      type: 'api',
      data: {
        name: 'Api',
        id: 'api',
        class_type: 'ApiNode',
        max_consecutive_auto_reply: 10,
        tools: [],
      },
      position: { x: 271, y: 214 },
    },
    {
      id: '998',
      type: 'note',
      data: {
        name: 'note',
        id: 'note',
        class_type: 'Note',
        content:
          "Click **Chat** icon on the right bottom to show the chat pane, and in chat pane, select a sample question to start the conversation.",
      },
      position: { x: 87, y: 740 },
      width: 400,
      height: 200,
      selected: false,
    },
    // New nodes from src copy
    {
      id: 'text-1',
      type: 'text',
      data: {
        name: 'Text',
        id: 'text',
        class_type: 'TextNode',
        text: 'Welcome to the flow! This is a text node.',
      },
      position: { x: 1350, y: 216 },
      width: 150,
      height: 100,
    },
    {
      id: 'input-1',
      type: 'input',
      data: {
        name: 'Input',
        id: 'input',
        class_type: 'InputNode',
        variableName: 'userInput',
        prompt: 'Please enter your input:',
      },
      position: { x: 1600, y: 216 },
      width: 150,
      height: 100,
    },
    {
      id: 'delay-1',
      type: 'delay',
      data: {
        name: 'Delay',
        id: 'delay',
        class_type: 'DelayNode',
        delayMs: 2000,
      },
      position: { x: 1850, y: 216 },
      width: 150,
      height: 100,
    },
    {
      id: 'assistant-1',
      type: 'assistant',
      data: {
        name: 'Assistant',
        id: 'assistant',
        class_type: 'AssistantNode',
      },
      position: { x: 2100, y: 216 },
      width: 150,
      height: 100,
    },
    {
      id: 'condition-1',
      type: 'condition',
      data: {
        name: 'Condition',
        id: 'condition',
        class_type: 'ConditionNode',
        label: 'If-Else',
        ifCondition: 'userInput === "yes"',
        elseIfConditions: [
          { condition: 'userInput === "maybe"' },
        ],
        elseNode: true,
        connections: {},
      },
      position: { x: 2350, y: 216 },
      width: 220,
      height: 160,
    },
    {
      id: 'quickreply-1',
      type: 'quickreply',
      data: {
        name: 'Quick Reply',
        id: 'quickreply',
        class_type: 'QuickReplyNode',
        label: 'Quick Reply',
        message: 'Choose an option:',
        options: [
          { text: 'Option 1' },
          { text: 'Option 2' },
          { text: 'Option 3' },
        ],
        connections: {},
      },
      position: { x: 2600, y: 216 },
      width: 200,
      height: 180,
    },
    {
      id: 'container-1',
      type: 'container',
      data: {
        name: 'Container',
        id: 'container',
        class_type: 'ContainerNode',
        label: 'Container',
        icon: '📦',
        message: 'This is a container with quick reply options',
        options: [
          { text: 'Continue', id: 'opt1' },
          { text: 'Cancel', id: 'opt2' },
        ],
      },
      position: { x: 2850, y: 216 },
      width: 250,
      height: 200,
    },
    {
      id: 'branch-1',
      type: 'branch',
      data: {
        name: 'Branch',
        id: 'branch',
        class_type: 'BranchNode',
        label: 'IF Branch',
        condition: 'Continue selected',
        branchType: 'if',
      },
      position: { x: 3150, y: 216 },
    },
  ];
  
export function useProjects(){
    const backendUrl= 'http://localhost:8000/v1';
    const getAuthHeaders = () => {
      const user = useUserStore.getState().user;
      const token = user?.token;
      console.log(token)
      return token ? { Authorization: `Bearer ${token}` } : {};
    };
  
    const authenticatedFetcher = async (url) => {
      const response = await fetch(url, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    };
    const { data, error, mutate } = useSWR(
        `${backendUrl}/projects`, 
        authenticatedFetcher, 
        {
          revalidateOnFocus: false,
        }
      );
    const projects=useProjectStore((state)=>state.projects)
    const setProjects=useProjectStore((state)=>state.setProjects)
    const deleteProject=useProjectStore((state)=>state.deleteProject)
    const updateProject=useProjectStore((state)=>state.updateProject)
    const activeProjectId=useProjectStore((state)=>state.activeProjectId)
    const setActiveProjectId=useProjectStore((state)=>state.setActiveProjectId)
    const getProjectById = useProjectStore((state) => state.getProjectById);
    const prevDataRef = useRef(data);
    useEffect(() => {
        if (data && !error && data !== prevDataRef.current) {
          setProjects(data);
          prevDataRef.current = data;
        }
      }, [data, error, setProjects]);//what it do why keep two instance of data 
      const [isCreating, setIsCreating] = useState(false);
      const handleCreateProject = useCallback(
        async (project) => {
          setIsCreating(true);
          try {
            const response = await fetch(`${backendUrl}/projects/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
              },
              body: JSON.stringify({
                name: project?.name ?? 'New Project',
                description:
                  project?.description ?? 'A new project with sample nodes.',
                flow: project?.flow ?? {},
              }),
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText);
            }
            
            const newProject = await response.json();
            setProjects([newProject, ...projects]);
            await mutate();
            return newProject;
          } catch (error) {
            console.error('Failed to create project:', error);
            throw error;
          } finally {
            setIsCreating(false);
          }
        },
        [projects, setProjects, mutate]
      );
      const [isDeleting, setIsDeleting] = useState(false);
      const handleDeleteProject = useCallback(
        async (id) => {
          setIsDeleting(true);
          const previousProjects = [...projects];
          
          deleteProject(id);
          mutate(projects.filter(p => p.id !== id), false);
          
          try {
            const response = await fetch(`${backendUrl}/projects/${id}`, {
              method: 'DELETE',
              headers: {
                ...getAuthHeaders(),
              },
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText);
            }
            
            await mutate();
          } catch (error) {
            console.error('Failed to delete project:', error);
            setProjects(previousProjects);
            await mutate();
            throw error;
          } finally {
            setIsDeleting(false);
          }
        },
        [projects, deleteProject, setProjects, mutate]
      );
      const [isUpdating, setIsUpdating] = useState(false);
    const handleUpdateProject = useCallback(
    async (id, project) => {
    
      setIsUpdating(true);
      const previousProject = projects.find((p) => p.id === id);
      if (!previousProject) {
        setIsUpdating(false);
        return;
      }
      
      updateProject(id, project);
      
      try {
        const response = await fetch(`${backendUrl}/projects/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify(project),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
        
        const updatedProject = await response.json();
        updateProject(id, updatedProject);
        await mutate();
      } catch (error) {
        console.error('Failed to update project:', error);
        updateProject(id, previousProject);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [projects, updateProject, mutate]
  );
  return {
    projects,
    activeProjectId,
    setActiveProjectId,
    isError: error,
    isLoading: !error && !data,
    refresh: mutate,
    createProject: handleCreateProject,
    isCreating,
    updateProject: handleUpdateProject,
    isUpdating,
    deleteProject: handleDeleteProject,
    isDeleting,
    getProjectById,
  }
}

export function useProject(id) {
    const { isLoading, isError, updateProject, isUpdating, getProjectById } =
      useProjects();
     console.log("thisisisworking",getProjectById(id))
    return {
      project: getProjectById(id),
      isLoading,
      isError,
      updateProject: (project) => updateProject(id, project),
      isUpdating,
    };
  }
