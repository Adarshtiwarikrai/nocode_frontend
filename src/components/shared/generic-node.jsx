
import {
  Handle,
  Position,
  NodeResizer,
  NodeToolbar,
  useReactFlow,
} from '@xyflow/react';
import { cn } from '../../lib/utils';
import { Icons } from '../ui/icons';
import { Button } from '../ui/button';
import { getNodeIcon } from '../../lib/flow';

export const GenericNode = ({
  id,
  data,
  selected,
  ports = [],
  handles = [],
  children,
  width,
  height,
  minWidth = 120,
  minHeight = 60,
  className,
  header,
  contentClassName,
  resizerColor,
  showIcon = true,
  showName = true,
}) => {
  const NodeIcon = getNodeIcon(data.id);
  const instance = useReactFlow();

  // Use explicit dimensions if provided, otherwise use defaults
  const nodeWidth = typeof width === 'number' ? width : (width || minWidth);
  const nodeHeight = typeof height === 'number' ? height : (height || minHeight);

  // Use handles if provided, otherwise fall back to ports for backward compatibility
  const handleConfigs = handles.length > 0 ? handles : ports.map(({ type, name }) => ({
    type,
    id: `${type}-${name}`,
    position: type === 'target' ? Position.Left : Position.Right,
  }));

  return (
    <div
      style={{
        width: typeof nodeWidth === 'number' ? `${nodeWidth}px` : nodeWidth,
        height: typeof nodeHeight === 'number' ? `${nodeHeight}px` : nodeHeight,
        minWidth: `${minWidth}px`,
        minHeight: `${minHeight}px`,
      }}
      className={cn(
        'relative flex flex-col rounded-xl border-2 bg-muted',
        className
      )}
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
        color={resizerColor || "#000000"}
        isVisible={selected}
        minWidth={minWidth}
        minHeight={minHeight}
        keepAspectRatio={false}
      />
      
      {header || (
        <div className="flex flex-col items-center gap-2 p-4 flex-grow">
          {showIcon && NodeIcon && <NodeIcon className="w-10 h-10" />}
          {showName && <span className="text-sm font-bold">{data.name}</span>}
        </div>
      )}

      <div className={cn('flex-1 relative', contentClassName)}>
        {children}
      </div>

      {handleConfigs.map((handle) => {
        const {
          type,
          id: handleId,
          position,
          style = {},
          className: handleClassName,
          ...handleProps
        } = handle;

        return (
          <Handle
            key={handleId}
            type={type}
            position={position}
            id={handleId}
            style={style}
            className={cn(
              '!w-2 !h-2 !rounded-full !border-2 !bg-background',
              selected ? '!border-brand/80' : '!border-muted-foreground/80',
              handleClassName
            )}
            {...handleProps}
          />
        );
      })}
    </div>
  );
};
