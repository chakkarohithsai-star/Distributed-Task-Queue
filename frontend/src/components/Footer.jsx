import { Link } from "react-router-dom";
import { 
  Cpu, 
  GitBranch, 
  Globe, 
  Activity, 
  MessageSquare, 
  Terminal, 
  Layers, 
  Shield, 
  BookOpen, 
  Compass, 
  Server,
  ExternalLink
} from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-950/80 backdrop-blur-md border-t border-slate-900/60 relative overflow-hidden select-none mt-auto">
      {/* Cyber Grid Pattern Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Soft Neon Ambient Glows */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Futuristic Animated Top Accent Line */}
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-65 animate-pulse" />

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand/Platform Panel (Left Section) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Glowing Interactive Brand Logo */}
              <Link to="/" className="flex items-center gap-3 w-fit group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300">
                  <Cpu className="text-white animate-spin-slow group-hover:scale-110 transition-transform" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors leading-none">
                    AetherQueue
                  </h3>
                  <span className="text-[8px] font-bold text-indigo-400 tracking-[0.25em] uppercase block mt-1">
                    Distributed task Queue
                  </span>
                </div>
              </Link>

              {/* Enterprise Infrastructure Summary */}
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm">
                Real-time distributed task scheduling, worker orchestration, telemetry, and scalable queue processing. Built for extreme throughput and low latency.
              </p>
            </div>

            {/* Diagnostic Protocol Indicator */}
            <div className="pt-4 lg:pt-0 hidden sm:flex items-center gap-2 text-[10px] text-slate-500 font-mono-custom">
              <Shield size={12} className="text-indigo-400/80 animate-pulse" />
              <span>TLS Security Protocol Active // AES-256</span>
            </div>
          </div>

          {/* Navigational Links (Right Section) */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            
            {/* Column 1 — Platform */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 tracking-[0.15em] uppercase flex items-center gap-1.5">
                <Activity size={12} className="text-indigo-400" />
                <span>Platform</span>
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-slate-400">
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Projects</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Workers</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Analytics</span>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-indigo-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Live Telemetry</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 — Queue System */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 tracking-[0.15em] uppercase flex items-center gap-1.5">
                <Server size={12} className="text-cyan-400" />
                <span>Queue System</span>
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-slate-400">
                <li>
                  <a href="#redis-queue" className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Redis Queue</span>
                  </a>
                </li>
                <li>
                  <a href="#bullmq-workers" className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">BullMQ Workers</span>
                  </a>
                </li>
                <li>
                  <a href="#smart-scheduling" className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Smart Scheduling</span>
                  </a>
                </li>
                <li>
                  <a href="#load-balancing" className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Load Balancing</span>
                  </a>
                </li>
                <li>
                  <a href="#retry-policies" className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Retry Policies</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 — Resources */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 tracking-[0.15em] uppercase flex items-center gap-1.5">
                <BookOpen size={12} className="text-purple-400" />
                <span>Resources</span>
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-slate-400">
                <li>
                  <a href="#documentation" className="hover:text-purple-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Documentation</span>
                  </a>
                </li>
                <li>
                  <a href="#api-reference" className="hover:text-purple-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">API Reference</span>
                  </a>
                </li>
                <li>
                  <a href="#developer-logs" className="hover:text-purple-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Developer Logs</span>
                  </a>
                </li>
                <li>
                  <a href="#monitoring" className="hover:text-purple-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Monitoring</span>
                  </a>
                </li>
                <li>
                  <a href="#websocket-events" className="hover:text-purple-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">WebSocket Events</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4 — Company */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 tracking-[0.15em] uppercase flex items-center gap-1.5">
                <Compass size={12} className="text-emerald-400" />
                <span>Company</span>
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-slate-400">
                <li>
                  <a href="#about" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">About</span>
                  </a>
                </li>
                <li>
                  <a href="#careers" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Careers</span>
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Contact</span>
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Privacy Policy</span>
                  </a>
                </li>
                <li>
                  <a href="#terms" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 group">
                    <span className="group-hover:translate-x-1 transition-transform duration-200">Terms</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 5 — Socials */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 tracking-[0.15em] uppercase flex items-center gap-1.5">
                <Terminal size={12} className="text-rose-400" />
                <span>Socials</span>
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-slate-400">
                <li>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-slate-200 transition-colors duration-200 flex items-center gap-2 group w-fit"
                  >
                    <GitBranch size={13} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span>GitHub</span>
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group w-fit"
                  >
                    <Globe size={13} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                    <span>LinkedIn</span>
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-sky-400 transition-colors duration-200 flex items-center gap-2 group w-fit"
                  >
                    <Activity size={13} className="text-slate-400 group-hover:text-sky-400 transition-colors" />
                    <span>Twitter</span>
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://discord.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-indigo-400 transition-colors duration-200 flex items-center gap-2 group w-fit"
                  >
                    <MessageSquare size={13} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span>Discord</span>
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Animated Accent Divider Grid Line */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800/80 to-transparent my-10 opacity-70" />

        {/* Bottom Footer Strip */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-5 text-xs text-slate-500 font-medium">
          {/* Copyright identifier */}
          <div className="text-center md:text-left hover:text-slate-400 transition-colors duration-200">
            <span>© {currentYear} AetherQueue — Distributed Task Queue Platform</span>
          </div>

          {/* Tech Stack Details */}
          <div className="flex items-center gap-2 text-center md:text-right font-mono-custom text-[10px] text-slate-500 hover:text-indigo-400 transition-colors duration-200">
            <Layers size={11} className="text-indigo-500/80 shrink-0" />
            <span>Built with React, Redis, BullMQ, Socket.IO, and MongoDB</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
