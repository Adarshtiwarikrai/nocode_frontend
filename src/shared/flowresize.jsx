import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { genId } from '../lib/id';
import { Editor } from './page/resize';
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
const Flow=(projectId  )=>{
    const [mode, setMode] = useState('flow');
    const handleModeChange = (mode) => {
        setMode(mode);
      };
    return (
        <div style={{ height: "100vh" }}>
        <Editor projectId={projectId} onModeChange={handleModeChange}  />
        </div>
         
       
        )
}
export default Flow