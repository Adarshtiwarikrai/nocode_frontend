import { NodeProps } from '@xyflow/react';
import { GenericNode } from '@/flow/node/generic-node';
import { ComponentType } from 'react';

export const ConversableAgent= ({
  id,
  data,
  selected,
  ...props
}) => {
  return (
    <GenericNode
      id={id}
      data={data}
      selected={selected}
      ports={[
        { type: 'target', name: 'input' },
        { type: 'source', name: 'output' },
      ]}
      nodeClass="agent"
      {...props}
    ></GenericNode>
  );
};
