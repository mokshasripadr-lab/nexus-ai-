const messages = [{ role: 'user', text: 'what is earth' }];
const mapped = messages.map((m) => ({
  role: m.role,
  content: m.content || m.text || (m.parts && m.parts[0]?.text) || ""
}));
console.log(mapped);
