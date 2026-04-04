// ─────────────────────────────────────────────────────────
//  All individual widget renderers live here.
//  To add a new chart: create a new function and export it
//  via the WIDGET_RENDERERS map at the bottom.
// ─────────────────────────────────────────────────────────

import React from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ScatterChart, Scatter, ComposedChart, RadialBarChart, RadialBar,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

/* ── Shared colors ── */
const C = {
  blue:   "#1a73e8",
  green:  "#34a853",
  yellow: "#fbbc04",
  red:    "#ea4335",
  indigo: "#5f6291",
  teal:   "#00bcd4",
};

/* ── Custom Tooltip ── */
const GaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1px solid #e8eaed", borderRadius:8, padding:"10px 14px", boxShadow:"0 2px 12px rgba(0,0,0,0.12)" }}>
      {label && <p style={{ fontSize:"0.78rem", color:"#5f6368", marginBottom:6, fontWeight:500 }}>{label}</p>}
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background: p.color || p.stroke || p.fill }} />
          <span style={{ fontSize:"0.82rem", color:"#202124", fontWeight:600 }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
          <span style={{ fontSize:"0.78rem", color:"#5f6368" }}>{p.name}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Progress bar util ── */
const ProgressBar = ({ value, max = 100, color = C.blue }) => (
  <div style={{ background:"#e8eaed", borderRadius:2, height:4, overflow:"hidden" }}>
    <div style={{ width:`${(value/max)*100}%`, height:"100%", background:color, borderRadius:2, transition:"width 1s ease" }} />
  </div>
);

/* ══════════════════════════════════════════════════════════
   WIDGET FUNCTIONS
   Each receives:  { metrics, height = 220 }
   metrics = { total_events, active_users, records:[] }
   ══════════════════════════════════════════════════════════ */

/* 1. Concurrent Users — live area chart */
export function WConcurrentUsers({ metrics, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={metrics.records} margin={{ top:5, right:10, left:-20, bottom:0 }}>
        <defs>
          <linearGradient id="grad_users" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={C.blue} stopOpacity={0.2} />
            <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
        <XAxis dataKey="time_bucket" tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} minTickGap={30} />
        <YAxis tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<GaTooltip />} />
        <Area type="monotone" dataKey="active_users" name="Active Users" stroke={C.blue} strokeWidth={2.5} fill="url(#grad_users)" isAnimationActive={false} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* 2. Event Volume — bar chart */
export function WEventVolumeBar({ metrics, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={metrics.records} margin={{ top:5, right:10, left:-20, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
        <XAxis dataKey="time_bucket" tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} minTickGap={30} />
        <YAxis tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<GaTooltip />} />
        <Bar dataKey="total_events" name="Events" fill={C.blue} radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* 3. Conversion Funnel */
const FUNNEL = [
  { step:"App Open", val:5400, pct:100 },
  { step:"Login",    val:3200, pct:59  },
  { step:"Product",  val:2450, pct:45  },
  { step:"Cart",     val:1800, pct:33  },
  { step:"Checkout", val:950,  pct:18  },
  { step:"Purchase", val:720,  pct:13  },
];
export function WConversionFunnel({ height = 220 }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height, padding:"12px 8px 0" }}>
      {FUNNEL.map((s, i) => {
        const dropoff = i > 0 ? (((FUNNEL[i-1].val - s.val) / FUNNEL[i-1].val)*100).toFixed(1) : null;
        return (
          <div key={s.step} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", position:"relative" }}>
            {dropoff && (
              <div style={{ position:"absolute", top:-22, fontSize:"0.65rem", fontWeight:600, color:"#c5221f", background:"#fce8e6", padding:"2px 5px", borderRadius:10 }}>-{dropoff}%</div>
            )}
            <div style={{ fontSize:"0.75rem", fontWeight:700, color:"#202124", marginBottom:4 }}>{s.val.toLocaleString()}</div>
            <div style={{ width:"70%", height:`${s.pct * 1.8}px`, background:`linear-gradient(180deg, ${C.blue} 0%, #4285f4 100%)`, borderRadius:"4px 4px 0 0", opacity:0.75+(s.pct/400) }} />
            <div style={{ fontSize:"0.65rem", fontWeight:600, color:"#3c4043", marginTop:6, textAlign:"center" }}>{s.step}</div>
          </div>
        );
      })}
    </div>
  );
}

/* 4. Retention Heatmap */
const RETENTION = [
  { cohort:"Mar 27", size:1240, d:[100,94,82,76,65,58,45,42] },
  { cohort:"Mar 28", size:1390, d:[100,92,85,79,70,64,52,48] },
  { cohort:"Mar 29", size:1420, d:[100,96,88,82,75,66,59,50] },
  { cohort:"Mar 30", size:1530, d:[100,95,86,74,68,62,null,null] },
  { cohort:"Mar 31", size:1680, d:[100,98,90,84,null,null,null,null] },
];
export function WRetentionHeatmap({ height }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:3, fontSize:"0.75rem" }}>
        <thead>
          <tr>
            <th style={{ textAlign:"left", padding:"6px 10px", color:"#5f6368", fontWeight:600, fontSize:"0.7rem" }}>Cohort</th>
            {["D0","D1","D2","D3","D4","D5","D6","D7"].map(d=>(
              <th key={d} style={{ textAlign:"center", padding:"6px 4px", color:"#5f6368", fontWeight:600, fontSize:"0.7rem" }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RETENTION.map(row => (
            <tr key={row.cohort}>
              <td style={{ padding:"6px 10px", fontWeight:600, color:"#202124", whiteSpace:"nowrap" }}>{row.cohort}</td>
              {row.d.map((val, i) => {
                if (val === null) return <td key={i}><div style={{ background:"#f8f9fa", borderRadius:4, padding:"5px 4px", textAlign:"center", color:"#dadce0" }}>—</div></td>;
                const alpha = 0.15 + (val/100)*0.75;
                return (
                  <td key={i}>
                    <div style={{ background:`rgba(26,115,232,${alpha})`, color: alpha>0.5?"#fff":"#1a73e8", borderRadius:4, padding:"5px 4px", textAlign:"center", fontWeight:val>80?700:500 }}>
                      {val}%
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* 5. Platform Donut */
const SEGS = [
  { name:"iOS", value:45, color:C.blue },
  { name:"Android", value:35, color:C.green },
  { name:"Web", value:20, color:C.yellow },
];
export function WPlatformPie({ height = 220 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
      <ResponsiveContainer width={160} height={height}>
        <PieChart>
          <Pie data={SEGS} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
            {SEGS.map((s,i) => <Cell key={i} fill={s.color} />)}
          </Pie>
          <Tooltip content={<GaTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:14 }}>
        {SEGS.map(s => (
          <div key={s.name}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:s.color }} />
                <span style={{ fontSize:"0.82rem", fontWeight:500, color:"#3c4043" }}>{s.name}</span>
              </div>
              <span style={{ fontSize:"0.82rem", fontWeight:700, color:"#202124" }}>{s.value}%</span>
            </div>
            <ProgressBar value={s.value} color={s.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* 6. KPI Cards */
export function WKpiCards({ metrics }) {
  const cards = [
    { label:"Total Events",     value:metrics.total_events?.toLocaleString() || "—", trend:12,  color:C.blue   },
    { label:"Active Users",     value:metrics.active_users?.toLocaleString() || "—", trend:4,   color:C.green  },
    { label:"Avg Session",      value:"4m 12s",                                       trend:-2,  color:C.yellow },
    { label:"Conversion Rate",  value:"13.3%",                                        trend:8,   color:C.red    },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background:"#f8f9fa", borderRadius:8, padding:"14px 16px" }}>
          <div style={{ fontSize:"0.72rem", color:"#5f6368", fontWeight:500, marginBottom:4 }}>{c.label}</div>
          <div style={{ fontSize:"1.4rem", fontWeight:700, color:"#202124" }}>{c.value}</div>
          <div style={{ fontSize:"0.72rem", fontWeight:600, marginTop:4, color: c.trend>=0?"#137333":"#c5221f" }}>
            {c.trend>=0?"▲":"▼"} {Math.abs(c.trend)}%
          </div>
        </div>
      ))}
    </div>
  );
}

/* 7. Session Trend — two lines (this vs last week) */
const SESSION_TREND = [
  { day:"Mon", thisWeek:1240, lastWeek:1080 },
  { day:"Tue", thisWeek:1890, lastWeek:1400 },
  { day:"Wed", thisWeek:1530, lastWeek:1600 },
  { day:"Thu", thisWeek:2100, lastWeek:1750 },
  { day:"Fri", thisWeek:2400, lastWeek:2200 },
  { day:"Sat", thisWeek:1800, lastWeek:1500 },
  { day:"Sun", thisWeek:1350, lastWeek:1200 },
];
export function WSessionLine({ height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={SESSION_TREND} margin={{ top:5, right:10, left:-20, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
        <XAxis dataKey="day" tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<GaTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:"0.78rem", paddingTop:8 }} />
        <Line type="monotone" dataKey="thisWeek" name="This Week" stroke={C.blue}  strokeWidth={2.5} dot={{ r:4, fill:C.blue  }} />
        <Line type="monotone" dataKey="lastWeek" name="Last Week" stroke="#dadce0" strokeWidth={2}   dot={{ r:4, fill:"#bdc1c6" }} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* 8. Top Pages Table */
const TOP_PAGES = [
  { page:"/ (Home)",    sessions:4210, bounce:"42%", avgTime:"2m 14s" },
  { page:"/products",   sessions:2980, bounce:"38%", avgTime:"3m 42s" },
  { page:"/checkout",   sessions:1630, bounce:"22%", avgTime:"4m 18s" },
  { page:"/about",      sessions:980,  bounce:"61%", avgTime:"1m 08s" },
  { page:"/blog",       sessions:870,  bounce:"55%", avgTime:"2m 55s" },
];
export function WTopPages({ height }) {
  return (
    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.82rem" }}>
      <thead>
        <tr>
          {["Page","Sessions","Bounce %","Avg Time"].map(h => (
            <th key={h} style={{ textAlign:"left", padding:"8px 10px", fontWeight:600, color:"#5f6368", fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.04em", borderBottom:"1px solid #e8eaed" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TOP_PAGES.map(row => (
          <tr key={row.page} style={{ cursor:"default" }}>
            <td style={{ padding:"10px 10px", color:C.blue, fontWeight:500, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", borderBottom:"1px solid #f1f3f4" }}>{row.page}</td>
            <td style={{ padding:"10px 10px", fontWeight:600, color:"#202124", borderBottom:"1px solid #f1f3f4" }}>{row.sessions.toLocaleString()}</td>
            <td style={{ padding:"10px 10px", color:"#5f6368", borderBottom:"1px solid #f1f3f4" }}>{row.bounce}</td>
            <td style={{ padding:"10px 10px", color:"#5f6368", borderBottom:"1px solid #f1f3f4" }}>{row.avgTime}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* 9. Engagement Scatter */
const SCATTER_DATA = Array.from({ length: 40 }, (_, i) => ({
  duration: Math.floor(30 + Math.random() * 600),
  pages: Math.floor(1 + Math.random() * 12),
  users: Math.floor(10 + Math.random() * 200),
}));
export function WScatterEngagement({ height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top:5, right:10, left:-20, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
        <XAxis type="number" dataKey="duration" name="Session (s)" tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} label={{ value:"Session Duration (s)", position:"insideBottomRight", offset:-5, fontSize:10, fill:"#80868b" }} />
        <YAxis type="number" dataKey="pages" name="Pages"          tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<GaTooltip />} cursor={{ strokeDasharray:"3 3" }} />
        <Scatter data={SCATTER_DATA} name="Users" fill={C.blue} fillOpacity={0.6} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/* 10. Composed — bars + line */
export function WComposedOverview({ metrics, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={metrics.records} margin={{ top:5, right:10, left:-20, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
        <XAxis dataKey="time_bucket" tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} minTickGap={30} />
        <YAxis yAxisId="left"  tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<GaTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:"0.78rem" }} />
        <Bar     yAxisId="left"  dataKey="total_events"  name="Events"  fill={C.blue}  radius={[4,4,0,0]} />
        <Line    yAxisId="right" dataKey="active_users"  name="Users"   stroke={C.green} strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* 11. Radial Goals */
const RADIAL_GOALS = [
  { name:"Events Goal",   value:78, fill:C.blue   },
  { name:"Users Goal",    value:62, fill:C.green  },
  { name:"Revenue Goal",  value:45, fill:C.yellow },
  { name:"Retention",     value:91, fill:C.teal   },
];
export function WRadialGoals({ height = 220 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
      <ResponsiveContainer width={180} height={height}>
        <RadialBarChart innerRadius={25} outerRadius={85} data={RADIAL_GOALS} startAngle={90} endAngle={-270}>
          <RadialBar minAngle={15} dataKey="value" background={{ fill:"#f1f3f4" }} cornerRadius={6} />
          <Tooltip content={<GaTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12 }}>
        {RADIAL_GOALS.map(g => (
          <div key={g.name}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:"0.78rem", color:"#3c4043", fontWeight:500 }}>{g.name}</span>
              <span style={{ fontSize:"0.78rem", fontWeight:700, color:g.fill }}>{g.value}%</span>
            </div>
            <ProgressBar value={g.value} color={g.fill} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* 12. Error Rate — live line, red */
export function WErrorRate({ metrics, height = 220 }) {
  const data = (metrics.records || []).map(r => ({
    time_bucket: r.time_bucket,
    error_rate: parseFloat((0.5 + Math.random() * 2.5).toFixed(2)),
    threshold: 2,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top:5, right:10, left:-20, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
        <XAxis dataKey="time_bucket" tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} minTickGap={30} />
        <YAxis tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} unit="%" />
        <Tooltip content={<GaTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:"0.78rem" }} />
        <Line type="monotone" dataKey="error_rate" name="Error Rate" stroke={C.red}    strokeWidth={2.5} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="threshold"  name="Threshold"  stroke="#dadce0" strokeWidth={1.5} strokeDasharray="6 3" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* 13. Top Events Bar (static mock) */
const TOP_EVENTS = [
  { event: "page_view",    count: 14820 },
  { event: "click",        count: 9340  },
  { event: "purchase",     count: 720   },
  { event: "signup",       count: 430   },
  { event: "video_play",   count: 2100  },
  { event: "search",       count: 3870  },
];
export function WTopEventsBar({ height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={TOP_EVENTS} layout="vertical" margin={{ top:4, right:16, left:0, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f3f4" />
        <XAxis type="number" tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="event" width={82} tick={{ fill:"#5f6368", fontSize:11, fontWeight:500 }} tickLine={false} axisLine={false} />
        <Tooltip content={<GaTooltip />} />
        <Bar dataKey="count" name="Events" fill={C.indigo} radius={[0,4,4,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* 14. User Growth — stacked area */
const USER_GROWTH = [
  { week:"W1", new_users:420, returning:820 },
  { week:"W2", new_users:530, returning:910 },
  { week:"W3", new_users:480, returning:970 },
  { week:"W4", new_users:690, returning:1080 },
  { week:"W5", new_users:810, returning:1230 },
  { week:"W6", new_users:750, returning:1400 },
  { week:"W7", new_users:920, returning:1520 },
  { week:"W8", new_users:1040, returning:1680 },
];
export function WUserGrowth({ height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={USER_GROWTH} margin={{ top:5, right:10, left:-20, bottom:0 }}>
        <defs>
          <linearGradient id="grad_new" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.green} stopOpacity={0.35} />
            <stop offset="100%" stopColor={C.green} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="grad_ret" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.blue} stopOpacity={0.25} />
            <stop offset="100%" stopColor={C.blue} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
        <XAxis dataKey="week" tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<GaTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:"0.78rem", paddingTop:8 }} />
        <Area type="monotone" dataKey="returning"  name="Returning" stroke={C.blue}  strokeWidth={2} fill="url(#grad_ret)" />
        <Area type="monotone" dataKey="new_users"  name="New Users" stroke={C.green} strokeWidth={2} fill="url(#grad_new)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* 15. Top Countries — horizontal bar */
const TOP_COUNTRIES = [
  { country: "United States", sessions: 18420, flag: "🇺🇸" },
  { country: "India",         sessions: 9340,  flag: "🇮🇳" },
  { country: "United Kingdom",sessions: 6210,  flag: "🇬🇧" },
  { country: "Germany",       sessions: 4870,  flag: "🇩🇪" },
  { country: "Canada",        sessions: 4120,  flag: "🇨🇦" },
  { country: "Australia",     sessions: 3560,  flag: "🇦🇺" },
  { country: "France",        sessions: 2940,  flag: "🇫🇷" },
  { country: "Brazil",        sessions: 2480,  flag: "🇧🇷" },
];
export function WTopCountries({ height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={TOP_COUNTRIES} layout="vertical" margin={{ top:4, right:24, left:8, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f3f4" />
        <XAxis type="number" tick={{ fill:"#80868b", fontSize:11 }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="country" width={110}
          tick={({ x, y, payload }) => (
            <text x={x} y={y} dy={4} textAnchor="end" fill="#3c4043" fontSize={11} fontWeight={500}>
              {payload.value}
            </text>
          )}
          tickLine={false} axisLine={false}
        />
        <Tooltip content={<GaTooltip />} />
        <Bar dataKey="sessions" name="Sessions" fill={C.blue} radius={[0,4,4,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* 16. Region Pie */
const REGIONS = [
  { name: "North America", value: 42, color: C.blue },
  { name: "Europe",        value: 28, color: C.green },
  { name: "Asia Pacific",  value: 20, color: C.yellow },
  { name: "Rest of World", value: 10, color: C.red },
];
export function WRegionPie({ height = 260 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:20 }}>
      <ResponsiveContainer width={180} height={height}>
        <PieChart>
          <Pie data={REGIONS} innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
            {REGIONS.map((r,i) => <Cell key={i} fill={r.color} />)}
          </Pie>
          <Tooltip content={<GaTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:14 }}>
        {REGIONS.map(r => (
          <div key={r.name}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:r.color }} />
                <span style={{ fontSize:"0.82rem", fontWeight:500, color:"#3c4043" }}>{r.name}</span>
              </div>
              <span style={{ fontSize:"0.82rem", fontWeight:700, color:"#202124" }}>{r.value}%</span>
            </div>
            <ProgressBar value={r.value} color={r.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══ RENDERER MAP — maps registry id → component ══════════ */
export const WIDGET_RENDERERS = {
  concurrent_users:    WConcurrentUsers,
  total_events_bar:    WEventVolumeBar,
  conversion_funnel:   WConversionFunnel,
  retention_heatmap:   WRetentionHeatmap,
  platform_pie:        WPlatformPie,
  kpi_cards:           WKpiCards,
  session_line:        WSessionLine,
  top_pages:           WTopPages,
  scatter_engagement:  WScatterEngagement,
  composed_overview:   WComposedOverview,
  radial_goals:        WRadialGoals,
  error_rate:          WErrorRate,
  top_events_bar:      WTopEventsBar,
  user_growth:         WUserGrowth,
  top_countries:       WTopCountries,
  region_pie:          WRegionPie,
};
