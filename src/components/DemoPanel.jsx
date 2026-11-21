import { useState } from "react";
import { Sliders, Zap, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

export default function DemoPanel({ onTriggerSimulation, onResetSimulation }) {
  const [isOpen, setIsOpen] = useState(true);
  const [busyAction, setBusyAction] = useState(null);
  const [feedback, setFeedback] = useState("");

  const handleTrigger = async (actionKey, nodeId, eventType, label) => {
    if (!onTriggerSimulation || busyAction) return;
    setBusyAction(actionKey);
    setFeedback("");
    try {
      await onTriggerSimulation(nodeId, eventType);
      setFeedback(`Triggered ${label}`);
    } catch {
      setFeedback("Failed to trigger simulation");
    } finally {
      setBusyAction(null);
    }
  };

  const handleReset = async () => {
    if (!onResetSimulation || busyAction) return;
    setBusyAction("reset");
    setFeedback("");
    try {
      await onResetSimulation();
      setFeedback("All nodes reset to NORMAL");
    } catch {
      setFeedback("Failed to reset nodes");
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[500] w-80 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl shadow-2xl text-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-300 transition"
      >
        <span className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5" />
          Demo Simulation Control
        </span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-3.5 space-y-2.5 text-xs">
          <p className="text-[11px] text-slate-400">
            Inject test acoustic events into the pipeline for live presentation demos.
          </p>

          <button
            type="button"
            disabled={!!busyAction}
            onClick={() =>
              handleTrigger(
                "chainsaw-b",
                "NODE_02",
                "chainsaw",
                "Chainsaw in Sector B"
              )
            }
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/40 font-medium transition disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              Trigger Chainsaw (Sector B)
            </span>
            <span className="font-mono text-[10px] text-rose-300">NODE_02</span>
          </button>

          <button
            type="button"
            disabled={!!busyAction}
            onClick={() =>
              handleTrigger(
                "gunshot-a",
                "NODE_01",
                "gunshot",
                "Gunshot in Sector A"
              )
            }
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/40 font-medium transition disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              Trigger Gunshot (Sector A)
            </span>
            <span className="font-mono text-[10px] text-rose-300">NODE_01</span>
          </button>

          <button
            type="button"
            disabled={!!busyAction}
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            Reset All Nodes
          </button>

          {feedback && (
            <div className="pt-1 text-[11px] font-mono text-emerald-400 text-center">
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}