
import { memo } from 'react';
import { Position } from '@xyflow/react';
import { cn } from '../../../lib/utils';
import { GenericNode } from '../generic-node';

const BranchNode = memo(({ id, data, selected, width, height, ...props }) => {
  const { label, condition, branchType, color = '#2196F3' } = data;

  const borderColorMap = {
    if: '#10b981',
    elseif: '#f59e0b',
    else: '#8b5cf6',
    option: '#3b82f6',
  };

  const borderColor = borderColorMap[branchType] || color;

  const handles = [
    { type: 'target', id: 'input', position: Position.Left, style: { top: '50%' }, className: '!border-green-500' },
    { type: 'source', id: 'output', position: Position.Right, style: { top: '50%' }, className: '!border-blue-500' },
  ];

  return (
    <GenericNode
      id={id}
      data={data}
      selected={selected}
      width={width}
      height={height}
      minWidth={150}
      minHeight={50}
      handles={handles}
      resizerColor={borderColor}
      showIcon={false}
      showName={false}
      className={cn(
        'rounded-lg border-t-4 bg-background border-2 shadow-sm transition-all',
        selected && 'ring-2 ring-primary/30 shadow-md'
      )}
      contentClassName="flex flex-col items-center justify-center flex-1 px-3 py-2"
    >
      <div className="text-xs font-semibold text-primary">{label || 'Branch'}</div>
      <div className="text-[10px] text-muted-foreground text-center truncate max-w-[130px]">
        {condition || 'No condition'}
      </div>
    </GenericNode>
  );
});

BranchNode.displayName = 'BranchNode';

export default BranchNode;

