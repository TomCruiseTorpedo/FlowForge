"use client";

import React, { useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "reactflow";
import {
  MessageCircle,
  Link2,
  Bot,
  Code2,
  Linkedin,
  Zap,
  FileCode,
} from "lucide-react";
import "reactflow/dist/style.css";

const NODE_COLORS = {
  trigger: { bg: "hsl(160 84% 39%)", border: "hsl(160 84% 32%)" },
  action: { bg: "hsl(217 91% 60%)", border: "hsl(217 91% 50%)" },
};
const DEFAULT_NODE = { bg: "hsl(215 16% 47%)", border: "hsl(215 16% 40%)" };

// Map node label/id to an identifying icon (n8n-style)
const NODE_ICONS = {
  slack_message: MessageCircle,
  "slack message": MessageCircle,
  "node-trigger-slack": MessageCircle,
  basic_llm_chain: Link2,
  "basic llm chain": Link2,
  "node-llm-chain": Link2,
  openai_chat_model: Bot,
  "openai chat model": Bot,
  "node-openai-model": Bot,
  code_in_javascript: Code2,
  "code in javascript": Code2,
  "node-code-js": Code2,
  generate_linkedin_post: Linkedin,
  "generate linkedin post": Linkedin,
  "node-generate-linkedin": Linkedin,
  generate_tweets: Zap,
  "generate tweets": Zap,
  "node-generate-tweets": Zap,
  youtube_upload: FileCode,
  "youtube upload": FileCode,
  "node-trigger-youtube": FileCode,
};

function getIconForNode(node) {
  const key = node?.id?.toLowerCase() || node?.label?.toLowerCase() || "";
  return (
    NODE_ICONS[key] ||
    NODE_ICONS[key?.replace(/\s+/g, "_")] ||
    (node?.type === "trigger" ? MessageCircle : Link2)
  );
}

// Id of the node that has a dedicated "model" input (subnode attaches to bottom in n8n)
const LLM_CHAIN_NODE_ID = "node-llm-chain";
const MODEL_HANDLE_ID = "model";

function WorkflowNode({ data, selected }) {
  const style = NODE_COLORS[data.type] ?? DEFAULT_NODE;
  const Icon = getIconForNode(data);
  const isLlmChain = data.id === LLM_CHAIN_NODE_ID;
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
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-2 !bg-background" />
      {isLlmChain && (
        <Handle
          type="target"
          position={Position.Bottom}
          id={MODEL_HANDLE_ID}
          className="!w-2 !h-2 !border-2 !bg-background !bottom-0"
        />
      )}
      <div className="flex items-center justify-center gap-2">
        <Icon className="h-5 w-5 flex-shrink-0 opacity-95" />
        <span className="text-sm font-semibold leading-tight">{data.label}</span>
      </div>
      <div className="text-[10px] uppercase tracking-wider opacity-75 mt-1">
        {data.type}
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-2 !bg-background" />
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
        data?.workflow?.connections ?? data?.connections ?? data?.edges ?? [];

      if (!rawNodes?.length) return;
      const connections = Array.isArray(rawEdges) ? rawEdges : [];

      const flowNodes = rawNodes.map((node, i) => {
        const hasPosition = Array.isArray(node.position) && node.position.length >= 2;
        return {
          id: node.id,
          type: "workflow",
          position: hasPosition
            ? { x: node.position[0], y: node.position[1] }
            : { x: 100 + (i % 3) * 240, y: 100 + Math.floor(i / 3) * 180 },
          data: { ...node },
        };
      });

      const flowEdges = connections
        .map((c) => {
          if (
            !rawNodes.find((n) => n.id === c.source) ||
            !rawNodes.find((n) => n.id === c.target)
          )
            return null;
          const isModelConnection =
            c.source === "node-openai-model" && c.target === "node-llm-chain";
          return {
            id: `${c.source}-${c.target}`,
            source: c.source,
            target: c.target,
            ...(isModelConnection && { targetHandle: "model" }),
            type: "smoothstep",
            animated: true,
            style: {
              stroke: "hsl(38 92% 45%)",
              strokeWidth: 2.5,
            },
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
