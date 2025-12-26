import { memo } from 'react';
import { GenericNode } from '../generic-node';

const DelayNode = memo(({ id, data, selected, width, height, ...props }) => {
  const delay = data.delayMs || 1000;

  return (
    <GenericNode
      id={id}
      data={{
        ...data,
        id: data.id || 'delay',
        name: data.name || data.label || 'Delay',
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
        Wait: {delay}ms
      </div>
    </GenericNode>
  );
});

DelayNode.displayName = 'DelayNode';

export default DelayNode;

