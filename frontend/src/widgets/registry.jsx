import React from 'react';

// Reusable SVG wrapper for clean, uniform widget library icons
const Ico = ({ children }) => (
  <div style={{
    width: 40, height: 40, borderRadius: 8, background: "#e8f0fe",
    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
  }}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </div>
);

export const WIDGET_REGISTRY = [
  {
    id: "concurrent_users",
    name: "Concurrent Users",
    icon: <Ico><path d="M3 3v18h18"/><path d="M3 15l5-5 4 4 9-9"/></Ico>,
    description: "Live area chart — users over time",
    tags: ["realtime", "users"],
  },
  {
    id: "total_events_bar",
    name: "Event Volume",
    icon: <Ico><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></Ico>,
    description: "Bar chart of events per time bucket",
    tags: ["events", "volume"],
  },
  {
    id: "conversion_funnel",
    name: "Conversion Funnel",
    icon: <Ico><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Ico>,
    description: "Step-by-step funnel with drop-off rates",
    tags: ["funnel", "conversion"],
  },
  {
    id: "retention_heatmap",
    name: "Retention Heatmap",
    icon: <Ico><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></Ico>,
    description: "Cohort retention grid by day",
    tags: ["retention", "cohort"],
  },
  {
    id: "platform_pie",
    name: "Platform Breakdown",
    icon: <Ico><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></Ico>,
    description: "Donut chart by device/platform",
    tags: ["segments", "platform"],
  },
  {
    id: "kpi_cards",
    name: "KPI Cards",
    icon: <Ico><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Ico>,
    description: "4-card summary: events, users, session, conversion",
    tags: ["kpi", "summary"],
  },
  {
    id: "session_line",
    name: "Session Trend",
    icon: <Ico><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Ico>,
    description: "Line chart comparing this vs last week sessions",
    tags: ["trend", "sessions"],
  },
  {
    id: "top_pages",
    name: "Top Pages Table",
    icon: <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></Ico>,
    description: "Most visited pages ranked by sessions",
    tags: ["pages", "table"],
  },
  {
    id: "scatter_engagement",
    name: "Engagement Scatter",
    icon: <Ico><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="18.5" cy="5.5" r=".5" fill="currentColor"/><circle cx="11.5" cy="11.5" r=".5" fill="currentColor"/><circle cx="7.5" cy="16.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="14.5" r=".5" fill="currentColor"/><path d="M3 3v18h18"/></Ico>,
    description: "Scatter: session duration vs pages viewed",
    tags: ["engagement", "scatter"],
  },
  {
    id: "composed_overview",
    name: "Events + Users Combo",
    icon: <Ico><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/><polyline points="4 15 9 10 14 12 20 6"/></Ico>,
    description: "Bars for events + line for users overlaid",
    tags: ["composed", "overview"],
  },
  {
    id: "radial_goals",
    name: "Radial Goals",
    icon: <Ico><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Ico>,
    description: "Radial bar showing progress toward targets",
    tags: ["goals", "radial"],
  },
  {
    id: "error_rate",
    name: "Error Rate Monitor",
    icon: <Ico><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Ico>,
    description: "Live line chart tracking error % vs threshold",
    tags: ["errors", "realtime", "monitoring"],
  },
  {
    id: "top_events_bar",
    name: "Top Event Types",
    icon: <Ico><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></Ico>,
    description: "Horizontal bar: most frequent event names",
    tags: ["events", "ranking"],
  },
  {
    id: "user_growth",
    name: "User Growth",
    icon: <Ico><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ico>,
    description: "Stacked area: new vs returning users by week",
    tags: ["growth", "users", "trend"],
  },
  {
    id: "top_countries",
    name: "Top Countries",
    icon: <Ico><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Ico>,
    description: "Horizontal bar: sessions ranked by country",
    tags: ["geography", "countries", "sessions"],
  },
  {
    id: "region_pie",
    name: "Region Breakdown",
    icon: <Ico><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Ico>,
    description: "Donut chart: traffic share by world region",
    tags: ["geography", "region", "pie"],
  },
];
