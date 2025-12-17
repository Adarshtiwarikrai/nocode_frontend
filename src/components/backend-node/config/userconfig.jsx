
import { GenericOption } from '../../shared/option';

import { ConversableAgentConfig } from './config';
export const UserConfig = ({ nodeId, data }) => {
  return (
    <ConversableAgentConfig
      className="flex flex-col gap-4 p-2"
      nodeId={nodeId}
      data={data}
      toolScene={'user'}
    ></ConversableAgentConfig>
  );
};
