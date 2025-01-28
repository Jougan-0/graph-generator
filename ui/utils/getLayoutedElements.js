import dagre from "dagre";

// Node sizes used when calculating graph layout
const nodeWidth = 172;
const nodeHeight = 36;

/**
 * Calculates and returns new node and edge positions using dagre.
 */
function getLayoutedElements(nodes, edges, options = { rankdir: "TB" }) {
  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Pass in any custom layout options, e.g. TB (top-bottom), LR (left-right), etc.
  dagreGraph.setGraph(options);

  // Add nodes to the graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run the Dagre layout
  dagre.layout(dagreGraph);

  // Map back into our node positions
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  // We can also adjust edges if needed, but typically edges don’t need a manual update.
  return { nodes: layoutedNodes, edges };
}

export default getLayoutedElements;
