const socket = new WebSocket("ws://localhost:8000/ws");

socket.onopen = () => {
  console.log("Connected to WebSocket");

  // Send your query as JSON
  socket.send(JSON.stringify({
    query: "send me the temperature near the equator of October 2024"
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

socket.onclose = (event) => {
  console.log("WebSocket closed:", event.code, event.reason);
};
