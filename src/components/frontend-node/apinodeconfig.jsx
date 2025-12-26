// AI generated file
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '../ui/scrollarea';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Icons } from '../ui/icons';
import { GenericOption } from '../shared/option';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useReactFlow } from '@xyflow/react';
import { setNodeData } from '../../lib/flow';

const API_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export const ApiNodeConfig = React.memo(({ nodeId, data, className, ...props }) => {
  const instance = useReactFlow();
  const [parameters, setParameters] = useState(data?.parameters || []);

  useEffect(() => {
    setParameters(data?.parameters || []);
  }, [data?.parameters]);

  const updateNode = (updates) => {
    setNodeData(instance, nodeId, updates);
  };

  const handleAddParameter = () => {
    const newParams = [...parameters, { key: '', value: '' }];
    setParameters(newParams);
    updateNode({ parameters: newParams });
  };

  const handleUpdateParameter = (index, field, value) => {
    const newParams = [...parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setParameters(newParams);
    updateNode({ parameters: newParams });
  };

  const handleRemoveParameter = (index) => {
    const newParams = parameters.filter((_, i) => i !== index);
    setParameters(newParams);
    updateNode({ parameters: newParams });
  };

  return (
    <ScrollArea>
      <div className={cn(className, 'flex flex-col gap-4 p-2')}>
        {/* General Options */}
        <GenericOption
          type="text"
          nodeId={nodeId}
          data={data}
          name="name"
          label="Name"
          placeholder="Enter node name"
        />
        <GenericOption
          type="text"
          nodeId={nodeId}
          data={data}
          name="description"
          label="Description"
          placeholder="Enter description"
          rows={2}
        />

        {/* API Method */}
        <div className="flex flex-col gap-2 text-sm">
          <Label>API Method</Label>
          <Select
            value={data?.apiMethod || 'GET'}
            onValueChange={(value) => updateNode({ apiMethod: value })}
          >
            <SelectTrigger className="bg-transparent w-full nodrag nowheel">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {API_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* API URL */}
        <div className="flex flex-col gap-2 text-sm">
          <Label>API URL</Label>
          <Input
            type="text"
            value={data?.apiUrl || ''}
            onChange={(e) => updateNode({ apiUrl: e.target.value })}
            placeholder="https://api.example.com/endpoint"
            className="bg-transparent w-full nodrag nowheel"
          />
        </div>

        {/* API Body (for POST, PUT, DELETE, PATCH) */}
        {['POST', 'PUT', 'DELETE', 'PATCH'].includes(data?.apiMethod || 'GET') && (
          <div className="flex flex-col gap-2 text-sm">
            <Label>Request Body</Label>
            <Textarea
              value={data?.body || ''}
              onChange={(e) => updateNode({ body: e.target.value, useBody: true })}
              placeholder="Enter JSON body or use {{context.variableName}} for dynamic values"
              rows={6}
              className="bg-transparent w-full nodrag nowheel font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Use <code className="bg-muted px-1 rounded">{'{{context.userInput}}'}</code> to insert user input,{' '}
              <code className="bg-muted px-1 rounded">{'{{context.apiResponse}}'}</code> for API responses, etc.
            </p>
          </div>
        )}

        {/* Parameters */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <Label>Query Parameters</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddParameter}
              className="h-7"
            >
              <Icons.add className="w-3 h-3 mr-1" />
              Add Parameter
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {parameters.map((param, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Key"
                  value={param.key || ''}
                  onChange={(e) => handleUpdateParameter(index, 'key', e.target.value)}
                  className="bg-transparent flex-1 nodrag nowheel"
                />
                <Input
                  type="text"
                  placeholder="Value"
                  value={param.value || ''}
                  onChange={(e) => handleUpdateParameter(index, 'value', e.target.value)}
                  className="bg-transparent flex-1 nodrag nowheel"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveParameter(index)}
                  className="h-7 w-7 p-0"
                >
                  <Icons.trash className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {parameters.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No parameters added. Click "Add Parameter" to add one.
              </p>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
});

ApiNodeConfig.displayName = 'ApiNodeConfig';

