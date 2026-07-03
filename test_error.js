const { createGoogleGenerativeAI } = require('@ai-sdk/google');
const { generateText } = require('ai');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const apiKey = envFile.match(/GOOGLE_GENERATIVE_AI_API_KEY="(.*)"/)[1];
const google = createGoogleGenerativeAI({ apiKey: apiKey });

async function main() {
  try {
    const routeCode = fs.readFileSync('./src/app/api/chat/route.ts', 'utf8');
    // Extract the systemPrompt from the file
    const match = routeCode.match(/const systemPrompt = `([\s\S]*?)`;/);
    if (!match) throw new Error("Could not find systemPrompt in route.ts");
    
    const systemPrompt = match[1];
    
    console.log("Using model gemini-2.5-flash with system prompt length:", systemPrompt.length);
    
    const result = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: 'hello'
    });
    console.log("Result text:", result.text.substring(0, 50));
  } catch(e) {
    console.error("Error details:", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
  }
}
main();
