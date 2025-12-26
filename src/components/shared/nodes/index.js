import TextNode from './TextNode';
import InputNode from './InputNode';
import DelayNode from './DelayNode';
import AssistantNode from './AssistantNode';
import ConditionNode from './ConditionNode';
import QuickReplyNode from './QuickReplyNode';
import ContainerNode from './ContainerNode';
import BranchNode from './BranchNode';

export const nodeTypes = {
  text: TextNode,
  input: InputNode,
  delay: DelayNode,
  assistant: AssistantNode,
  condition: ConditionNode,
  quickreply: QuickReplyNode,
  container: ContainerNode,
  branch: BranchNode,
};

export {
  TextNode,
  InputNode,
  DelayNode,
  AssistantNode,
  ConditionNode,
  QuickReplyNode,
  ContainerNode,
  BranchNode,
};

