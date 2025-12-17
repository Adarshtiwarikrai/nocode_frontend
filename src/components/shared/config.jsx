import React from 'react'
import { useReactFlow } from '@xyflow/react'
import { Icons } from '../ui/icons'
import { UserConfig } from '../backend-node/config/userconfig'
import { ConversableAgentConfig } from '../backend-node/config/config'
export const FlowConfig = ({ nodeId }) => {
    const { getNode } = useReactFlow()

    if (!nodeId) {
        return (
            <div className="flex flex-col justify-center items-center h-full text-muted-foreground/50 gap-2">
                <Icons.agent className="w-6 h-6" />
                <span className="text-sm font-bold">
                    Select a node to configure
                </span>
            </div>
        )
    }

    const node = getNode(nodeId)

    if (!node) {
        return (
            <div className="flex flex-col justify-center items-center h-full text-muted-foreground/50 gap-2">
                <Icons.agent className="w-6 h-6" />
                <span className="text-sm font-bold">Node not found</span>
            </div>
        )
    }

    const type = node.data?.id

    switch (type) {
        case 'user':
            return <UserConfig nodeId={nodeId} data={node.data} />

        case 'conversable':
            return <ConversableAgentConfig nodeId={nodeId} data={node.data} />
        case 'api':
            return <ConversableAgentConfig nodeId={nodeId} data={node.data} />


        default:
            return (
                <div className="flex flex-col justify-center items-center h-full text-muted-foreground gap-2">
                    <Icons.agent className="w-10 h-10" />
                    <span className="text-sm font-bold">
                        No configuration available for this node type
                    </span>
                </div>
            )
    }
}
