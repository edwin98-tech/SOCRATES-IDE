import asyncio
import os
import json
import edge_tts
from mutagen.mp3 import MP3

VOICE = "en-US-ChristopherNeural"

SCRIPT_SEGMENTS = [
    {
        "id": "scene_01",
        "file": "scene_01_intro.mp3",
        "title": "Scene 1: Introduction & Problem",
        "sentences": [
            "Every year, millions of students embark on their computer science journey.",
            "However, the rapid explosion of Generative AI tools has introduced a severe challenge: students rely on copy-pasting full code solutions from chat interfaces, bypassing critical algorithmic thinking.",
            "They pass automated homework checks, but struggle when asked to explain their logic or write code from scratch in technical interviews."
        ]
    },
    {
        "id": "scene_02",
        "file": "scene_02_solution.mp3",
        "title": "Scene 2: Introducing Socrates IDE",
        "sentences": [
            "Welcome to Socrates IDE — a next-generation pedagogical platform engineered specifically for computer science education.",
            "Socrates replaces passive answer generation with active cognitive scaffolding, applying the time-tested Socratic Method to diagnose root misconceptions and empower students to solve problems independently."
        ]
    },
    {
        "id": "scene_03",
        "file": "scene_03_portals.mp3",
        "title": "Scene 3: Dual Portal Architecture",
        "sentences": [
            "Our landing experience features a sleek dual-portal architecture.",
            "Students access an interactive, proctored coding workspace, while educators enter a real-time telemetry dashboard.",
            "With zero-configuration instant demo launchers, professors and evaluators can jump right into either experience seamlessly."
        ]
    },
    {
        "id": "scene_04",
        "file": "scene_04_curriculum.mp3",
        "title": "Scene 4: Student Workspace & DSA Curriculum",
        "sentences": [
            "Entering the Student Portal, learners are greeted by a distraction-free dark interface.",
            "On the left pane, students can explore ten curated data structure and algorithm challenges, spanning array operations, linear search, in-place reversal, two sum, binary search, palindrome checking, and stack-based valid parentheses."
        ]
    },
    {
        "id": "scene_05",
        "file": "scene_05_wasm.mp3",
        "title": "Scene 5: Local Pyodide WebAssembly Execution",
        "sentences": [
            "Unlike traditional cloud-based coding platforms that suffer from remote server queues and execution lag, Socrates IDE runs a full Python runtime directly inside the browser using WebAssembly and Pyodide.",
            "Code execution is instantaneous, completely sandbox-secure, and capable of functioning even in low-bandwidth classroom environments."
        ]
    },
    {
        "id": "scene_06",
        "file": "scene_06_execution.mp3",
        "title": "Scene 6: Test Assertions & Ergonomics",
        "sentences": [
            "With ergonomic shortcuts like Control Enter to run code and Control Shift Enter to submit solutions, students receive immediate feedback on public and hidden test assertions.",
            "Execution metrics, standard output logs, and Big-O efficiency feedback are presented in a clean bottom slide-up terminal."
        ]
    },
    {
        "id": "scene_07",
        "file": "scene_07_socratic_ai.mp3",
        "title": "Scene 7: Socratic AI Mentor & Guidance",
        "sentences": [
            "When students get stuck or encounter runtime bugs, they interact with the Socrates AI Mentor — represented by our friendly Owl Mascot.",
            "The mentor adheres to strict pedagogical rules: it never outputs direct copy-paste code.",
            "Instead, it reads the runtime traceback and student code to ask targeted, bite-sized diagnostic questions."
        ]
    },
    {
        "id": "scene_08",
        "file": "scene_08_checkins.mp3",
        "title": "Scene 8: Confidence Check-Ins & Anti-Leak",
        "sentences": [
            "After each guidance turn, students engage with interactive confidence check-ins, allowing the AI to adapt its explanations dynamically.",
            "Behind the scenes, our integration with the Google Gemini API uses native system instructions and regex sanitizers to eliminate model draft leaks and ensure pure, natural conversational dialogue."
        ]
    },
    {
        "id": "scene_09",
        "file": "scene_09_educator_intro.mp3",
        "title": "Scene 9: The Educator Portal & Telemetry",
        "sentences": [
            "Now let us transition to the Educator Portal.",
            "In large university courses with hundreds of students, instructors often have no visibility into where their class is stumbling until exam day.",
            "Socrates IDE solves this with real-time Empathy Telemetry."
        ]
    },
    {
        "id": "scene_10",
        "file": "scene_10_heatmaps.mp3",
        "title": "Scene 10: Misconception Heatmaps",
        "sentences": [
            "Educators receive a live class heatmap aggregating common algorithmic pitfalls — from off-by-one loop boundaries to stack underflows.",
            "Instructors can filter by course sections, such as CS-101 Data Structures or CS-102 Algorithms, and identify struggling students in seconds."
        ]
    },
    {
        "id": "scene_11",
        "file": "scene_11_code_replay.mp3",
        "title": "Scene 11: Student Code & Dialogue Replay",
        "sentences": [
            "Clicking into any student card allows professors to inspect submitted code snapshots alongside the full chronological Socratic debugging dialogue.",
            "Instructors can review the exact questions the student asked, check their confidence responses, and send personalized feedback directly to the student."
        ]
    },
    {
        "id": "scene_12",
        "file": "scene_12_conclusion.mp3",
        "title": "Scene 12: Technical Stack & Conclusion",
        "sentences": [
            "Built with React, TypeScript, Tailwind CSS, Pyodide WASM, Google Gemini, and Supabase, Socrates IDE transforms AI from a cheating crutch into an empowering cognitive mentor.",
            "Thank you for exploring Socrates IDE!"
        ]
    }
]

def format_srt_time(seconds):
    millis = int((seconds - int(seconds)) * 1000)
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

async def main():
    os.makedirs("demo_5min/audio", exist_ok=True)
    
    print("Generating 5-minute audio segments...")
    segment_durations = []
    srt_entries = []
    current_time = 0.0
    subtitle_index = 1

    for seg in SCRIPT_SEGMENTS:
        full_text = " ".join(seg["sentences"])
        out_path = os.path.join("demo_5min/audio", seg["file"])
        
        print(f"Synthesizing {seg['file']}...")
        communicate = edge_tts.Communicate(full_text, VOICE, rate="+1%")
        await communicate.save(out_path)
        
        # Get duration
        audio = MP3(out_path)
        duration = audio.info.length
        segment_durations.append({
            "id": seg["id"],
            "file": seg["file"],
            "title": seg["title"],
            "duration": duration,
            "startTime": current_time,
            "endTime": current_time + duration
        })

        # Calculate approximate sentence timestamps for subtitles
        total_chars = sum(len(s) for s in seg["sentences"])
        seg_time = current_time
        for sentence in seg["sentences"]:
            sent_duration = (len(sentence) / total_chars) * duration
            start_str = format_srt_time(seg_time)
            end_str = format_srt_time(seg_time + sent_duration)
            srt_entries.append(f"{subtitle_index}\n{start_str} --> {end_str}\n{sentence}\n")
            subtitle_index += 1
            seg_time += sent_duration

        current_time += duration

    # Save timings
    with open("demo_5min/timings.json", "w") as f:
        json.dump(segment_durations, f, indent=2)

    # Save SRT Subtitles
    srt_path = "demo_5min/subtitles.srt"
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(srt_entries))

    print(f"\nAll audio generated! Total duration: {current_time:.2f} seconds ({current_time/60:.2f} minutes).")
    print(f"Subtitles saved to {srt_path}")

if __name__ == "__main__":
    asyncio.run(main())
