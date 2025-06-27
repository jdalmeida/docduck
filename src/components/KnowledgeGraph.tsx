import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ForceGraph2D from "react-force-graph-2d";
import { useAuth } from "../context/AuthContext";

export const KnowledgeGraph = () => {
  const { user } = useAuth();
  const documents = useQuery(api.documents.getGraph, user?._id ? { userId: user._id } : "skip");

  if (!documents) {
    return null;
  }

  const nodes = documents.map((doc) => ({
    id: doc._id,
    name: doc.icon || "📄",
  }));

  const links = documents
    .filter((doc) => doc.parentDocument)
    .map((doc) => ({
      source: doc.parentDocument,
      target: doc._id,
    }));
    
  const graphData = { nodes, links };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.1,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="group"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkColor={() => "rgba(100, 100, 255, 1)"}
        width={window.innerWidth}
        height={window.innerHeight}
        backgroundColor="rgba(255, 255, 255, 0)"
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name || "";
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map(
            (n) => n + fontSize * 0.2
          );

          ctx.fillStyle = "rgba(255, 255, 255, 0)";
          ctx.fillRect(
            (node.x || 0) - bckgDimensions[0] / 2,
            (node.y || 0) - bckgDimensions[1] / 2,
            bckgDimensions[0],
            bckgDimensions[1]
          );

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "black";
          ctx.fillText(label, node.x || 0, node.y || 0);
        }}
      />
    </div>
  );
}; 