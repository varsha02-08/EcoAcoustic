export const INITIAL_NODES = [
  {
    node_id: "NODE_01",
    sector_name: "Sector A — North Ridge",
    lat: 12.9784,
    lng: 77.5946,
    status: "NORMAL", // "NORMAL" | "WILDLIFE" | "THREAT" | "ACKNOWLEDGED"
    last_confidence: 0.96,
    detected_class: "Ambient Forest / Wind",
    last_updated: "2026-11-19T16:40:00Z",
  },
  {
    node_id: "NODE_02",
    sector_name: "Sector B — River Valley",
    lat: 12.9716,
    lng: 77.6032,
    status: "WILDLIFE",
    last_confidence: 0.89,
    detected_class: "Asian Elephant Call",
    last_updated: "2026-11-19T16:42:10Z",
  },
  {
    node_id: "NODE_03",
    sector_name: "Sector C — Timber Buffer",
    lat: 12.9652,
    lng: 77.5891,
    status: "NORMAL",
    last_confidence: 0.94,
    detected_class: "Songbird Chorus",
    last_updated: "2026-11-19T16:41:05Z",
  },
];

export const INITIAL_ALERTS = [
  {
    id: 102,
    node_id: "NODE_02",
    sector_name: "Sector B — River Valley",
    detected_class: "Asian Elephant Call",
    category: "WILDLIFE", // "THREAT" | "WILDLIFE"
    confidence: 0.89,
    timestamp: "2026-11-19T16:42:10Z",
    audio_url: "", // Empty in mock; points to /static/clips/alert_102.wav in production
    status: "ACTIVE", // "ACTIVE" | "ACKNOWLEDGED" | "FALSE_ALARM"
  },
  {
    id: 101,
    node_id: "NODE_03",
    sector_name: "Sector C — Timber Buffer",
    detected_class: "Chainsaw",
    category: "THREAT",
    confidence: 0.93,
    timestamp: "2026-11-19T15:18:44Z",
    audio_url: "",
    status: "ACKNOWLEDGED",
  },
];

export const MOCK_ANALYTICS = {
  kpis: {
    active_nodes: 3,
    threats_blocked: 14,
    avg_confidence: 0.91,
  },
  by_class: [
    { detected_class: "Chainsaw", count: 8 },
    { detected_class: "Gunshot", count: 4 },
    { detected_class: "Heavy Vehicle", count: 2 },
    { detected_class: "Wildlife Calls", count: 39 },
  ],
  trends: [
    { time: "08:00", threats: 1, wildlife: 9 },
    { time: "10:00", threats: 2, wildlife: 12 },
    { time: "12:00", threats: 0, wildlife: 7 },
    { time: "14:00", threats: 3, wildlife: 6 },
    { time: "16:00", threats: 1, wildlife: 11 },
  ],
};