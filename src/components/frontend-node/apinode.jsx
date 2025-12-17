import { memo } from 'react';
import { GenericNode } from '../shared/generic-node';

const ApiNode = memo(function ApiNode(props) {
  const { data } = props;

  const method = data.apiMethod || 'GET';
  const url = data.apiUrl || 'No URL';
  const ports = [
    { type: 'target', name: 'in' },
    { type: 'source', name: 'out' },
  ];

  return (
    <GenericNode
      {...props}
      ports={ports}
    >
    
          <div className="node-preview-content">
            <div className="preview-method">{method}</div>
            <div className="preview-url">{url}</div>
          </div>
        
    </GenericNode>
  );
});

export default ApiNode;