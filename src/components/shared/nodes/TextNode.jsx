import { memo } from 'react';
import { GenericNode } from '../generic-node';

const TextNode = memo(({ id, data, selected, width, height, ...props }) => {
  const preview = data.text || 'No text';
  const truncated = preview.length > 50 ? preview.substring(0, 50) + '...' : preview;

  return (
    <GenericNode
      id={id}
      data={{
        ...data,
        id: data.id || 'text',
        name: data.name || data.label || 'Text',
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
        {truncated}
      </div>
    </GenericNode>
  );
});

TextNode.displayName = 'TextNode';

export default TextNode;

