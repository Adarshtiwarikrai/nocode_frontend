
import { memo, useMemo, useEffect } from 'react';
import { Position, useReactFlow } from '@xyflow/react';
import { cn } from '../../../lib/utils';
import { GenericNode } from '../generic-node';
import { OptionItem } from './OptionItem';

const ConditionNode = memo(({ id, data, selected, width, height }) => {
  const { ifCondition, elseIfConditions = [], elseNode } = data;
  const hasConnections = data.connections || {};
  const { updateNode } = useReactFlow();
  
  const conditionHeight = 40;
  const headerHeight = 40;
  const padding = 16;
  const spacing = 8;
  
  const conditionCount = (ifCondition ? 1 : 0) + elseIfConditions.length + (elseNode ? 1 : 0);
  
  const { minWidth, minHeight } = useMemo(() => {
    const calculatedMinHeight = Math.max(
      100,
      headerHeight + (conditionCount * (conditionHeight + spacing)) + padding
    );
    return {
      minWidth: 180,
      minHeight: calculatedMinHeight,
    };
  }, [conditionCount]);

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
        'rounded-lg border-2 bg-background shadow-sm transition-all',
        selected && 'ring-2 ring-primary/30 shadow-md'
      )}
      header={
        <div 
          className="flex items-center gap-2 px-3 py-2 rounded-t-lg text-white text-xs font-semibold flex-shrink-0 relative z-10"
          style={{ backgroundColor: nodeColor }}
        >
          <span>❓</span>
          <span className="flex-1 text-center">{data.label || 'If-Else'}</span>
        </div>
      }
      contentClassName="flex flex-col gap-2 p-3 bg-muted/50 rounded-b-lg"
    >
      <div className="flex flex-col gap-2">
        {ifCondition && (
          <OptionItem
            id="if"
            label="IF"
            text={ifCondition}
            type="if"
            hasConnection={hasConnections.if}
            hasTargetConnection={hasConnections['if-target']}
            showSourceHandle={true}
            showTargetHandle={true}
            sourceHandleId="if"
            targetHandleId="if-target"
          />
        )}

        {elseIfConditions.map((elseIf, index) => (
          <OptionItem
            key={index}
            id={`elseif-${index}`}
            label={`ELSE IF ${index + 1}`}
            text={elseIf.condition || 'No condition'}
            type="elseif"
            hasConnection={hasConnections[`elseif-${index}`]}
            hasTargetConnection={hasConnections[`elseif-${index}-target`]}
            showSourceHandle={true}
            showTargetHandle={true}
            sourceHandleId={`elseif-${index}`}
            targetHandleId={`elseif-${index}-target`}
          />
        ))}

        {elseNode && (
          <OptionItem
            id="else"
            label="ELSE"
            text="Default"
            type="else"
            hasConnection={hasConnections.else}
            hasTargetConnection={hasConnections['else-target']}
            showSourceHandle={true}
            showTargetHandle={true}
            sourceHandleId="else"
            targetHandleId="else-target"
          />
        )}
      </div>
    </GenericNode>
  );
});

ConditionNode.displayName = 'ConditionNode';

export default ConditionNode;

