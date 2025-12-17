import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    useStoreApi,
    Panel,
    ReactFlowProvider,
    BackgroundVariant,
    SelectionMode,
    applyNodeChanges,
    applyEdgeChanges,
    ConnectionLineType,
    useReactFlow
} from '@xyflow/react';
import './reactflow.css';
import '@xyflow/react/dist/style.css';

import { useProject } from '../hooks/project';
import { Icons } from '../components/ui/icons';
import { genId } from '../lib/id';
import { debounce } from 'lodash-es';
import { edgeTypes,nodeTypes,isConversable } from '../lib/flow';


const DEBOUNCE_DELAY = 500; 

const useDebouncedUpdate = (projectId) => {
  const [isDirty, setIsDirty] = useState(false);
  const { updateProject } = useProject(projectId);
 
  const { toObject } = useReactFlow();
  const initialLoad = useRef(true);

  const debouncedUpdate = debounce((flow) => {
    updateProject({ flow });
    setIsDirty(false);
  }, DEBOUNCE_DELAY);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    if (isDirty) {
      debouncedUpdate(toObject());
    }

    return () => {
      debouncedUpdate.cancel();
    };
  }, [isDirty, toObject, debouncedUpdate]);

  return { setIsDirty, debouncedUpdate };
};

export const FlowCanvas = ({
  projectId,
  onModeChange,
}) => {
  const { project, isLoading, isError } = useProject(projectId);
  console.log(project,projectId,"thisthisthisthis")
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const { setIsDirty } = useDebouncedUpdate(projectId);
  const flowParent = useRef(null);

  const store = useStoreApi();
  useEffect(() => {
    if (import.meta.env.DEV) {
      store.getState().onError = (code, message) => {
        if (code === '002') {
          return;
        }
        console.warn('Workflow warning:', code, message);
      };
    }
  }, []);

  useEffect(() => {
    const initializeProjectFlow = () => {
      if (project?.flow) {
        setNodes(project.flow.nodes);
        setEdges(project.flow.edges);
        setIsDirty(false);
      }
    };

    initializeProjectFlow();
  }, [projectId]);

  const isGroupType = (type) =>
    ['groupchat', 'nestedchat'].includes(type);

  const onNodesChange = useCallback(
    (changes) => {
      console.log("changessssssssssssss",changes);
      setNodes((nds) => {
        
        let nextNodes = applyNodeChanges(changes, nds);

        if (changes.some((c) => c.type === 'dimensions')) {
          setIsDirty(true);
        }

        // Handle node dragging for grouping/ungrouping
        changes.forEach((change) => {
          if (change.type === 'position') {
            const draggedNode = nextNodes.find((n) => n.id === change.id);
            if (
              !draggedNode ||
              (draggedNode.type && isGroupType(draggedNode.type))
            ) {
              return;
            }

            // Calculate absolute position for the node
            const absolutePosition = { ...draggedNode.position };
            const oldParent = draggedNode.parentId
              ? nextNodes.find((n) => n.id === draggedNode.parentId)
              : null;
            if (oldParent) {
              absolutePosition.x += oldParent.position.x;
              absolutePosition.y += oldParent.position.y;
            }

            // During dragging, update the node's position to be absolute
            if ('dragging' in change && change.dragging) {
              draggedNode.position = absolutePosition;
              draggedNode.parentId = undefined;
              draggedNode.extent = undefined;

              const groupNode = nextNodes.find((n) => {
                if (
                  n.type === 'groupchat' &&
                  n.id !== draggedNode.id &&
                  !n.parentId
                ) {
                  // Get the actual node dimensions from DOM
                  const nodeElement = document.querySelector(
                    `[data-id="${n.id}"]`
                  );
                  const nodeWidth =
                    nodeElement?.getBoundingClientRect().width ?? n.width ?? 0;
                  const nodeHeight =
                    nodeElement?.getBoundingClientRect().height ??
                    n.height ??
                    0;

                  return (
                    absolutePosition.x >= n.position.x &&
                    absolutePosition.x <= n.position.x + nodeWidth &&
                    absolutePosition.y >= n.position.y &&
                    absolutePosition.y <= n.position.y + nodeHeight
                  );
                }
                return false;
              });

              // Update all group nodes' data with current hover state
              nextNodes = nextNodes.map((node) => {
                if (node.type === 'groupchat') {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      hoveredGroupId: groupNode?.id || null,
                    },
                  };
                }
                return node;
              });

              return;
            }

            // When drag ends, handle grouping/ungrouping
            if ('dragging' in change && !change.dragging) {
              // Clear hover state from all group nodes
              nextNodes = nextNodes.map((node) => {
                if (node.type === 'groupchat') {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      hoveredGroupId: null,
                    },
                  };
                }
                return node;
              });

              const groupNode = nextNodes.find(
                (n) =>
                  n.type === 'groupchat' &&
                  n.id !== draggedNode.id &&
                  !n.parentId && // Prevent nested groups
                  // Check if the node position is within the group's bounds
                  absolutePosition.x >= n.position.x &&
                  absolutePosition.x <= n.position.x + (n.width ?? 0) &&
                  absolutePosition.y >= n.position.y &&
                  absolutePosition.y <= n.position.y + (n.height ?? 0)
              );

          
              if (groupNode) {

                draggedNode.parentId = groupNode.id;
                draggedNode.position = {
                  x: absolutePosition.x - groupNode.position.x,
                  y: absolutePosition.y - groupNode.position.y,
                };
                draggedNode.extent = 'parent';

                nextNodes = nextNodes.filter((n) => n.id !== draggedNode.id);
                const groupIndex = nextNodes.findIndex(
                  (n) => n.id === groupNode.id
                );
                nextNodes.splice(groupIndex + 1, 0, draggedNode);
              }
            }
          }
        });

        return nextNodes;
      });
      setIsDirty(true); 
    },
    [setNodes, setIsDirty]
  );

  const onEdgesChange = useCallback(
   
    (changes) => {
      console.log("trying to start to connect")
      if (changes.some((change) => change.type !== 'select')) {
        setIsDirty(true);
      }
      console.log("tryingffffffffffffffffffffffffffffffffffffffffffffffffffff")
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setIsDirty]
  );

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      if (!flowParent.current) return;

      const flowBounds = flowParent.current.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: event.clientX - flowBounds.left,
        y: event.clientY - flowBounds.top,
      });

      // Find if we're hovering over a group node
      const groupNode = nodes.find(
        (n) =>
          n.type === 'groupchat' &&
          position.x > n.position.x &&
          position.x < n.position.x + (n.width ?? 0) &&
          position.y > n.position.y &&
          position.y < n.position.y + (n.height ?? 0)
      );

      // Update all group nodes' data with current hover state
      setNodes(
        nodes.map((node) => {
          if (node.type === 'groupchat') {
            return {
              ...node,
              data: {
                ...node.data,
                hoveredGroupId: groupNode?.id || null,
              },
            };
          }
          return node;
        })
      );
    },
    [nodes, screenToFlowPosition, flowParent]
  );

  const onDragLeave = useCallback(() => {
    // Clear hover state from all group nodes
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.type === 'groupchat') {
          return {
            ...node,
            data: {
              ...node.data,
              hoveredGroupId: null,
            },
          };
        }
        return node;
      })
    );
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      if (!data || !flowParent.current) return;

      const flowBounds = flowParent.current.getBoundingClientRect();
      const position = screenToFlowPosition({
        x: event.clientX - flowBounds.left,
        y: event.clientY - flowBounds.top,
      });

      const { offsetX, offsetY, width, height, ...cleanedData } = data;
      const newId = genId();
      const newNode = {
        id: `${data.id}_${newId}`,
        type: data.id,
        data: {
          id: cleanedData.id,
          name: cleanedData.name,
          description: cleanedData.description,
          class_type: cleanedData.class_type,
          ...(cleanedData.data || {}),
        },
        position,
        width,
        height,
        selected: true,
        draggable: true,
        selectable: true,
        focusable: true,
        parentId: undefined,
        style: undefined,
      } ;

      // Find if we're dropping into a group node
      const groupNode = nodes.find(
        (n) =>
          n.type === 'groupchat' &&
          position.x > n.position.x &&
          position.x < n.position.x + (n.width ?? 0) &&
          position.y > n.position.y &&
          position.y < n.position.y + (n.height ?? 0)
      );

      setNodes((nds) => {
        // Clear hover state from all nodes first
        const updatedNodes = nds.map((n) => ({
          ...n,
          selected: false,
          data:
            n.type === 'groupchat'
              ? { ...n.data, hoveredGroupId: null }
              : n.data,
        }));

        if (groupNode) {
          // Adjust position to be relative to the group node
          const updatedNode = {
            ...newNode,
            position: {
              x: position.x - groupNode.position.x,
              y: position.y - groupNode.position.y,
            },
            parentId: groupNode.id,
            // If the node being dropped is also a group, adjust its size
            ...(data.id === 'groupchat'
              ? {
                style: {
                  width: Math.min(300, groupNode.width - 50),
                  height: Math.min(200, groupNode.height - 50),
                },
              }
              : {}),
          };

          // Insert new node right after its parent group
          const groupIndex = updatedNodes.findIndex(
            (n) => n.id === groupNode.id
          );
          if (groupIndex !== -1) {
            updatedNodes.splice(groupIndex + 1, 0, updatedNode);
            return updatedNodes;
          }
        }

        // If not in a group or group not found, just append to the end
        return [...updatedNodes, newNode];
      });
    },
    [nodes, screenToFlowPosition, setNodes, flowParent]
  );

  const onConnect = (params) => {
    const sourceNode = nodes.find((nd) => nd.id === params.source);
    const targetNode = nodes.find((nd) => nd.id === params.target);
    const isConverseEdge =
      isConversable(sourceNode) && isConversable(targetNode);
    setEdges((eds) => {
      let newEdge = {
        ...params,
        strokeWidth: 2,
      };
      if (isConverseEdge) {
        newEdge = {
          ...newEdge,
          animated: true,
          type: 'converse',
        };
      }

      console.log("trying to connect")
      return addEdge(newEdge, eds);
    });
    setIsDirty(true);
  };

  const onAddNode = useCallback(
    (nodeMeta) => {
      setNodes((nds) => {
        const newId = genId();
        const bounds = flowParent.current?.getBoundingClientRect();
        if (!bounds) return nds;
        const center = {
          x: bounds.left + (bounds.right - bounds.left) / 2,
          y: bounds.top + (bounds.bottom - bounds.top) / 2,
        };
        const randInt = (max) =>
          Math.floor(Math.random() * Math.floor(max));

        const position = screenToFlowPosition({
          x: center.x + randInt(100),
          y: center.y + randInt(100),
        });

        const newNode = {
          id: `${nodeMeta.id}_${newId}`,
          type: nodeMeta.id,
          position,
          data: {
            id: nodeMeta.id,
            name: nodeMeta.name,
            class_type: nodeMeta.class_type,
            ...nodeMeta.data, // Spread any additional data properties
          },
          width: nodeMeta.width,
          height: nodeMeta.height,
          selected: true,
          draggable: true,
          selectable: true,
          focusable: true,
          resizable: true,
        };
        const updatedNodes = nds.map((n) => ({ ...n, selected: false }));
        return [...updatedNodes, newNode];
      });

      setIsDirty(true);
    },
    [screenToFlowPosition, setNodes]
  );

  if (isLoading) {
    return (
      <div className="relative flex w-full h-full items-center justify-center">
        <Icons.logoSimple className="w-12 h-12 text-muted-foreground/50 animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative flex w-full h-full items-center justify-center">
        <p className="text-red-500">Project load failed </p>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-grow flex-col w-full h-full"
      ref={flowParent}
    >
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineStyle={{ strokeWidth: 2, stroke: 'darkgreen' }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        panOnScroll
        selectionOnDrag
        selectionMode={SelectionMode.Partial}
        fitView
        fitViewOptions={{ maxZoom: 1 }}
        attributionPosition="bottom-right"
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={50}
          size={4}
          color="rgba(128,128,128,0.1)"
        />
        <Controls
          fitViewOptions={{ maxZoom: 1 }}
          showInteractive={false}
          position="bottom-left"
          className="flex"
        />
       <Panel position="top-left" className="flex items-center p-1 gap-2">
          
       
        </Panel>
      
      </ReactFlow>
    </div>
  );
};
