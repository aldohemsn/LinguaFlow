# LinguaFlow: Passage-Oriented Professional Translation Helper

LinguaFlow is a specialized translation environment designed for high-stakes professional translation. It replaces the traditional "literal translation -> editing" workflow with a **"Passage-Oriented, Human-in-the-Loop"** process powered by Google's Gemini AI.

![App Screenshot Placeholder](https://via.placeholder.com/800x400?text=LinguaFlow+3-Step+Workflow)

## 🧠 The Core Philosophy

Traditional AI translators often produce "Translationese"—text that is grammatically correct but structurally mimicked the source language. LinguaFlow breaks this by treating translation as a **verified reconstruction** process:

1.  **Contextualize first**: Understanding the global document domain.
2.  **Deconstruct logic**: Smashing the source structure into simple, verified logic.
3.  **Reconstruct blindly**: Writing the final text from the verified logic *without looking at the source*, ensuring a native flow.

---

## ✨ Key Features

### 1. 4-Step Passage Workflow (The "Wizard")
Instead of a simple "Translate" button, LinguaFlow guides you through a rigorous 4-step production process for each difficult passage:

1.  **Insight (Domain Analysis)**: AI defines the context and key terms.
2.  **Logic (Layman's Explanation)**: AI explains the meaning simply.
3.  **Literal (Strict Translation)**: AI translates the verify logic literally.
4.  **Editor (Professional Polish)**: AI refines the text into native-level quality.

### 2. Global Context Injection
*   Upload your full source document (PDF/Text) at the start.
*   The system extracts a "Global Context" (Topic, Tone, Audience) that is silently injected into every subsequent passage analysis, ensuring consistency across unconnected paragraphs.

### 3. Audience & Purpose Control
*   **Target Audience**: Define who you are writing for (e.g., "Junior Bankers", "General Public"). The "Layman Logic" step adapts to explain things at the right level.
*   **Purpose**: choose "Informative", "Expressive", or "Operative" to control the final rhetorical strategy.

### 4. Technical Resilience
*   **Offline-First PWA**: Built to work in low-connectivity environments.
*   **Self-Contained**: All fonts and assets are local; reliable access even in restricted networks (GFW-friendly).
*   **Secure**: Passphrase-protected entry.

---

## 🛠️ Tech Stack
*   **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
*   **Backend:** Node.js, Express
*   **AI Engine:** Google Gemini 2.5 (Flash Lite for Speed, Pro for Logic/Reconstruction)

## 🚀 Usage

1.  **Context Setup**: Upload your document or describe the global context. Set your Target Audience.
2.  **The Loop**:
    *   Paste a difficult passage.
    *   **Verify** the Insight (Definitions).
    *   **Verify** the Logic (Simple Explanation). *Edit this if the AI is wrong!*
    *   **Verify** the Literal Translation.
    *   Receive the final **Editor** output.

## 📄 License
Open source for educational and personal use.