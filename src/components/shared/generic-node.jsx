import {
  Handle,
  Position,
  NodeResizer,
  NodeToolbar,
  useReactFlow,
} from '@xyflow/react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';
import { Icons } from '../ui/icons';
import { Button } from '../ui/button';
import { getNodeIcon, setNodeData } from '../../lib/flow';
export const GenericNode = ({
  id,
  data,
  selected,
  ports = [],
  children,
  width,
  height,
}) => {
  const NodeIcon = getNodeIcon(data.id);
  const instance = useReactFlow();
  console.log('node size', width, height);

  return (
    <div
      style={{
        width,
        height,
        minWidth: 120,
        minHeight: 60,
      }}
      className="relative flex flex-col gap-2 p-4 rounded-xl border-2 bg-muted"
    >
      <NodeToolbar isVisible={selected} position={Position.Top} align={'end'}>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => instance.deleteElements({ nodes: [{ id }] })}
        >
          <Icons.trash className="w-4 h-4" />
        </Button>
      </NodeToolbar>
      <NodeResizer
        color="#000000"
        isVisible={selected}
        minWidth={120}
        minHeight={60}
      />
      <div className="flex flex-col items-center gap-2 flex-grow">
        <NodeIcon className="w-10 h-10" />
        <span className="text-sm font-bold">{data.name}</span>
       <div>
       {children}
       </div>
       
      </div>

      {ports.map(({ type, name }) => (
        <Handle
          key={`${type}-${name}`}
          type={type}
          position={type === 'target' ? Position.Left : Position.Right}
          id={`${type}-${name}`}
          className={cn(
            '!w-2 !h-2 !rounded-full !border-2 !bg-background',
            selected ? '!border-brand/80' : '!border-muted-foreground/80'
          )}
        />
      ))}
    </div>
  );
};
