import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scrollarea';
import { Badge } from '../ui/badge';
import { Icons } from '../ui/icons';
import { cn } from '../../lib/utils';
import { useTools } from '../../hooks/tool';
import useUserStore from '../../store/user';
import { useToast } from '../../hooks/toast';
const BACKEND_URL =
  (typeof window !== 'undefined' && window.__BACKEND_URL__) ||
  'http://localhost:8000/v1'

export const ToolParameterConfig = ({
  tool,
  isOpen,
  onClose,
  onSave,
  initialValues = {},
  nodeId = 'default',
  nodeName = 'default',
  agentId,
}) => {
  const [parameterValues, setParameterValues] = useState({})
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingFromBackend, setIsLoadingFromBackend] = useState(false)

  const { saveToolParameterConfig, getToolParameterConfigs } = useTools()
  const { toast } = useToast()

  const currentNodeIdRef = useRef(nodeId)
  const isInitializedRef = useRef(false)

  const getDefaultValues = () => {
    const defaults = {}

    if (tool?.parameters?.length) {
      tool.parameters.forEach((param) => {
        if (param.default !== undefined) {
          defaults[param.name] = param.default
        } else {
          switch (param.type) {
            case 'string':
            case 'textarea':
              defaults[param.name] = ''
              break
            case 'number':
              defaults[param.name] = 0
              break
            case 'boolean':
              defaults[param.name] = false
              break
            case 'select':
              defaults[param.name] = param.options?.[0] || ''
              break
            case 'dict':
              defaults[param.name] = {}
              break
            default:
              defaults[param.name] = ''
          }
        }
      })
    }

    return defaults
  }

  useEffect(() => {
    if (!isOpen || !tool || !agentId) return

    const hasNodeChanged = currentNodeIdRef.current !== nodeId

    if (!isInitializedRef.current || hasNodeChanged) {
      const loadParameters = async () => {
        setIsLoadingFromBackend(true)
        try {
          const savedParams = await getToolParameterConfigs(
            tool.id,
            nodeId,
            agentId
          )

          const defaults = getDefaultValues()
          const finalValues = {
            ...defaults,
            ...initialValues,
            ...savedParams,
          }

          setParameterValues(finalValues)
          setErrors({})

          currentNodeIdRef.current = nodeId
          isInitializedRef.current = true
        } catch (err) {
          const defaults = getDefaultValues()
          setParameterValues({ ...defaults, ...initialValues })
        } finally {
          setIsLoadingFromBackend(false)
        }
      }

      loadParameters()
    }
  }, [isOpen, nodeId, tool?.id, agentId])

  useEffect(() => {
    if (!isOpen) {
      isInitializedRef.current = false
    }
  }, [isOpen])

  const validateParameter = (param, value) => {
    if (param.required && (value === undefined || value === null || value === '')) {
      return `${param.name} is required`
    }

    if (param.type === 'number' && value !== '' && isNaN(Number(value))) {
      return `${param.name} must be a valid number`
    }

    if (param.validation) {
      const { min, max, pattern } = param.validation
      if (min !== undefined && Number(value) < min) {
        return `${param.name} must be at least ${min}`
      }
      if (max !== undefined && Number(value) > max) {
        return `${param.name} must be at most ${max}`
      }
      if (pattern && !new RegExp(pattern).test(value)) {
        return `${param.name} format is invalid`
      }
    }

    return null
  }

  const handleParameterChange = (name, value) => {
    setParameterValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSave = async () => {
    if (!tool.parameters) return

    const newErrors = {}
    let hasErrors = false

    tool.parameters.forEach((param) => {
      const err = validateParameter(param, parameterValues[param.name])
      if (err) {
        newErrors[param.name] = err
        hasErrors = true
      }
    })

    setErrors(newErrors)

    if (hasErrors) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        variant: 'destructive',
      })
      return
    }

    if (!agentId) {
      toast({
        title: 'Error',
        description: 'Project ID not found',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      await saveToolParameterConfig(
        tool.id,
        nodeId,
        agentId,
        parameterValues
      )

      toast({
        title: 'Success',
        description: 'Tool parameters saved successfully',
      })

      onSave(parameterValues)
      onClose()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save tool parameters',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!tool || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <Card className="w-96 h-full rounded-none border-l shadow-lg">
        {/* HEADER */}
        <CardHeader className="border-b">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Icons.tool className="w-5 h-5" />
              <CardTitle>{tool.name}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icons.close className="w-4 h-4" />
            </Button>
          </div>
          {tool.description && (
            <CardDescription>{tool.description}</CardDescription>
          )}
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-6 space-y-6">
              {tool.parameters?.map((param) => (
                <div key={param.name} className="space-y-2">
                  <Label>
                    {param.name}
                    {param.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Badge variant="secondary">{param.type}</Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>

        {/* FOOTER */}
        <div className="border-t p-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Parameters
          </Button>
        </div>
      </Card>
    </div>,
    document.body
  )
}