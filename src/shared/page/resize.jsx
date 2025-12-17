import React, { useState,useEffect } from "react";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '../../components/ui/resize';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tab';
  import { ChatPane } from '../../components/shared/chatpane';
  import { FlowCanvas } from "../canvas";
  import { Icons } from "../../components/ui/icons";
  import { useChats } from '../../hooks/chat';
  import { useEdges, useNodes } from '@xyflow/react';
  import { FlowConfig } from "../../components/shared/config";
  export const Editor = ({ projectId }) => {
    const [mode, setMode] = useState('flow');
    const { chats } = useChats();
    const nodes = useNodes();
    const edges = useEdges();
    console.log("projectiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",projectId)
    const selectedNode = nodes.find((node) => node.selected);
    const selectedEdge = edges.find((edge) => edge.selected);
    const [activeChatId, setActiveChatId] = useState(-1);
    useEffect(() => {
      const existingChat = chats.findLast(
        (chat) => chat.from_project === projectId
      );
      setActiveChatId(existingChat?.id || -1);
    }, [projectId, chats]);
  
    const handleModeChange = (mode) => {
      setMode(mode);
    };
  
    return (
        <div className="flex h-screen w-screen overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex h-full">
          {/* -------- Flow Panel -------- */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Tabs defaultValue="flow" className="flex flex-col h-full ">
              <TabsList className="border-b rounded-none">
                <TabsTrigger value="flow" className="flex items-center gap-2">
                  <Icons.project className="w-4 h-4" />
                  <span className="hidden md:block text-sm">Flow</span>
                </TabsTrigger>
              </TabsList>
  
              <TabsContent value="flow" className="flex-1 overflow-auto mt-0">
       
                <FlowCanvas projectId={projectId} onModeChange={handleModeChange}  />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
  
          <ResizableHandle withHandle />
  
          {/* -------- Chat Panel -------- */}
          <ResizablePanel defaultSize={20} minSize={15}>
            <Tabs defaultValue="chat" className="flex flex-col h-full">
              <TabsList className="border-b rounded-none">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Icons.chat className="w-4 h-4" />
                  <span className="hidden md:block text-sm">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="config" className="flex items-center gap-2">
                <Icons.config className="w-4 h-4" />
                <span className="hidden md:block text-sm">Properties</span>
              </TabsTrigger>
              </TabsList>
              <TabsContent value="config" className="flex-1 overflow-auto">
              <FlowConfig
                projectId={projectId}
                nodeId={selectedNode?.id}
                edgeId={selectedEdge?.id}
              />
            </TabsContent>
              <TabsContent value="chat" className="flex-1 overflow-auto mt-0">
                <ChatPane projectId={projectId} chatId={activeChatId} />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  };
  