import { InitializerNode } from '../components/backend-node/initizlizer';
import { ConversableAgent } from '../components/backend-node/agent';
import { GroupNode } from '../components/backend-node/group';
import { NoteNode } from '../components/backend-node/note';
import { UserProxyAgent } from '../components/backend-node/user';
import { genId } from './id'; 
import { Icons } from '../components/ui/icons'; 
import { ConverseEdge } from '../components/shared/edge';
import ApiNode from '../components/frontend-node/apinode'

/* =========================
   Node & Edge Types
========================= */

export const nodeTypes = {
  initializer: InitializerNode,
  conversable: ConversableAgent,
  groupchat: GroupNode,
  user:UserProxyAgent,
  api:ApiNode,
  note:NoteNode
};

export const edgeTypes = {
  converse: ConverseEdge,
};

/* =========================
   Helpers
========================= */

export const isConversable = (node) =>
  node?.type &&
  ['conversable', 'groupchat'].includes(node.type);

/* =========================
   Node Metadata
========================= */

export const basicNodes = [
  {
    id: 'initializer',
    icon: Icons.rocket,
    name: 'Initializer',
    description: 'The first node in the flow',
    class_type: 'Initializer',
  },
  {
    id: 'conversable',
    icon: Icons.robot,
    name: 'Agent',
    description: 'A Conversable Agent',
    class_type: 'ConversableAgent',
  },
  {
    id: 'user',
    icon: Icons.user,
    name: 'User',
    description: 'A User Proxy Agent',
    class_type: 'UserProxyAgent',
  },
  {
    id: 'groupchat',
    icon: Icons.group,
    name: 'Group',
    description: 'Group several agents together',
    class_type: 'GroupChat',
    width: 400,
    height: 300,
  },
  {
    id: 'api',
    icon: Icons.note,
    name: 'Api',
    description: 'node for api calling',
    class_type: 'ApiNode',
    width: 400,
    height: 300,
  },
  {
    id: 'note',
    icon: Icons.note,
    name: 'Note',
    description: 'Work as comment for the flow and node',
    class_type: 'Note',
    width: 400,
    height: 200,
  },
];

const allNodes = [...basicNodes];

/* =========================
   Utilities
========================= */

export const getNodeIcon = (type) => {
  console.log("adfadafaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",type)
  const nodeMeta = allNodes.find((node) => node.id === type);
  return nodeMeta?.icon || Icons.question;
};

export const setNodeData = (instance, id, dataset, scope = '') => {
  const nodes = instance.getNodes();

  instance.setNodes(
    nodes.map((node) => {
      if (node.id === id) {
        if (scope) {
          node.data = {
            ...node.data,
            [scope]: { ...node.data?.[scope], ...dataset },
          };
        } else {
          node.data = { ...node.data, ...dataset };
        }
      }
      return node;
    })
  );
};

export const setEdgeData = (instance, id, dataset, scope = '') => {
  const edges = instance.getEdges();

  instance.setEdges(
    edges.map((edge) => {
      if (edge.id === id) {
        if (scope) {
          edge.data = {
            ...edge.data,
            [scope]: { ...edge.data?.[scope], ...dataset },
          };
        } else {
          edge.data = { ...edge.data, ...dataset };
        }
      }
      return edge;
    })
  );
};

/* =========================
   Flow Helpers
========================= */

export const getFlowName = (nodes) => {
  const configNode = nodes.find((node) => node.type === 'config');
  return configNode?.data?.flow_name || `flow-${genId()}`;
};

export const getFlowDescription = (nodes) => {
  const configNode = nodes.find((node) => node.type === 'config');
  return configNode?.data?.flow_description || '';
};

/* =========================
   Comparison Utilities
========================= */

export const isFlowDirty = (flow1, flow2) =>
  !deepEqual(flow1, flow2, ['selected', 'dragging']);

export function deepEqual(obj1, obj2, ignoreKeys = []) {
  if (obj1 === obj2) return true;

  const keys1 = Object.keys(obj1).filter((k) => !ignoreKeys.includes(k));
  const keys2 = Object.keys(obj2).filter((k) => !ignoreKeys.includes(k));

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    const bothObjects = isObject(val1) && isObject(val2);

    if (
      (bothObjects && !deepEqual(val1, val2, ignoreKeys)) ||
      (!bothObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

/* =========================
   Formatting
========================= */

export function formatData(data) {
  let markdown = '| Key | Value |\n| --- | --- |\n';
  Object.entries(data).forEach(([key, value]) => {
    markdown += `| ${key} | ${value} |\n`;
  });
  return markdown;
}
