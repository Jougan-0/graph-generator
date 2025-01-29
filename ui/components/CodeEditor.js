"use client";

import { motion } from "framer-motion";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

export default function CodeEditor({
  code,
  setCode,
  selectedModel,
  setSelectedModel,
  generateGraph,
  loading,
}) {
  return (
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
        {["80Bmodel", "7Bmodel", "DeepSeek"].map((model) => (
          <button
            key={model}
            onClick={() => setSelectedModel(model)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-md ${
              selectedModel === model
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {model}
          </button>
        ))}
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
  );
}
