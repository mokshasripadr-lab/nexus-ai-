import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

async function test() {
  const result = await streamText({
    model: google('gemini-2.5-flash'),
    messages: [{ role: "user", content: "hello" }]
  });
  const res = result.toUIMessageStreamResponse();
  const reader = res.body.getReader();
  const { value } = await reader.read();
  console.log(new TextDecoder().decode(value));
}
test();
