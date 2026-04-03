import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid rgba(99,102,241,0.35)",
        borderRadius: "12px",
        padding: "10px 16px",
        fontSize: "0.82rem",
        color: "#e2e8f0",
        backdropFilter: "blur(12px)",
      }}>
        <p style={{ color: "#94a3b8", marginBottom: "4px" }}>{label}</p>
        <p style={{ color: "#818cf8", fontWeight: 700 }}>
          {payload[0].value} events
        </p>
      </div>
    );
  }
  return null;
};

export default function EventChart({ data }) {
  return (
    <div className="card-glow" style={{
      background: "linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(30,41,59,0.6) 100%)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "24px",
      padding: "1.75rem 2rem",
      backdropFilter: "blur(20px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <span style={{ fontSize: "1.1rem" }}>📈</span>
        <h2 style={{
          color: "#e2e8f0",
          fontSize: "0.8rem",
          textTransform: "uppercase",
          letterSpacing: "2px",
          fontWeight: 700,
        }}>Events Trend</h2>
        {data.length === 0 && (
          <span style={{
            marginLeft: "auto",
            fontSize: "0.72rem",
            color: "#64748b",
            fontStyle: "italic",
          }}>Waiting for data…</span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"  stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 5" stroke="rgba(51,65,85,0.6)" vertical={false} />
          <XAxis
            dataKey="time_bucket"
            stroke="transparent"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Inter" }}
            tickLine={false}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Inter" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total_events"
            stroke="url(#strokeGrad)"
            strokeWidth={3}
            fill="url(#areaGrad)"
            dot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#1e1b4b" }}
            activeDot={{ r: 7, fill: "#a5b4fc", stroke: "#1e1b4b", strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
