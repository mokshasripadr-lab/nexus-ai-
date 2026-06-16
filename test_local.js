fetch("http://localhost:3001/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "what is earth" }
    ]
  })
}).then(async res => {
  const text = await res.text();
  console.log("Response:", text.substring(0, 500));
  process.exit(0);
});
