import React, { useEffect, useState, useRef } from "react";
import { sendEvent } from "./services/api";
import { WIDGET_REGISTRY } from "./widgets/registry.jsx";
import { WIDGET_RENDERERS } from "./widgets/renderers";

/* ─── Icon SVG ────────────────────────────────────────── */
const Ico = ({ d, size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  plus:    "M12 5v14M5 12h14",
  x:       "M18 6L6 18M6 6l12 12",
  grid:    "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  drag:    "M9 3h6M9 12h6M9 21h6M3 3h.01M3 12h.01M3 21h.01M21 3h.01M21 12h.01M21 21h.01",
  settings:"M12 15a3 3 0 100-6 3 3 0 000 6z",
  download:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  home:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
};

/* ─── Realtime widget IDs (show live badge) ──────────── */
const REALTIME_WIDGETS = new Set(["concurrent_users", "total_events_bar", "composed_overview", "kpi_cards"]);

/* ─── Default starting dashboard ─────────────────────── */
const DEFAULT_WIDGETS = [
  { instanceId: "w1", id: "kpi_cards",        title: "Key Metrics",                 colSpan: 2 },
  { instanceId: "w2", id: "concurrent_users",  title: "Concurrent Users (Real-time)", colSpan: 2 },
  { instanceId: "w3", id: "conversion_funnel", title: "Conversion Funnel",           colSpan: 1 },
  { instanceId: "w4", id: "platform_pie",      title: "Platform Breakdown",          colSpan: 1 },
  { instanceId: "w5", id: "session_line",      title: "Session Trend",               colSpan: 2 },
  { instanceId: "w6", id: "composed_overview",  title: "Events + Users Combo",       colSpan: 2 },
  { instanceId: "w7", id: "radial_goals",      title: "Goal Progress",               colSpan: 1 },
  { instanceId: "w8", id: "scatter_engagement", title: "Engagement Scatter",         colSpan: 1 },
];

/* ─── Read-only card for fixed tab views ─────────────── */
function TabCard({ id, title, colSpan = 1, metrics }) {
  const Renderer   = WIDGET_RENDERERS[id];
  const isRealtime = REALTIME_WIDGETS.has(id);
  return (
    <div className="ga-card widget-enter" style={{ gridColumn: `span ${colSpan}`, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 18px 10px", borderBottom: "1px solid #f1f3f4" }}>
        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#202124" }}>{title}</div>
        {isRealtime && (
          <div className="ga-realtime-badge" style={{ fontSize: "0.65rem", padding: "2px 7px" }}>
            <span className="live-dot" style={{ width: 6, height: 6, background: "#137333", borderRadius: "50%", display: "inline-block" }} />
            Live
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: "16px 18px 18px" }}>
        {Renderer
          ? <Renderer metrics={metrics} height={220} />
          : <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#80868b" }}>Widget not found</div>}
      </div>
    </div>
  );
}

/* ─── Widget Card Wrapper ────────────────────────────────── */
function WidgetCard({ widget, metrics, onRemove, onColSpanChange }) {
  const Renderer   = WIDGET_RENDERERS[widget.id];
  const isWide     = widget.colSpan === 2;
  const isRealtime = REALTIME_WIDGETS.has(widget.id);

  return (
    <div
      className="ga-card widget-enter"
      style={{
        gridColumn: `span ${widget.colSpan}`,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px 10px", borderBottom: "1px solid #f1f3f4",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#202124" }}>
            {widget.title}
          </div>
          {isRealtime && (
            <div className="ga-realtime-badge" style={{ fontSize: "0.65rem", padding: "2px 7px" }}>
              <span className="live-dot" style={{ width: 6, height: 6, background: "#137333", borderRadius: "50%", display: "inline-block" }} />
              Live
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {/* Width toggle */}
          <button
            title={isWide ? "Collapse to half width" : "Expand to full width"}
            onClick={() => onColSpanChange(widget.instanceId, isWide ? 1 : 2)}
            style={{
              background: "none", border: "1px solid #e8eaed", borderRadius: 4,
              padding: "3px 8px", cursor: "pointer", fontSize: "0.7rem",
              color: "#5f6368", fontWeight: 600, transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f1f3f4"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            {isWide ? "½ width" : "Full width"}
          </button>

          {/* Remove */}
          <button
            title="Remove widget"
            onClick={() => onRemove(widget.instanceId)}
            style={{
              background: "none", border: "1px solid #e8eaed", borderRadius: 4,
              width: 26, height: 26, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fce8e6"; e.currentTarget.style.borderColor = "#ea4335"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#e8eaed"; }}
          >
            <Ico d={ICONS.x} size={13} color="#5f6368" />
          </button>
        </div>
      </div>

      {/* Chart body */}
      <div style={{ flex: 1, padding: "16px 18px 18px", minHeight: 0 }}>
        {Renderer ? (
          <Renderer metrics={metrics} height={220} />
        ) : (
          <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#80868b", fontSize: "0.82rem" }}>
            Widget not found
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Add Widget Panel (slide-over) ──────────────────── */
function AddWidgetPanel({ open, onClose, onAdd }) {
  const [search, setSearch] = useState("");

  const filtered = WIDGET_REGISTRY.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.description.toLowerCase().includes(search.toLowerCase()) ||
    w.tags.some(t => t.includes(search.toLowerCase()))
  );

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
          zIndex: 200, backdropFilter: "blur(3px)",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0, width: 400,
        background: "#fff", zIndex: 201, boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column", animation: "slideInRight 0.25s ease",
      }}>
        {/* Header */}
        <div style={{ padding: "22px 24px", borderBottom: "1px solid #e8eaed", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fa" }}>
          <div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#202124", margin: 0 }}>📦 Widget Library</h2>
            <p style={{ fontSize: "0.75rem", color: "#5f6368", margin: "3px 0 0" }}>{WIDGET_REGISTRY.length} widgets available · click to add</p>
          </div>
          <button onClick={onClose} style={{ background: "#f1f3f4", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico d={ICONS.x} size={16} color="#5f6368" />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid #f1f3f4" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f1f3f4", borderRadius: 24, padding: "8px 14px" }}>
            <Ico d={ICONS.search} size={15} color="#80868b" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search widgets..."
              autoFocus
              style={{ background: "none", border: "none", outline: "none", fontSize: "0.85rem", color: "#202124", flex: 1 }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <Ico d={ICONS.x} size={13} color="#80868b" />
              </button>
            )}
          </div>
        </div>

        {/* Widget list — always allow adding (multiple instances OK) */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(w => (
            <div
              key={w.id}
              onClick={() => { onAdd(w); onClose(); }}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 10,
                border: "1px solid #e8eaed",
                cursor: "pointer",
                transition: "all 0.15s",
                background: "#fff",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f0f6ff"; e.currentTarget.style.borderColor = "#1a73e8"; e.currentTarget.style.transform = "translateX(2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e8eaed"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ fontSize: "1.8rem", width: 44, textAlign: "center", flexShrink: 0 }}>{w.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#202124" }}>{w.name}</div>
                  {REALTIME_WIDGETS.has(w.id) && (
                    <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#137333", background: "#e6f4ea", padding: "1px 6px", borderRadius: 8 }}>LIVE</span>
                  )}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#5f6368", marginTop: 2 }}>{w.description}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  {w.tags.map(t => (
                    <span key={t} style={{ fontSize: "0.65rem", fontWeight: 600, color: "#1a73e8", background: "#e8f0fe", padding: "2px 7px", borderRadius: 10 }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ico d={ICONS.plus} size={15} color="#1a73e8" />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "50px 0", color: "#80868b", fontSize: "0.85rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>🔍</div>
              No widgets match "<strong>{search}</strong>"
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #e8eaed", fontSize: "0.72rem", color: "#80868b", background: "#f8f9fa" }}>
          💡 <strong>Tip:</strong> You can add the same widget multiple times. Use the width toggle on each card to resize.
        </div>
      </div>
    </>
  );
}

/* ─── MAIN DASHBOARD ──────────────────────────────────── */
export default function Dashboard() {
  const [widgets,    setWidgets]    = useState(DEFAULT_WIDGETS);
  const [panelOpen,  setPanelOpen]  = useState(false);
  const [activeTab,  setActiveTab]  = useState("overview");
  const [propOpen,   setPropOpen]   = useState(false);
  const [dateOpen,   setDateOpen]   = useState(false);
  const [dateRange,  setDateRange]  = useState("Last 7 Days");
  const [selectedProp, setSelectedProp] = useState("My Analytics App");
  const [metrics,    setMetrics]    = useState({ total_events: 0, active_users: 0, records: [] });

  /* Generate a persistent anonymous device ID for real user tracking */
  const [deviceId] = useState(() => {
    let id = localStorage.getItem("ga_device_id");
    if (!id) {
      id = "usr_" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem("ga_device_id", id);
    }
    return id;
  });

  const PROPERTIES = [
    { name: "My Analytics App", id: "P-001", type: "Web + App" },
    { name: "Marketing Site",   id: "P-002", type: "Web"      },
    { name: "Mobile App (iOS)", id: "P-003", type: "App"      },
  ];

  /* Live Data: WebSocket Connection */
  useEffect(() => {
    const socket = new WebSocket("wss://u1h0vk7jv8.execute-api.ap-south-1.amazonaws.com/prod");

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("LIVE DATA:", data);

      if (data.payload) {
        setMetrics(data.payload); // 🔥 update UI
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => socket.close(); // 🔥 cleanup
  }, []);

  /* 🔥 AUTO EVENT GENERATOR */
  useEffect(() => {
    const events = ["page_view", "click", "purchase"];

    const interval = setInterval(() => {
      const randomEvent =
        events[Math.floor(Math.random() * events.length)];

      const userId = "user_" + Math.floor(Math.random() * 1000);

      sendEvent(userId, randomEvent);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  /* Widget actions */
  const addWidget = (registryEntry) => {
    setWidgets(prev => [
      ...prev,
      {
        instanceId: `w_${Date.now()}`,
        id:      registryEntry.id,
        title:   registryEntry.name,
        colSpan: 1,
      },
    ]);
  };

  const removeWidget = (instanceId) =>
    setWidgets(prev => prev.filter(w => w.instanceId !== instanceId));

  const setColSpan = (instanceId, span) =>
    setWidgets(prev => prev.map(w => w.instanceId === instanceId ? { ...w, colSpan: span } : w));

  const resetDashboard = () => setWidgets(DEFAULT_WIDGETS);

  const exportCSV = () => {
    const csv = "time_bucket,active_users,total_events\n"
      + metrics.records.map(r => `${r.time_bucket},${r.active_users},${r.total_events}`).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `analytics_${Date.now()}.csv`;
    a.click();
  };

  /* activeIds kept for future use (e.g. limits), not used to block adding */

  /* ─── Tab views — curated widget grids per page ─────── */
  const TAB_VIEWS = {
    realtime:  [
      { id: "kpi_cards",        title: "Key Metrics",           colSpan: 2 },
      { id: "concurrent_users", title: "Live Concurrent Users",  colSpan: 2 },
      { id: "composed_overview",title: "Events + Users Overlay", colSpan: 2 },
      { id: "error_rate",       title: "Error Rate Monitor",     colSpan: 1 },
      { id: "total_events_bar", title: "Event Volume",           colSpan: 1 },
    ],
    funnels: [
      { id: "conversion_funnel",title: "Conversion Funnel",      colSpan: 2 },
      { id: "top_events_bar",   title: "Top Event Types",        colSpan: 1 },
      { id: "radial_goals",     title: "Goal Progress",          colSpan: 1 },
    ],
    retention: [
      { id: "retention_heatmap",title: "Cohort Retention Heatmap", colSpan: 2 },
      { id: "session_line",     title: "Day-1 vs Day-7 Retention", colSpan: 2 },
    ],
    segments: [
      { id: "platform_pie",      title: "Platform Breakdown",    colSpan: 1 },
      { id: "user_growth",       title: "New vs Returning Users", colSpan: 1 },
      { id: "scatter_engagement",title: "Engagement Depth",      colSpan: 1 },
      { id: "radial_goals",      title: "Segment Goals",         colSpan: 1 },
    ],
    traffic: [
      { id: "top_pages",    title: "Top Pages",        colSpan: 2 },
      { id: "user_growth", title: "User Growth Trend", colSpan: 2 },
      { id: "session_line",title: "Traffic Trend",     colSpan: 2 },
    ],
    engagement: [
      { id: "scatter_engagement",title: "Session Depth",        colSpan: 2 },
      { id: "session_line",      title: "Session Trend",        colSpan: 1 },
      { id: "error_rate",        title: "Error Rate",           colSpan: 1 },
      { id: "radial_goals",      title: "Engagement Goals",     colSpan: 2 },
    ],
    geography: [
      { id: "top_countries", title: "Top Countries by Sessions", colSpan: 2 },
      { id: "region_pie",    title: "Traffic by Region",         colSpan: 1 },
      { id: "user_growth",   title: "Geographic Growth Trend",   colSpan: 1 },
    ],
  };

  const TAB_META = {
    overview:    { label: "My Dashboard",  emoji: "🧩", sub: `${widgets.length} widget${widgets.length !== 1 ? "s" : ""} · customizable` },
    realtime:    { label: "Realtime",      emoji: "⚡", sub: "Live stream · updates every 2s" },
    funnels:     { label: "Funnels",       emoji: "🔻", sub: "Conversion analysis · all users" },
    retention:   { label: "Retention",     emoji: "🔁", sub: "Cohort analysis · Day 0 – Day 7" },
    segments:    { label: "Segments",      emoji: "🍩", sub: "Platform & user breakdowns" },
    traffic:     { label: "Traffic",       emoji: "📈", sub: "Session sources & growth" },
    engagement:  { label: "Engagement",    emoji: "💬", sub: "Session depth & interaction" },
    geography:   { label: "Geography",     emoji: "🌍", sub: "Traffic by country & region" },
  };

  const curMeta = TAB_META[activeTab] || TAB_META.overview;

  /* ─── NAV ──────────────────────────────────────────── */
  const navSections = [
    {
      label: "Reports",
      items: [
        { id: "overview",   icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10", label: "Overview"  },
        { id: "realtime",   icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",                             label: "Realtime"  },
        { id: "funnels",    icon: "M22 3H2l8 9.46V19l4 2V12.46L22 3z",                           label: "Funnels"   },
        { id: "retention",  icon: "M17 1l4 4-4 4 M3 11V9a4 4 0 014-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 01-4 4H3", label: "Retention" },
        { id: "segments",   icon: "M21.21 15.89A10 10 0 118 2.83 M22 12A10 10 0 0012 2v10z",     label: "Segments"  },
      ],
    },
    {
      label: "Acquisition",
      items: [
        { id: "traffic",    icon: "M23 6l-9.5 9.5-5-5L1 18",                                     label: "Traffic"    },
        { id: "engagement", icon: "M18 20V10M12 20V4M6 20v-6",                                    label: "Engagement" },
        { id: "geography",  icon: "M12 2a10 10 0 100 20A10 10 0 0012 2z M2 12h20 M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20", label: "Geography" },
      ],
    },
  ];

  /* ─── RENDER ────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8f9fa", fontFamily: "'Google Sans','Roboto',sans-serif" }}>

      {/* ══ SIDEBAR ════════════════════════════════════ */}
      <aside className="ga-sidebar">
        {/* Logo — clicking resets to overview */}
        <div
          onClick={() => setActiveTab("overview")}
          style={{ padding: "18px 20px", borderBottom: "1px solid #e8eaed", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <div style={{ display: "flex", gap: 3 }}>
            {["#4285f4","#34a853","#fbbc04","#ea4335"].map((c,i) => (
              <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:c }} />
            ))}
          </div>
          <span style={{ fontWeight:700, fontSize:"0.92rem", color:"#202124" }}>Analytics</span>
          <span style={{ fontSize:"0.72rem", color:"#1a73e8", fontWeight:600, background:"#e8f0fe", padding:"2px 8px", borderRadius:12 }}>Pro</span>
        </div>

        {/* Property selector — interactive dropdown */}
        <div style={{ padding:"12px 16px", borderBottom:"1px solid #e8eaed", position:"relative" }}>
          <div
            onClick={() => setPropOpen(o => !o)}
            style={{ background:"#f1f3f4", borderRadius:6, padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between",
              outline: propOpen ? "2px solid #1a73e8" : "none",
            }}
          >
            <div>
              <div style={{ fontSize:"0.7rem", color:"#80868b", fontWeight:500 }}>Property</div>
              <div style={{ fontSize:"0.82rem", color:"#202124", fontWeight:600, marginTop:1 }}>{selectedProp}</div>
            </div>
            <span style={{ color:"#5f6368", fontSize:11, transition:"transform 0.2s", display:"inline-block", transform: propOpen ? "rotate(180deg)" : "none" }}>▼</span>
          </div>

          {/* Dropdown */}
          {propOpen && (
            <>
              {/* Click-outside overlay */}
              <div onClick={() => setPropOpen(false)} style={{ position:"fixed", inset:0, zIndex:49 }} />
              <div style={{
                position:"absolute", top:"calc(100% - 4px)", left:12, right:12,
                background:"#fff", borderRadius:8, boxShadow:"0 4px 20px rgba(0,0,0,0.15)",
                border:"1px solid #e8eaed", zIndex:50, overflow:"hidden",
                animation: "widgetEnter 0.15s ease",
              }}>
                <div style={{ padding:"8px 12px", fontSize:"0.68rem", fontWeight:700, color:"#80868b", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #f1f3f4" }}>
                  Switch Property
                </div>
                {PROPERTIES.map(p => (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedProp(p.name); setPropOpen(false); }}
                    style={{
                      padding:"10px 14px", cursor:"pointer",
                      background: selectedProp === p.name ? "#e8f0fe" : "transparent",
                      borderLeft: selectedProp === p.name ? "3px solid #1a73e8" : "3px solid transparent",
                      transition:"background 0.12s",
                    }}
                    onMouseEnter={e => { if (selectedProp !== p.name) e.currentTarget.style.background = "#f8f9fa"; }}
                    onMouseLeave={e => { if (selectedProp !== p.name) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ fontSize:"0.82rem", fontWeight:600, color: selectedProp === p.name ? "#1a73e8" : "#202124" }}>{p.name}</div>
                    <div style={{ fontSize:"0.7rem", color:"#80868b", marginTop:1 }}>{p.id} · {p.type}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"8px 0", overflowY:"auto" }}>
          {navSections.map(sec => (
            <div key={sec.label}>
              <div className="ga-nav-section">{sec.label}</div>
              {sec.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    className={`ga-nav-item${isActive ? " active" : ""}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Ico d={item.icon} size={16} color={isActive ? "#1a73e8" : "#5f6368"} />
                    {item.label}
                    {item.id === "realtime" && (
                      <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: "#137333", display: "inline-block", animation: "pulse 2s infinite" }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Live badge */}
        <div style={{ padding:"16px 20px", borderTop:"1px solid #e8eaed" }}>
          <div className="ga-realtime-badge" style={{ marginBottom:10 }}>
            <span className="live-dot" style={{ width:7, height:7, background:"#137333", borderRadius:"50%", display:"inline-block" }} />
            Live · 2s refresh
          </div>
          <div style={{ fontSize:"0.72rem", color:"#80868b" }}>
            {metrics.records.length} data points
          </div>
        </div>
      </aside>

      {/* ══ MAIN ═══════════════════════════════════════ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Topbar */}
        <header className="ga-topbar">
          <div style={{ flex:1 }}>
            <h1 style={{ fontSize:"1.05rem", fontWeight:700, color:"#202124", margin:0 }}>
              {curMeta.emoji} {curMeta.label}
            </h1>
            <p style={{ fontSize:"0.72rem", color:"#5f6368", margin:0 }}>{curMeta.sub}</p>
          </div>

          {/* Dynamic Date range dropdown */}
          <div style={{ position: "relative" }}>
            <button 
              className="ga-date-pill" 
              onClick={() => setDateOpen(o => !o)}
              style={{ fontSize:"0.78rem" }}
            >
              📅 {dateRange} ▼
            </button>
            {dateOpen && (
              <>
                <div onClick={() => setDateOpen(false)} style={{ position:"fixed", inset:0, zIndex:49 }} />
                <div style={{
                  position:"absolute", top:"calc(100% + 4px)", right:0,
                  background:"#fff", borderRadius:8, boxShadow:"0 4px 20px rgba(0,0,0,0.15)",
                  border:"1px solid #e8eaed", zIndex:50, overflow:"hidden",
                  minWidth: 160,
                  animation: "widgetEnter 0.15s ease",
                }}>
                  {["Today", "Last 7 Days", "Last 30 Days", "Year to Date", "All Time"].map(range => (
                    <div
                      key={range}
                      onClick={() => { setDateRange(range); setDateOpen(false); }}
                      style={{
                        padding:"10px 14px", cursor:"pointer", fontSize:"0.82rem", fontWeight:500,
                        background: dateRange === range ? "#e8f0fe" : "transparent",
                        color: dateRange === range ? "#1a73e8" : "#202124",
                        transition:"background 0.12s",
                      }}
                      onMouseEnter={e => { if (dateRange !== range) e.currentTarget.style.background = "#f8f9fa"; }}
                      onMouseLeave={e => { if (dateRange !== range) e.currentTarget.style.background = "transparent"; }}
                    >
                      {range}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Reset — globally available, resets widgets and brings you to overview */}
          <button 
            onClick={() => { setActiveTab("overview"); resetDashboard(); }} 
            className="ga-date-pill" 
            title="Reset to default layout" 
            style={{ fontSize:"0.78rem" }}
          >
            <Ico d={ICONS.refresh} size={14} color="#5f6368" />
            Reset Layout
          </button>

          {/* Export */}
          <button className="ga-btn-primary" onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <Ico d={ICONS.download} size={14} color="#fff" />
            Export CSV
          </button>

          {/* Add Widget — globally visible, switches to overview if clicked */}
          <button
            onClick={() => { setActiveTab("overview"); setPanelOpen(true); }}
            style={{
              display:"flex", alignItems:"center", gap:8,
              background:"#202124", color:"#fff", border:"none",
              borderRadius:4, padding:"8px 18px", fontSize:"0.875rem",
              fontWeight:600, cursor:"pointer", fontFamily:"inherit",
              transition:"background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background="#3c4043"}
            onMouseLeave={e => e.currentTarget.style.background="#202124"}
          >
            <Ico d={ICONS.plus} size={16} color="#fff" />
            Add Widget
          </button>
        </header>

        {/* Dashboard canvas */}
        <main style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>

          {/* ── Overview: custom widget builder ── */}
          {activeTab === "overview" && (
            widgets.length === 0 ? (
              <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
                <div style={{ fontSize:"3rem" }}>📊</div>
                <h3 style={{ fontSize:"1.1rem", fontWeight:600, color:"#202124" }}>Your dashboard is empty</h3>
                <p style={{ fontSize:"0.85rem", color:"#5f6368" }}>Click <strong>Add Widget</strong> to start building.</p>
                <button onClick={() => setPanelOpen(true)} className="ga-btn-primary" style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 24px" }}>
                  <Ico d={ICONS.plus} size={16} color="#fff" /> Add Widget
                </button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, alignItems:"start" }}>
                {widgets.map(widget => (
                  <WidgetCard key={widget.instanceId} widget={widget} metrics={metrics} onRemove={removeWidget} onColSpanChange={setColSpan} />
                ))}
              </div>
            )
          )}

          {/* ── Fixed report tabs (all nav tabs except overview) ── */}
          {activeTab !== "overview" && TAB_VIEWS[activeTab] && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, alignItems:"start" }}>
              {TAB_VIEWS[activeTab].map((w, i) => (
                <TabCard key={i} id={w.id} title={w.title} colSpan={w.colSpan} metrics={metrics} />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* ══ Add Widget Panel ═══════════════════════════ */}
      <AddWidgetPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onAdd={addWidget}
      />
    </div>
  );
}
