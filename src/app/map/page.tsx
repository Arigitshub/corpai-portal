"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  ChevronLeft, 
  LayoutDashboard,
  Loader2,
  Share2,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import OrgMap from "@/components/OrgMap";
import Link from "next/link";

interface Role {
  id: string;
  title: string;
  rank: string;
  reportsTo: string;
  department: string;
  path: string;
}

export default function MapPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFromGitHub = async () => {
      try {
        const repoUrl = "https://api.github.com/repos/Arigitshub/CorpAI/contents/roles";
        const response = await fetch(repoUrl);
        const depts = await response.json();
        
        let allRoles: Role[] = [];
        for (const dept of depts) {
          if (dept.type === 'dir') {
             const deptResp = await fetch(dept.url);
             const deptFiles = await deptResp.json();
             
             for (const file of deptFiles) {
               if (file.name.endsWith('.md') && !file.name.toUpperCase().includes('README')) {
                  const title = file.name.replace('.md', '').split('-').map((s:string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                  allRoles.push({
                    id: file.sha,
                    title: title,
                    rank: title.includes('Director') ? 'L4' : 'L2',
                    reportsTo: "OWNER", // Default fallback for visualizer
                    department: dept.name,
                    path: file.html_url
                  });
               }
             }
          }
        }
        setRoles(allRoles);
        setLoading(false);
      } catch (err) {
        console.error("Manual fetch fallback:", err);
        fetch("/api/org")
          .then(res => res.json())
          .then(data => {
            if (data.roles) setRoles(data.roles);
            setLoading(false);
          });
      }
    };
    fetchFromGitHub();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="h-screen w-screen bg-[#0a0a0b] text-white flex flex-col">
      {/* Navigation Layer */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6 flex items-center justify-between pointer-events-none">
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex items-center gap-6 pointer-events-auto"
        >
          <Link 
            href="/"
            className="h-12 w-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all group shadow-2xl backdrop-blur-xl"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          
          <div className="h-10 w-[1px] bg-white/10" />
          
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Org Chart Explorer</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-0.5">Live Agent Workforce Map</p>
          </div>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex items-center gap-3 pointer-events-auto"
        >
           <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-semibold hover:bg-white/10 transition-all backdrop-blur-md">
             <Share2 size={14} className="text-blue-500" /> Share
           </button>
           <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
             <Download size={14} /> Export SVG
           </button>
        </motion.div>
      </nav>

      {/* The Visualizer */}
      <div className="flex-1 w-full overflow-hidden">
        <OrgMap roles={roles} />
      </div>

      {/* Analytics Footer Overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-50 flex items-center justify-between pointer-events-none">
         <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl pointer-events-auto flex items-center gap-6"
         >
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Coverage</span>
              <span className="text-sm font-bold text-white/90 font-mono tracking-tighter">54 ROLES CERTIFIED</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Departments</span>
              <span className="text-sm font-bold text-white/90 font-mono tracking-tighter">12 DOMAINS ACTIVE</span>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Protocol</span>
              <span className="text-sm font-bold text-blue-400 font-mono tracking-tighter">CorpAI v1.1.0</span>
            </div>
         </motion.div>

         <div className="pointer-events-auto flex items-center gap-4 text-white/20 text-[10px] uppercase font-bold tracking-[0.2em]">
            <span>Secure Tunnel Active</span>
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
         </div>
      </div>
    </main>
  );
}
