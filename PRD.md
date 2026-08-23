# Product Requirements Document (PRD): Socrates-IDE

## 1. Project Overview
**Project Name:** Socrates-IDE (Hackathon MVP)
**Theme:** Systemic Design Blueprints for Just-in-Time Feedback Loops
**Objective:** To build an educational coding environment that prevents the "Answer Machine" epidemic. The IDE intercepts compilation errors and utilizes an AI tutor to guide students through the debugging process using the Socratic method (70% diagnostic questions, 30% hints). 

## 2. Target Audience
*   **Students (Ages 14-22):** Learning introductory programming (Python and JavaScript) who need immediate, guided feedback when stuck, rather than delayed teacher grading.
*   **Educators / Teachers:** Who need scalable insights into class misconceptions and student debugging resilience without manually reviewing hundreds of failed code executions.

## 3. Tech Stack Architecture
*   **Frontend Framework:** React 18 (TypeScript) via Vite
*   **Styling:** Tailwind CSS + Lucide React (Icons)
*   **Code Editor:** Monaco Editor (`@monaco-editor/react`)
*   **Code Execution Engine:** Pyodide (Python WebAssembly) & Native Browser JS Engine (100% Client-Side execution; zero bandwidth/server costs)
*   **AI Engine:** Google Gemini API (Strictly prompted for Socratic pedagogy)
*   **Database (MVP):** Supabase (PostgreSQL). Provides a real, cloud-hosted database for live, cross-device demos between the Student IDE and the Teacher Dashboard.

*Note: VS Code/JetBrains extension development is explicitly out of scope for the MVP.*

## 4. User Interface (UI) Layout
The MVP utilizes a clean, 2-Pane educational layout inspired by enterprise platforms.

### 4.1. Left Pane (Problem View)
*   **Problem Statement:** Displays the current coding task and constraints.
*   **Sample Test Cases:** Collapsible section showing expected inputs and outputs.

### 4.2. Right Pane (Developer View)
*   **Top Half (Editor):** The Monaco Code Editor taking up the full pane initially. Contains "Run" and "Submit" buttons in the header.
*   **Bottom Half (Execution Panel):** Remains hidden until "Run" or "Submit" is clicked. Slides up to reveal two tabs:
    *   **Terminal Tab:** Raw standard output and traceback errors.
    *   **Test Cases Tab:** Displays Average/Max execution time, Passed/Failed test cases (Shown vs. Hidden), Expected vs. Actual output, and the **AI Code Feedback** score.

### 4.3. Floating AI Widget
*   **Draggable Socratic Chat:** A popup chat window that can be dragged anywhere on the screen. Includes quick-action chips.

## 5. Core MVP Features & Logic

### Feature 1: Dual Login Routing
*   A mock login screen routing users to either the **Student IDE** or the **Teacher Empathy Dashboard**.

### Feature 2: The Socratic Error Mentor
*   When code fails, the raw error prints to the terminal.
*   A "Need Help?" button appears. If clicked, the AI reads the traceback and asks a diagnostic question to guide the student to the solution. It is strictly forbidden from providing copy-pasteable code.

### Feature 2a: Concept Confusion Tagging
*   When the AI diagnoses the root cause of a student's error (e.g., off-by-one, wrong data structure, misunderstood recursion), it tags the misconception category alongside the session log.
*   These tags feed the Teacher Empathy Dashboard as an aggregated **class-wide misconception heatmap**, surfacing patterns (e.g., "60% of the class struggled with recursion this week") instead of raw per-student submission data.

### Feature 2b: Socratic Question History / Replay
*   Every diagnostic question and hint exchanged during a debugging session is logged in sequence.
*   Students and teachers can scroll back through this Q&A trail to see *how* a fix was reached — not just the final passing code — making the debugging process itself visible and reviewable.

### Feature 2c: Confidence Check-In
*   After each hint is delivered, the AI asks a lightweight confirmation ("Does that make sense?") before proceeding.
*   If the student indicates "no," the AI stays at the same hint level rather than advancing; if "yes," it resumes the Socratic questioning flow. Reinforces that this is guided pedagogy, not a chatbot dispensing answers.

### Feature 3: The Efficiency Mentor (Big-O Analysis)
*   When code *passes* all test cases, the AI analyzes the logic and provides an "AI Code Feedback" score, challenging the student to optimize their time/space complexity.

### Feature 4: Idle Detection ("Are you stuck?")
*   If a student is idle for a set period without typing or running code, a lightweight popup appears asking, *"Are you stuck? You've been idle for a while, want some help?"*

### Feature 5: Smart Anti-Cheating (Paste & Anomaly Blocker)
*   **Feature 5a (Paste Blocker):** Students are allowed to copy and paste code *internally* within the editor. Pasting code from external sources (e.g., ChatGPT, StackOverflow) is intercepted and blocked to enforce active typing.
*   **Feature 5b (Keystroke Velocity & Anomaly Escalation):** The IDE monitors typing speed (WPM) to detect unnatural bursts of code input (e.g., macro scripts bypassing the paste blocker). 
    *   **Escalation Tier 1 (Soft Nudge):** On the first anomaly, the system flags the behavior and gives the student a soft warning popup.
    *   **Escalation Tier 2 (Account Lock):** On repeated anomalies, the account is temporarily suspended. Upon login, the student hits a "Temporarily Suspended" wall restricting all IDE access.
    *   **Self-Appeal Path:** On the suspension screen, the student is shown a "Request Review" text box to explain the flagged activity. The appeal note is saved to the database and surfaces directly in the Teacher Dashboard's unblock queue.

### Feature 6: Teacher "Empathy Dashboard"
*   When a student clicks "Submit", their code, execution stats, and AI feedback are saved to the Supabase database.
*   Teachers can log in to view these submissions, alongside metrics like "Debugging Resilience" and "Focus Mode" violations.
*   The dashboard surfaces the **class-wide misconception heatmap (from Feature 2a)**.
*   The dashboard provides an interface to review anomaly flags — **including any student appeal notes** — and unblock suspended accounts (from Feature 5b).
