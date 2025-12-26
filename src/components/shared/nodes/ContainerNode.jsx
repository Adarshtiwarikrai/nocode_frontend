
import { memo, useMemo, useEffect } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { cn } from '../../../lib/utils';
import { GenericNode } from '../generic-node';
import { OptionItem } from './OptionItem';

const ContainerNode = memo(({ id, data, selected, width, height }) => {
  const { label, icon, color = '#2196F3', children = [], message, options = [], isEdgeSource } = data;
  const isQuickReply = message !== undefined;
  const { updateNode } = useReactFlow();
  
  const quickReplyOptions = isQuickReply ? (options || []) : [];
  const optionHeight = 40;
  const headerHeight = 50;
  const messageHeight = 70;
  const padding = 24;
  const spacing = 8;
  
  const { minWidth, minHeight } = useMemo(() => {
    if (isQuickReply) {
      const calculatedMinHeight = Math.max(
        140,
        headerHeight + messageHeight + (quickReplyOptions.length * (optionHeight + spacing)) + padding + 50
      );
      return {
        minWidth: 220,
        minHeight: calculatedMinHeight,
      };
    }
    return {
      minWidth: 220,
      minHeight: 140,
    };
  }, [isQuickReply, quickReplyOptions.length]);

  useEffect(() => {
    if (isQuickReply && height && height > minHeight) {
      updateNode(id, { height: minHeight });
    }
  }, [id, isQuickReply, height, minHeight, updateNode]);

  const handles = [
    { type: 'target', id: 'input', position: Position.Left, style: { top: '50%' }, className: '!border-green-500' },
  ];

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
      resizerColor={color}
      showIcon={false}
      showName={false}
      className={cn(
        'rounded-xl border-t-4 border-2 bg-background shadow-sm transition-all overflow-visible',
        selected && 'ring-2 ring-primary/30 shadow-md',
        isEdgeSource && 'ring-4 ring-green-500/50'
      )}
      header={
        <div 
          className="flex items-center gap-2 px-4 py-3 rounded-t-xl text-white text-xs font-semibold flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` }}
        >
          <span className="text-lg">{icon || '📦'}</span>
          <span className="flex-1 text-center">{label || 'Container'}</span>
        </div>
      }
      contentClassName="flex flex-col gap-2.5 p-3.5 bg-muted/50 flex-1 min-h-[70px] rounded-b-xl"
    >
      {isQuickReply && (
        <>
          <div className="bg-background border rounded-lg p-3 min-h-[55px] flex-shrink-0 shadow-sm">
            <div className="text-xs text-foreground leading-relaxed break-words">
              {message || 'No message'}
            </div>
          </div>
          
          {quickReplyOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              {quickReplyOptions.map((option, index) => {
                const optionText = typeof option === 'string' ? option : (option.text || option.preview || option.label || `Option ${index + 1}`);
                return (
                  <OptionItem
                    key={option.id || `option-${index}` || index}
                    id={`option-${index}`}
                    text={optionText}
                    type="option"
                    showSourceHandle={true}
                    showTargetHandle={true}
                    sourceHandleId={`option-${index}`}
                    targetHandleId={`option-${index}-target`}
                  />
                );
              })}
            </div>
          )}
          
          {/* Add options button at bottom */}
          <div className="bg-muted border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all flex-shrink-0 mt-auto mb-1 hover:bg-muted/80 hover:border-primary hover:scale-[1.02]">
            <span className="text-xs text-muted-foreground font-medium">add options +</span>
          </div>
        </>
      )}
      
      {!isQuickReply && children.length > 0 && (
        <div className="flex flex-col gap-1.5 flex-1 overflow-visible">
          {children.map((child, index) => (
            <div key={child.id || index} className="px-3 py-2.5 bg-background border rounded-lg text-xs">
              <div className="font-semibold text-primary text-[10px] mb-1">{child.label}</div>
              <div className="text-muted-foreground text-[9px] truncate">{child.preview || ''}</div>
            </div>
          ))}
        </div>
      )}
    </GenericNode>
  );
});

ContainerNode.displayName = 'ContainerNode';

export default ContainerNode;
