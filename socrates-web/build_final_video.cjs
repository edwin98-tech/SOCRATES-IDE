const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');

console.log("Using FFmpeg at:", ffmpegPath);

const audioDir = path.join(__dirname, 'demo_media', 'audio');
const rawVideoPath = path.join(__dirname, 'demo_media', 'raw_video.webm');
const fullAudioPath = path.join(__dirname, 'demo_media', 'full_narration.mp3');
const finalVideoPath = path.join(__dirname, 'SOCRATES_PITCH_DEMO.mp4');

// Step 1: Concat Audio Files
console.log("Step 1: Merging voiceover audio tracks...");
const audioFiles = [
  'audio_01_intro.mp3',
  'audio_02_solution.mp3',
  'audio_03_student_ide.mp3',
  'audio_04_pyodide.mp3',
  'audio_05_socratic_mentor.mp3',
  'audio_06_educator_portal.mp3',
  'audio_07_heatmaps.mp3',
  'audio_08_architecture_closing.mp3'
];

const concatListPath = path.join(__dirname, 'demo_media', 'audio_concat.txt');
const concatContent = audioFiles
  .map(f => `file '${path.join(audioDir, f).replace(/\\/g, '/')}'`)
  .join('\n');
fs.writeFileSync(concatListPath, concatContent);

try {
  execSync(`"${ffmpegPath}" -y -f concat -safe 0 -i "${concatListPath}" -c copy "${fullAudioPath}"`, { stdio: 'inherit' });
  console.log("Unified voiceover created at:", fullAudioPath);
} catch (e) {
  console.error("Audio concat error:", e);
}

// Step 2: Combine video and voiceover
console.log("Step 2: Merging video and voiceover into final MP4 presentation...");
try {
  if (fs.existsSync(rawVideoPath)) {
    execSync(`"${ffmpegPath}" -y -i "${rawVideoPath}" -i "${fullAudioPath}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${finalVideoPath}"`, { stdio: 'inherit' });
    console.log(`\n======================================================`);
    console.log(`SUCCESS! Final Pitch Video rendered at:`);
    console.log(finalVideoPath);
    console.log(`======================================================\n`);
  } else {
    console.error("Raw video file not found at:", rawVideoPath);
  }
} catch (e) {
  console.error("Video merging error:", e);
}
