
import React from 'react';
import { ScrollArea } from '../../ui/scrollarea';
import { cn } from '../../../lib/utils';
import { GenericOption } from '../option';

export const AssistantNodeConfig = React.memo(({ nodeId, data, className, ...props }) => {
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
          placeholder="Assistant"
        />
      </div>
    </ScrollArea>
  );
});

AssistantNodeConfig.displayName = 'AssistantNodeConfig';

