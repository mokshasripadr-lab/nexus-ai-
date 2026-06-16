const messages = [
  { role: "user", parts: [{ text: "what is earth" }] },
  { role: "user", parts: [{ text: "what is art" }] }
];
const mapped = messages.map(m => ({
  role: m.role,
  content: m.content || m.text || (m.parts && m.parts[0]?.text) || ""
}));
console.log(mapped);
