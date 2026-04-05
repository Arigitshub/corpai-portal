"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  Users, 
  ShieldAlert, 
  ChevronRight, 
  LayoutDashboard,
  ExternalLink,
  Loader2,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Role {
  id: string;
  title: string;
  rank: string;
  reportsTo: string;
  department: string;
  path: string;
}

export default function Dashboard() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Public version fetches from the GitHub live spec
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
                  // Basic transform from name
                  const title = file.name.replace('.md', '').split('-').map((s:string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                  allRoles.push({
                    id: file.sha,
                    title: title,
                    rank: title.includes('Director') ? 'L4' : 'L2', // Dynamic fallback
                    reportsTo: "OWNER",
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
        console.error("GitHub Fetch Failed, falling back to local API:", err);
        // Fallback to local API (for dev only)
        fetch("/api/org")
          .then(res => res.json())
          .then(data => {
            if (data.roles) setRoles(data.roles);
            setLoading(false);
          })
          .catch(e => {
            console.error(e);
            setLoading(false);
          });
      }
    };

    fetchFromGitHub();
  }, []);

  const totalRoles = roles.length;
  const totalDepts = new Set(roles.map(r => r.department)).size;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white selection:bg-blue-500/30">
      {/* Background patterns */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,transparent_50%)] opacity-30 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-blue-500 mb-2"
            >
              <Globe size={16} />
              <span className="text-xs font-semibold tracking-widest uppercase">Global Spec Portal V1.1</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent"
            >
              CorpAI Portal
            </motion.h1>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              href="/map"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xl border border-white/10"
            >
              Enter Org Map <ChevronRight size={18} />
            </Link>
          </motion.div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <StatCard 
            title="Total Roles" 
            value={totalRoles} 
            icon={<Users className="text-blue-500" />} 
            delay={0.2}
          />
          <StatCard 
            title="Departments" 
            value={totalDepts} 
            icon={<Building2 className="text-purple-500" />} 
            delay={0.3}
          />
          <StatCard 
            title="Registry Mode" 
            value="Public" 
            icon={<Globe className="text-emerald-500" />} 
            delay={0.4}
          />
          <StatCard 
            title="Cert. Status" 
            value="Active" 
            icon={<ShieldAlert className="text-amber-500" />} 
            delay={0.5}
          />
        </section>

        {/* Info Banner */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6 }}
           className="mb-16 p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl backdrop-blur-xl flex items-center justify-between"
        >
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center bg-blue-500 text-white rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                 <Globe size={20} />
              </div>
              <div>
                 <h4 className="font-bold text-white/90">Always Published to the World</h4>
                 <p className="text-sm text-white/40">This portal is now dynamically fetching the latest agent workforce standard from the global CorpAI registry.</p>
              </div>
           </div>
           <a 
             href="https://github.com/Arigitshub/CorpAI" 
             target="_blank" 
             rel="noopener noreferrer"
             className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/10"
           >
             View Standard
           </a>
        </motion.div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Department List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
              Departments
            </h3>
            {Array.from(new Set(roles.map(r => r.department))).sort().map((dept, i) => (
              <motion.div
                key={dept}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (i * 0.05) }}
                className="group flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.05] hover:border-blue-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                    <Building2 size={20} />
                  </div>
                  <span className="font-medium capitalize">{dept}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xs text-white/40">{roles.filter(r => r.department === dept).length}</span>
                   <ChevronRight size={14} className="text-white/20 group-hover:text-blue-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Roles / Active Chains */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white/90">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
              Global Role Explorer
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roles.slice(0, 10).map((role, i) => (
                <motion.div
                  key={`${role.id}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.05) }}
                  className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl group hover:border-purple-500/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-md tracking-wider uppercase">
                      CERTIFIED STATUS
                    </span>
                    <a href={role.path} target="_blank" rel="noopener noreferrer">
                       <ExternalLink size={14} className="text-white/20 hover:text-purple-500 transition-colors" />
                    </a>
                  </div>
                  <h4 className="text-lg font-semibold group-hover:text-white transition-colors">{role.title}</h4>
                  <p className="text-xs text-white/40 mt-1 capitalize">{role.department} Department</p>
                </motion.div>
              ))}
            </div>
            
            <div className="pt-8 flex justify-center">
               <button className="text-white/40 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                 Displaying {Math.min(10, roles.length)} of {roles.length} roles <ChevronRight size={14} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, icon, delay }: { title: string, value: string | number, icon: React.ReactNode, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl group hover:bg-white/[0.05] transition-all"
    >
      <div className="h-12 w-12 flex items-center justify-center bg-white/5 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-white/40 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    </motion.div>
  );
}
