import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { EditableText } from '../../components/ui/editabletext';
import CodeEditor from '../../components/tools/code';

import { ParameterList } from '../../components/tools/parameterlist';
import { useTool } from '../../hooks/tool';

import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Card, CardTitle, CardContent, CardHeader } from '../../components/ui/card';

export default function Page() {
  const params = useParams();
  const id = params?.id;

  if (!id) return <div>Tool ID is missing</div>;

  const toolId = parseInt(id, 10);
  const { tool, updateTool } = useTool(toolId);

  const setToolData = useCallback(
    (key, value) => {
      updateTool({ [key]: value });
    },
    [updateTool]
  );

  if (!tool) return null;

  return (
    <div className="relative flex flex-col w-full gap-1 h-full overflow-y-auto">
      <Card className="flex flex-col gap-1 p-2 bg-background">
        <div className="flex items-start justify-between w-full gap-1">
          <div className="flex items-center gap-2">
            
            <div className="flex flex-col gap-1">
              <EditableText
                value={tool.name ?? ''}
                onChange={(text) => setToolData('name', text)}
                className="!text-lg !font-bold text-green-500"
              />
              <EditableText
                value={tool.description ?? ''}
                onChange={(text) => setToolData('description', text)}
                className="!text-sm !font-normal text-green-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm px-2 text-green-500">
            <Label htmlFor="is_public" className="no-wrap text-green-500">
              Public
            </Label>
            <Switch
              id="is_public"
              checked={!!tool.is_public}
              onCheckedChange={(checked) => setToolData('is_public', checked)}
              className="text-green-500"
            />
          </div>
        </div>
      </Card>

      

      <ParameterList
        toolId={toolId}
        toolParameters={tool.parameters}
        className="shrink-0 bg-background text-green-500"
        iconClassName="text-green-500"
      />

      <Card className="flex flex-col flex-1 bg-background h-full">
        <CardHeader>
          <CardTitle className="text-green-500">Code</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <CodeEditor
            toolId={toolId}
            className="h-full min-h-[400px] text-green-500"
            iconClassName="text-green-500" // if CodeEditor has icons
          />
        </CardContent>
      </Card>
    </div>
  );
}
