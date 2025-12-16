import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import clsx from 'clsx';
import { useEffect, useState, useCallback } from 'react';
import { useTool } from '../../hooks/tool';
import { debounce } from 'lodash-es';
import { Icons } from '../ui/icons';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import useUserStore from '../../store/user';
import { useToast } from '../../hooks/toast';
const getAuthHeaders = () => {
  const user = useUserStore.getState().user;
  const token = user?.token;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

const CodeEditor = ({
  toolId,
  className,
}) => {
  const { tool, updateTool, isUpdating } = useTool(toolId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [code, setCode] = useState('');

  const { toast } = useToast();
  
  useEffect(() => {
    if (tool?.code !== code) setCode(tool?.code);
  }, [tool?.code]);

  const debouncedUpdateProject = useCallback(
    debounce(async (updatedCode) => {
      let updatedTool = { code: updatedCode };
      updateTool(updatedTool);
    }, 500),
    [toolId]
  );

  useEffect(() => {
    if (code) {
      debouncedUpdateProject(code);
    }
  }, [code]);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      
      const payload = {
        name: tool?.name || '',
        description: tool?.description || '', 
        variables: tool?.variables || [],
        code: tool?.code || ''
      };

      const res = await fetch('http://localhost:8000/v1/codegen/tool', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const generatedFunc = await res.json();
        

        setCode(generatedFunc.code);
        

        await updateTool({ 
          code: generatedFunc.code,
          description: generatedFunc.description || tool?.description
        });
        
        

        toast({
          title: 'Code Generated Successfully',
          description: 'The generated code has been saved to your tool.',
        });
      } else {
        const errorText = await res.text();
        console.error('Failed to generate code:', errorText);
        
      
        toast({
          title: 'Failed to Generate Code',
          description: 'There was an error generating the code. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('An error occurred while generating code:', error);

      toast({
        title: 'Error Generating Code',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const extractMeta = async (code) => {
    setIsExtracting(true);
    try {
      const res = await fetch('http://localhost:8000/v1/api/codegen/extract', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        const extractedMeta = await res.json();
        return extractedMeta;
      } else {
        console.error('Failed to extract meta');
      }
    } catch (error) {
      console.error('An error occurred while extracting meta:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div
      className={cn('relative flex flex-col w-full h-full gap-2', className)}
    >
      <CodeMirror
        value={code ?? ''}
        height="100%"
        minHeight="400px"
        basicSetup={{ lineNumbers: true }}
        extensions={[python()]}
        onChange={(value) => setCode(value)}
        style={{ fontSize: '0.75rem', height: '100%' }}
      />
      <div
        className={clsx('absolute flex items-center gap-1', {
          'right-2 top-2 translate-x-0 translate-y-0': code !== '',
          'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2': code === '',
        })}
      >
        <Button
          variant={code ? 'outline' : 'default'}
          size="sm"
          className="gap-1"
          onClick={handleGenerateCode}
          disabled={isGenerating || !tool}
        >
          {isGenerating ? (
            <Icons.spinner className="w-4 h-4 animate-spin" />
          ) : (
            <Icons.sparkles className="w-4 h-4" />
          )}
          <span>Generate code</span>
        </Button>
        
        {code && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={async () => {
              await updateTool({ code });
              toast({
                title: 'Code Saved',
                description: 'Your changes have been saved.',
              });
            }}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Icons.spinner className="w-4 h-4 animate-spin" />
            ) : (
              <Icons.check className="w-4 h-4" />
            )}
            <span>Save</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;