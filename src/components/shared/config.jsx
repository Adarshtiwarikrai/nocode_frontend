import React from 'react'
import { useReactFlow } from '@xyflow/react'
import { Icons } from '../ui/icons'
import { UserConfig } from '../backend-node/config/userconfig'
import { ConversableAgentConfig } from '../backend-node/config/config'
import { ApiNodeConfig } from '../frontend-node/apinodeconfig'
import { ConditionNodeConfig } from '../shared/nodes/ConditionNodeConfig'
import { QuickReplyNodeConfig } from '../shared/nodes/QuickReplyNodeConfig'
import { ContainerNodeConfig } from '../shared/nodes/ContainerNodeConfig'
import { TextNodeConfig } from '../shared/nodes/TextNodeConfig'
import { DelayNodeConfig } from '../shared/nodes/DelayNodeConfig'
import { AssistantNodeConfig } from '../shared/nodes/AssistantNodeConfig'
import { InputNodeConfig } from '../shared/nodes/InputNodeConfig'
import { BranchNodeConfig } from '../shared/nodes/BranchNodeConfig'
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

    const type = node.data?.id || node.type
    
    // Debug: log node type for troubleshooting
    if (type === 'api') {
        console.log('API node detected:', { nodeId, type, data: node.data })
    }

    switch (type) {
        case 'user':
            return <UserConfig nodeId={nodeId} data={node.data} />

        case 'conversable':
            return <ConversableAgentConfig nodeId={nodeId} data={node.data} />
        case 'api':
            return <ApiNodeConfig nodeId={nodeId} data={node.data} />
        case 'condition':
            return <ConditionNodeConfig nodeId={nodeId} data={node.data} />
        case 'quickreply':
            return <QuickReplyNodeConfig nodeId={nodeId} data={node.data} />
        case 'container':
            return <ContainerNodeConfig nodeId={nodeId} data={node.data} />
        case 'text':
            return <TextNodeConfig nodeId={nodeId} data={node.data} />
        case 'delay':
            return <DelayNodeConfig nodeId={nodeId} data={node.data} />
        case 'assistant':
            return <AssistantNodeConfig nodeId={nodeId} data={node.data} />
        case 'input':
            return <InputNodeConfig nodeId={nodeId} data={node.data} />
        case 'branch':
            return <BranchNodeConfig nodeId={nodeId} data={node.data} />


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
