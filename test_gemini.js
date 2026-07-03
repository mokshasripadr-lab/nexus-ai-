const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { generateText } = require('ai');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const apiKey = envFile.match(/GOOGLE_GENERATIVE_AI_API_KEY="(.*)"/)[1];

const google = createGoogleGenerativeAI({ apiKey: apiKey });

async function main() {
  try {
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: 'hello'
    });
    console.log("gemini-2.5-flash result:", result.text);
  } catch(e) {
    console.error("gemini-2.5-flash failed:", e.message);
  }
}
main();
