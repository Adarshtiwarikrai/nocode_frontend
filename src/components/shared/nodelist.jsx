import React from 'react';
import { advancedNodes, basicNodes, getNodeIcon, NodeMeta } from '@/lib/flow';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { PopoverClose } from '@/components/ui/popover';



const NodeItem = ({
  id,
  name,
  description,
  class_type,
  width,
  height,
  icon,
  data,
}) => {
  const NodeIcon = icon || getNodeIcon(id);
  const onDragStart = (
    event,
    nodeData
  ) => {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeData));
  };

  return (
    <div
      className={cn(
        'flex flex-col items-start gap-2 w-full h-full p-2 rounded-md border cursor-grab',
        'hover:bg-muted'
      )}
      draggable
      onDragStart={(e) =>
        onDragStart(e, {
          id,
          name,
          description,
          class_type,
          width,
          height,
          icon,
          data,
        })
      }
    >
      <div className="flex items-center gap-2 w-full h-full">
        <NodeIcon className="w-4 h-4 shrink-0" />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <span className="text-left text-xs text-muted-foreground line-clamp-2">
        {description}
      </span>
    </div>
  );
};

export const NodeList = ({
  onAddNode,
}) => {
  const nodeCategories = [
    {
      title: 'Basic',
      nodes: basicNodes,
    },
    {
      title: 'Advanced',
      nodes: advancedNodes,
    },
  ];
  return (
    <Accordion
      type="multiple"
      defaultValue={nodeCategories.map(({ title }) => title)}
      className="w-full p-2"
    >
      {nodeCategories.map(({ title, nodes }) => (
        <AccordionItem value={title} className="border-none" key={title}>
          <AccordionTrigger className="text-sm outline-none py-2">
            {title}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1">
              {nodes.map((node) => (
                <PopoverClose key={node.id} onClick={() => onAddNode(node)}>
                  <NodeItem {...node} />
                </PopoverClose>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
