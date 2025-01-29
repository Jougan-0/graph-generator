"use client";

import ReactMarkdown from "react-markdown";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";

export default function GraphDisplay({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  summary,
}) {
  return (
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
            <Background variant="dots" gap={15} size={1} />
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
          <h3 className="font-semibold text-lg text-gray-100 mb-2">Summary:</h3>
          <ReactMarkdown className="prose prose-invert">
            {summary}
          </ReactMarkdown>
        </motion.div>
      )}
    </motion.div>
  );
}
