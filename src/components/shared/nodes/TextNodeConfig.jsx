
import React from 'react';
import { ScrollArea } from '../../ui/scrollarea';
import { cn } from '../../../lib/utils';
import { GenericOption } from '../option';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { useReactFlow } from '@xyflow/react';
import { setNodeData } from '../../../lib/flow';

export const TextNodeConfig = React.memo(({ nodeId, data, className, ...props }) => {
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
          placeholder="Text Node"
        />

        {/* Text Content */}
        <div className="flex flex-col gap-2 text-sm">
          <Label>Text Content</Label>
          <Textarea
            value={data?.text || ''}
            onChange={(e) => updateNode({ text: e.target.value })}
            placeholder="Enter text content... Use {{context.variableName}} to insert dynamic values"
            rows={6}
            className="bg-transparent w-full nodrag nowheel font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Use <code className="bg-muted px-1 rounded">{'{{context.apiResponse}}'}</code> to display API response,{' '}
            <code className="bg-muted px-1 rounded">{'{{context.userInput}}'}</code> for user input, etc.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
});

TextNodeConfig.displayName = 'TextNodeConfig';

