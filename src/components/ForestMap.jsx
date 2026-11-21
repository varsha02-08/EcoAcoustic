import { useEffect, useRef } from "react";
import L from "leaflet";

const STATUS_CONFIG = {
  NORMAL: {
    label: "Normal Monitoring",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    dotClass: "bg-emerald-500 border-emerald-200 eco-dot-normal",
  },
  WILDLIFE: {
    label: "Wildlife Detected",
    badgeClass: "bg-amber-400/20 text-amber-200 border-amber-400/40",
    dotClass: "bg-yellow-400 border-yellow-100",
  },
  THREAT: {
    label: "THREAT DETECTED",
    badgeClass: "bg-rose-500/25 text-rose-200 border-rose-500/50",
    dotClass: "bg-rose-600 border-rose-200 eco-dot-threat",
  },
  ACKNOWLEDGED: {
    label: "Under Investigation",
    badgeClass: "bg-orange-500/20 text-orange-200 border-orange-500/40",
    dotClass: "bg-orange-500 border-orange-100",
  },
};

function createNodeIcon(node) {
  const cfg = STATUS_CONFIG[node.status] || STATUS_CONFIG.NORMAL;
  const shortId = node.node_id.replace("NODE_", "N");

  return L.divIcon({
    className: "eco-marker-wrapper",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20],
    html: `
      <div class="relative flex flex-col items-center justify-center cursor-pointer select-none">
        <div class="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[11px] font-bold text-slate-950 shadow-lg ${cfg.dotClass}">
          ${shortId}
        </div>
        <span class="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-medium text-slate-200 whitespace-nowrap">
          ${node.sector_name.split("—")[0].trim()}
        </span>
      </div>
    `,
  });
}

function formatPopupHtml(node) {
  const cfg = STATUS_CONFIG[node.status] || STATUS_CONFIG.NORMAL;
  const confidencePct =
    typeof node.last_confidence === "number"
      ? `${Math.round(node.last_confidence * 100)}%`
      : "—";
  const updatedTime = node.last_updated
    ? new Date(node.last_updated).toLocaleTimeString()
    : "—";

  return `
    <div class="min-w-[210px] space-y-2 text-xs">
      <div class="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5">
        <span class="font-semibold text-sm text-white">${node.sector_name}</span>
        <span class="text-[10px] font-mono text-slate-400">${node.node_id}</span>
      </div>
      <div>
        <span class="inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${cfg.badgeClass}">
          ${cfg.label}
        </span>
      </div>
      <div class="space-y-1 text-slate-300">
        <div class="flex justify-between">
          <span class="text-slate-400">Latest Sound:</span>
          <span class="font-medium text-white">${node.detected_class || "Ambient"}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">AI Confidence:</span>
          <span class="font-mono font-semibold text-emerald-400">${confidencePct}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Last Update:</span>
          <span class="font-mono text-slate-300">${updatedTime}</span>
        </div>
      </div>
    </div>
  `;
}

export default function ForestMap({ nodes = [], selectedNodeId, onSelectNode }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markersMapRef = useRef({});
  const hasFittedBoundsRef = useRef(false);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = layerGroup;

    // Fix resize calculation when switching tabs or layout changes
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      markersMapRef.current = {};
    };
  }, []);

  // Sync markers whenever nodes change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    markersMapRef.current = {};

    const validCoords = [];

    nodes.forEach((node) => {
      if (typeof node.lat !== "number" || typeof node.lng !== "number") return;
      validCoords.push([node.lat, node.lng]);

      const marker = L.marker([node.lat, node.lng], {
        icon: createNodeIcon(node),
      }).addTo(layerGroup);

      marker.bindPopup(formatPopupHtml(node));
      marker.on("click", () => {
        if (onSelectNode) onSelectNode(node.node_id);
      });

      markersMapRef.current[node.node_id] = marker;
    });

    if (validCoords.length > 0 && !hasFittedBoundsRef.current) {
      map.fitBounds(validCoords, { padding: [50, 50], maxZoom: 15 });
      hasFittedBoundsRef.current = true;
    }
  }, [nodes, onSelectNode]);

  // Open popup if another part of the UI selects a node
  useEffect(() => {
    if (!selectedNodeId) return;
    const marker = markersMapRef.current[selectedNodeId];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedNodeId]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 shadow-lg">
        <div className="font-semibold text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
          Node Status Legend
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
            <span>Wildlife</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping inline-block" />
            <span className="text-rose-300 font-medium">Threat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            <span>Investigating</span>
          </div>
        </div>
      </div>
    </div>
  );
}