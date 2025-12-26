
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '../../ui/scrollarea';
import { cn } from '../../../lib/utils';
import { GenericOption } from '../option';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { useReactFlow } from '@xyflow/react';
import { setNodeData } from '../../../lib/flow';

export const InputNodeConfig = React.memo(({ nodeId, data, className, ...props }) => {
  const instance = useReactFlow();

  const updateNode = (updates) => {
    setNodeData(instance, nodeId, updates);
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
          name="label"
          label="Label"
          placeholder="Input"
        />

        {/* Variable Name */}
        <div className="flex flex-col gap-2 text-sm">
          <Label>Variable Name</Label>
          <Input
            type="text"
            value={data?.variableName || ''}
            onChange={(e) => updateNode({ variableName: e.target.value })}
            placeholder="e.g., userInput, name, email"
            className="bg-transparent w-full nodrag nowheel"
          />
          <p className="text-xs text-muted-foreground">
            This variable will be available in context and can be used in conditions and other nodes
          </p>
        </div>

        {/* Prompt Text */}
        <div className="flex flex-col gap-2 text-sm">
          <Label>Prompt Text</Label>
          <Textarea
            value={data?.prompt || ''}
            onChange={(e) => updateNode({ prompt: e.target.value })}
            placeholder="Enter the prompt text to show to the user..."
            rows={3}
            className="bg-transparent w-full nodrag nowheel"
          />
        </div>
      </div>
    </ScrollArea>
  );
});

InputNodeConfig.displayName = 'InputNodeConfig';

