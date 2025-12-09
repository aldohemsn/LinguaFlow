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

### 1. 3-Step Passage Workflow (The "Wizard")
Instead of a simple "Translate" button, LinguaFlow guides you through a rigorous production process for each difficult passage:

*   **Step 1: Passage Insight (The Strategist)**
    *   AI analyzes the text to define the specific micro-domain (e.g., "Central Bank Collateral").
    *   Extracts key terms and warns of "False Friends".
    *   *You review and refine these definitions.*

*   **Step 2: Layman's Logic (The Deconstructor)**
    *   AI acts as a "Simulated Layman" using the Feynman Technique to explain the passage's logic in simple, linear language.
    *   **Human-in-the-Loop**: You verify this logic. If the AI misunderstood the cause-and-effect, you fix the "Layman explanation" here.

*   **Step 3: Professional Reconstruction (The Blind Editor)**
    *   **Strict Physical Isolation**: The AI *source text input is removed*.
    *   The model reconstructs the final professional text using *only* your **Verified Logic** (from Step 2) and the **Strategic Terms** (from Step 1).
    *   **Result**: A translation that is terminologically accurate but structurally completely decoupled from the source.

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
    *   Receive the final **Reconstruction**.
3.  **Polish**: Optionally use the "Polish" tool for final native-speaker refinement.

## 📄 License
Open source for educational and personal use.