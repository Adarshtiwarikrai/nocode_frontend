import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { genId } from '../lib/id';
import {FlowCanvas} from './canvas'
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
const Floweditor=(projectId  )=>{
    const [mode, setMode] = useState('flow');
    const handleModeChange = (mode) => {
        setMode(mode);
      };
    return (
        <div style={{ height: "100vh" }}>
         <FlowCanvas projectId={projectId} onModeChange={handleModeChange}  />
        </div>
         
       
        )
}
export default Floweditor