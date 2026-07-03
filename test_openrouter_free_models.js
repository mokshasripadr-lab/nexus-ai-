const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const apiKey = envFile.match(/OPENROUTER_API_KEY="(.*)"/)[1];

async function main() {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const data = await res.json();
  const freeModels = data.data.filter(m => m.id.includes('free') || m.pricing?.prompt === '0');
  console.log(freeModels.slice(0, 5).map(m => m.id).join(', '));
}
main();
