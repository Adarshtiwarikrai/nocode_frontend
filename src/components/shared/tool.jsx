import React, { useState, useEffect } from 'react'
import { useReactFlow } from '@xyflow/react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ToolParameterConfig } from '../tools/toolconfig'
import { useTools } from '../../hooks/tool'
import { useParams } from 'react-router-dom'

export const ToolOption = ({ nodeId, data }) => {
  const { setNodes } = useReactFlow()
  const { tools } = useTools()
  const { id: projectId } = useParams()

  const [selectedToolId, setSelectedToolId] = useState(data?.toolId || null)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)

  const selectedTool = selectedToolId
    ? tools.find(t => t.id === selectedToolId)
    : null

  // Check if tool is already configured
  useEffect(() => {
    if (data?.parameterValues && Object.keys(data.parameterValues).length > 0) {
      setIsConfigured(true)
    } else {
      setIsConfigured(false)
    }
  }, [data?.parameterValues, selectedToolId])

  const handleToolSelect = toolId => {
    const numericToolId = parseInt(toolId)
    setSelectedToolId(numericToolId)
    setIsConfigured(false)

    setNodes(nodes =>
      nodes.map(node =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                toolId: numericToolId,
                parameterValues: {},
              },
            }
          : node
      )
    )
  }

  const handleOpenConfig = () => {
    if (!selectedTool || !selectedTool.parameters || selectedTool.parameters.length === 0) {
      alert('This tool has no parameters to configure')
      return
    }
    setIsConfigOpen(true)
  }

  const handleSaveConfig = parameters => {
    console.log('[ToolOption] Saving parameters to node:', parameters)

    setNodes(nodes =>
      nodes.map(node =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                parameterValues: parameters,
              },
            }
          : node
      )
    )

    setIsConfigured(true)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <Label>Select Tool</Label>
        <Select value={selectedToolId?.toString() || ''} onValueChange={handleToolSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a tool" />
          </SelectTrigger>
          <SelectContent>
            {tools.map(tool => (
              <SelectItem key={tool.id} value={tool.id.toString()}>
                {tool.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTool && (
        <div className="space-y-2">
          <Label>Tool Description</Label>
          <p className="text-sm text-muted-foreground">
            {selectedTool.description || 'No description available'}
          </p>
        </div>
      )}

      {selectedTool && selectedTool.parameters && selectedTool.parameters.length > 0 && (
        <div className="space-y-2">
          <Button
            onClick={handleOpenConfig}
            variant={isConfigured ? 'outline' : 'default'}
            className="w-full"
          >
            {isConfigured ? (
              <>
                <Icons.check className="w-4 h-4 mr-2" />
                Configured ({selectedTool.parameters.length} params)
              </>
            ) : (
              <>
                <Icons.settings className="w-4 h-4 mr-2" />
                Configure Parameters ({selectedTool.parameters.length})
              </>
            )}
          </Button>

          {isConfigured && (
            <p className="text-xs text-green-600 dark:text-green-400 text-center">
              ✓ Tool parameters have been configured
            </p>
          )}
        </div>
      )}

      {selectedTool && (!selectedTool.parameters || selectedTool.parameters.length === 0) && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            This tool has no parameters to configure
          </p>
        </div>
      )}

      {/* Tool Parameter Configuration Modal */}
      {selectedTool && isConfigOpen && (
        <ToolParameterConfig
          tool={selectedTool}
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onSave={handleSaveConfig}
          initialValues={data?.parameterValues || {}}
          nodeId={nodeId}
          nodeName={data?.name}
          agentId={projectId ? parseInt(projectId) : 0}
        />
      )}
    </div>
  )
}

// Add missing Icons if not already imported
const Icons = {
  check: props => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  settings: props => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m5.656-14.656l-4.242 4.242m-2.828 2.828l-4.242 4.242m12.728 0l-4.242-4.242m-2.828-2.828l-4.242-4.242" />
    </svg>
  ),
  spinner: props => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
}
