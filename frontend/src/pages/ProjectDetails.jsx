import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  RotateCw, 
  Terminal, 
  Layers, 
  Clock, 
  Activity, 
  CheckCircle, 
  XCircle,
  Cpu,
  AlertTriangle
} from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import socket from "../socket/socket.js";
import Footer from "../components/Footer";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const consoleEndRef = useRef(null);

  const [projectTitle, setProjectTitle] = useState("Loading Pipeline...");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("ALL");

  // Fetch project title and meta parameters
  const fetchProjectMeta = async () => {
    try {
      const res = await API.get("/project/all");
      const matched = res.data.find((p) => p._id === id);
      if (matched) {
        setProjectTitle(matched.title);
      }
    } catch (err) {
      console.error("[ProjectDetails] Error loading project title:", err);
    }
  };

  // Fetch enqueued tasks
  const fetchTasks = async (isFirst = false) => {
    try {
      const res = await API.get(`/project/${id}/tasks`);
      const newTasks = res.data;
      setTasks(newTasks);

      // Generate dynamic logs based on task state values
      const logStreams = [];
      newTasks.forEach((task) => {
        const timeStr = new Date(task.updatedAt).toLocaleTimeString();
        if (task.status === "pending") {
          logStreams.push(`[${timeStr}] [PENDING] Redis broker enqueued job for: "${task.taskName}"`);
        } else if (task.status === "processing") {
          logStreams.push(`[${timeStr}] [RUNNING] Worker pulled job: "${task.taskName}" (Allocating heap sandbox)`);
        } else if (task.status === "completed") {
          logStreams.push(`[${timeStr}] [COMPLETED] Worker processed job: "${task.taskName}" successfully. DB synchronized.`);
        } else if (task.status === "failed") {
          logStreams.push(`[${timeStr}] [CRITICAL] Worker failed processing: "${task.taskName}". Error code: ECONNRESET.`);
        }
      });
      
      // Keep only unique logs and sort them to look organic
      setConsoleLogs((prev) => {
        const uniqueLogs = Array.from(new Set([...prev, ...logStreams]));
        return uniqueLogs.sort().slice(-20); // Keep last 20 console lines
      });

    } catch (error) {
      console.error("[ProjectDetails] Error polling tasks:", error);
      setErrorMsg("Failed to poll live worker execution frames.");
    } finally {
      if (isFirst) setLoading(false);
    }
  };

  // Update a task status manually (for workers viewing details page)
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await API.put(`/project/task/${taskId}/status`, { status: newStatus });
      // State will automatically be kept in sync by sockets, but we refresh silently as backup
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("[ProjectDetails] Failed to update task status:", err);
    }
  };

  useEffect(() => {
    // Schedule initial load on next tick to avoid synchronous setState inside useEffect body
    const timer = setTimeout(() => {
      fetchProjectMeta();
      fetchTasks(true);
    }, 0);

    // Set up a 2-second polling frame to check active worker operations as a fallback
    const interval = setInterval(() => {
      fetchTasks(false);
    }, 2000);

    // Register real-time WebSockets event listeners
    socket.on("task:updated", (payload) => {
      if (payload.projectId === id) {
        console.log("[ProjectDetails] Real-time task update via WebSocket:", payload.taskId, payload.status);
        
        // Instantly transition the specific task state
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t._id === payload.taskId
              ? { ...t, status: payload.status, assignedWorker: payload.assignedWorker }
              : t
          )
        );

        // Print worker-specific log line in the scrollable console feed
        const timeStr = new Date().toLocaleTimeString();
        let logMsg = "";
        const workerName = payload.assignedWorker?.name || "Worker Node";
        
        if (payload.status === "processing") {
          logMsg = `[${timeStr}] [RUNNING] ${workerName} pulled job (Allocating heap sandbox)`;
        } else if (payload.status === "completed") {
          logMsg = `[${timeStr}] [COMPLETED] ${workerName} processed job successfully. DB synced.`;
        } else if (payload.status === "failed") {
          logMsg = `[${timeStr}] [CRITICAL] Job execution failed. Error: Process terminated.`;
        }

        if (logMsg) {
          setConsoleLogs((prev) => {
            const uniqueLogs = Array.from(new Set([...prev, logMsg]));
            return uniqueLogs.sort().slice(-20);
          });
        }
      }
    });

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      socket.off("task:updated");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Filtered Logs
  const filteredLogs = consoleLogs.filter((log) => {
    // 1. Filter by Level
    if (selectedLevel !== "ALL") {
      const levelToken = `[${selectedLevel}]`;
      if (!log.includes(levelToken)) {
        return false;
      }
    }
    // 2. Filter by Search Query
    if (searchQuery.trim() !== "") {
      const term = searchQuery.toLowerCase();
      if (!log.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  // Scroll console feed down automatically
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs]);

  // Calculate statistics
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const failed = tasks.filter((t) => t.status === "failed").length;
  const processing = tasks.filter((t) => t.status === "processing").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col font-sans select-none pb-12">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 space-y-8">
        
        {/* Navigation & Header */}
        <header className="flex flex-col gap-2 pb-6 border-b border-slate-900">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 font-semibold transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft size={14} />
            <span>Dashboard Panel</span>
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">
                {projectTitle}
              </h1>
              <p className="text-slate-500 text-xs mt-2">Pipeline Telemetry ID: <span className="font-mono-custom text-[11px] text-indigo-400">{id}</span></p>
            </div>
            
            {/* Master Gauge status */}
            <div className="shrink-0 px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-bold flex items-center gap-1.5">
              <Activity size={13} className="animate-pulse" />
              <span>LIVE QUEUE POLLING ACTIVE</span>
            </div>
          </div>
        </header>

        {errorMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Master stats & progress display */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Completion Meter */}
          <div className="lg:col-span-7 glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aggregate Completion Gauge</h3>
              <span className="text-xl font-extrabold text-indigo-400 tracking-tight">{progressPercent}%</span>
            </div>

            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900/40">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000 ease-out"
                style={{ 
                  width: `${progressPercent}%`,
                  boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)"
                }}
              />
            </div>
            
            <p className="text-slate-500 text-xs font-medium">
              Finished: <strong className="text-white font-bold">{completed}</strong> of {total} background jobs successfully synced to database.
            </p>
          </div>

          {/* Counts box grid */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
            <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 flex items-center gap-3">
              <Clock size={16} className="text-amber-400" />
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Queued</p>
                <p className="text-base font-extrabold text-white">{pending}</p>
              </div>
            </div>
            <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 flex items-center gap-3">
              <Activity size={16} className="text-blue-400 animate-spin-slow" />
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Running</p>
                <p className="text-base font-extrabold text-white">{processing}</p>
              </div>
            </div>
            <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-400" />
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Finished</p>
                <p className="text-base font-extrabold text-white">{completed}</p>
              </div>
            </div>
            <div className="glass-card bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 flex items-center gap-3">
              <XCircle size={16} className="text-rose-400" />
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Failed</p>
                <p className="text-base font-extrabold text-white">{failed}</p>
              </div>
            </div>
          </div>

        </section>

        {/* Telemetry and Task details splitting */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left - Telemetry log feed */}
          <div className="lg:col-span-5">
            <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60 flex flex-col min-h-[380px]">
              
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900/60 pb-3 flex items-center gap-2">
                <Terminal size={16} className="text-cyan-400 animate-pulse" />
                <span>Worker Execution Logs</span>
              </h3>

              {/* Syslog Toolbar */}
              <div className="mt-4 space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search task logs..."
                    className="w-full text-xs px-3 py-2 bg-slate-950/80 border border-slate-900/80 rounded-xl focus:outline-none focus:border-cyan-500/50 text-cyan-400 font-mono-custom placeholder-cyan-900/40 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600 hover:text-cyan-400 text-[10px] font-extrabold transition-colors cursor-pointer"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Log level filter badges */}
                <div className="flex flex-wrap gap-1.5">
                  {["ALL", "PENDING", "RUNNING", "COMPLETED", "CRITICAL"].map((level) => {
                    const isActive = selectedLevel === level;
                    let activeClass = "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
                    if (level === "PENDING") activeClass = "bg-amber-500/20 text-amber-400 border-amber-500/30";
                    if (level === "RUNNING") activeClass = "bg-blue-500/20 text-blue-400 border-blue-500/30";
                    if (level === "COMPLETED") activeClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
                    if (level === "CRITICAL") activeClass = "bg-rose-500/20 text-rose-400 border-rose-500/30";

                    return (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          isActive 
                            ? `${activeClass} shadow-[0_0_8px_rgba(6,182,212,0.15)]` 
                            : "bg-slate-950/40 text-slate-500 border-slate-900/60 hover:text-slate-300 hover:border-slate-800"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[320px] font-mono-custom text-[10px] text-cyan-400/90 leading-relaxed bg-slate-950/80 border border-slate-950 rounded-xl p-4 mt-4 space-y-2.5 shadow-inner">
                {filteredLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 font-sans italic text-xs py-8">
                    {consoleLogs.length === 0 ? "Initializing socket console listeners..." : "No logs match active filters"}
                  </div>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-slate-600 font-bold shrink-0">&gt;</span>
                      <span className="break-all">{log}</span>
                    </div>
                  ))
                )}
                <div ref={consoleEndRef} />
              </div>
              
              <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono-custom mt-4">
                <Cpu size={12} />
                <span>Broker protocol: redis://127.0.0.1:6379/taskQueue</span>
              </div>
            </div>
          </div>

          {/* Right - Task list cards */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-slate-300 tracking-tight flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" />
              <span>Enqueued Queue Tasks ({total})</span>
            </h2>

            {loading ? (
              <div className="glass-card bg-slate-950/20 p-20 rounded-2xl border border-slate-900/60 flex flex-col items-center justify-center gap-4 text-slate-500">
                <RotateCw className="text-indigo-500 animate-spin-slow" size={24} />
                <span className="text-xs font-semibold tracking-wider font-mono-custom text-indigo-400">POLLING LIVE WORKERS...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <TaskCard key={task._id} task={task} onUpdateStatus={handleUpdateStatus} />
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}

export default ProjectDetails;