import { memo } from 'react';
import { GenericNode } from '../generic-node';

const InputNode = memo(({ id, data, selected, width, height, ...props }) => {
  const variable = data.variableName || 'userInput';
  const prompt = data.prompt || 'Enter input:';
  const truncatedPrompt = prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt;

  return (
    <GenericNode
      id={id}
      data={{
        ...data,
        id: data.id || 'input',
        name: data.name || data.label || 'Input',
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
      <div className="text-xs text-muted-foreground text-center px-2 space-y-1">
        <div className="font-semibold">{variable}</div>
        <div className="text-xs">{truncatedPrompt}</div>
      </div>
    </GenericNode>
  );
});

InputNode.displayName = 'InputNode';

export default InputNode;

