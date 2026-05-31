import { Link } from "react-router-dom";
import { Calendar, ArrowRight, CheckCircle, Clock } from "lucide-react";

function ProjectCard({ project }) {
  const { _id, title, createdAt, stats = { total: 0, completed: 0, failed: 0, progress: 0 } } = project;

  // Format Date
  const dateFormatted = new Date(createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  // Calculate project color theme based on aggregate state
  const getThemeColor = () => {
    if (stats.total === 0) return "var(--warning)";
    if (stats.completed === stats.total) return "#10b981"; // success green
    if (stats.failed > 0 && stats.completed + stats.failed === stats.total) return "#f43f5e"; // failed red
    return "#6366f1"; // processing indigo
  };

  const getStatusText = () => {
    if (stats.total === 0) return "Empty Queue";
    if (stats.completed === stats.total) return "COMPLETED";
    if (stats.failed > 0 && stats.completed + stats.failed === stats.total) return "CRITICAL STATE";
    return "PROCESSING";
  };

  const themeColor = getThemeColor();

  return (
    <Link to={`/project/${_id}`} className="block group">
      <div className="glass-card bg-slate-950/45 p-6 rounded-2xl border border-slate-900/60 flex flex-col justify-between h-full relative overflow-hidden">
        
        {/* Header Block */}
        <div>
          <div className="flex justify-between items-start gap-4">
            <span 
              className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
              style={{ 
                color: themeColor, 
                borderColor: `${themeColor}20`,
                backgroundColor: `${themeColor}05`
              }}
            >
              {getStatusText()}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <Calendar size={12} />
              <span>{dateFormatted}</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight leading-snug mt-3 group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
        </div>

        {/* Counter Indicators */}
        <div className="flex gap-4 mt-6 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-1">
            <Clock size={13} className="text-slate-500" />
            <span>Tasks: <strong className="text-white">{stats.total}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle size={13} className="text-emerald-500" />
            <span>Success: <strong className="text-emerald-400">{stats.completed}</strong></span>
          </div>
          {stats.failed > 0 && (
            <div className="flex items-center gap-1 border-l border-slate-900 pl-3">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-400">Failed: <strong className="text-rose-400">{stats.failed}</strong></span>
            </div>
          )}
        </div>

        {/* Progress Tracker Fill */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Execution Gauge</span>
            <span style={{ color: themeColor }}>{stats.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900/40">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${stats.progress}%`,
                backgroundColor: themeColor,
                boxShadow: `0 0 10px ${themeColor}60`
              }}
            />
          </div>
        </div>

        {/* Action Link Footer */}
        <div className="border-t border-slate-900/60 mt-6 pt-4 flex justify-end">
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
            <span>Track Telemetry</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>
    </Link>
  );
}

export default ProjectCard;