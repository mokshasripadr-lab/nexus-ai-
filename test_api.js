const { createServer } = require('http');
// Just a simple script to fetch the Vercel API and see the raw response format
fetch("https://nexus-ai-8ggo-ten.vercel.app/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "what is earth" }
    ]
  })
}).then(async res => {
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 1000));
});
