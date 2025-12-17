import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScrollArea } from '../../ui/scrollarea';
import { cn } from '../../../lib/utils';
import { useTools } from '../../../hooks/tool';
import { Button } from '../../ui/button';
import { Icons } from '../../ui/icons';
import { Card } from '../../ui/card';
import { GenericOption } from '../../shared/option';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import useUserStore from '../../../store/user';
import { useParams } from 'react-router-dom';
import { useReactFlow } from '@xyflow/react';
import { ToolPicker } from '../../tools/picker'; 
import { ToolParameterConfig } from '../../tools/toolconfig';
const getAuthHeaders = () => {
    const user = useUserStore.getState().user
    const token = user?.token
  
    return token
      ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      : { 'Content-Type': 'application/json' }
  }
  

  const globalToolParameterConfigs = new Map()
  
  export const ConversableAgentConfig = React.memo(({
    nodeId,
    data,
    optionsDisabled = [],
    className,
    ...props
  }) => {
    const [models, setModels] = useState([])
    const [selectedToolForParams, setSelectedToolForParams] = useState(null)
    const [toolParameterConfigs, setToolParameterConfigs] = useState({})
  
    const { tools, getToolById } = useTools()
    const instance = useReactFlow()
    const { id: projectId } = useParams()
  
    useEffect(() => {
      setModels(['ChatGpt', 'GoogleGemini'])
    }, [])
  
    /* Restore cached configs */
    useEffect(() => {
      const agentId = projectId
        ? parseInt(projectId)
        : data?.agent_id || 1
  
      const key = `${nodeId}-${agentId}`
      const cached = globalToolParameterConfigs.get(key)
  
      if (cached) {
        setToolParameterConfigs(cached)
      }
    }, [nodeId, data?.agent_id, projectId])
  
   
    useEffect(() => {
      const loadConfigs = async () => {
        if (!data?.tools?.length) return
  
        const agentId = projectId
          ? parseInt(projectId)
          : data?.agent_id || 1
  
        const configs = {}
  
        for (const toolId of data.tools) {
          try {
            const res = await fetch(
              `http://localhost:8000/v1/tools/${toolId}/parameter-configs?agent_id=${agentId}&node_id=${nodeId}`,
              { headers: getAuthHeaders() }
            )
  
            if (res.ok) {
              const json = await res.json()
              if (json.configs?.length) {
                const toolConfig = {}
                json.configs.forEach((c) => {
                  toolConfig[c.parameter_name] = c.parameter_value
                })
                configs[toolId] = toolConfig
              }
            }
          } catch (err) {
            console.error(`Error loading tool ${toolId}`, err)
          }
        }
  
        const key = `${nodeId}-${agentId}`
        globalToolParameterConfigs.set(key, configs)
        setToolParameterConfigs(configs)
      }
  
      loadConfigs()
    }, [data?.tools, data?.agent_id, nodeId, projectId])
  
    const onAddTool = useCallback((toolId) => {
      if (data?.tools?.includes(toolId)) return
  
      instance.setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  tools: [...(node.data?.tools || []), toolId],
                },
              }
            : node
        )
      )
    }, [data?.tools, instance, nodeId])
  
    const onDeleteTool = useCallback((toolId) => {
      instance.setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  tools: (node.data?.tools || []).filter((t) => t !== toolId),
                },
              }
            : node
        )
      )
  
      setToolParameterConfigs((prev) => {
        const copy = { ...prev }
        delete copy[toolId]
        return copy
      })
    }, [instance, nodeId])
  
    const handleConfigureParameters = useCallback((tool) => {
      setSelectedToolForParams(tool)
    }, [])
  
    const handleSaveParameters = useCallback(async (parameters) => {
      if (!selectedToolForParams) return
  
      const updated = {
        ...toolParameterConfigs,
        [selectedToolForParams.id]: parameters,
      }
  
      setToolParameterConfigs(updated)
  
      const agentId = projectId
        ? parseInt(projectId)
        : data?.agent_id || 1
  
      const key = `${nodeId}-${agentId}`
      globalToolParameterConfigs.set(key, updated)
  
      instance.setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  toolParameterConfigs: {
                    ...node.data.toolParameterConfigs,
                    [selectedToolForParams.id]: parameters,
                  },
                },
              }
            : node
        )
      )
  
      try {
        await fetch(
          `http://localhost:8000/v1/tools/${selectedToolForParams.id}/parameter-configs`,
          {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              agent_id: agentId,
              node_id: nodeId,
              parameters,
            }),
          }
        )
      } catch (err) {
        console.error('Failed saving parameters', err)
      }
  
      setSelectedToolForParams(null)
    }, [selectedToolForParams, toolParameterConfigs, nodeId, data?.agent_id, instance])
  
    const GENERAL_OPTIONS = useMemo(() => [
      {
        type: 'text',
        name: 'name',
        label: 'Name',
        placeholder: 'Enter a name',
      },
      {
        type: 'text',
        name: 'description',
        label: 'Description',
        rows: 2,
      },
      {
        type: 'text',
        name: 'system_message',
        label: 'System Message',
        rows: 2,
      },
      {
        type: 'select',
        name: 'human_input_mode',
        label: 'Human Input Mode',
        options: [
          { value: 'NEVER', label: 'Never' },
          { value: 'ALWAYS', label: 'Always' },
          { value: 'TERMINATE', label: 'On Termination' },
        ],
      },
    ], [])
  
    return (
      <ScrollArea>
        <div className={cn(className, 'flex flex-col gap-4 p-2')}>
          {GENERAL_OPTIONS
            .filter((o) => !optionsDisabled.includes(o.name))
            .map((opt, i) => (
              <GenericOption
                key={`${nodeId}-${i}`}
                nodeId={nodeId}
                data={data}
                {...opt}
              />
            ))}
  
          {/* Tools */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Tools</span>
              <ToolPicker
                onAddTool={onAddTool}
                button={
                  <Button size="sm" className="h-7">
                    <Icons.add className="w-4 h-4" />
                    Add Tool
                  </Button>
                }
              />
            </div>
  
            {data?.tools?.map((toolId, i) => {
              const tool = getToolById(toolId)
              if (!tool) return null
  
              return (
                <Card key={i} className="flex items-center gap-2 p-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={tool.logo_url} />
                    <AvatarFallback>{tool.name?.[0]}</AvatarFallback>
                  </Avatar>
  
                  <div className="flex-1">
                    <span className="text-sm font-medium">{tool.name}</span>
                  </div>
  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleConfigureParameters(tool)}
                  >
                    <Icons.settings className="w-4 h-4" />
                  </Button>
  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteTool(toolId)}
                  >
                    <Icons.close className="w-4 h-4" />
                  </Button>
                </Card>
              )
            })}
          </div>
  
          {props.children}
        </div>
  
        <ToolParameterConfig
          tool={selectedToolForParams}
          isOpen={!!selectedToolForParams}
          onClose={() => setSelectedToolForParams(null)}
          onSave={handleSaveParameters}
          initialValues={
            selectedToolForParams
              ? toolParameterConfigs[selectedToolForParams.id]
              : {}
          }
          nodeId={nodeId}
          nodeName={data?.name || nodeId}
          agentId={projectId ? parseInt(projectId) : 0}
        />
      </ScrollArea>
    )
  })