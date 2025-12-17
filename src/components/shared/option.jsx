import React from 'react'
import { TextOption } from './text'
import { ToolOption } from './tool'

import { setEdgeData } from '../../lib/flow'
import { setNodeData } from '../../lib/flow'
import { useReactFlow } from '@xyflow/react'

const UnsupportedOption = ({ type }) => {
  return (
    <div className="flex items-center justify-center w-full rounded-sm p-4 border border-error text-error bg-error/10">
      <p>
        Option type <span className="font-bold">{type}</span> is not supported
      </p>
    </div>
  )
}

export const GenericOption = ({
  type,
  onValueChange,
  ...props
}) => {
  const instance = useReactFlow()

  /* Only supported options */
  const optionDict = {
    text: TextOption,
    tool: ToolOption,
  }

  const isEdge = (nodeId) => {
    const inEdges = instance
      .getEdges()
      .some((edge) => edge.id === nodeId)

    const inNodes = instance
      .getNodes()
      .some((node) => node.id === nodeId)

    if (inEdges && inNodes) {
      console.warn(
        `ID ${nodeId} exists in both nodes and edges. Defaulting to node.`
      )
      return false
    }

    return inEdges
  }

  const handleChange = (name, value) => {
    if (onValueChange) {
      onValueChange(name, value)
      return
    }

    if (isEdge(props.nodeId)) {
      setEdgeData(instance, props.nodeId, { [name]: value })
    } else {
      setNodeData(instance, props.nodeId, { [name]: value })
    }
  }

  const OptionComponent = optionDict[type]

  if (!OptionComponent) {
    console.warn(`Unsupported option type: ${type}`)
    return <UnsupportedOption type={type} />
  }

  return <OptionComponent onValueChange={handleChange} {...props} />
}
