const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDemoRecording() {
  const outputDir = path.join(__dirname, 'demo_media', 'raw_recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Launching Chromium in 1080p Full HD recording mode...");
  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  console.log("Navigating to Socrates IDE (http://localhost:5173)...");
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('hackathon_role'));
  await page.reload({ waitUntil: 'networkidle' });

  // SCENE 1: Login Page & Intro (Audio 1 & 2: ~35 seconds)
  console.log("Scene 1: Login & Platform Overview...");
  await sleep(4000);
  // Hover features
  await page.mouse.move(300, 300, { steps: 20 });
  await sleep(4000);
  await page.mouse.move(300, 450, { steps: 20 });
  await sleep(4000);
  await page.mouse.move(300, 580, { steps: 20 });
  await sleep(5000);

  // Toggle role tabs
  const educatorTab = page.locator('text=Educator Portal').first();
  if (await educatorTab.isVisible()) {
    await educatorTab.click();
    await sleep(4000);
  }
  const studentTab = page.locator('text=Student Portal').first();
  if (await studentTab.isVisible()) {
    await studentTab.click();
    await sleep(4000);
  }
  await sleep(4000);

  // SCENE 2: Launch Student IDE (Audio 3: ~18 seconds)
  console.log("Scene 2: Entering Student IDE...");
  const launchStudentBtn = page.locator('text=Launch Student IDE').first();
  if (await launchStudentBtn.isVisible()) {
    await launchStudentBtn.click();
  } else {
    await page.locator('button:has-text("Sign In")').click();
  }
  await sleep(4000);

  // Inspect problem pane and questions
  await page.mouse.move(200, 300, { steps: 25 });
  await sleep(4000);
  await page.mouse.move(200, 450, { steps: 25 });
  await sleep(5000);

  // Select Question 1.2.6 (Binary Search) or another problem
  const selectDropdown = page.locator('select').first();
  if (await selectDropdown.isVisible()) {
    await selectDropdown.selectOption({ index: 2 });
    await sleep(4000);
  }

  // SCENE 3: Pyodide WASM Execution & Tests (Audio 4: ~20 seconds)
  console.log("Scene 3: Running Code with Pyodide...");
  const runBtn = page.locator('button:has-text("Run Code")').first();
  if (await runBtn.isVisible()) {
    await runBtn.click();
    await sleep(5000);
  }

  const submitBtn = page.locator('button:has-text("Submit Solution")').first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await sleep(6000);
  }

  // SCENE 4: Socratic AI Mentor in Action (Audio 5: ~30 seconds)
  console.log("Scene 4: Interacting with Socratic AI Mentor...");
  // Click Mascot to open chat
  const mascot = page.locator('button[title="Click for Socratic Guidance"], svg').first();
  if (await mascot.isVisible()) {
    await mascot.click();
    await sleep(3000);
  }

  // Type question in Socratic Chat
  const chatInput = page.locator('input[placeholder*="Ask about your code"]').first();
  if (await chatInput.isVisible()) {
    await chatInput.click();
    await chatInput.fill('Why is my solution not handling the boundary correctly?');
    await sleep(2000);
    await page.keyboard.press('Enter');
    await sleep(6000);

    // Click Confidence Button
    const yesBtn = page.locator('button:has-text("Yes")').last();
    if (await yesBtn.isVisible()) {
      await yesBtn.click();
      await sleep(4000);
    }
  }
  await sleep(6000);

  // SCENE 5: Educator Portal & Telemetry (Audio 6 & 7: ~40 seconds)
  console.log("Scene 5: Switching to Educator Portal...");
  const logoutBtn = page.locator('button:has-text("Logout")').first();
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await sleep(3000);
  }

  const launchEducatorBtn = page.locator('text=Launch Educator Portal').first();
  if (await launchEducatorBtn.isVisible()) {
    await launchEducatorBtn.click();
    await sleep(4000);
  }

  // Hover over Heatmaps
  await page.mouse.move(500, 450, { steps: 30 });
  await sleep(6000);

  // Click Section A
  const sectionACard = page.locator('text=Section A').first();
  if (await sectionACard.isVisible()) {
    await sectionACard.click();
    await sleep(4000);
  }

  // Inspect S EDWIN
  const edwinCard = page.locator('text=S EDWIN').first();
  if (await edwinCard.isVisible()) {
    await edwinCard.click();
    await sleep(6000);
  }

  // Scroll down student submission details & Socratic trail
  await page.mouse.wheel(0, 400);
  await sleep(6000);
  await page.mouse.wheel(0, -300);
  await sleep(5000);

  // SCENE 6: Closing Summary (Audio 8: ~18 seconds)
  console.log("Scene 6: Conclusion...");
  await sleep(8000);

  console.log("Finishing video capture...");
  await page.close();
  await context.close();
  await browser.close();

  // Find the generated video file in outputDir
  const files = fs.readdirSync(outputDir);
  const videoFile = files.find(f => f.endsWith('.webm'));
  if (videoFile) {
    const oldPath = path.join(outputDir, videoFile);
    const newPath = path.join(__dirname, 'demo_media', 'raw_video.webm');
    fs.copyFileSync(oldPath, newPath);
    console.log(`Video recorded successfully and saved to: ${newPath}`);
  }
}

runDemoRecording().catch(err => {
  console.error("Recording error:", err);
  process.exit(1);
});
