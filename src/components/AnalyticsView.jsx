import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { ShieldAlert, Radio, Sparkles, RefreshCw } from "lucide-react";
import { apiClient } from "../api/client";

export default function AnalyticsView({ nodes = [], alerts = [] }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAnalytics();
      setSummary(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, alerts.length]);

  const activeNodesCount =
    nodes.length > 0 ? nodes.length : summary?.kpis?.active_nodes ?? 0;
  const threatsBlockedCount = summary?.kpis?.threats_blocked ?? 0;
  const avgConfidencePct =
    typeof summary?.kpis?.avg_confidence === "number"
      ? `${Math.round(summary.kpis.avg_confidence * 100)}%`
      : "—";

  const byClassData = summary?.by_class || [];
  const trendsData = summary?.trends || [];

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-base font-semibold text-white">
            Biodiversity & Threat Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Aggregated acoustic detections, threat categories, and ecological call trends
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh Summary"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Active Acoustic Nodes</div>
            <div className="text-2xl font-bold text-white mt-1">
              {activeNodesCount}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              Online across monitored sectors
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Threats Logged / Blocked</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">
              {threatsBlockedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Chainsaws, gunshots & heavy vehicles
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Avg. AI Confidence</div>
            <div className="text-2xl font-bold text-amber-300 mt-1">
              {avgConfidencePct}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Sliding-window verified detections
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Class Breakdown Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-1">
            Detections by Acoustic Class
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Comparison of human threat sounds vs. wildlife vocalizations
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byClassData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="detected_class"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Detections"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trends Over Time Area Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-1">
            Threat vs. Wildlife Activity Over Time
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Hourly acoustic event distribution across monitored sectors
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area
                  type="monotone"
                  dataKey="wildlife"
                  name="Wildlife Calls"
                  stroke="#facc15"
                  fill="#facc15"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="threats"
                  name="Threat Detections"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}