import { INITIAL_NODES, INITIAL_ALERTS, MOCK_ANALYTICS } from "./mockData";

export const USE_MOCK = true;
const API_BASE = "http://localhost:8000";
const WS_URL = "ws://localhost:8000/ws/live-alerts";

let mockNodes = structuredClone(INITIAL_NODES);
let mockAlerts = structuredClone(INITIAL_ALERTS);
let mockListeners = [];

function notifyMockListeners(event) {
  mockListeners.forEach((cb) => cb(event));
}

export const apiClient = {
  async getNodes() {
    if (USE_MOCK) return structuredClone(mockNodes);
    const res = await fetch(`${API_BASE}/api/nodes`);
    return res.json();
  },

  async getAlerts(filters = {}) {
    if (USE_MOCK) {
      return mockAlerts.filter((a) => {
        if (filters.category && filters.category !== "ALL" && a.category !== filters.category) return false;
        if (filters.sector && filters.sector !== "ALL" && !a.sector_name.includes(filters.sector)) return false;
        return true;
      });
    }
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/api/alerts?${params}`);
    return res.json();
  },

  async getAnalytics() {
    if (USE_MOCK) return structuredClone(MOCK_ANALYTICS);
    const res = await fetch(`${API_BASE}/api/analytics/summary`);
    return res.json();
  },

  async updateAlertStatus(alertId, status) {
    if (USE_MOCK) {
      const alert = mockAlerts.find((a) => a.id === alertId);
      if (alert) {
        alert.status = status;
        const node = mockNodes.find((n) => n.node_id === alert.node_id);
        if (node) {
          node.status = status === "ACKNOWLEDGED" ? "ACKNOWLEDGED" : "NORMAL";
        }
        notifyMockListeners({
          type: "ALERT_UPDATED",
          alert: structuredClone(alert),
          node: structuredClone(node),
        });
      }
      return alert;
    }
    const res = await fetch(`${API_BASE}/api/alerts/${alertId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async triggerSimulation(node_id, event_type) {
    if (USE_MOCK) {
      const node = mockNodes.find((n) => n.node_id === node_id);
      if (!node) return;
      const isThreat = ["chainsaw", "gunshot", "vehicle"].includes(event_type.toLowerCase());
      const label = event_type.charAt(0).toUpperCase() + event_type.slice(1);
      const newAlert = {
        id: Date.now(),
        node_id,
        sector_name: node.sector_name,
        detected_class: label,
        category: isThreat ? "THREAT" : "WILDLIFE",
        confidence: 0.94,
        timestamp: new Date().toISOString(),
        audio_url: "",
        status: "ACTIVE",
      };
      node.status = isThreat ? "THREAT" : "WILDLIFE";
      node.last_confidence = 0.94;
      node.detected_class = label;
      node.last_updated = newAlert.timestamp;
      mockAlerts = [newAlert, ...mockAlerts];

      notifyMockListeners({
        type: "NEW_ALERT",
        alert: structuredClone(newAlert),
        node: structuredClone(node),
      });
      return newAlert;
    }
    const res = await fetch(`${API_BASE}/api/simulate/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ node_id, event_type }),
    });
    return res.json();
  },

  async resetSimulation() {
    if (USE_MOCK) {
      mockNodes = mockNodes.map((n) => ({
        ...n,
        status: "NORMAL",
        detected_class: "Ambient Forest",
        last_confidence: 0.95,
        last_updated: new Date().toISOString(),
      }));
      notifyMockListeners({
        type: "NODES_RESET",
        nodes: structuredClone(mockNodes),
      });
      return { ok: true };
    }
    const res = await fetch(`${API_BASE}/api/simulate/reset`, { method: "POST" });
    return res.json();
  },

  connectLiveStream({ onStatusChange, onMessage }) {
    if (USE_MOCK) {
      onStatusChange("connected");
      mockListeners.push(onMessage);
      return () => {
        mockListeners = mockListeners.filter((cb) => cb !== onMessage);
      };
    }

    let ws;
    let reconnectTimer;
    let isClosed = false;

    const connect = () => {
      onStatusChange("connecting");
      ws = new WebSocket(WS_URL);
      ws.onopen = () => onStatusChange("connected");
      ws.onmessage = (event) => {
        try {
          onMessage(JSON.parse(event.data));
        } catch (err) {
          console.error("Invalid WS payload:", err);
        }
      };
      ws.onclose = () => {
        onStatusChange("disconnected");
        if (!isClosed) reconnectTimer = setTimeout(connect, 2500);
      };
    };

    connect();
    return () => {
      isClosed = true;
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  },
};