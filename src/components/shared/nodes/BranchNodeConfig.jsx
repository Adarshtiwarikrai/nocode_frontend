
import React from 'react';
import { ScrollArea } from '../../ui/scrollarea';
import { cn } from '../../../lib/utils';
import { GenericOption } from '../option';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useReactFlow } from '@xyflow/react';
import { setNodeData } from '../../../lib/flow';

export const BranchNodeConfig = React.memo(({ nodeId, data, className, ...props }) => {
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
          placeholder="Branch"
        />

        {/* Condition/Text */}
        <div className="flex flex-col gap-2 text-sm">
          <Label>Condition/Text</Label>
          <Input
            type="text"
            value={data?.condition || ''}
            onChange={(e) => updateNode({ condition: e.target.value })}
            placeholder="Condition or option text"
            className="bg-transparent w-full nodrag nowheel"
          />
        </div>
      </div>
    </ScrollArea>
  );
});

BranchNodeConfig.displayName = 'BranchNodeConfig';

