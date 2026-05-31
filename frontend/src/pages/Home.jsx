import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Cpu, 
  ArrowRight, 
  Mail, 
  Image as ImageIcon, 
  FileText, 
  Zap, 
  ChevronRight,
  Database
} from "lucide-react";
import Footer from "../components/Footer";

function Home() {
  const [isAuthenticated] = useState(() => !!localStorage.getItem("token"));
  
  // Real-time simulated stats
  const [simulatedStats, setSimulatedStats] = useState({
    activeWorkers: 3,
    processedJobs: 12584,
    latency: "24ms"
  });

  useEffect(() => {
    // Interval to simulate slightly fluctuating latency and active jobs
    const interval = setInterval(() => {
      setSimulatedStats(prev => ({
        activeWorkers: Math.random() > 0.85 ? Math.floor(Math.random() * 2) + 3 : prev.activeWorkers,
        processedJobs: prev.processedJobs + Math.floor(Math.random() * 2),
        latency: `${Math.floor(20 + Math.random() * 10)}ms`
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex flex-col font-sans select-none">
      
      {/* Immersive Landing Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Floating Top Nav bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="text-white animate-spin-slow" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">AetherQueue</h1>
            <span className="text-[9px] font-bold text-indigo-400 tracking-[0.25em] uppercase block -mt-1">Task Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link 
              to="/dashboard" 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Control Panel
            </Link>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/50 text-white text-sm font-semibold hover:bg-slate-800 transition-all duration-300"
              >
                Register Node
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 flex flex-col justify-center py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero side - Copywriting */}
          <div className="md:col-span-7 space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
              <Zap size={13} className="animate-pulse" />
              <span>Celery & RabbitMQ Architecture in MERN</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Distributed Task <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Orchestration Engine
              </span>
            </h2>

            <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
              Submit heavy execution workloads. Automatically decompose projects into isolated, specialized task structures enqueued in local Redis layers and processed by high-performance asynchronous workers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
              {isAuthenticated ? (
                <Link 
                  to="/dashboard"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span>Go to Control Dashboard</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <span>Deploy Operator Node</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link 
                    to="/register"
                    className="px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/40 text-slate-300 font-semibold flex items-center justify-center gap-2 hover:bg-slate-800/80 transition-all duration-300"
                  >
                    <span>Register New Client</span>
                  </Link>
                </>
              )}
            </div>

            {/* Live System Diagnostics */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-800/60 max-w-md mx-auto md:mx-0">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Workers</p>
                <p className="text-2xl font-extrabold text-indigo-400 tracking-tight mt-1">{simulatedStats.activeWorkers} Clusters</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jobs Processed</p>
                <p className="text-2xl font-extrabold text-purple-400 tracking-tight mt-1">{simulatedStats.processedJobs.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Broker Latency</p>
                <p className="text-2xl font-extrabold text-cyan-400 tracking-tight mt-1">{simulatedStats.latency}</p>
              </div>
            </div>
          </div>

          {/* Right Hero side - Architecture Panel Visualizer */}
          <div className="md:col-span-5 relative">
            <div className="glass-card rounded-2xl p-6 relative z-10 border border-slate-700/50 bg-slate-900/65 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-mono-custom text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>core_pipeline_telemetry.log</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                </div>
              </div>

              {/* Flowchart Diagrams inside console */}
              <div className="py-6 space-y-5 font-mono-custom text-xs text-slate-400 leading-relaxed">
                <div className="flex gap-3 items-start">
                  <span className="text-slate-600">01</span>
                  <div>
                    <span className="text-indigo-400">[CLIENT]</span> submitted container payload:<br />
                    <span className="text-emerald-400">&gt; "Launch Marketing Campaign"</span>
                  </div>
                </div>

                <div className="w-full flex justify-center py-1">
                  <ChevronRight className="rotate-90 text-indigo-500 animate-bounce" size={16} />
                </div>

                <div className="flex gap-3 items-start">
                  <span className="text-slate-600">02</span>
                  <div>
                    <span className="text-purple-400">[BROKER]</span> splits tasks into specialized Redis keys:<br />
                    <div className="pl-4 mt-1 border-l-2 border-indigo-500/20 text-[11px] space-y-0.5">
                      <div className="flex items-center gap-1.5"><Mail size={11} className="text-indigo-400" /> <span>emailQueue : enqueued</span></div>
                      <div className="flex items-center gap-1.5"><ImageIcon size={11} className="text-cyan-400" /> <span>imageQueue : enqueued</span></div>
                      <div className="flex items-center gap-1.5"><FileText size={11} className="text-purple-400" /> <span>reportQueue : enqueued</span></div>
                    </div>
                  </div>
                </div>

                <div className="w-full flex justify-center py-1">
                  <ChevronRight className="rotate-90 text-purple-500 animate-bounce" size={16} />
                </div>

                <div className="flex gap-3 items-start">
                  <span className="text-slate-600">03</span>
                  <div>
                    <span className="text-cyan-400">[WORKERS]</span> initialized local processing threads:<br />
                    <span className="text-slate-500">&gt; Waiting for thread response (5.0s mock delay)</span>
                  </div>
                </div>

                <div className="w-full flex justify-center py-1">
                  <ChevronRight className="rotate-90 text-cyan-500 animate-bounce" size={16} />
                </div>

                <div className="flex gap-3 items-start">
                  <span className="text-slate-600">04</span>
                  <div className="flex items-center gap-2">
                    <Database size={13} className="text-emerald-400" />
                    <span><span className="text-emerald-400">[MONGO]</span> synchronized job status -&gt; completed</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Glowing Backdrop accents */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-[60px]" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-purple-500/10 blur-[60px]" />
          </div>

        </div>
      </main>

      {/* Premium Futuristic SaaS Multi-Column Footer */}
      <Footer />

    </div>
  );
}

export default Home;
