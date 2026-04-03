const API_BASE = "https://z2b1uh7ffb.execute-api.ap-south-1.amazonaws.com/prod";

export const sendEvent = async () => {
  const res = await fetch(`${API_BASE}/event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: "user_" + Math.floor(Math.random() * 100),
      event: "page_view",
      timestamp: new Date().toISOString()
    })
  });

  return res.json();
};

export const getMetrics = async () => {
  const res = await fetch(`${API_BASE}/metrics`);
  return res.json();
};
