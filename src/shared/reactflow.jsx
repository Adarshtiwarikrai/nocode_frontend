import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import { genId } from '../lib/id';
import Canvasbuilder from './canvas'
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
    return (
        <div style={{ height: "100vh" }}>
         <Canvasbuilder projectId={1}/>
        </div>
         
       
        )
}
export default Floweditor