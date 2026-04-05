"use client";

import React, { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Panel,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  ConnectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';

// Custom Node for the CorpAI Premium Aesthetic
const RoleNode = ({ data }: { data: any }) => {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="px-4 py-3 shadow-xl rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md min-w-[180px] group transition-all hover:border-blue-500/50 hover:bg-white/[0.05]"
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500 !border-none" />
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
           <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-1.5 rounded">
             {data.rank}
           </span>
           <span className="text-[10px] text-white/30 uppercase font-medium">{data.department}</span>
        </div>
        <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{data.label}</h3>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-purple-500 !border-none" />
    </motion.div>
  );
};

const nodeTypes = {
  role: RoleNode,
};

export default function OrgMap({ roles }: { roles: any[] }) {
  // Transform roles into ReactFlow nodes and edges
  const initialNodes = useMemo(() => {
    const nodes: any[] = [];
    const deptGroups: Record<string, number> = {};
    
    roles.forEach((role, i) => {
      // Basic auto-layout logic (can be improved)
      const deptIndex = Object.keys(deptGroups).length;
      if (!deptGroups[role.department]) deptGroups[role.department] = 0;
      const xOffset = Object.keys(deptGroups).indexOf(role.department) * 300;
      const yOffset = deptGroups[role.department] * 120;
      deptGroups[role.department]++;

      nodes.push({
        id: role.id,
        type: 'role',
        data: { 
          label: role.title,
          rank: role.rank,
          department: role.department 
        },
        position: { x: xOffset, y: yOffset },
      });
    });
    return nodes;
  }, [roles]);

  const initialEdges = useMemo(() => {
    const edges: any[] = [];
    roles.forEach(role => {
      if (role.reportsTo && role.reportsTo !== "—") {
        const targetId = role.reportsTo.toLowerCase().replace(/\s+/g, '-');
        // Find if target exists
        const targetExists = roles.some(r => r.id === targetId || r.title.toLowerCase() === role.reportsTo.toLowerCase());
        
        if (targetExists) {
            edges.push({
              id: `e-${role.id}-${targetId}`,
              source: targetId,
              target: role.id,
              animated: true,
              style: { stroke: 'rgba(59, 130, 246, 0.4)', strokeWidth: 1.5 },
            });
        }
      }
    });
    return edges;
  }, [roles]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-full bg-[#0a0a0b]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        connectionMode={ConnectionMode.Loose}
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background color="#1e1b4b" gap={40} size={1} />
        <Controls className="!bg-black/50 !border-white/10 !fill-white" />
        <Panel position="top-right" className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-2xl text-white">
           <h4 className="text-sm font-semibold mb-1">Org Explorer</h4>
           <p className="text-[10px] text-white/40">Drag to move, scroll to zoom.</p>
        </Panel>
      </ReactFlow>
    </div>
  );
}
