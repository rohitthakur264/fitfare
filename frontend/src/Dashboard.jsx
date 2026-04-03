import React, { useEffect, useState, useMemo } from "react";
import { sendEvent, getMetrics } from "./services/api";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line
} from "recharts";

/* ── MOCK DATA ──────────────────────────────────────── */

const retentionData = [
  { cohort: "Mar 27", size: 1240, d1: 94, d2: 82, d3: 76, d4: 65, d5: 58, d6: 45, d7: 42 },
  { cohort: "Mar 28", size: 1390, d1: 92, d2: 85, d3: 79, d4: 70, d5: 64, d6: 52, d7: 48 },
  { cohort: "Mar 29", size: 1420, d1: 96, d2: 88, d3: 82, d4: 75, d5: 66, d6: 59, d7: 50 },
  { cohort: "Mar 30", size: 1530, d1: 95, d2: 86, d3: 74, d4: 68, d5: 62, d6: null, d7: null },
  { cohort: "Mar 31", size: 1680, d1: 98, d2: 90, d3: 84, d4: null, d5: null, d6: null, d7: null },
];

const funnelData = [
  { step: "App Open", val: 5400 },
  { step: "Login", val: 3200 },
  { step: "View Product", val: 2450 },
  { step: "Add to Cart", val: 1800 },
  { step: "Checkout", val: 950 },
  { step: "Purchase", val: 720 },
];

const segmentsData = [
  { name: "iOS", value: 45 },
  { name: "Android", value: 35 },
  { name: "Web", value: 20 },
];

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

/* ── UI COMPONENTS ──────────────────────────────────── */

function Card({ title, subtitle, children, flex = 1, colSpan = 1 }) {
  return (
    <div className="pro-card" style={{ display: "flex", flexDirection: "column", flex, gridColumn: `span ${colSpan}` }}>
      <div style={{ padding: "16px 20px 8px" }}>
        <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "#f8fafc", letterSpacing: "0.2px" }}>{title}</h3>
        {subtitle && <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{subtitle}</span>}
      </div>
      <div style={{ padding: "12px 20px 20px", flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}

function Stat({ label, value, trend, suffix = "" }) {
  const isUp = trend >= 0;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, marginBottom: "4px" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{value}{suffix}</span>
        {trend !== undefined && (
          <span style={{
            fontSize: "0.75rem", fontWeight: 700,
            color: isUp ? "#10b981" : "#ef4444",
            background: isUp ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            padding: "2px 6px", borderRadius: "4px"
          }}>
            {isUp ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ── DASHBOARD ──────────────────────────────────────── */

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ total_events: 0, active_users: 0, last_event: null, records: [] });
  const [activeTab, setActiveTab] = useState("Overview");
  
  // WebSocket Live Connection
  useEffect(() => {
    // Note: We keep the sendEvent loop just to simulate active users for the demo
    const iv = setInterval(() => sendEvent().catch(console.error), 2000);
    
    // Connect to API Gateway WebSocket
    const socket = new WebSocket("wss://<API_ID>.execute-api.ap-south-1.amazonaws.com/prod");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "metrics_update") {
        setMetrics(data.payload);
      }
    };

    return () => {
      clearInterval(iv);
      socket.close();
    };
  }, []);

  const navItems = ["Overview", "Live Stream", "Funnels", "Retention", "Segments"];

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#09090b", color: "#e2e8f0", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        .pro-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .pro-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
          transform: translateY(-2px);
        }
        .pro-card::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .pro-card:hover::after { opacity: 1; }
        
        .logo-hover { transition: opacity 0.2s, transform 0.2s; cursor: pointer; }
        .logo-hover:hover { opacity: 0.8; transform: scale(1.02); }
        
        .nav-item { transition: all 0.2s ease; cursor: pointer; }
        .nav-item:hover { background: rgba(255,255,255,0.05) !important; color: #fff !important; transform: translateX(8px); }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
      
      {/* ── SIDEBAR ── */}
      <div style={{ width: "240px", backgroundColor: "#12121a", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="logo-hover" onClick={() => setActiveTab("Overview")} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #4f46e5, #ec4899)", borderRadius: "6px", boxShadow: "0 0 15px rgba(79,70,229,0.3)" }} />
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff", letterSpacing: "-0.5px" }}>Analytics <span style={{ opacity: 0.8, fontWeight: 400, background: "linear-gradient(90deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pro</span></span>
          </div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1 }}>
          <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: "12px", paddingLeft: "8px" }}>Dashboards</div>
          {navItems.map(nav => (
            <div 
              key={nav}
              className="nav-item"
              onClick={() => setActiveTab(nav)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: activeTab === nav ? "rgba(99,102,241,0.15)" : "transparent",
                color: activeTab === nav ? "#818cf8" : "#94a3b8",
                fontWeight: activeTab === nav ? 600 : 500,
                fontSize: "0.85rem",
                marginBottom: "4px"
              }}
            >
              {nav}
            </div>
          ))}
        </div>
        <div style={{ padding: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: "0.75rem", color: "#64748b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            Polling active (2s)
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* HEADER */}
        <div style={{ height: "64px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "#fff" }}>{activeTab}</h1>
          
          <div style={{ display: "flex", gap: "12px" }}>
            <select style={{ background: "#1e1e2d", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", padding: "6px 12px", borderRadius: "4px", fontSize: "0.8rem", outline: "none" }}>
              <option>Environment: Production</option>
              <option>Environment: Staging</option>
            </select>
            <select style={{ background: "#1e1e2d", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", padding: "6px 12px", borderRadius: "4px", fontSize: "0.8rem", outline: "none" }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Today</option>
            </select>
            <button 
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," 
                  + "time_bucket,total_events,active_users\n" 
                  + metrics.records.map(e => `${e.time_bucket},${e.total_events},${e.active_users}`).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `analytics_export_${new Date().getTime()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              style={{ background: "#6366f1", border: "none", color: "#fff", padding: "6px 16px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
            >
              Export
            </button>
          </div>
        </div>

        {/* SCROLLABLE DASHBOARD AREA */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          
          {(activeTab === "Overview" || activeTab === "Live Stream") && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "20px" }}>
              <Card>
                <Stat label="Total Events" value={metrics.total_events} trend={12} />
              </Card>
              <Card>
                <Stat label="Live Users" value={metrics.active_users || 0} trend={4} />
              </Card>
              <Card>
                <Stat label="Avg Session" value="4m 12s" trend={-2} />
              </Card>
              <Card>
                <Stat label="Conversion Rate" value="13.3" suffix="%" trend={8} />
              </Card>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            
            {/* LIVE EVENT STREAM */}
            {(activeTab === "Overview" || activeTab === "Live Stream") && (
              <Card title="Concurrent Users (Real-time)" subtitle="Updates every 2 seconds" colSpan={activeTab === "Live Stream" ? 3 : 2}>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={metrics.records} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time_bucket" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={30} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc" }} 
                      itemStyle={{ color: "#818cf8" }}
                    />
                    <Area type="monotone" dataKey="active_users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* PLATFORM SEGMENTATION */}
            {(activeTab === "Overview" || activeTab === "Segments") && (
              <Card title="User Segmentation" subtitle="By Platform" colSpan={activeTab === "Segments" ? 3 : 1}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={segmentsData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                      {segmentsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip itemStyle={{ color: "#000" }} contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#f8fafc" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "10px" }}>
                  {segmentsData.map((s, i) => (
                     <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#cbd5e1" }}>
                       <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: COLORS[i] }} />
                       {s.name}
                     </div>
                  ))}
                </div>
              </Card>
            )}

            {/* FUNNEL ANALYSIS */}
            {(activeTab === "Overview" || activeTab === "Funnels") && (
              <Card title="Conversion Funnel" subtitle="Onboarding Flow" colSpan={3}>
                <div style={{ display: "flex", justifyContent: "space-between", height: "200px", alignItems: "flex-end", padding: "20px 40px 0" }}>
                  {funnelData.map((step, i) => {
                    const max = funnelData[0].val;
                    const pct = ((step.val / max) * 100).toFixed(0);
                    const dropoff = i > 0 ? (((funnelData[i-1].val - step.val) / funnelData[i-1].val) * 100).toFixed(1) : null;
                    
                    return (
                      <div key={step.step} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", flex: 1 }}>
                        {dropoff && (
                          <div style={{ position: "absolute", top: "-25px", left: "-50%", width: "100%", textAlign: "center", fontSize: "0.65rem", color: "#ef4444", fontWeight: 600 }}>
                            -{dropoff}%
                          </div>
                        )}
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>{step.val}</div>
                        <div style={{ 
                          width: "60%", height: `${pct}%`, minHeight: "4px", 
                          background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)", 
                          borderRadius: "4px 4px 0 0",
                          transition: "height 1s ease-out"
                        }} />
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "12px", fontWeight: 600, textAlign: "center" }}>
                          {step.step}<br/>
                          <span style={{ color: "#64748b", fontSize: "0.65rem", fontWeight: 500 }}>{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* COHORT RETENTION HEATMAP */}
            {(activeTab === "Overview" || activeTab === "Retention") && (
              <Card title="User Retention (Cohorts)" subtitle="Day 0 to Day 7" colSpan={3}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "4px", fontSize: "0.8rem", color: "#cbd5e1" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "8px", fontWeight: 600, color: "#64748b", width: "120px" }}>Cohort</th>
                        <th style={{ textAlign: "left", padding: "8px", fontWeight: 600, color: "#64748b", width: "80px" }}>Users</th>
                        {[...Array(8)].map((_, i) => <th key={i} style={{ textAlign: "center", padding: "8px", fontWeight: 600, color: "#64748b" }}>Day {i}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {retentionData.map((row) => (
                        <tr key={row.cohort}>
                          <td style={{ padding: "8px", fontWeight: 600 }}>{row.cohort}</td>
                          <td style={{ padding: "8px" }}>{row.size}</td>
                          {/* Day 0 is always 100% */}
                          <td style={{ background: "rgba(16, 185, 129, 0.9)", color: "#fff", textAlign: "center", padding: "8px", borderRadius: "4px", fontWeight: 600 }}>100%</td>
                          {[row.d1, row.d2, row.d3, row.d4, row.d5, row.d6, row.d7].map((val, i) => {
                            if (val === null) return <td key={i} style={{ background: "rgba(255,255,255,0.02)", textAlign: "center", padding: "8px", borderRadius: "4px", color: "#475569" }}>-</td>;
                            const intensity = val / 100;
                            return (
                              <td key={i} style={{ 
                                background: `rgba(16, 185, 129, ${intensity * 0.8})`, 
                                color: intensity > 0.6 ? "#fff" : "#cbd5e1",
                                textAlign: "center", padding: "8px", borderRadius: "4px", fontWeight: val > 80 ? 600 : 400
                              }}>
                                {val}%
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
