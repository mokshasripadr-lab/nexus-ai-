fetch("https://nexus-ai-8ggo-ten.vercel.app/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "what is earth" },
      { role: "assistant", content: "Earth is the third planet from the Sun." },
      { role: "user", content: "what is art" }
    ]
  })
}).then(async res => {
  const text = await res.text();
  console.log("Response:", text.substring(0, 500));
});
