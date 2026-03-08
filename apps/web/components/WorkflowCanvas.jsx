"use client";

import React, { useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

const NODE_COLORS = {
  trigger: { bg: "hsl(160 84% 39%)", border: "hsl(160 84% 32%)" },
  action: { bg: "hsl(217 91% 60%)", border: "hsl(217 91% 50%)" },
};
const DEFAULT_NODE = { bg: "hsl(215 16% 47%)", border: "hsl(215 16% 40%)" };

function WorkflowNode({ data, selected }) {
  const style = NODE_COLORS[data.type] ?? DEFAULT_NODE;
  return (
    <div
      style={{
        background: style.bg,
        border: `1.5px solid ${style.border}`,
        boxShadow: selected
          ? "0 0 0 2px hsl(221 83% 53% / 0.4)"
          : "0 2px 8px rgba(0,0,0,.12)",
        padding: "10px 16px",
        borderRadius: "10px",
        minWidth: 140,
        textAlign: "center",
        color: "#fff",
      }}
    >
      <div className="text-sm font-semibold leading-tight">{data.label}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-75 mt-1">
        {data.type}
      </div>
    </div>
  );
}

export default function WorkflowCanvas({ workflow }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const initializeFlow = useCallback(
    (data) => {
      const rawNodes = data?.workflow?.nodes ?? data?.nodes;
      const rawEdges =
        data?.workflow?.connections ?? data?.connections ?? data?.edges;

      if (!rawNodes?.length || !Array.isArray(rawEdges)) return;

      const flowNodes = rawNodes.map((node, i) => ({
        id: node.id,
        type: "workflow",
        position: { x: 100 + (i % 3) * 240, y: 100 + Math.floor(i / 3) * 180 },
        data: { ...node },
      }));

      const flowEdges = rawEdges
        .map((c) => {
          if (
            !rawNodes.find((n) => n.id === c.source) ||
            !rawNodes.find((n) => n.id === c.target)
          )
            return null;
          return {
            id: `${c.source}-${c.target}`,
            source: c.source,
            target: c.target,
            type: "smoothstep",
            animated: true,
            style: { stroke: "hsl(215 16% 47%)", strokeWidth: 2 },
          };
        })
        .filter(Boolean);

      setNodes(flowNodes);
      setEdges(flowEdges);
    },
    [setNodes, setEdges]
  );

  useEffect(() => {
    if (workflow) initializeFlow(workflow);
  }, [workflow, initializeFlow]);

  const nodeTypes = useMemo(() => ({ workflow: WorkflowNode }), []);

  return (
    <div
      style={{ width: "100%", height: 500 }}
      className="rounded-lg overflow-hidden"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        snapToGrid
        snapGrid={[10, 10]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background color="hsl(210 20% 94%)" gap={20} />
        <Controls />
        <MiniMap
          nodeColor="hsl(215 16% 47%)"
          nodeBorderRadius={4}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
