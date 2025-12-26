
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '../../ui/scrollarea';
import { cn } from '../../../lib/utils';
import { GenericOption } from '../option';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useReactFlow } from '@xyflow/react';
import { setNodeData } from '../../../lib/flow';

export const DelayNodeConfig = React.memo(({ nodeId, data, className, ...props }) => {
  const instance = useReactFlow();
  const [delayMs, setDelayMs] = useState(data?.delayMs || 1000);

  useEffect(() => {
    setDelayMs(data?.delayMs || 1000);
  }, [data?.delayMs]);

  const updateNode = (updates) => {
    setNodeData(instance, nodeId, updates);
  };

  const handleDelayChange = (value) => {
    const delay = parseInt(value) || 1000;
    setDelayMs(delay);
    updateNode({ delayMs: delay });
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
          placeholder="Delay"
        />

        {/* Delay */}
        <div className="flex flex-col gap-2 text-sm">
          <Label>Delay (milliseconds)</Label>
          <Input
            type="number"
            value={delayMs}
            onChange={(e) => handleDelayChange(e.target.value)}
            placeholder="1000"
            min="0"
            className="bg-transparent w-full nodrag nowheel"
          />
          <p className="text-xs text-muted-foreground">
            Wait time in milliseconds before continuing to next node
          </p>
        </div>
      </div>
    </ScrollArea>
  );
});

DelayNodeConfig.displayName = 'DelayNodeConfig';

