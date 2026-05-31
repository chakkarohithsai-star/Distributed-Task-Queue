import { 
  Mail, 
  Image as ImageIcon, 
  FileText, 
  Clock, 
  Activity, 
  CheckCircle, 
  XCircle,
  Calendar,
  Cpu
} from "lucide-react";

function TaskCard({ task, onUpdateStatus }) {
  const { taskName, status, updatedAt, assignedWorker, priority } = task;

  const userRole = localStorage.getItem("role") || "client";
  const currentUserId = localStorage.getItem("userId");

  // Determine if this task is unassigned or assigned to the current worker
  const isAssignedToMe = !assignedWorker || 
    (typeof assignedWorker === "string" 
      ? assignedWorker === currentUserId 
      : (assignedWorker._id === currentUserId || assignedWorker.userId === currentUserId)
    );

  // Detect task category for custom visual themes
  const isEmail = taskName.toLowerCase().includes("email") || taskName.toLowerCase().includes("smtp");
  const isImage = taskName.toLowerCase().includes("image") || taskName.toLowerCase().includes("processing") || taskName.toLowerCase().includes("compress");
  const isReport = taskName.toLowerCase().includes("report") || taskName.toLowerCase().includes("generation");

  const getTaskIcon = () => {
    if (isEmail) return <Mail size={18} className="text-indigo-400" />;
    if (isImage) return <ImageIcon size={18} className="text-cyan-400" />;
    if (isReport) return <FileText size={18} className="text-purple-400" />;
    return <Clock size={18} className="text-slate-400" />;
  };

  const getTaskCategory = () => {
    if (isEmail) return "Email Subsystem";
    if (isImage) return "Image Subsystem";
    if (isReport) return "Report Compiler";
    return "Core Task Node";
  };

  // Status-based formatting values
  const statusConfig = {
    pending: {
      color: "#f59e0b", // Amber
      text: "Queued",
      bgClass: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      icon: <Clock size={13} />
    },
    processing: {
      color: "#3b82f6", // Blue
      text: "Processing",
      bgClass: "bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse-glow",
      icon: <Activity size={13} className="animate-spin" />
    },
    completed: {
      color: "#10b981", // Emerald
      text: "Finished",
      bgClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      icon: <CheckCircle size={13} />
    },
    failed: {
      color: "#f43f5e", // Rose
      text: "Failed",
      bgClass: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      icon: <XCircle size={13} />
    }
  };

  const activeStatus = statusConfig[status] || statusConfig.pending;

  // Format Time
  const timeFormatted = new Date(updatedAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  return (
    <div className={`glass-card bg-slate-950/45 p-5 rounded-2xl border border-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300`}>
      
      {/* Left Block - Metadata & Name */}
      <div className="flex gap-4 items-start">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
          {getTaskIcon()}
        </div>
        
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">{getTaskCategory()}</span>
            <span className={`text-[7px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0 ${
              priority === "high" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse" :
              priority === "medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
              "bg-slate-800 text-slate-400 border border-slate-700"
            }`}>
              {priority || "medium"}
            </span>
          </div>
          <h4 className="text-base font-bold text-white tracking-tight mt-1 leading-snug">
            {taskName}
          </h4>
          
          <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2 font-medium flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Last Telemetry Sync: <strong className="text-slate-400 font-semibold">{timeFormatted}</strong></span>
            </div>
            {assignedWorker && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-[9px] uppercase tracking-wider flex items-center shrink-0">
                <Cpu size={11} className="shrink-0 text-indigo-400 animate-pulse" />
                <span>Assigned: {assignedWorker.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Block - Status Badges & Worker Actions */}
      <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto border-t border-slate-900/60 sm:border-none pt-3 sm:pt-0 justify-between sm:justify-start">
        <span className="text-[10px] font-bold font-mono-custom text-slate-600 block sm:hidden">STATUS:</span>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${activeStatus.bgClass}`}>
            {activeStatus.icon}
            <span>{activeStatus.text}</span>
          </div>

          {/* Render worker execution controls only if worker role, callback provided, and assigned to this worker or unassigned */}
          {userRole === "worker" && onUpdateStatus && isAssignedToMe && (
            <div className="ml-2 pl-2 border-l border-slate-800 flex items-center">
              {status === "pending" && (
                <button
                  onClick={() => onUpdateStatus(task._id, "processing")}
                  className="px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-[11px] font-bold text-blue-400 transition-all cursor-pointer whitespace-nowrap"
                >
                  Process Task
                </button>
              )}
              {status === "processing" && (
                <button
                  onClick={() => onUpdateStatus(task._id, "completed")}
                  className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-[11px] font-bold text-emerald-400 transition-all cursor-pointer whitespace-nowrap"
                >
                  Complete Task
                </button>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default TaskCard;