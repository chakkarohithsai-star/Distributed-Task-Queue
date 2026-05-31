import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Cpu, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Layers, 
  Play, 
  AlertTriangle,
  Mail,
  Image as ImageIcon,
  FileText,
  HelpCircle
} from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function CreateProject() {
  const [title, setTitle] = useState("");
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  // Enforce Client Node security - redirect Worker nodes to Dashboard
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "worker") {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Task Template presets for one-click enqueuing with predefined priorities
  const presets = [
    { label: "Send Welcome Email", type: "email", text: "Send Welcome Email", priority: "high" },
    { label: "Compress Image Assets", type: "image", text: "Image Processing", priority: "medium" },
    { label: "Aggregate Database Report", type: "report", text: "Report Generation", priority: "low" },
    { label: "SMTP Invoice Dispatch", type: "email", text: "Send Billing Invoice Email", priority: "high" },
  ];

  const handleAddCustomTask = (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    setTasks([...tasks, { taskName: taskName.trim(), priority }]);
    setTaskName("");
    setPriority("medium");
    setErrorMsg("");
  };

  const handleAddPreset = (text, presetPriority = "medium") => {
    setTasks([...tasks, { taskName: text, priority: presetPriority }]);
    setErrorMsg("");
  };

  const handleRemoveTask = (index) => {
    setTasks(tasks.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please provide a project title identifier.");
      return;
    }
    if (tasks.length === 0) {
      setErrorMsg("Please append at least one task to the pipeline execution stack.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      
      const res = await API.post("/project/create", {
        title: title.trim(),
        tasks
      });
      
      console.log("[CreateProject] Project deployed successfully:", res.data);
      // Redirect back to dashboard to view newly added project card
      navigate("/dashboard");
    } catch (error) {
      console.error("[CreateProject] Deployment Failed:", error);
      setErrorMsg(error.response?.data?.message || "Internal server error during queue enqueuing.");
    } finally {
      setLoading(false);
    }
  };

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
            <span>Operational Dashboard</span>
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">Deploy Queue Pipeline</h1>
          <p className="text-slate-500 text-xs">Configure a project instance and enqueue task packages directly to Redis.</p>
        </header>

        {errorMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Master Construction Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel - Config and Builder */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Project Metadata */}
            <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60 space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-bold flex items-center justify-center border border-indigo-500/20">1</span>
                <span>Pipeline Parameters</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Pipeline Title</label>
                <input
                  type="text"
                  placeholder="e.g. Server Logs Analytics Compilation"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-900 focus:border-indigo-500/50 text-white placeholder-slate-600 text-sm rounded-xl outline-none focus:shadow-[0_0_15px_-3px_rgba(99,102,241,0.25)] transition-all duration-300"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Step 2: Task Stack Compiler */}
            <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60 space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-bold flex items-center justify-center border border-cyan-500/20">2</span>
                <span>Task Compiler Stack</span>
              </h2>

              {/* Task Presets Shortcuts */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">Templates Shortcuts</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPreset(preset.text, preset.priority)}
                      className="px-4 py-3 rounded-xl border border-slate-900 bg-slate-950/70 hover:border-indigo-500/40 hover:bg-slate-900/40 text-left text-xs font-semibold text-slate-300 flex items-center gap-2.5 transition-all duration-200 cursor-pointer"
                      disabled={loading}
                    >
                      {preset.type === "email" && <Mail size={14} className="text-indigo-400" />}
                      {preset.type === "image" && <ImageIcon size={14} className="text-cyan-400" />}
                      {preset.type === "report" && <FileText size={14} className="text-purple-400" />}
                      <span className="flex-1">{preset.label}</span>
                      <span className={`text-[7px] font-extrabold px-1 py-0.5 rounded uppercase shrink-0 ${
                        preset.priority === "high" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        preset.priority === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {preset.priority}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Task Input */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mb-2">Custom Task Identifier & Priority</span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter custom task string (e.g. Watermark Corporate Profile)..."
                    className="flex-1 px-4 py-3 bg-slate-950/80 border border-slate-900 focus:border-indigo-500/50 text-white placeholder-slate-600 text-sm rounded-xl outline-none transition-all duration-300"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    disabled={loading}
                  />
                  
                  {/* Priority Select */}
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="px-4 py-3 bg-slate-950/80 border border-slate-900 focus:border-indigo-500/50 text-white text-xs font-bold rounded-xl outline-none transition-all duration-300 cursor-pointer min-w-[120px]"
                    disabled={loading}
                  >
                    <option value="high">🔴 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">🔵 Low Priority</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddCustomTask}
                    className="px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    disabled={loading}
                  >
                    <Plus size={14} />
                    <span>Append</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Right panel - Queue Stack Preview */}
          <div className="lg:col-span-5">
            <div className="glass-card bg-slate-950/40 p-6 rounded-2xl border border-slate-900/60 flex flex-col min-h-[380px]">
              
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-3 flex items-center gap-2">
                <Layers size={16} className="text-indigo-400" />
                <span>Job Package Stack ({tasks.length})</span>
              </h2>

              {/* Task list preview */}
              <div className="flex-1 overflow-y-auto max-h-[300px] py-4 space-y-2">
                {tasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2 p-8 text-slate-600">
                    <HelpCircle size={32} className="opacity-40" />
                    <p className="text-xs font-bold text-slate-500">Pipeline Stack is Empty</p>
                    <span className="text-[10px] leading-relaxed max-w-[200px]">Click on preset templates or compile custom tasks on the left.</span>
                  </div>
                ) : (
                  tasks.map((itemObj, index) => {
                    const { taskName, priority } = itemObj;
                    // Match type icon for visual decoration
                    const isEmail = taskName.toLowerCase().includes("email") || taskName.toLowerCase().includes("smtp");
                    const isImage = taskName.toLowerCase().includes("image") || taskName.toLowerCase().includes("processing") || taskName.toLowerCase().includes("compress");
                    const isReport = taskName.toLowerCase().includes("report") || taskName.toLowerCase().includes("generation");

                    return (
                      <div
                        key={index}
                        className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl flex justify-between items-center gap-4 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono-custom text-[10px] text-slate-600 font-bold">#{index + 1}</span>
                          <div className="shrink-0 text-slate-500">
                            {isEmail && <Mail size={14} className="text-indigo-400" />}
                            {isImage && <ImageIcon size={14} className="text-cyan-400" />}
                            {isReport && <FileText size={14} className="text-purple-400" />}
                            {!isEmail && !isImage && !isReport && <Cpu size={14} className="text-slate-500" />}
                          </div>
                          <span className="text-xs font-medium text-white truncate">{taskName}</span>
                          
                          {/* Mini Priority Badge */}
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0 ${
                            priority === "high" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                            priority === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}>
                            {priority}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(index)}
                          className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          disabled={loading}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Submit panel */}
              <div className="border-t border-slate-900/60 pt-4 mt-auto">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/20 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform active:translate-y-0 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || tasks.length === 0}
                >
                  <Play size={16} />
                  <span>{loading ? "Deploying Node Package..." : "Deploy Pipeline Queue"}</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}

export default CreateProject;