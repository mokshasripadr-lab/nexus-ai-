const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { generateText } = require('ai');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const apiKey = envFile.match(/GOOGLE_GENERATIVE_AI_API_KEY="(.*)"/)[1];

const google = createGoogleGenerativeAI({
  apiKey: apiKey,
});

async function main() {
  try {
    const result = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: 'hello'
    });
    console.log("gemini-1.5-flash result:", result.text);
  } catch(e) {
    console.error("gemini-1.5-flash failed:", e.message);
    try {
      const result2 = await generateText({
        model: google('models/gemini-1.5-flash-latest'),
        prompt: 'hello'
      });
      console.log("gemini-1.5-flash-latest result:", result2.text);
    } catch(e2) {
      console.error("gemini-1.5-flash-latest failed:", e2.message);
      try {
        const result3 = await generateText({
          model: google('gemini-pro'),
          prompt: 'hello'
        });
        console.log("gemini-pro result:", result3.text);
      } catch(e3) {
        console.error("gemini-pro failed:", e3.message);
      }
    }
  }
}
main();
