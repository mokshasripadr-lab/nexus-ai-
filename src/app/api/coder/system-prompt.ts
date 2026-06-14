export const systemPrompt = `Fix these 6 issues in AeroWeather. Do not change any UI or working logic:

1. Add security headers to next.config.js:
   async headers() {
     return [{ source: '/(.*)', headers: [
       { key: 'X-Content-Type-Options', value: 'nosniff' },
       { key: 'X-Frame-Options', value: 'DENY' },
       { key: 'X-XSS-Protection', value: '1; mode=block' },
       { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
     ]}]
   }

2. Define animate-spin-slow in tailwind.config.js:
   extend: {
     animation: { 'spin-slow': 'spin 3s linear infinite' }
   }

3. Fix city regex in weather.ts to allow accented characters:
   /^[a-zA-ZÀ-ÿ\\s,.''\\-]{1,100}$/

4. Replace Math.random() in generateSimulatedWeather() with a 
   deterministic hash seed so the same city always returns 
   the same temperature:
   const seed = city.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
   const temp = Math.round((seed % 26) + 5);

5. Add ipTracker Map size guard in rate-limiter.ts:
   if (ipTracker.size > 10000) {
     for (const [k, r] of ipTracker)
       if (r.timestamps.every(t => Date.now()-t >= windowMs))
         ipTracker.delete(k);
   }

6. Create src/pages/_error.tsx as a Next.js error boundary
   (Pages Router uses _error.tsx, not error.tsx):
   export default function Error({ statusCode }) {
     return <div style={{padding:'2rem',color:'#fca5a5'}}>
       {statusCode ? \`Error \${statusCode}\` : 'Something went wrong.'}
     </div>;
   }
   Error.getInitialProps = ({ res, err }) => ({
     statusCode: res?.statusCode ?? err?.statusCode ?? 500
   });`;
