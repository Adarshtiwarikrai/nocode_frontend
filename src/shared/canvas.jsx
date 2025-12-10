import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { genId } from '../lib/id';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider,
    BackgroundVariant,
    applyNodeChanges,
    applyEdgeChanges,
    useReactFlow
} from '@xyflow/react';
const Canvasbuilder = () => {
    const [showmodal, setshowmodal] = useState(false);
    const [modalname, setmodalname] = useState("")
    const [darkmode, setdarkmode] = useState(false);
    const [selectnode, setselectnode] = useState(false);
    const [selectedge, setselectedge] = useState(false);
    const [zoom, setzoom] = useState(1)
    const [nodes, setnodes] = useNodesState([])
    const [edges, setedges] = useEdgesState([])
    const { screenToFlowPosition } = useReactFlow();
    const { setIsDirty } = useDebouncedUpdate(projectId);
    const flowParent = useRef < HTMLDivElement > (null);
    const nodeselected = () => {

    }
    const edgeselected = () => {

    }
    const panelselected = () => {

    }
    const onNodesChange = (changes) => {
        (changes) => {
            setnodes((nds) => {
                let nextnodes = applyNodeChanges(changes, nds)
            })
        }

    }
    const onEdgesChange = (changes) => {
        (changes) => {
            if (changes.some((change) => change.type !== 'select')) {
                setIsDirty(true)
            }
            setedges((eds) => applyEdgeChanges(changes, eds))
        }
        [setIsDirty]

    }
    const onAddNode = (nodemeta) => {
        (nodemeta) => {
            setnodes((nds) => {
                const newid = genId();
                const bounds = flowParent.current?.getBoundingClientRect();
                if (!bounds) return nds
                const center = {
                    x: bounds.left + (bounds.right - bounds.left) / 2,
                    y: bounds.top + (bounds.bottom - bounds.top) / 2
                }
                const randint = (max) => {
                    Math.floor(Math.random() * Math.floor(max));

                }
                const position = screenToFlowPosition({
                    x: center.x + randint(100),
                    y: center.y + randint(100)
                })
                const newnode = {
                    id: `${nodemeta.id}_${newid}`,
                    type: nodemeta.id,
                    position,
                    data: {
                        id: nodemeta.id,
                        name: nodemeta.name,
                        class_type: nodemeta.class_type,
                        ...nodemeta.data
                    },
                    width: nodemeta.width,
                    height: nodemeta.height,
                    selected: true,
                    draggable: true,
                    selectable: true,
                    focusable: true,
                }
                const updatedNodes = nds.map((n) => ({ ...n, selected: false }));
                return [...updatedNodes, newnode]
            })
            setIsDirty(true);
        }
        [screenToFlowPosition, setnodes]
    }
    const onconnect = (params) => {
        const sourcenode = nodes.find((nd) => nd.id == params.source);
        const targetnode = nodes.find((nd) => nd.id == params.target);
        const isconverseedge = isConversable(sourcenode) && isConversable(targetnode);
        setedges((nd) => {
            let newedge = {
                ...params,
                strokeWidth: 2
            }
            if (isconverseedge) {
                newedge = {
                    ...newedge,
                    animated: true,
                    type: 'converse'
                }
            }
            return addEdge(newedge, eds)
        })
        setIsDirty(true)
    }
    const ondrop = (event) => {
        (event) => {
            event.preventDefault()
            const data = JSON.parse(event.dataTransfer.getData('application/json'))
            const flowbounds = flowParent.current.getBoundingClientRect()
            const position = screenToFlowPosition({
                x: event.clientX - flowbounds.left,
                y: event.clientY - flowbounds.top
            })
            const { offsetX, offsetY, width, height, ...cleanedData } = data
            const newid = genId()
            const newnode = {
                id: `${data.id}_${newid}`,
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
            }
            const groupnode=nodes.find(
                (n)=>
                n.type==='groupchat'&&
                position.x>n.position.x&&
                position.x<n.position.x+(n.width??0)&&
                position.y>n.position.y&&
                position.y<n.position.y+(n.height??0)
            )
            setnodes(
                (nds)=>{
                    const updatednodes=nds.map((n)=>({
                        ...n,
                        selected:false,
                        data:n.type==='groupchat'?{...n.data,hoveredGroupId: null }
                        : n.data,
                    }))
                if (groupnode) {
                    const updatednode={
                        ...newnode,
                        position:{
                            x:position.x-groupnode.position.x,
                            y:position.y-groupnode.position.y
                        },
                        parentId:groupnode.id,
                        ...(data.id==='groupchat'?{
                            style: {
                                width: Math.min(300, groupnode.width - 50),
                                height: Math.min(200, groupnode.height - 50),
                              },
                        }:{ })
                    }
                    const groupindex=updatesnodes.findIndex(
                        (n)=>n.id===groupnode.id
                    )
                    if(groupindex!==-1){
                    updatednodes.slice(groupindex+1,0,updatednode)
                    return updatednodes
                }
                }
                return [...updatednodes,newnode]
                })
        }
        [nodes,screenToFlowPosition,setnodes,flowParent]
    }
    const ondragover=(event)=>{
        (event)=>{
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move';
            if (!flowParent.current) return;
            const flowbounds = flowParent.current.getBoundingClientRect()
            const position = screenToFlowPosition({
                x: event.clientX - flowbounds.left,
                y: event.clientY - flowbounds.top
            })
            const groupnode=nodes.find(
                (n)=>
                n.type==='groupchat'&&
                position.x>n.position.x&&
                position.x<n.position.x+(n.width??0)&&
                position.y>n.position.y&&
                position.y<n.position.y+(n.height??0)
            )
            setnodes(
                nodes.map((node)=>{
                    if (node.type==='groupchat'){
                        return {
                            ...node,
                            data:{
                                ...node.data,
                                hoveredGroupId:groupnode?.id||null
                            }
                        }
                    }
                    return node
                })
               )
               [nodes,screenToFlowPosition,flowParent]
        }
    }
    const ondragleave=()=>{
        setnodes((nodes)=>
            nodes.map((node)=>{
                if (node.type==='groupchat'){
                    return {
                        ...node,
                        data:{
                            ...node.data,
                            hoveredGroupId:groupnode?.id||null
                        }
                    }
                }
                return node
            })
           );

    }
    return (
        <ReactFlowProvider>
            <ReactFlow
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onConnect={onconnect}
            connectionLineType={ConnectionLineType.Bezier}
            connectionLineStyle={{ strokeWidth: 2, stroke: 'darkgreen' }}
            onDragOver={ondragover}
            onDragLeave={ondragleave}
            onDrop={ondrop}
            panOnScroll
            selectionOnDrag
            selectionMode={SelectionMode.Partial}
            fitView
            fitViewOptions={{ maxZoom: 1 }}
            attributionPosition="bottom-right"                
            />
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
        </ReactFlowProvider>
    )
}
export default Canvasbuilder