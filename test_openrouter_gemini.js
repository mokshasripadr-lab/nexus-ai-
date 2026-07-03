const { createOpenAI } = require('@ai-sdk/openai');
const { generateText } = require('ai');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const apiKey = envFile.match(/OPENROUTER_API_KEY="(.*)"/)[1];

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: apiKey,
});

async function main() {
  try {
    const result = await generateText({
      model: openrouter('google/gemini-2.5-flash'),
      prompt: 'hello'
    });
    console.log("OpenRouter gemini result:", result.text);
  } catch(e) {
    console.error("OpenRouter gemini failed:", e.message);
  }
}
main();
