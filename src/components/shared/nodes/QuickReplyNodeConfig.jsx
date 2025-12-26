
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '../../ui/scrollarea';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/button';
import { Icons } from '../../ui/icons';
import { GenericOption } from '../option';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { useReactFlow } from '@xyflow/react';
import { setNodeData } from '../../../lib/flow';

export const QuickReplyNodeConfig = React.memo(({ nodeId, data, className, ...props }) => {
  const instance = useReactFlow();
  const [message, setMessage] = useState(data?.message || '');
  const [options, setOptions] = useState(data?.options || []);

  useEffect(() => {
    setMessage(data?.message || '');
    setOptions(data?.options || []);
  }, [data?.message, data?.options]);

  const updateNode = (updates) => {
    setNodeData(instance, nodeId, updates);
    // Don't auto-update node size - let user control it manually
  };

  const handleAddOption = () => {
    const newOptions = [...options, { text: '', value: '' }];
    setOptions(newOptions);
    updateNode({ options: newOptions });
  };

  const handleUpdateOption = (index, field, value) => {
    const newOptions = [...options];
    if (!newOptions[index]) {
      newOptions[index] = { text: '', value: '' };
    }
    newOptions[index][field] = value;
    // If text is updated, also update value
    if (field === 'text') {
      newOptions[index].value = value;
    }
    setOptions(newOptions);
    updateNode({ options: newOptions });
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    updateNode({ options: newOptions });
  };

  const handleMessageChange = (value) => {
    setMessage(value);
    updateNode({ message: value });
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
          placeholder="Quick Reply"
        />

        {/* Message */}
        <div className="flex flex-col gap-2 text-sm">
          <Label>Message</Label>
          <Textarea
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="Enter the message/question to show to the user..."
            rows={3}
            className="bg-transparent w-full nodrag nowheel"
          />
        </div>

        {/* Quick Reply Options */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <Label>Quick Reply Options</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddOption}
              className="h-7"
            >
              <Icons.add className="w-3 h-3 mr-1" />
              Add Option
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={`Option ${index + 1} text`}
                  value={option.text || ''}
                  onChange={(e) => handleUpdateOption(index, 'text', e.target.value)}
                  className="bg-transparent flex-1 nodrag nowheel"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveOption(index)}
                  className="h-7 w-7 p-0"
                >
                  <Icons.trash className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {options.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No options added. Click "Add Option" to add one.
              </p>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
});

QuickReplyNodeConfig.displayName = 'QuickReplyNodeConfig';

