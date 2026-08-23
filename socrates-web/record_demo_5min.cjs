const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFull5MinDemo() {
  const outputDir = path.join(__dirname, 'demo_5min', 'raw_recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Load timings if available
  const timingsPath = path.join(__dirname, '..', 'demo_5min', 'timings.json');
  let timings = [];
  if (fs.existsSync(timingsPath)) {
    timings = JSON.parse(fs.readFileSync(timingsPath, 'utf8'));
    console.log(`Loaded ${timings.length} scene timings.`);
  }

  console.log("Launching Chromium in 1080p Full HD recording mode for 5-minute pitch...");
  const browser = await chromium.launch({ headless: true });
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

  // SCENE 1: The Problem (Intro) - ~25s
  console.log("Scene 1: Introduction & Problem...");
  await page.mouse.move(960, 540, { steps: 20 });
  await sleep(6000);
  await page.mouse.move(400, 350, { steps: 25 });
  await sleep(8000);
  await page.mouse.move(400, 500, { steps: 25 });
  await sleep(10000);

  // SCENE 2: The Solution (Socrates IDE Overview) - ~20s
  console.log("Scene 2: Introducing Socrates IDE...");
  await page.mouse.move(300, 200, { steps: 20 });
  await sleep(6000);
  await page.mouse.move(300, 600, { steps: 20 });
  await sleep(8000);
  await page.mouse.move(960, 540, { steps: 20 });
  await sleep(6000);

  // SCENE 3: Dual Portals & Instant Demo Launch - ~20s
  console.log("Scene 3: Dual Portal Architecture...");
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
  await page.mouse.move(1200, 650, { steps: 20 });
  await sleep(6000);

  // SCENE 4: Entering Student IDE & 10 DSA Curriculum - ~25s
  console.log("Scene 4: Student Workspace & Curated DSA Problems...");
  const launchStudentBtn = page.locator('text=Launch Student IDE').first();
  if (await launchStudentBtn.isVisible()) {
    await launchStudentBtn.click();
  } else {
    await page.locator('button:has-text("Sign In")').click();
  }
  await sleep(5000);

  // Browse the 10 questions dropdown
  const selectDropdown = page.locator('select').first();
  if (await selectDropdown.isVisible()) {
    await selectDropdown.selectOption({ index: 1 });
    await sleep(3000);
    await selectDropdown.selectOption({ index: 3 });
    await sleep(3000);
    await selectDropdown.selectOption({ index: 5 });
    await sleep(3000);
    await selectDropdown.selectOption({ index: 0 }); // Back to Array Operations
    await sleep(4000);
  }
  await page.mouse.move(200, 400, { steps: 20 });
  await sleep(6000);

  // SCENE 5: Local Pyodide WebAssembly Execution - ~25s
  console.log("Scene 5: Local Pyodide WASM Execution...");
  await page.mouse.move(700, 350, { steps: 25 });
  await sleep(6000);
  const runBtn = page.locator('button:has-text("Run Code")').first();
  if (await runBtn.isVisible()) {
    await runBtn.click();
    await sleep(7000);
  }
  await page.mouse.move(700, 750, { steps: 20 });
  await sleep(8000);

  // SCENE 6: Test Assertions Engine & Shortcuts - ~25s
  console.log("Scene 6: Test Assertions & Feedback...");
  const submitBtn = page.locator('button:has-text("Submit Solution")').first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await sleep(7000);
  }
  // Click Test Cases Tab
  const testcasesTab = page.locator('button:has-text("Test Cases")').first();
  if (await testcasesTab.isVisible()) {
    await testcasesTab.click();
    await sleep(6000);
  }
  const terminalTab = page.locator('button:has-text("Terminal Output")').first();
  if (await terminalTab.isVisible()) {
    await terminalTab.click();
    await sleep(5000);
  }

  // SCENE 7: Socratic AI Mentor & Anti-Cheating - ~25s
  console.log("Scene 7: Interacting with Socratic AI Mentor...");
  const mascot = page.locator('button[title="Click for Socratic Guidance"], svg').first();
  if (await mascot.isVisible()) {
    await mascot.click();
    await sleep(4000);
  }

  // Ask Socratic Question
  const chatInput = page.locator('input[placeholder*="Ask about your code"]').first();
  if (await chatInput.isVisible()) {
    await chatInput.click();
    await chatInput.fill('Can you explain the difference between print(arr) and print(*arr)?');
    await sleep(3000);
    await page.keyboard.press('Enter');
    await sleep(8000);
  }

  // SCENE 8: Confidence Check-Ins & Anti-Leak - ~25s
  console.log("Scene 8: Interactive Confidence Check-Ins...");
  const yesBtn = page.locator('button:has-text("Yes")').last();
  if (await yesBtn.isVisible()) {
    await yesBtn.click();
    await sleep(4000);
  }
  
  // Open Settings Modal
  const settingsBtn = page.locator('button[title="Settings"], button:has-text("Settings")').first();
  if (await settingsBtn.isVisible()) {
    await settingsBtn.click();
    await sleep(5000);
    // Close Settings
    const closeSettings = page.locator('button:has-text("Close"), button:has-text("✕")').first();
    if (await closeSettings.isVisible()) {
      await closeSettings.click();
      await sleep(3000);
    }
  }
  await sleep(4000);

  // SCENE 9: Educator Portal Transition - ~22s
  console.log("Scene 9: Transitioning to Educator Portal...");
  const logoutBtn = page.locator('button:has-text("Logout")').first();
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await sleep(4000);
  }

  const launchEducatorBtn = page.locator('text=Launch Educator Portal').first();
  if (await launchEducatorBtn.isVisible()) {
    await launchEducatorBtn.click();
    await sleep(5000);
  }
  await page.mouse.move(960, 300, { steps: 20 });
  await sleep(7000);

  // SCENE 10: Misconception Heatmaps & Telemetry - ~25s
  console.log("Scene 10: Misconception Heatmaps...");
  await page.mouse.move(400, 480, { steps: 25 });
  await sleep(6000);
  await page.mouse.move(950, 480, { steps: 25 });
  await sleep(6000);
  await page.mouse.move(1100, 350, { steps: 20 });
  await sleep(7000);

  // SCENE 11: Section Roster & Student Code Replay - ~30s
  console.log("Scene 11: Section Roster & Individual Code Replay...");
  const sectionACard = page.locator('text=Section A').first();
  if (await sectionACard.isVisible()) {
    await sectionACard.click();
    await sleep(5000);
  }

  const edwinCard = page.locator('text=S EDWIN').first();
  if (await edwinCard.isVisible()) {
    await edwinCard.click();
    await sleep(6000);
  }

  // Scroll down student submission details & Socratic trail
  await page.mouse.wheel(0, 450);
  await sleep(6000);
  await page.mouse.wheel(0, 300);
  await sleep(6000);
  await page.mouse.wheel(0, -600);
  await sleep(4000);

  // SCENE 12: Conclusion & Technical Architecture - ~20s
  console.log("Scene 12: Technical Architecture & Conclusion...");
  const backToSectionBtn = page.locator('button:has-text("Back to Section Roster")').first();
  if (await backToSectionBtn.isVisible()) {
    await backToSectionBtn.click();
    await sleep(3000);
  }
  const backToAllSectionsBtn = page.locator('button:has-text("Back to All Sections")').first();
  if (await backToAllSectionsBtn.isVisible()) {
    await backToAllSectionsBtn.click();
    await sleep(3000);
  }
  await page.mouse.move(960, 400, { steps: 20 });
  await sleep(8000);

  console.log("Finishing 5-minute video capture...");
  await page.close();
  await context.close();
  await browser.close();

  // Copy raw recording
  const files = fs.readdirSync(outputDir);
  const videoFile = files.find(f => f.endsWith('.webm'));
  if (videoFile) {
    const oldPath = path.join(outputDir, videoFile);
    const newPath = path.join(__dirname, 'demo_5min', 'raw_video_5min.webm');
    fs.copyFileSync(oldPath, newPath);
    console.log(`5-Minute Video recorded successfully and saved to: ${newPath}`);
  }
}

runFull5MinDemo().catch(err => {
  console.error("Recording error:", err);
  process.exit(1);
});
