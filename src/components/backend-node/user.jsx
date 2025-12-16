
import { GenericNode } from '../shared/generic-node';
import { ComponentType } from 'react';

export const UserProxyAgent = ({ ...props }) => {
  return (
    <GenericNode ports={[{ type: 'source' }, { type: 'target' }]} {...props} />
  );
};
