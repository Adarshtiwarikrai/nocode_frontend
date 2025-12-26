
import { memo, useMemo, useEffect } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { cn } from '../../../lib/utils';
import { GenericNode } from '../generic-node';
import { OptionItem } from './OptionItem';

const QuickReplyNode = memo(({ id, data, selected, width, height }) => {
  const { message, options = [] } = data;
  const hasConnections = data.connections || {};
  const { updateNode } = useReactFlow();
  
  const optionHeight = 40;
  const headerHeight = 40;
  const messageHeight = 60;
  const padding = 16;
  const spacing = 8;
  
  const { minWidth, minHeight } = useMemo(() => {
    const calculatedMinHeight = Math.max(
      80,
      headerHeight + messageHeight + (options.length * (optionHeight + spacing)) + padding
    );
    return {
      minWidth: 150,
      minHeight: calculatedMinHeight,
    };
  }, [options.length]);

  useEffect(() => {
    if (height && height > minHeight) {
      updateNode(id, { height: minHeight });
    }
  }, [id, height, minHeight, updateNode]);

  const handles = [
    { type: 'target', id: 'input', position: Position.Left, style: { top: '50%' }, className: '!border-green-500' },
  ];

  const nodeColor = data.color || '#2196F3';

  return (
    <GenericNode
      id={id}
      data={data}
      selected={selected}
      width={width}
      height={height}
      minWidth={minWidth}
      minHeight={minHeight}
      handles={handles}
      resizerColor={nodeColor}
      showIcon={false}
      showName={false}
      className={cn(
        'rounded-lg border-2 bg-background shadow-sm transition-all overflow-visible',
        selected && 'ring-2 ring-primary/30 shadow-md'
      )}
      header={
        <div 
          className="flex items-center gap-2 px-3 py-2 rounded-t-lg text-white text-xs font-semibold flex-shrink-0 min-h-[40px] relative z-10"
          style={{ backgroundColor: nodeColor }}
        >
          <span>💬</span>
          <span className="flex-1 text-center">{data.label || 'Quick Reply'}</span>
        </div>
      }
      contentClassName="flex flex-col gap-2 p-3 bg-muted/50 rounded-b-lg"
    >
      <div className="font-medium text-xs text-foreground mb-2 pb-2 border-b flex-shrink-0">
        {message || 'No message'}
      </div>
      
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <OptionItem
            key={index}
            id={`option-${index}`}
            text={option.text || `Option ${index + 1}`}
            type="option"
            hasConnection={hasConnections[`option-${index}`]}
            hasTargetConnection={hasConnections[`option-${index}-target`]}
            showSourceHandle={true}
            showTargetHandle={true}
            sourceHandleId={`option-${index}`}
            targetHandleId={`option-${index}-target`}
          />
        ))}
      </div>
    </GenericNode>
  );
});

QuickReplyNode.displayName = 'QuickReplyNode';

export default QuickReplyNode;

