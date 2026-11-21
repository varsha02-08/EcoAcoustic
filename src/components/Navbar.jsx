import { Radio, Volume2, VolumeX, Map, BarChart3 } from "lucide-react";

export default function Navbar({
  wsStatus,
  activeTab,
  setActiveTab,
  alarmMuted,
  setAlarmMuted,
  activeThreatCount,
}) {
  const statusStyles = {
    connected: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    connecting: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    disconnected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-slate-100">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
          <Radio className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-semibold tracking-tight text-base leading-tight">
            EcoAcoustics <span className="text-emerald-400">Command</span>
          </h1>
          <p className="text-xs text-slate-400">Edge-AI Acoustic Biodiversity & Threat Grid</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <nav className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveTab("command")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition ${
            activeTab === "command"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Live GIS Grid
          {activeThreatCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-xs rounded-full bg-rose-600 text-white animate-pulse">
              {activeThreatCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium transition ${
            activeTab === "analytics"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Biodiversity & Analytics
        </button>
      </nav>

      {/* Right Status & Alarm Control */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setAlarmMuted((prev) => !prev)}
          title={alarmMuted ? "Unmute Threat Alarm" : "Mute Threat Alarm"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
            alarmMuted
              ? "bg-slate-800 border-slate-700 text-slate-400"
              : "bg-amber-500/15 border-amber-500/40 text-amber-300"
          }`}
        >
          {alarmMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {alarmMuted ? "Alarm Muted" : "Alarm Armed"}
        </button>

        <div
          className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-2 ${
            statusStyles[wsStatus]
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          Stream: {wsStatus.toUpperCase()}
        </div>
      </div>
    </header>
  );
}