const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');

console.log("Using FFmpeg at:", ffmpegPath);

const audioDir = path.join(__dirname, 'demo_5min', 'audio');
const rawVideoPath = path.join(__dirname, 'demo_5min', 'raw_video_5min.webm');
const fullAudioPath = path.join(__dirname, 'demo_5min', 'full_narration_5min.mp3');
const srtPath = path.join(__dirname, 'demo_5min', 'subtitles.srt');
const finalVideoPath = path.join(__dirname, '..', 'SOCRATES_5MIN_PITCH_WITH_SUBTITLES.mp4');
const standardVideoPath = path.join(__dirname, '..', 'SOCRATES_PITCH_DEMO.mp4');

// Step 1: Concat All 12 Audio Files
console.log("Step 1: Merging all 12 scene voiceover tracks...");
const audioFiles = [
  'scene_01_intro.mp3',
  'scene_02_solution.mp3',
  'scene_03_portals.mp3',
  'scene_04_curriculum.mp3',
  'scene_05_wasm.mp3',
  'scene_06_execution.mp3',
  'scene_07_socratic_ai.mp3',
  'scene_08_checkins.mp3',
  'scene_09_educator_intro.mp3',
  'scene_10_heatmaps.mp3',
  'scene_11_code_replay.mp3',
  'scene_12_conclusion.mp3'
];

const concatListPath = path.join(__dirname, 'demo_5min', 'audio_concat_5min.txt');
const concatContent = audioFiles
  .map(f => `file '${path.join(audioDir, f).replace(/\\/g, '/')}'`)
  .join('\n');
fs.writeFileSync(concatListPath, concatContent);

try {
  execSync(`"${ffmpegPath}" -y -f concat -safe 0 -i "${concatListPath}" -c copy "${fullAudioPath}"`, { stdio: 'inherit' });
  console.log("Full 5-minute voiceover created at:", fullAudioPath);
} catch (e) {
  console.error("Audio concat error:", e);
}

// Step 2: Merge Video, Voiceover, and Burn-in Subtitles
console.log("Step 2: Merging video, audio narration, and burning in subtitles...");
try {
  if (!fs.existsSync(rawVideoPath)) {
    console.error("Raw video file not found at:", rawVideoPath);
    process.exit(1);
  }

  // Format SRT path for FFmpeg subtitles filter on Windows (escaped colons and backslashes)
  const escapedSrtPath = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');
  const subtitleFilter = `subtitles='${escapedSrtPath}':force_style='FontSize=18,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=2,Shadow=1,Alignment=2,MarginV=35'`;

  console.log("Executing FFmpeg encode with burned-in subtitles...");
  execSync(`"${ffmpegPath}" -y -i "${rawVideoPath}" -i "${fullAudioPath}" -vf "${subtitleFilter}" -c:v libx264 -pix_fmt yuv420p -preset medium -crf 22 -c:a aac -b:a 192k "${finalVideoPath}"`, { stdio: 'inherit' });

  fs.copyFileSync(finalVideoPath, standardVideoPath);

  console.log(`\n======================================================`);
  console.log(`SUCCESS! 5-Minute Pitch Video with Subtitles rendered at:`);
  console.log(finalVideoPath);
  console.log(`======================================================\n`);
} catch (e) {
  console.error("Video rendering error:", e);
}
