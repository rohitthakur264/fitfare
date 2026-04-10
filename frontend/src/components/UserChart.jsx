import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(15,23,42,0.95)",
        border: "1px solid rgba(34,197,94,0.3)",
        borderRadius: 10,
        padding: "8px 14px",
        fontSize: "0.78rem",
        color: "#e2e8f0",
        backdropFilter: "blur(10px)",
      }}>
        <p style={{ color: "#94a3b8", marginBottom: 3 }}>{label}</p>
        <p style={{ color: "#4ade80", fontWeight: 700 }}>
          {payload[0].value} unique users
        </p>
      </div>
    );
  }
  return null;
};

export default function UserChart({ data }) {
  // Format data inline or expect formatted data
  const chartData = data?.map ? data.map(item => ({
    time: item.time_bucket || item.time,
    users: item.active_users !== undefined ? item.active_users : item.users
  })) : [];

  return (
    <div className="card-glow" style={{
      background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(30,41,59,0.6) 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20,
      padding: "1.5rem 1.75rem",
      backdropFilter: "blur(18px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.1rem" }}>
        <span style={{ fontSize: "1.05rem" }}>👥</span>
        <h2 style={{
          color: "#e2e8f0", fontSize: "0.78rem",
          textTransform: "uppercase", letterSpacing: "2px", fontWeight: 700,
        }}>Active Users</h2>
        {chartData.length === 0 && (
          <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#64748b", fontStyle: "italic" }}>
            Waiting for data…
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 6, right: 12, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="userStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 5" stroke="rgba(51,65,85,0.5)" vertical={false} />
          <XAxis dataKey="time" hide />
          <YAxis tick={{ fill: "#475569", fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="users"
            stroke="url(#userStroke)"
            strokeWidth={2.5}
            dot={{ r: 5, fill: "#22c55e", strokeWidth: 2, stroke: "#0f172a" }}
            activeDot={{ r: 7, fill: "#4ade80", stroke: "#0f172a", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
