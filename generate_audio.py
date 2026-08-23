import asyncio
import os
import edge_tts

VOICE = "en-US-ChristopherNeural"  # Professional, confident, clear American presenter voice

SECTIONS = [
    (
        "audio_01_intro.mp3",
        "Every day, millions of computer science students struggle when learning to code. With the rapid rise of Generative AI tools like ChatGPT and Copilot, students are increasingly copying and pasting AI-generated solutions rather than developing foundational problem-solving intuition. This creates a severe learning gap: students pass homework assignments, but fail fundamental technical interviews."
    ),
    (
        "audio_02_solution.mp3",
        "Welcome to Socrates IDE — the world’s first pedagogical, empathy-driven coding platform designed to bridge this critical gap. Instead of generating code for students, Socrates employs the classical Socratic Method: diagnosing root conceptual misunderstandings, asking targeted guiding questions, and providing real-time classroom telemetry for educators."
    ),
    (
        "audio_03_student_ide.mp3",
        "Let's log in to the Student Portal. The student is greeted with a sleek, distraction-free dark IDE. On the left pane, we have 10 curated data structure and algorithm problems with difficulty badges, problem constraints, and sample test cases."
    ),
    (
        "audio_04_pyodide.mp3",
        "In the center, we have our full code editor. When the student clicks Run Code, execution does not require a slow remote container. Socrates runs a Local WebAssembly Python runtime directly inside the student's browser. This guarantees zero-latency execution, offline resiliency, and instant test assertion evaluation."
    ),
    (
        "audio_05_socratic_mentor.mp3",
        "Now, let's look at our core innovation: the Socratic AI Mentor. When a student gets stuck or encounters an error, they open Socrates. When the student asks why their code is failing, Socrates never gives away the code. Instead, it analyzes the runtime error, identifies the root boundary misconception, and asks targeted questions to guide the student's thinking. Students can then confirm their understanding with interactive confidence check-ins."
    ),
    (
        "audio_06_educator_portal.mp3",
        "Now let's switch over to the Educator Portal. For professors and teaching assistants, teaching hundreds of students simultaneously makes it impossible to know who is struggling in real time. Socrates solves this with Empathy Telemetry."
    ),
    (
        "audio_07_heatmaps.mp3",
        "Educators get a real-time Misconception Heatmap aggregating class-wide stumbling blocks. Teachers can drill down into specific course sections, view live student integrity states, and click into any individual student to inspect their submitted code and full chronological Socratic dialogue replay."
    ),
    (
        "audio_08_architecture_closing.mp3",
        "Under the hood, Socrates IDE is powered by React, TypeScript, Pyodide WebAssembly, and Google Gemini with native system instructions and anti-leak sanitizers, backed by Supabase. Socrates IDE transforms AI from a passive cheating crutch into an empowering cognitive mentor. Thank you!"
    )
]

async def main():
    os.makedirs("demo_media/audio", exist_ok=True)
    print("Generating Neural AI Voiceover tracks...")
    for filename, text in SECTIONS:
        out_path = os.path.join("demo_media/audio", filename)
        print(f"Generating {filename}...")
        communicate = edge_tts.Communicate(text, VOICE, rate="+3%")
        await communicate.save(out_path)
        print(f"Saved {out_path}")

if __name__ == "__main__":
    asyncio.run(main())
