const API_BASE = "https://z2b1uh7ffb.execute-api.ap-south-1.amazonaws.com/prod";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicm9oaXQifQ.q4j45ydjL4SYzPTCJ5jB8kgWAK6gknk9YqpyWMg9cfw";

export const sendEvent = async (userId, eventName = "page_view") => {
  try {
    const res = await fetch(`${API_BASE}/event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        user_id: userId,
        event: eventName,
        timestamp: new Date().toISOString()
      })
    });

    if (!res.ok) throw new Error("API error");

    return await res.json();
  } catch (err) {
    console.error("Send event failed:", err);
    return null;
  }
};