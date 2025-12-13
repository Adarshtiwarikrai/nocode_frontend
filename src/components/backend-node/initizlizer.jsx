
import { ComponentType } from 'react';
import { GenericNode } from '../shared/generic-node';

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
