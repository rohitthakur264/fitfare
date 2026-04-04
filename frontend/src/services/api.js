const API_BASE = "https://z2b1uh7ffb.execute-api.ap-south-1.amazonaws.com/prod";
const TOKEN = "mysecrettoken123";

export const sendEvent = async (userId, eventName = "page_view") => {
  try {
    const res = await fetch(`${API_BASE}/event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": TOKEN
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