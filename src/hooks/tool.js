import { useState, useCallback, useEffect, useRef } from 'react';
import useUserStore from '../store/user';
import useProjectStore from '../store/project';
import useSWR from 'swr';
import { isEqual } from "lodash-es";
import useToolStore from '../store/tool';
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

  export function useTools() {
    const { data, error, mutate } = useSWR(
      `${backendUrl}/tools`,
      authenticatedFetcher,
      {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }
    );
  
    const tools = useToolStore((state) => state.tools);
    const setTools = useToolStore((state) => state.setTools);
    const updateToolState = useToolStore((state) => state.updateTool);
    const deleteToolState = useToolStore((state) => state.deleteTool);
    const getToolById = useToolStore((state) => state.getToolById);
    const prevDataRef = useRef();
  
    useEffect(() => {
      if (data && !isEqual(data, prevDataRef.current)) {
        setTools(data);
        prevDataRef.current = data;
      }
    }, [data, setTools]);
  
 
    const [isCreating, setIsCreating] = useState(false);
    const createTool = useCallback(
      async (toolData) => {
        setIsCreating(true);
        try {
          const headers = getAuthHeaders();
          console.log("Headers sent:", headers);
  
          const res = await fetch(`${backendUrl}/tools`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
              },
            body: JSON.stringify(toolData),
          });
  
          if (!res.ok) throw new Error(await res.text());
  
          const newTool = await res.json();
          setTools([newTool, ...tools]);
          await mutate();
          return newTool;
        } catch (err) {
          console.error("❌ Failed to create tool:", err);
          throw err;
        } finally {
          setIsCreating(false);
        }
      },
      [tools, setTools, mutate]
    );
  
   
    const [isUpdating, setIsUpdating] = useState(false);
    const updateTool = useCallback(
      async (id, updates) => {
        setIsUpdating(true);
        const prevTool = tools.find((t) => t.id === id);
        if (!prevTool) return;
  
      
        const fullUpdates = { ...prevTool, ...updates };
  
  
        updateToolState(id, fullUpdates);
  
        try {
          const res = await fetch(`${backendUrl}/tools/${id}`, {
            method: "PUT",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
              },
            body: JSON.stringify(fullUpdates),
          });
  
          if (!res.ok) throw new Error(await res.text());
          const updatedTool = await res.json();
  
          updateToolState(id, updatedTool);
          await mutate();
        } catch (err) {
          console.error("❌ Failed to update tool:", err);
          // revert on error
          updateToolState(id, prevTool);
        } finally {
          setIsUpdating(false);
        }
      },
      [tools, updateToolState, mutate]
    );
  
   
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteTool = useCallback(
      async (id) => {
        setIsDeleting(true);
        const prevTools = [...tools];
        deleteToolState(id);
  
        try {
          const res = await fetch(`${backendUrl}/tools/${id}`, {
            method: "DELETE",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
              },
          });
  
          if (!res.ok) throw new Error(await res.text());
          await mutate();
        } catch (err) {
          console.error("❌ Failed to delete tool:", err);
          setTools(prevTools); 
        } finally {
          setIsDeleting(false);
        }
      },
      [tools, deleteToolState, setTools, mutate]
    );
  
   
    const saveToolParameterConfig = useCallback(
      async (
        toolId,
        nodeId,
        agentId,
        parameters
      ) => {
        try {
          console.log(`[saveToolParameterConfig] Saving params for tool ${toolId}, node ${nodeId}`);
          
          const res = await fetch(`${backendUrl}/tools/${toolId}/parameter-configs`, {
            method: "POST",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
              },
            body: JSON.stringify({
              agent_id: agentId,
              node_id: nodeId,
              parameters: parameters,
            }),
          });
  
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || `Failed to save parameter config: ${res.status}`);
          }
  
          const result = await res.json();
          console.log("[saveToolParameterConfig] Success:", result);
          return result;
        } catch (err) {
          console.error("❌ Failed to save tool parameter config:", err);
          throw err;
        }
      },
      []
    );
  
  
    const getToolParameterConfigs = useCallback(
      async (toolId, nodeId, agentId) => {
        try {
          const url = `${backendUrl}/tools/${toolId}/parameter-configs?agent_id=${agentId}&node_id=${nodeId}`;
          const res = await fetch(url, { headers: getAuthHeaders() });
  
          if (!res.ok) {
            throw new Error(`Failed to get parameter configs: ${res.status}`);
          }
  
          const result = await res.json();
          
        
          const configObject = {};
          if (result.configs && Array.isArray(result.configs)) {
            result.configs.forEach((config) => {
              configObject[config.parameter_name] = config.parameter_value;
            });
          }
          
          return configObject;
        } catch (err) {
          console.error("❌ Failed to get tool parameter configs:", err);
          return {};
        }
      },
      []
    );
  
    const deleteToolParameterConfigs = useCallback(
      async (toolId, nodeId, agentId) => {
        try {
          const url = `${backendUrl}/tools/${toolId}/parameter-configs?agent_id=${agentId}&node_id=${nodeId}`;
          const res = await fetch(url, {
            method: "DELETE",
            headers: {
                ...getAuthHeaders(),
                "Content-Type": "application/json",
              },
          });
  
          if (!res.ok) {
            throw new Error(`Failed to delete parameter configs: ${res.status}`);
          }
  
          return await res.json();
        } catch (err) {
          console.error("❌ Failed to delete tool parameter configs:", err);
          throw err;
        }
      },
      []
    );
  
    return {
      tools: data ?? [],
      isLoading: !data && !error,
      isError: error,
      createTool,
      updateTool,
      deleteTool,
      isCreating,
      isUpdating,
      isDeleting,
      getToolById,
      refresh: mutate,
      saveToolParameterConfig,
      getToolParameterConfigs,
      deleteToolParameterConfigs,
    };
  }
  export function useTool(toolId) {
    const {
      tools,
      updateTool,
      deleteTool,
      isUpdating,
      isDeleting,
      isLoading,
      isError,
      saveToolParameterConfig,
      getToolParameterConfigs,
      deleteToolParameterConfigs,
    } = useTools();
  
    const tool = tools.find((t) => t.id === toolId);
  
    return {
      tool,
      updateTool: (updates) => {
        if (!tool) return;
        const mergedUpdates = { ...tool, ...updates };
        return updateTool(toolId, mergedUpdates);
      },
      deleteTool: () => deleteTool(toolId),
      isUpdating,
      isDeleting,
      isLoading,
      isError,
     
      saveParameterConfig: (nodeId, agentId, parameters) =>
        saveToolParameterConfig(toolId, nodeId, agentId, parameters),
      getParameterConfigs: (nodeId, agentId) =>
        getToolParameterConfigs(toolId, nodeId, agentId),
      deleteParameterConfigs: (nodeId, agentId) =>
        deleteToolParameterConfigs(toolId, nodeId, agentId),
    };
  }