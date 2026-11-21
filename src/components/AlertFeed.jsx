import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  Bird,
  Play,
  Pause,
  ShieldCheck,
  XCircle,
  Clock,
  MapPin,
  Volume2,
} from "lucide-react";

const ALERT_STATUS_BADGE = {
  ACTIVE: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  ACKNOWLEDGED: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  FALSE_ALARM: "bg-slate-700/60 text-slate-300 border-slate-600",
};

export default function AlertFeed({
  alerts = [],
  onUpdateAlertStatus,
  onFocusNode,
}) {
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [selectedAlertId, setSelectedAlertId] = useState(null);
  const [playingAlertId, setPlayingAlertId] = useState(null);
  const [audioNotice, setAudioNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  const audioRef = useRef(null);

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (categoryFilter !== "ALL" && alert.category !== categoryFilter) {
      return false;
    }
    if (
      sectorFilter !== "ALL" &&
      !(alert.sector_name || "").includes(sectorFilter)
    ) {
      return false;
    }
    return true;
  });

  const handleTogglePlay = async (e, alert) => {
    e.stopPropagation();
    setSelectedAlertId(alert.id);
    setAudioNotice("");

    // If clicking the currently playing alert, pause it
    if (playingAlertId === alert.id && audioRef.current) {
      audioRef.current.pause();
      setPlayingAlertId(null);
      return;
    }

    if (!alert.audio_url) {
      setPlayingAlertId(null);
      setAudioNotice(
        `No audio file attached to alert #${alert.id} yet (mock mode). Real backend clips will play from audio_url.`
      );
      return;
    }

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setPlayingAlertId(null);
        audioRef.current.onerror = () => {
          setPlayingAlertId(null);
          setAudioNotice("Could not load audio clip. Check backend /static/clips path.");
        };
      }

      const fullUrl = alert.audio_url.startsWith("http")
        ? alert.audio_url
        : `http://localhost:8000${alert.audio_url}`;

      audioRef.current.src = fullUrl;
      await audioRef.current.play();
      setPlayingAlertId(alert.id);
    } catch {
      setPlayingAlertId(null);
      setAudioNotice("Browser blocked playback or audio stream unavailable.");
    }
  };

  const handleTriage = async (e, alertId, nextStatus) => {
    e.stopPropagation();
    if (!onUpdateAlertStatus || busyId === alertId) return;
    setBusyId(alertId);
    try {
      await onUpdateAlertStatus(alertId, nextStatus);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="h-full bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
      {/* Header & Filters */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Real-Time Acoustic Alert Feed
            </h2>
            <p className="text-xs text-slate-400">
              {filteredAlerts.length} of {alerts.length} detections shown
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            3s CLIP EVIDENCE
          </span>
        </div>

        {/* Category & Sector Filter Row */}
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "THREAT", "WILDLIFE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                categoryFilter === cat
                  ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}

          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            aria-label="Filter by sector"
            className="ml-auto bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-md px-2.5 py-1 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Sectors</option>
            <option value="Sector A">Sector A</option>
            <option value="Sector B">Sector B</option>
            <option value="Sector C">Sector C</option>
          </select>
        </div>

        {audioNotice && (
          <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 shrink-0" />
            <span>{audioNotice}</span>
          </div>
        )}
      </div>

      {/* Scrollable Alert List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs text-center px-4">
            No alerts match the selected filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isThreat = alert.category === "THREAT";
            const isSelected = selectedAlertId === alert.id;
            const isPlaying = playingAlertId === alert.id;
            const confidencePct =
              typeof alert.confidence === "number"
                ? `${Math.round(alert.confidence * 100)}%`
                : "—";
            const formattedTime = alert.timestamp
              ? new Date(alert.timestamp).toLocaleTimeString()
              : "—";

            return (
              <div
                key={alert.id}
                onClick={() => {
                  setSelectedAlertId(alert.id);
                  if (onFocusNode && alert.node_id) {
                    onFocusNode(alert.node_id);
                  }
                }}
                className={`rounded-xl border p-3 transition cursor-pointer ${
                  isSelected
                    ? "bg-slate-800/90 border-emerald-500/50"
                    : isThreat && alert.status === "ACTIVE"
                    ? "bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Top Row: Class & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isThreat ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Bird className="w-4 h-4 text-amber-300 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-semibold text-white leading-snug">
                        {alert.detected_class}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{alert.sector_name}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                      ALERT_STATUS_BADGE[alert.status] || ALERT_STATUS_BADGE.ACTIVE
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>

                {/* Middle Row: Confidence, Time, Audio Clip Button */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-emerald-400 font-semibold">
                      {confidencePct} conf
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-[11px] font-mono">
                      <Clock className="w-3 h-3" />
                      {formattedTime}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleTogglePlay(e, alert)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                      isPlaying
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Play Clip
                      </>
                    )}
                  </button>
                </div>

                {/* Triage Action Buttons for ACTIVE Alerts */}
                {alert.status === "ACTIVE" && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/90 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === alert.id}
                      onClick={(e) => handleTriage(e, alert.id, "ACKNOWLEDGED")}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 text-xs font-medium transition disabled:opacity-50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Dispatch Ranger
                    </button>

                    <button
                      type="button"
                      disabled={busyId === alert.id}
                      onClick={(e) => handleTriage(e, alert.id, "FALSE_ALARM")}
                      className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      False Alarm
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}