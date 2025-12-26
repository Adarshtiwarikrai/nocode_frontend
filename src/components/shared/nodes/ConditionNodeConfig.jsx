
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '../../ui/scrollarea';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/button';
import { Icons } from '../../ui/icons';
import { GenericOption } from '../option';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { useReactFlow } from '@xyflow/react';
import { setNodeData } from '../../../lib/flow';

export const ConditionNodeConfig = React.memo(({ nodeId, data, className, ...props }) => {
  const instance = useReactFlow();
  const [ifCondition, setIfCondition] = useState(data?.ifCondition || '');
  const [elseIfConditions, setElseIfConditions] = useState(data?.elseIfConditions || []);
  const [elseNode, setElseNode] = useState(data?.elseNode !== undefined ? data.elseNode : true);

  useEffect(() => {
    setIfCondition(data?.ifCondition || '');
    setElseIfConditions(data?.elseIfConditions || []);
    setElseNode(data?.elseNode !== undefined ? data.elseNode : true);
  }, [data?.ifCondition, data?.elseIfConditions, data?.elseNode]);

  const updateNode = (updates) => {
    setNodeData(instance, nodeId, updates);
  };

  const handleAddElseIf = () => {
    const newElseIfs = [...elseIfConditions, { condition: '' }];
    setElseIfConditions(newElseIfs);
    updateNode({ elseIfConditions: newElseIfs });
  };

  const handleUpdateElseIf = (index, value) => {
    const newElseIfs = [...elseIfConditions];
    newElseIfs[index] = { ...newElseIfs[index], condition: value };
    setElseIfConditions(newElseIfs);
    updateNode({ elseIfConditions: newElseIfs });
  };

  const handleRemoveElseIf = (index) => {
    const newElseIfs = elseIfConditions.filter((_, i) => i !== index);
    setElseIfConditions(newElseIfs);
    updateNode({ elseIfConditions: newElseIfs });
  };

  const handleIfConditionChange = (value) => {
    setIfCondition(value);
    updateNode({ ifCondition: value });
  };

  const handleElseNodeToggle = (checked) => {
    setElseNode(checked);
    updateNode({ elseNode: checked });
  };

  return (
    <ScrollArea>
      <div className={cn(className, 'flex flex-col gap-4 p-2')}>
        {/* General Options */}
        <GenericOption
          type="text"
          nodeId={nodeId}
          data={data}
          name="name"
          label="Name"
          placeholder="Enter node name"
        />
        <GenericOption
          type="text"
          nodeId={nodeId}
          data={data}
          name="label"
          label="Label"
          placeholder="If-Else"
        />

        {/* IF Condition */}
        <div className="flex flex-col gap-2 text-sm">
          <Label>IF Condition</Label>
          <Textarea
            value={ifCondition}
            onChange={(e) => handleIfConditionChange(e.target.value)}
            placeholder="e.g., context.value > 10 or userInput === 'yes'"
            rows={3}
            className="bg-transparent w-full nodrag nowheel font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Enter a JavaScript expression. Use <code className="bg-muted px-1 rounded">context.variableName</code> to access variables.
          </p>
        </div>

        {/* ELSE IF Conditions */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <Label>ELSE IF Conditions</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddElseIf}
              className="h-7"
            >
              <Icons.add className="w-3 h-3 mr-1" />
              Add ELSE IF
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {elseIfConditions.map((elseIf, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={`ELSE IF ${index + 1} condition`}
                  value={elseIf.condition || ''}
                  onChange={(e) => handleUpdateElseIf(index, e.target.value)}
                  className="bg-transparent flex-1 nodrag nowheel font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveElseIf(index)}
                  className="h-7 w-7 p-0"
                >
                  <Icons.trash className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {elseIfConditions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No ELSE IF conditions. Click "Add ELSE IF" to add one.
              </p>
            )}
          </div>
        </div>

        {/* ELSE Node Toggle */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col gap-1">
            <Label>Include ELSE Branch</Label>
            <p className="text-xs text-muted-foreground">
              Enable to add a default ELSE branch
            </p>
          </div>
          <Switch
            checked={elseNode}
            onCheckedChange={handleElseNodeToggle}
          />
        </div>
      </div>
    </ScrollArea>
  );
});

ConditionNodeConfig.displayName = 'ConditionNodeConfig';

