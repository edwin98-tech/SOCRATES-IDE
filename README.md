<div align="center">

# 🏛️ Socrates IDE
### *Empathy-Driven Socratic AI Coding Platform for Computer Science Education*

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-Pyodide_Python-654FF0?style=for-the-badge&logo=webassembly&logoColor=white)](https://pyodide.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime_Telemetry-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

<br/>

[![Watch Demo Video](https://img.shields.io/badge/▶_Watch_Pitch_Video-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/Ce-jjRcyxRY)

</div>

---

## 📺 5-Minute Prototype Pitch Video
Watch our full video presentation demonstrating the Student IDE, Pyodide WASM execution, Socratic AI dialogue, and the Educator Telemetry Portal:

🔗 **[Watch on YouTube: https://youtu.be/Ce-jjRcyxRY](https://youtu.be/Ce-jjRcyxRY)**

---

## 📌 The Problem: The AI Crutch in CS Education
With the rapid explosion of Generative AI tools (ChatGPT, Copilot), computer science students are increasingly copying and pasting AI-generated code rather than developing foundational problem-solving intuition. They pass automated homework checks, but fail fundamental technical interviews and conceptual exams.

### 💡 The Solution: Socratic AI & Empathy Telemetry
**Socrates IDE** replaces passive answer generation with active cognitive scaffolding. Instead of giving away direct code solutions:
1. **Socratic AI Mentor:** Diagnoses root conceptual misunderstandings (e.g. off-by-one loop boundaries, recursion flaws, or stack underflows) and asks targeted, bite-sized questions to guide the student.
2. **Local WebAssembly Python Runtime (Pyodide):** Executes student code instantly in-browser with zero remote server lag or cold starts.
3. **Educator Empathy Telemetry:** Gives professors real-time class heatmaps, tracking common student stumbling blocks and chronological dialogue replays.

---

## 🚀 Key Features

### 🧑‍🎓 1. Student Portal & In-Browser IDE
* **Local Pyodide WASM Runtime:** In-browser Python 3 execution with instant test assertions, zero queue wait times, and offline capabilities.
* **10 Curated DSA Problems:** Complete algorithmic curriculum covering Array Traversal, Linear Search, In-Place Reversal, Two Sum, Min/Max Search, Binary Search, Palindrome Check, Valid Parentheses Stack, Bubble Sort, and Remove Duplicates.
* **Ergonomic Keyboard Shortcuts:**
  * `Ctrl + Enter` $\rightarrow$ Run Code
  * `Ctrl + Shift + Enter` $\rightarrow$ Submit Solution
  * `Esc` $\rightarrow$ Close Socratic AI Chat
* **Big-O & Efficiency Analysis:** Instant feedback on runtime efficiency and automated assertion tests.

### 🦉 2. Socratic AI Mentor (Owl Mascot)
* **Never Spoils Code:** Adheres to strict pedagogical rules; guides thinking through analogies and mental models without writing solutions.
* **Google Gemini API with Native `system_instruction`:** Built-in anti-leak sanitizers strip out reasoning drafts and output pure, natural conversational dialogue.
* **Interactive Confidence Check-Ins:** Real-time feedback buttons (`👍 Yes` / `❓ Clarify`) allow the AI to adapt its explanations dynamically.
* **Draggable & Persistent Mascot:** Retains custom desktop docking positions across page reloads.

### 👨‍🏫 3. Educator Telemetry Portal
* **Class-Wide Misconception Heatmaps:** Aggregates real-time student stumbling blocks across course sections (CS-101 Data Structures, CS-102 Algorithms, Python Lab).
* **Section & Student Drill-Down:** Multi-level roster view with live AI score matrices and completion rates.
* **Chronological Socratic Replay:** Inspect any student's submitted code snapshots side-by-side with their complete AI debugging chat history.
* **Private Pedagogical Feedback:** Send personalized commendations or guidance directly to students.
* **Proctoring & Anomaly Queue:** Flags and manages integrity locks (anti-paste violations, tab switches).

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Student Browser] -->|Monaco Editor| B[Pyodide WASM Engine]
    B -->|Zero-Latency Execution| C[Local Test Harness Assertions]
    A -->|Ask for Guidance| D[Socrates AI Mentor]
    D -->|Pedagogical System Prompt| E[Google Gemini API]
    E -->|Anti-Leak Sanitizer| D
    A -->|Submit & Chat Logs| F[(Supabase Realtime)]
    F -->|Telemetry & Heatmaps| G[Educator Portal]
    G -->|Direct Teacher Feedback| A
```

---

## 📁 Repository Structure

```text
SOCRATES-IDE/
├── socrates-web/                   # Main Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── StudentIDE.tsx      # Monaco IDE + 10 DSA Curriculum + Test Harness
│   │   │   ├── SocraticChat.tsx    # Draggable Socratic AI Chat + Owl Mascot
│   │   │   ├── TeacherDashboard.tsx# Educator Portal + Heatmaps + Dialogue Replay
│   │   │   ├── CodeEditor.tsx      # Monaco Editor wrapper with anti-paste proctoring
│   │   │   ├── ExecutionPanel.tsx  # Bottom slide-up terminal & Big-O analyzer
│   │   │   ├── AISettingsModal.tsx # Gemini API Key & model configuration
│   │   │   └── ProblemCreatorModal.tsx # Teacher custom problem authoring
│   │   ├── lib/
│   │   │   ├── gemini.ts           # Gemini API client + Socratic prompt sanitizer
│   │   │   └── supabaseClient.ts   # Supabase backend client
│   │   ├── App.tsx                 # Dual Portal Router & Modern Login Screen
│   │   └── main.tsx                # Application Entrypoint
│   ├── package.json                # Project dependencies
│   └── vite.config.ts              # Vite configuration
├── socrates_pitch_thumbnail.jpg    # 16:9 HD Pitch Thumbnail
├── PRD.md                          # Product Requirements Document
├── README.md                       # Project Documentation
└── .gitignore                      # Git exclusion rules
```

---

## ⚡ Quick Start Guide

### Prerequisites
* **Node.js**: v18.0 or higher
* **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/socrates-ide.git
   cd socrates-ide/socrates-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   ```bash
   cp .env.example .env
   ```
   *(You can also configure your Gemini API Key directly within the UI via the `⚙️ Settings` modal!)*

4. **Start the local development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to **[http://localhost:5173](http://localhost:5173)** to explore Socrates IDE!

---

## 🧪 Demo Credentials (One-Click Launch)
The platform includes quick 1-click demo launch buttons on the login screen:
* **🧑‍🎓 Student Portal:** Click `⚡ Launch Student IDE` (Username: `demo student`)
* **👨‍🏫 Educator Portal:** Click `⚡ Launch Educator Portal` (Username: `demo teacher`)

---

## 👥 Authors & Acknowledgments
Built with ❤️ for empowering the next generation of computer scientists through empathetic, Socratic AI pair programming.

* **Demo Video:** [https://youtu.be/Ce-jjRcyxRY](https://youtu.be/Ce-jjRcyxRY)
* **License:** MIT License
