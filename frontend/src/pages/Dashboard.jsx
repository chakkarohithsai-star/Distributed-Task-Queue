import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Layers, 
  RotateCw, 
  CheckCircle, 
  XCircle, 
  Activity, 
  PlusCircle, 
  AlertTriangle,
  FolderOpen,
  Cpu,
  Terminal,
  Server
} from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import socket from "../socket/socket.js";
import Footer from "../components/Footer";

function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Flat array of all tasks in system for worker role
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [onlineWorkers, setOnlineWorkers] = useState([]);
  const [registeredWorkers, setRegisteredWorkers] = useState([]);

  // Retrieve user role from localStorage
  const userRole = localStorage.getItem("role") || "client";

  const fetchWorkers = async () => {
    try {
      const res = await API.get("/auth/workers");
      setRegisteredWorkers(res.data);
    } catch (err) {
      console.error("[Dashboard] Error fetching workers:", err);
    }
  };

  const fetchProjectsAndStats = async (isFirst = true) => {
    try {
      if (isFirst) setLoading(true);
      setErrorMsg("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch all projects (workers now fetch all projects in the system!)
      const res = await API.get("/project/all");
      const projectsData = res.data;

      if (userRole === "client") {
        fetchWorkers();
      }

      // Fetch tasks for each project in parallel to calculate progress & stats
      const projectsWithStats = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const tasksRes = await API.get(`/project/${project._id}/tasks`);
            const tasks = tasksRes.data;
            const total = tasks.length;
            const completed = tasks.filter(t => t.status === "completed").length;
            const failed = tasks.filter(t => t.status === "failed").length;
            const processing = tasks.filter(t => t.status === "processing").length;
            const pending = tasks.filter(t => t.status === "pending").length;

            return {
              ...project,
              tasks,
              stats: {
                total,
                completed,
                failed,
                processing,
                pending,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0
              }
            };
          } catch (err) {
            console.error(`[Dashboard] Error fetching tasks for project ${project._id}:`, err);
            return {
              ...project,
              tasks: [],
              stats: { total: 0, completed: 0, failed: 0, processing: 0, pending: 0, progress: 0 }
            };
          }
        })
      );

      setProjects(projectsWithStats);

      // Compile flat list of all tasks in the system with parent project titles
      const tasksList = [];
      projectsWithStats.forEach(proj => {
        proj.tasks?.forEach(task => {
          tasksList.push({
            ...task,
            projectTitle: proj.title
          });
        });
      });
      setAllTasks(tasksList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))); // Latest first

    } catch (err) {
      console.error("[Dashboard] Fetch Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      } else {
        setErrorMsg("Failed to read task queue configurations from server.");
      }
    } finally {
      if (isFirst) setLoading(false);
    }
  };

  useEffect(() => {
    // Schedule initial load on next tick to avoid synchronous setState inside useEffect body
    const timer = setTimeout(() => {
      fetchProjectsAndStats(true);
    }, 0);

    // Register dynamic WebSockets presence
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");

    if (token && userId) {
      socket.emit("node:presence", { userId, name, email, role });
    }

    // Subscribe to Socket.io events
    socket.on("workers:presence", (workers) => {
      setOnlineWorkers(workers);
    });

    socket.on("task:updated", (payload) => {
      console.log("[Dashboard] WebSocket task update received:", payload.taskId, payload.status);
      
      // Update allTasks state instantly!
      setAllTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === payload.taskId
            ? { ...t, status: payload.status, assignedWorker: payload.assignedWorker }
            : t
        )
      );

      // Update projects state instantly to refresh progress bars & counters in real-time!
      setProjects((prevProj) =>
        prevProj.map((proj) => {
          const hasTask = proj.tasks?.some((t) => t._id === payload.taskId);
          if (!hasTask) return proj;

          const updatedTasks = proj.tasks.map((t) =>
            t._id === payload.taskId
              ? { ...t, status: payload.status, assignedWorker: payload.assignedWorker }
              : t
          );

          const total = updatedTasks.length;
          const completed = updatedTasks.filter((t) => t.status === "completed").length;
          const failed = updatedTasks.filter((t) => t.status === "failed").length;
          const processing = updatedTasks.filter((t) => t.status === "processing").length;
          const pending = updatedTasks.filter((t) => t.status === "pending").length;

          return {
            ...proj,
            tasks: updatedTasks,
            stats: {
              total,
              completed,
              failed,
              processing,
              pending,
              progress: total > 0 ? Math.round((completed / total) * 100) : 0
            }
          };
        })
      );
    });

    socket.on("task:assigned", (payload) => {
      console.log("[Dashboard] WebSocket task assigned received:", payload.taskId, payload.workerId);
      const currentUserId = localStorage.getItem("userId");
      if (payload.workerId === currentUserId) {
        // Silently pull the newly assigned task from isolated API
        fetchProjectsAndStats(false);
      }
    });

    // If the logged-in role is "worker", set up a 2s polling interval
    let interval = null;
    if (userRole === "worker") {
      interval = setInterval(() => {
        fetchProjectsAndStats(false);
      }, 2000);
    }

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
      socket.off("workers:presence");
      socket.off("task:updated");
      socket.off("task:assigned");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, userRole]);



  // Compute aggregate numbers from all projects
  const getAggregates = () => {
    let activePipelines = projects.length;
    let totalTasks = 0;
    let completedTasks = 0;
    let failedTasks = 0;
    let runningTasks = 0;

    projects.forEach((proj) => {
      const stats = proj.stats || {};
      totalTasks += stats.total || 0;
      completedTasks += stats.completed || 0;
      failedTasks += stats.failed || 0;
      runningTasks += (stats.processing || 0) + (stats.pending || 0);
    });

    return {
      activePipelines,
      totalTasks,
      completedTasks,
      failedTasks,
      runningTasks,
    };
  };

  const aggregates = getAggregates();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans select-none pb-12">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Render CLIENT Dashboard View */}
        {userRole === "client" ? (
          <>
            {/* Header Title & Button */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-900">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <span>Engine Dashboard</span>
                </h1>
                <p className="text-slate-500 text-xs mt-1 font-medium">Deploy, track, and monitor distributed BullMQ background task workers.</p>
              </div>
              
              <Link
                to="/create"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/20 text-white text-sm font-semibold flex items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <PlusCircle size={17} />
                <span>Create Pipeline</span>
              </Link>
            </header>

            {errorMsg && (
              <div className="flex items-center gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
                <AlertTriangle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Statistics Cards Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Projects</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Layers size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">{aggregates.activePipelines}</h3>
                <p className="text-slate-500 text-[10px] mt-1.5 font-medium">Active queue groups</p>
              </div>

              <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Running Workers</span>
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                    <Activity size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">{aggregates.runningTasks}</h3>
                <p className="text-slate-500 text-[10px] mt-1.5 font-medium">Pending or processing jobs</p>
              </div>

              <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completed Jobs</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <CheckCircle size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">{aggregates.completedTasks}</h3>
                <p className="text-slate-500 text-[10px] mt-1.5 font-medium">Successful worker runs</p>
              </div>

              <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Failed Jobs</span>
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform">
                    <XCircle size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">{aggregates.failedTasks}</h3>
                <p className="text-slate-500 text-[10px] mt-1.5 font-medium">Requires job inspection</p>
              </div>
            </section>

            {/* Worker Nodes Cluster Status Section */}
            <section className="space-y-6 pb-6 border-b border-slate-900/60">
              <h2 className="text-lg font-bold text-slate-300 tracking-tight flex items-center gap-2">
                <Cpu size={18} className="text-cyan-400 animate-pulse" />
                <span>Worker Nodes Cluster Status ({registeredWorkers.length})</span>
              </h2>

              {registeredWorkers.length === 0 ? (
                <div className="glass-card bg-slate-950/20 p-8 rounded-2xl border border-slate-900/60 text-center text-slate-500 text-xs">
                  No registered worker nodes found in database.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registeredWorkers.map((worker) => {
                    const isOnline = onlineWorkers.some((ow) => ow.userId === worker._id);
                    
                    // Calculate active and processed tasks for this specific worker
                    const assignedTasks = allTasks.filter((t) => t.assignedWorker?._id === worker._id);
                    const activeCount = assignedTasks.filter((t) => t.status === "processing" || t.status === "pending").length;
                    const completedCount = assignedTasks.filter((t) => t.status === "completed").length;

                    return (
                      <div 
                        key={worker._id} 
                        className="glass-card bg-slate-950/40 p-5 rounded-2xl border border-slate-900/60 relative overflow-hidden group flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-slate-900 border flex items-center justify-center ${isOnline ? "border-emerald-500/20 text-emerald-400" : "border-slate-800 text-slate-500"}`}>
                              <Cpu size={16} className={isOnline ? "animate-pulse" : ""} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white tracking-tight">{worker.name}</h4>
                              <p className="text-slate-500 text-[10px] truncate max-w-[150px]">{worker.email}</p>
                            </div>
                          </div>

                          {/* Pulsing online status badge */}
                          <div className={`px-2.5 py-1 rounded-full border text-[9px] font-bold flex items-center gap-1 ${
                            isOnline ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse-glow" : "bg-slate-900 border-slate-800 text-slate-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-slate-600"}`} />
                            <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
                          </div>
                        </div>

                        {/* Workload Stats */}
                        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-900/60 text-xs font-semibold text-slate-400">
                          <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Active Jobs</p>
                            <p className={`text-base font-extrabold mt-0.5 ${activeCount > 0 ? "text-cyan-400 animate-pulse" : "text-white"}`}>
                              {activeCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Finished Work</p>
                            <p className="text-base font-extrabold text-white mt-0.5">{completedCount}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Deployed Pipelines List */}
            <section className="space-y-6">
              <h2 className="text-lg font-bold text-slate-300 tracking-tight flex items-center gap-2">
                <FolderOpen size={18} className="text-indigo-400" />
                <span>Deployed Pipelines</span>
              </h2>

              {loading ? (
                <div className="glass-card bg-slate-950/20 p-20 rounded-2xl border border-slate-900/60 flex flex-col items-center justify-center gap-4 text-slate-500">
                  <RotateCw className="text-indigo-500 animate-spin-slow" size={32} />
                  <span className="text-xs font-semibold tracking-wider font-mono-custom text-indigo-400">READING PIPELINES...</span>
                </div>
              ) : projects.length === 0 ? (
                <div className="glass-card bg-slate-950/20 p-20 rounded-2xl border border-slate-900/60 text-center space-y-4 max-w-2xl mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Layers size={22} />
                  </div>
                  <h3 className="text-white text-base font-bold">No Active Pipelines Found</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                    Decompose your heavy workflows by deploying a new pipeline. Add background email alerts, image manipulation, or database compile task stacks.
                  </p>
                  <Link 
                    to="/create" 
                    className="inline-flex px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white hover:bg-slate-800 transition-all duration-200"
                  >
                    Launch First Pipeline
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              )}
            </section>

            {/* System-Wide Queue Telemetry Feed for Client */}
            <section className="space-y-6">
              <h2 className="text-lg font-bold text-slate-300 tracking-tight flex items-center gap-2">
                <Terminal size={18} className="text-indigo-400 animate-pulse" />
                <span>System-Wide Queue Telemetry Feed</span>
              </h2>

              {loading ? (
                <div className="glass-card bg-slate-950/20 p-20 rounded-2xl border border-slate-900/60 flex flex-col items-center justify-center gap-4 text-slate-500">
                  <RotateCw className="text-indigo-500 animate-spin-slow" size={32} />
                  <span className="text-xs font-semibold tracking-wider font-mono-custom text-indigo-400">CONNECTING TELEMETRY FEED...</span>
                </div>
              ) : allTasks.length === 0 ? (
                <div className="glass-card bg-slate-950/20 p-12 rounded-2xl border border-slate-900/60 text-center text-slate-500 text-xs">
                  No active tasks enqueued in the system.
                </div>
              ) : (
                <div className="glass-card bg-slate-950/40 rounded-2xl border border-slate-900/60 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm text-slate-400 select-none">
                      <thead className="bg-slate-950/80 border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono-custom">
                        <tr>
                          <th className="px-6 py-4">Task Name</th>
                          <th className="px-6 py-4">Parent Project</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Assigned Worker</th>
                          <th className="px-6 py-4">Diagnostics</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60 font-sans">
                        {allTasks.map((task) => (
                          <tr key={task._id} className="hover:bg-slate-900/20 transition-colors">
                            <td className="px-6 py-4 font-bold text-white tracking-tight">{task.taskName}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-indigo-400">{task.projectTitle}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold inline-flex items-center gap-1 ${
                                task.status === "completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                task.status === "processing" ? "bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse-glow" :
                                task.status === "failed" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}>
                                {task.status === "processing" && <Activity size={10} className="animate-spin shrink-0" />}
                                <span>{task.status.toUpperCase()}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {task.assignedWorker ? (
                                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                                  <Cpu size={12} className="text-indigo-400 animate-pulse shrink-0" />
                                  <span>{task.assignedWorker.name}</span>
                                </span>
                              ) : (
                                <span className="text-xs text-slate-600 font-semibold italic">Unassigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs font-mono-custom">
                              {task.status === "pending" && <span className="text-slate-600">&gt; Waiting in Redis taskQueue broker</span>}
                              {task.status === "processing" && <span className="text-cyan-400/90">&gt; taskWorker process executing job...</span>}
                              {task.status === "completed" && <span className="text-emerald-400/90">&gt; Completed. Output frame synced</span>}
                              {task.status === "failed" && <span className="text-rose-400/90">&gt; Critical exception caught</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          /* Render WORKER Dashboard View */
          <>
            {/* Header Title for Worker */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-900">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <Cpu className="text-indigo-400 animate-spin-slow" size={28} />
                  <span>Worker Control Node Console</span>
                </h1>
                <p className="text-slate-500 text-xs mt-1 font-medium">Monitor and complete background task queue packages processed by taskWorker threads.</p>
              </div>

              <div className="shrink-0 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-pulse-glow">
                <Server size={14} />
                <span>WORKER THREADS ONLINE</span>
              </div>
            </header>

            {errorMsg && (
              <div className="flex items-center gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
                <AlertTriangle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Worker Statistics Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enqueued Queue Tasks</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Layers size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">{allTasks.length}</h3>
                <p className="text-slate-500 text-[10px] mt-1.5 font-medium">Total tasks in system</p>
              </div>

              <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node Workload Load</span>
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                    <Activity size={16} className="animate-pulse" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-3xl font-extrabold text-white tracking-tight">
                    {allTasks.filter(t => t.status === "processing" || t.status === "pending").length}
                  </h3>
                  <span className="text-slate-500 text-sm font-bold">/ 2</span>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ml-2.5 uppercase shrink-0 ${
                    allTasks.filter(t => t.status === "processing" || t.status === "pending").length >= 2 
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse" 
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {allTasks.filter(t => t.status === "processing" || t.status === "pending").length >= 2 ? "Fully Loaded" : "Available"}
                  </span>
                </div>
                
                {/* Dynamic workload indicator bar */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900/40 mt-3.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      allTasks.filter(t => t.status === "processing" || t.status === "pending").length >= 2 
                        ? "bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" 
                        : "bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    }`}
                    style={{ 
                      width: `${Math.min(100, (allTasks.filter(t => t.status === "processing" || t.status === "pending").length / 2) * 100)}%`
                    }}
                  />
                </div>
              </div>

              <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completed Work</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">
                  {allTasks.filter(t => t.status === "completed").length}
                </h3>
                <p className="text-slate-500 text-[10px] mt-1.5 font-medium">Successfully processed items</p>
              </div>

              <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Failed Jobs</span>
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <XCircle size={16} />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">
                  {allTasks.filter(t => t.status === "failed").length}
                </h3>
                <p className="text-slate-500 text-[10px] mt-1.5 font-medium">Errors caught in worker context</p>
              </div>
            </section>

            {/* Worker tasks list with polling */}
            <section className="space-y-6">
              <h2 className="text-lg font-bold text-slate-300 tracking-tight flex items-center gap-2">
                <Terminal size={18} className="text-indigo-400 animate-pulse" />
                <span>Operational Queue Telemetry Feed</span>
              </h2>

              {loading ? (
                <div className="glass-card bg-slate-950/20 p-20 rounded-2xl border border-slate-900/60 flex flex-col items-center justify-center gap-4 text-slate-500">
                  <RotateCw className="text-indigo-500 animate-spin-slow" size={32} />
                  <span className="text-xs font-semibold tracking-wider font-mono-custom text-indigo-400">CONNECTING TELEMETRY FEED...</span>
                </div>
              ) : allTasks.length === 0 ? (
                <div className="glass-card bg-slate-950/20 p-20 rounded-2xl border border-slate-900/60 text-center space-y-4 max-w-2xl mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Terminal size={22} />
                  </div>
                  <h3 className="text-white text-base font-bold">Queue is Currently Empty</h3>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
                    There are no tasks enqueued in Redis. Waiting for authorized Client nodes to submit pipeline workloads...
                  </p>
                </div>
              ) : (
                 <div className="glass-card bg-slate-950/40 rounded-2xl border border-slate-900/60 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm text-slate-400 select-none">
                      <thead className="bg-slate-950/80 border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono-custom">
                        <tr>
                          <th className="px-6 py-4">Task Name</th>
                          <th className="px-6 py-4">Parent Project</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Diagnostics</th>
                          <th className="px-6 py-4">Actions (Execute Work)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60 font-sans">
                        {allTasks.map((task) => (
                          <tr key={task._id} className="hover:bg-slate-900/20 transition-colors">
                            <td className="px-6 py-4 font-bold text-white tracking-tight">{task.taskName}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-indigo-400">{task.projectTitle}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold inline-flex items-center gap-1 ${
                                task.status === "completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                task.status === "processing" ? "bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse-glow" :
                                task.status === "failed" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}>
                                {task.status === "processing" && <Activity size={10} className="animate-spin shrink-0" />}
                                <span>{task.status.toUpperCase()}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono-custom">
                              {task.status === "pending" && <span className="text-slate-600">&gt; Waiting in Redis taskQueue broker</span>}
                              {task.status === "processing" && <span className="text-cyan-400/90">&gt; taskWorker process executing job...</span>}
                              {task.status === "completed" && <span className="text-emerald-400/90">&gt; Completed. Output frame synced</span>}
                              {task.status === "failed" && <span className="text-rose-400/90">&gt; Critical exception caught</span>}
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                to={`/project/${task.projectId}`}
                                className="px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-[11px] font-bold text-indigo-400 transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <span>View Details</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;