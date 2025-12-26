
import { Handle, Position } from '@xyflow/react';
import { cn } from '../../../lib/utils';

export const OptionItem = ({
  id,
  label,
  text,
  type = 'option',
  selected = false,
  hasConnection = false,
  hasTargetConnection = false,
  className,
  showSourceHandle = true,
  showTargetHandle = true,
  sourceHandleId,
  targetHandleId,
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'if':
        return 'border-l-4 border-l-green-500';
      case 'elseif':
        return 'border-l-4 border-l-yellow-500';
      case 'else':
        return 'border-l-4 border-l-purple-500';
      default:
        return 'border-l-4 border-l-blue-500';
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border shadow-sm transition-all min-h-[40px]',
        getTypeStyles(),
        selected && 'ring-2 ring-primary/30 shadow-md',
        className
      )}
    >
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          id={targetHandleId || `${id}-target`}
          className={cn(
            '!w-2 !h-2 !rounded-full !border-2 !bg-background',
            hasTargetConnection ? '!border-green-500' : (selected ? '!border-brand/80' : '!border-muted-foreground/80')
          )}
          style={{ top: '50%' }}
        />
      )}
      
      {label && (
        <span className="font-semibold text-muted-foreground text-[10px] min-w-[60px]">
          {label}:
        </span>
      )}
      <span className="flex-1 text-foreground text-[10px] truncate">
        {text || 'No text'}
      </span>
      {hasConnection && (
        <span className="text-green-500 text-xs font-bold">●</span>
      )}
      
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Right}
          id={sourceHandleId || id}
          className={cn(
            '!w-2 !h-2 !rounded-full !border-2 !bg-background',
            hasConnection ? '!border-purple-500' : (selected ? '!border-brand/80' : '!border-muted-foreground/80')
          )}
          style={{ top: '50%' }}
        />
      )}
    </div>
  );
};

