'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node types for our workflow
const WorkflowNodeTypes = {
  TRIGGER: 'trigger',
  ACTION: 'action'
};

// Custom node component
const WorkflowNode = ({ data, selected }) => {
  const nodeType = data.type;
  
  const getNodeStyle = (type) => {
    switch (type) {
      case WorkflowNodeTypes.TRIGGER:
        return {
          background: '#10b981',
          color: '#fff',
          border: '#059669',
        };
      case WorkflowNodeTypes.ACTION:
        return {
          background: '#3b82f6',
          color: '#fff',
          border: '#2563eb',
        };
      default:
        return {
          background: '#94a3b8',
          color: '#fff',
          border: '#64748b',
        };
    }
  };

  const nodeStyle = getNodeStyle(nodeType);
  const isSelected = selected;

  return (
    <div
      style={{
        background: nodeStyle.background,
        color: nodeStyle.color,
        border: `1px solid ${nodeStyle.border}`,
        boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.4)' : 'none',
        padding: '12px 16px',
        borderRadius: '8px',
        minWidth: '140px',
        textAlign: 'center'
      }}
      className="workflow-node"
    >
      <div className="node-content">
        <div className="node-label">{data.label}</div>
        <div className="node-type">{nodeType}</div>
      </div>
    </div>
  );
};

// Custom edge: built-in smoothstep used (no custom edgeTypes)
const WorkflowCanvas = ({ workflow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert workflow to React Flow format (read-only view)
  const initializeFlow = useCallback((workflowData) => {
    const nodes = workflowData?.workflow?.nodes ?? workflowData?.nodes;
    const connections = workflowData?.workflow?.connections ?? workflowData?.connections ?? workflowData?.edges;
    if (!nodes?.length || !Array.isArray(connections)) {
      return;
    }

    const flowNodes = nodes.map((node, index) => ({
      id: node.id,
      type: 'workflow',
      position: {
        x: 100 + (index % 3) * 220,
        y: 100 + Math.floor(index / 3) * 160
      },
      data: { ...node }
    }));

    const flowEdges = connections.map((connection) => {
      const sourceId = connection.source;
      const targetId = connection.target;
      const sourceNode = nodes.find(n => n.id === sourceId);
      const targetNode = nodes.find(n => n.id === targetId);
      if (!sourceNode || !targetNode) return null;
      return {
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#64748b', strokeWidth: 2 }
      };
    }).filter(Boolean);

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, []);

  // Initialize with workflow data when available (read-only)
  React.useEffect(() => {
    if (workflow) {
      initializeFlow(workflow);
    }
  }, [workflow, initializeFlow]);

  const onConnect = useCallback((params) => {
    const newEdge = {
      id: `${params.source}-${params.target}`,
      source: params.source,
      target: params.target,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#64748b', strokeWidth: 2 }
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const onConnectStart = useCallback(() => {}, []);
  const onConnectEnd = useCallback(() => {}, []);

  // React Flow expects nodeTypes/edgeTypes as object maps
  const nodeTypes = useMemo(() => ({ workflow: WorkflowNode }), []);
  const edgeTypes = useMemo(() => ({}), []); // use built-in smoothstep

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-slate-500">
          Generate a workflow to see the canvas
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-canvas" style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        connectionMode="loose"
        snapToGrid
        snapGrid={[10, 10]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background color="#f8fafc" gap={20} />
        <Controls />
        <MiniMap 
          nodeColor="#64748b" 
          nodeBorderRadius={2}
          pannable={true}
          zoomable={true}
        />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
