import { useEffect, useState, useCallback, useRef } from "react";
import { apiClient } from "./api/client";
import Navbar from "./components/Navbar";
import ForestMap from "./components/ForestMap";
import AlertFeed from "./components/AlertFeed";
import DemoPanel from "./components/DemoPanel";
import AnalyticsView from "./components/AnalyticsView";

function playThreatChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(740, ctx.currentTime);
    osc.frequency.setValueAtTime(520, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.32);
    osc.onended = () => ctx.close();
  } catch {
    // Ignore if browser blocks audio before user gesture
  }
}

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [wsStatus, setWsStatus] = useState("connecting");
  const [activeTab, setActiveTab] = useState("command");
  const [alarmMuted, setAlarmMuted] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const alarmMutedRef = useRef(alarmMuted);
  useEffect(() => {
    alarmMutedRef.current = alarmMuted;
  }, [alarmMuted]);

  // Hydrate initial nodes & alerts
  useEffect(() => {
    apiClient.getNodes().then(setNodes);
    apiClient.getAlerts().then(setAlerts);
  }, []);

  // Handle incoming WebSocket events
  const handleLiveMessage = useCallback((msg) => {
    if (msg.type === "NEW_ALERT") {
      setAlerts((prev) => [msg.alert, ...prev]);
      if (msg.node) {
        setNodes((prev) =>
          prev.map((n) => (n.node_id === msg.node.node_id ? msg.node : n))
        );
      }
      if (msg.alert?.category === "THREAT" && !alarmMutedRef.current) {
        playThreatChime();
      }
    } else if (msg.type === "ALERT_UPDATED") {
      setAlerts((prev) =>
        prev.map((a) => (a.id === msg.alert.id ? msg.alert : a))
      );
      if (msg.node) {
        setNodes((prev) =>
          prev.map((n) => (n.node_id === msg.node.node_id ? msg.node : n))
        );
      }
    } else if (msg.type === "NODES_RESET" && msg.nodes) {
      setNodes(msg.nodes);
    }
  }, []);

  useEffect(() => {
    const disconnect = apiClient.connectLiveStream({
      onStatusChange: setWsStatus,
      onMessage: handleLiveMessage,
    });
    return disconnect;
  }, [handleLiveMessage]);

  const handleUpdateAlertStatus = useCallback(async (alertId, nextStatus) => {
    await apiClient.updateAlertStatus(alertId, nextStatus);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: nextStatus } : a))
    );
  }, []);

  const handleTriggerSimulation = useCallback(async (nodeId, eventType) => {
    await apiClient.triggerSimulation(nodeId, eventType);
  }, []);

  const handleResetSimulation = useCallback(async () => {
    await apiClient.resetSimulation();
  }, []);

  const activeThreatCount = alerts.filter(
    (a) => a.category === "THREAT" && a.status === "ACTIVE"
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        wsStatus={wsStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alarmMuted={alarmMuted}
        setAlarmMuted={setAlarmMuted}
        activeThreatCount={activeThreatCount}
      />

      <main className="flex-1 p-4">
        {activeTab === "command" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-6rem)]">
            <section className="lg:col-span-8 h-full min-h-[420px]">
              <ForestMap
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={setSelectedNodeId}
              />
            </section>
            <aside className="lg:col-span-4 h-full min-h-[380px]">
              <AlertFeed
                alerts={alerts}
                onUpdateAlertStatus={handleUpdateAlertStatus}
                onFocusNode={setSelectedNodeId}
              />
            </aside>
          </div>
        ) : (
          <AnalyticsView nodes={nodes} alerts={alerts} />
        )}
      </main>

      <DemoPanel
        onTriggerSimulation={handleTriggerSimulation}
        onResetSimulation={handleResetSimulation}
      />
    </div>
  );
}