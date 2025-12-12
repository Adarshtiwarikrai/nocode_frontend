
import { NodeProps } from '@xyflow/react';
import { ComponentType } from 'react';
import { GenericNode } from '@/flow/node/generic-node';

export const InitializerNode = ({
  id,
  data,
  ...props
}) => {
  return (
    <GenericNode
      id={id}
      data={data}
      {...props}
      ports={[{ type: 'source', name: '' }]}
    />
  );
};
