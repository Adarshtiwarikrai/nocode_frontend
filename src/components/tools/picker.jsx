import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from '../ui/popover';
  import { Button } from '../ui/button';
  import { Icons } from '../ui/icons';
  import { PopoverClose } from '@radix-ui/react-popover';
  import { Card } from '../ui/card';
  import { useTools } from '../../hooks/tool';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tab';
  import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
  
  export function ToolPicker({
    onAddTool,
    button,
  }) {
    const { tools } = useTools();
  
    const handleCreateTool = () => {
      window.location.href = '/tools';
    };
  
    return (
      <Popover>
        <PopoverTrigger asChild>
          {button ? (
            button
          ) : (
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Icons.add className="w-4 h-4" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="w-80 p-0">
          <Tabs defaultValue="tools">
            <TabsList className="flex w-full p-1">
              <TabsTrigger value="0" className="w-full">
                Private Tools
              </TabsTrigger>
            </TabsList>
  
            <TabsContent value="0" className="flex flex-col mt-0 p-2 gap-1">
              {tools?.map((tool, index) => (
                <PopoverClose key={index} onClick={() => onAddTool(tool.id)} asChild>
                  <Card className="flex flex-col gap-2 p-2 w-full hover:bg-muted cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={tool.logo_url} />
                        <AvatarFallback>
                          {tool.name?.charAt(0)?.toUpperCase() || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{tool.name || 'Unknown Tool'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{tool.description || 'No description'}</span>
                  </Card>
                </PopoverClose>
              ))}
  
              {(!tools || tools.length === 0) && (
                <div className="flex flex-col items-center justify-center gap-2 w-full h-48">
                  <span>No tools found</span>
                  <Button variant="outline" onClick={handleCreateTool}>
                    Start to Build
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    );
  }
  