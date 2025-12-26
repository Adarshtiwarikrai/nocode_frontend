import { memo } from 'react';
import { GenericNode } from '../generic-node';

const AssistantNode = memo(({ id, data, selected, width, height, ...props }) => {
  return (
    <GenericNode
      id={id}
      data={{
        ...data,
        id: data.id || 'assistant',
        name: data.name || data.label || 'Assistant',
      }}
      selected={selected}
      width={width}
      height={height}
      ports={[
        { type: 'target', name: 'input' },
        { type: 'source', name: 'output' },
      ]}
      {...props}
    >
      <div className="text-xs text-muted-foreground text-center px-2">
        Assistant Response
      </div>
    </GenericNode>
  );
});

AssistantNode.displayName = 'AssistantNode';

export default AssistantNode;

