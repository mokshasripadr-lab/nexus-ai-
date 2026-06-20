import { streamText } from 'ai';
export async function test() {
  const result = await streamText({} as any);
  return result;
}
