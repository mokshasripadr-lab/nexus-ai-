const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => {
    console.log('PAGE ERROR MESSAGE:', err.message);
    console.log('PAGE ERROR STACK:', err.stack);
  });
  await page.goto('https://nexus-ai-8ggo-ten.vercel.app/dashboard/coder', { waitUntil: 'networkidle' });
  
  try {
    await page.fill('textarea[placeholder="Ask me to modify the code..."]', 'hello');
    await page.click('button:has(svg.lucide-send)');
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log("Error interacting:", e);
  }

  await browser.close();
})();
