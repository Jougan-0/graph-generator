"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";

import { motion } from "framer-motion";

import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

import getLayoutedElements from "@/utils/getLayoutedElements";

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
        "https://jougan.pythonanywhere.com/generate-graph",
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
              label: rel.from,
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
              label: rel.to,
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
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { stroke: "#f59e0b" },
              labelStyle: {
                fill: "#fff",
                fontWeight: "bold",
                fontSize: 12,
              },
              labelBgStyle: {
                fill: "rgba(0,0,0,0.6)",
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
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full md:w-1/2 p-6 bg-gray-800 shadow-2xl rounded-xl flex flex-col border border-gray-700"
      >
        <h2 className="text-3xl font-bold mb-4 text-gray-200">Paste Code</h2>
        <div className="flex-grow overflow-auto">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={(code) =>
              highlight(code, languages.javascript, "javascript")
            }
            padding={12}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 14,
              backgroundColor: "#1f1f1f",
              color: "#fff",
              minHeight: "300px",
              maxHeight: "1000px",
              borderRadius: "8px",
              overflowY: "auto",
            }}
          />
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => setSelectedModel("80Bmodel")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-md ${
              selectedModel === "80Bmodel"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            8B Model
          </button>
          <button
            onClick={() => setSelectedModel("7Bmodel")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-md ${
              selectedModel === "7Bmodel"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            70B Model
          </button>
          <button
            onClick={() => setSelectedModel("DeepSeek")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-md ${
              selectedModel === "DeepSeek"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            DeepSeek Model
          </button>
        </div>

        <motion.button
          onClick={generateGraph}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500
                     hover:from-blue-600 hover:to-indigo-600 text-white
                     font-semibold rounded-lg transition-all shadow-lg"
        >
          {loading ? "Generating..." : "Generate Graph"}
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full md:w-1/2 p-6 bg-gray-700 shadow-2xl rounded-xl flex flex-col justify-center items-center border border-gray-600"
      >
        <h2 className="text-3xl font-bold mb-4 text-gray-200">
          Relationships Graph
        </h2>
        <div className="w-full h-[500px] rounded-xl bg-gray-800 shadow-lg border border-gray-600">
          {nodes.length > 0 ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
            >
              <Background
                variant="dots"
                gap={15}
                size={1}
                className="text-gray-400"
              />
              <MiniMap />
              <Controls />
            </ReactFlow>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-center text-lg font-light">
                No relationships found.
              </p>
            </div>
          )}
        </div>

        {summary && (
          <motion.div className="mt-4 w-full bg-gray-800 p-4 rounded-lg text-gray-300 text-sm shadow-lg">
            <h3 className="font-semibold text-lg text-gray-100 mb-2">
              Summary:
            </h3>
            <ReactMarkdown className="prose prose-invert">
              {summary}
            </ReactMarkdown>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
