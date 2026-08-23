const puppeteer = require('puppeteer-core');
const path = require('path');

const artifactDir = 'C:/Users/EDWIN/.gemini/antigravity/brain/24a25b37-b3fc-423f-a969-97bd51378da7';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const delay = ms => new Promise(res => setTimeout(res, ms));

  // 1. Capture Student IDE: Confidence Check-In & Execution Benchmark
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('hackathon_role', 'student');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await delay(3000);

  // Click Submit Solution to generate test case execution time
  const btns = await page.$$('button');
  for (const btn of btns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Submit Solution')) {
      await btn.click();
      await delay(2000);
      break;
    }
  }

  // Screenshot: Execution Benchmark Badge (§ 4.2)
  const shotBenchmark = path.join(artifactDir, 'screen_execution_benchmark.png');
  await page.screenshot({ path: shotBenchmark });
  console.log("Saved Screenshot (Benchmark):", shotBenchmark);

  // Open Socratic Chat and trigger an interaction to show Confidence Check-In
  const owlBtn = await page.$('div[title*="Socrates Owl AI"]') || await page.$('img[alt*="Socrates Owl AI"]');
  if (owlBtn) {
    await owlBtn.click();
    await delay(1000);
  }

  const chatBtns = await page.$$('button');
  for (const btn of chatBtns) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Explain this question')) {
      await btn.click();
      await delay(1500);
      break;
    }
  }

  // Screenshot: Confidence Check-In Buttons (§ 5.2c)
  const shotConfidence = path.join(artifactDir, 'screen_confidence_checkin.png');
  await page.screenshot({ path: shotConfidence });
  console.log("Saved Screenshot (Confidence Check-In):", shotConfidence);

  // 2. Capture Educator Portal: Socratic Debugging Trail Replay (§ 5.2b)
  await page.evaluate(() => {
    localStorage.setItem('hackathon_role', 'teacher');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await delay(3000);

  const shotTrail = path.join(artifactDir, 'screen_teacher_trail_replay.png');
  await page.screenshot({ path: shotTrail });
  console.log("Saved Screenshot (Teacher Trail Replay):", shotTrail);

  await browser.close();
  console.log("All PRD feature screenshots captured successfully!");
}

capture().catch(console.error);
