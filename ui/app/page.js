"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { applyNodeChanges, applyEdgeChanges } from "reactflow";
import getLayoutedElements from "@/utils/getLayoutedElements";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
});
const GraphDisplay = dynamic(() => import("@/components/GraphDisplay"), {
  ssr: false,
});

export default function Home() {
  const [code, setCode] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("80Bmodel");

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const generateGraph = async () => {
    if (!code.trim()) return;
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/generate-graph`,
        {
          code,
          model: selectedModel,
        }
      );

      if (response.data) {
        const { relationships, summary } = response.data || {};

        const nodeMap = new Map();

        relationships.forEach((rel) => {
          if (!nodeMap.has(rel.from)) {
            nodeMap.set(rel.from, {
              id: rel.from.replace(/\s+/g, "-"),
              data: { label: rel.from },
              position: { x: 0, y: 0 },
              style: {
                backgroundColor: "#1d4ed8",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px",
                textAlign: "center",
              },
              draggable: true,
            });
          }
          if (!nodeMap.has(rel.to)) {
            nodeMap.set(rel.to, {
              id: rel.to.replace(/\s+/g, "-"),
              data: { label: rel.to },
              position: { x: 0, y: 0 },
              style: {
                backgroundColor: "#9333ea",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px",
                textAlign: "center",
              },
              draggable: true,
            });
          }
        });

        const formattedEdges = relationships
          .map((rel, index) => {
            const sourceNode = nodeMap.get(rel.from);
            const targetNode = nodeMap.get(rel.to);
            if (!sourceNode || !targetNode) return null;

            return {
              id: `e${index}`,
              source: sourceNode.id,
              target: targetNode.id,
              label: rel.label,
              animated: true,
              type: "smoothstep",
              style: { stroke: "#f59e0b" },
              labelStyle: {
                fill: "#fff",
                fontWeight: "bold",
                fontSize: 12,
              },
              labelBgStyle: {
                fill: "rgba(0, 0, 0, 0.7)",
                color: "#fff",
              },
              labelBgPadding: [8, 4],
              labelBgBorderRadius: 4,
            };
          })
          .filter(Boolean);

        const nodesArray = Array.from(nodeMap.values());

        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(nodesArray, formattedEdges, {
            rankdir: "TB",
            nodesep: 50,
            ranksep: 70,
          });

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setSummary(summary);
      }
    } catch (error) {
      console.error("Error generating graph:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-gray-900">
      <CodeEditor
        code={code}
        setCode={setCode}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        generateGraph={generateGraph}
        loading={loading}
      />
      <GraphDisplay
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        summary={summary}
      />
    </div>
  );
}
