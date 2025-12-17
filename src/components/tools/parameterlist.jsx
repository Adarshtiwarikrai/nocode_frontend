import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Icons } from '../ui/icons';
import { cn } from '../../lib/utils';
import useUserStore from '../../store/user';

// Auth headers helper
const getAuthHeaders = () => {
  const user = useUserStore.getState().user;
  const token = user?.token;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};


export const ParameterList = ({
  toolId,
  toolParameters,
  className,
  iconClassName
}) => {
  const [parameters, setParameters] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newParameter, setNewParameter] = useState({
    name: '',
    type: 'string',
    description: '',
    required: false,
    default: '',
    options: [],
    validation: {}
  });


  useEffect(() => {
    
    if (toolParameters) {
      setParameters(toolParameters);
    } else {
  
      setParameters([]);
    }
  }, [toolId, toolParameters]);

  const addParameter = () => {
    if (!newParameter.name || !newParameter.type) {
      return;
    }

    const parameter = {
      name: newParameter.name,
      type: newParameter.type ,
      description: newParameter.description || '',
      required: newParameter.required || false,
      default: newParameter.default,
      options: newParameter.type === 'select' ? newParameter.options : undefined,
      validation: newParameter.validation || {}
    };

    setParameters(prev => {
      const updated = [...prev, parameter];
      return updated;
    });
    setNewParameter({
      name: '',
      type: 'string',
      description: '',
      required: false,
      default: '',
      options: [],
      validation: {}
    });
  };

  const removeParameter = (index) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  };

  const updateParameter = (index, updates) => {
    setParameters(prev => prev.map((param, i) => 
      i === index ? { ...param, ...updates } : param
    ));
  };

  const saveParameters = async () => {
    try {
    
      let parametersToSave = [...parameters];
      
      if (newParameter.name && newParameter.type) {
        const Parameter= {
          name: newParameter.name,
          type: newParameter.type ,
          description: newParameter.description || '',
          required: newParameter.required || false,
          default: newParameter.default,
          options: newParameter.type === 'select' ? newParameter.options : undefined,
          validation: newParameter.validation || {}
        };
        
        parametersToSave.push(parameter);
        
      
        setNewParameter({
          name: '',
          type: 'string',
          description: '',
          required: false,
          default: '',
          options: [],
          validation: {}
        });
      }
      
      
      const response = await fetch(`http://localhost:8000/v1/tools/${toolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          parameters: parametersToSave
        })
      });

      if (response.ok) {
        const updatedTool = await response.json();
        
        
        setParameters(parametersToSave);
        setIsEditing(false);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('❌ Failed to save parameters:', errorData);
      }
    } catch (error) {
      console.error('❌ Error saving parameters:', error);
    }
  };

  const renderParameterType = (param, index) => {
    switch (param.type) {
      case 'string':
        return (
          <Input
            value={param.default || ''}
            onChange={(e) => updateParameter(index, { default: e.target.value })}
            placeholder="Default value"
            className="text-sm"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={param.default || ''}
            onChange={(e) => updateParameter(index, { default: e.target.value })}
            placeholder="Default value"
            className="text-sm"
          />
        );
      case 'boolean':
        return (
          <Switch
            checked={param.default || false}
            onCheckedChange={(checked) => updateParameter(index, { default: checked })}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={param.default || ''}
            onChange={(e) => updateParameter(index, { default: e.target.value })}
            placeholder="Default value"
            rows={2}
            className="text-sm"
          />
        );
      case 'select':
        return (
          <div className="space-y-2">
            <Input
              value={param.default || ''}
              onChange={(e) => updateParameter(index, { default: e.target.value })}
              placeholder="Default value"
              className="text-sm"
            />
            <div>
              <Label className="text-xs">Options (one per line)</Label>
              <Textarea
                value={param.options?.join('\n') || ''}
                onChange={(e) => updateParameter(index, { 
                  options: e.target.value.split('\n').filter(opt => opt.trim()) 
                })}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={3}
                className="text-sm"
              />
            </div>
          </div>
        );
      case 'dict':
        return (
          <div className="space-y-2">
            <Textarea
              value={typeof param.default === 'object' ? JSON.stringify(param.default, null, 2) : (param.default || '{}')}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateParameter(index, { default: parsed });
                } catch {
           
                  updateParameter(index, { default: e.target.value });
                }
              }}
              placeholder='{"key": "value"}'
              rows={3}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter JSON object (e.g., {`{"key": "value"}`})
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn("shrink-0 bg-background", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.settings className={cn("w-5 h-5", iconClassName)} />
            <CardTitle className={cn("text-lg", iconClassName)}>Parameters</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={saveParameters}>
                  {newParameter.name && newParameter.type ? 'Save & Add Parameter' : 'Save'}
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Icons.add className="w-4 h-4 mr-1" />
                Add Parameter
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Define parameters that users can configure when using this tool
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {parameters.length === 0 && !isEditing ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icons.settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No parameters defined</p>
            <p className="text-sm">Click "Add Parameter" to define tool parameters</p>
          </div>
        ) : (
          <>
            {/* Existing Parameters */}
            {parameters.map((param, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{param.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {param.type}
                    </Badge>
                    {param.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeParameter(index)}
                    className="h-6 w-6 p-0"
                  >
                    <Icons.close className="w-4 h-4" />
                  </Button>
                </div>
                
                {param.description && (
                  <p className="text-sm text-muted-foreground mb-3">{param.description}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={param.required}
                      onCheckedChange={(checked) => updateParameter(index, { required: checked })}
                    />
                    <Label className="text-sm">Required</Label>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Default Value</Label>
                    {renderParameterType(param, index)}
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Add New Parameter Form */}
            {isEditing && (
              <Card className={`p-4 border-dashed ${newParameter.name && newParameter.type ? 'border-orange-300 bg-orange-50' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Add New Parameter</h4>
                  {newParameter.name && newParameter.type && (
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
                      Unsaved
                    </Badge>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">Name</Label>
                      <Input
                        value={newParameter.name || ''}
                        onChange={(e) => setNewParameter(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Parameter name"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Type</Label>
                      <Select
                        value={newParameter.type || 'string'}
                        onValueChange={(value) => setNewParameter(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="dict">Dictionary</SelectItem>
                        <SelectItem value="file">File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Description</Label>
                    <Textarea
                      value={newParameter.description || ''}
                      onChange={(e) => setNewParameter(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Parameter description"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newParameter.required || false}
                      onCheckedChange={(checked) => setNewParameter(prev => ({ ...prev, required: checked }))}
                    />
                    <Label className="text-sm">Required</Label>
                  </div>
                  
                  <Button onClick={addParameter} className="w-full">
                    Add Parameter
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
