# LinguaFlow Translate

LinguaFlow Translate is a sophisticated, dual-mode Chinese-to-English translation tool powered by Google's latest Gemini AI models. It bridges the gap between raw literal understanding and professional, audience-tailored localization.

![App Screenshot Placeholder](https://via.placeholder.com/800x400?text=LinguaFlow+Translate+Interface)

## ✨ Features

### 1. Dual-Mode Translation Engine
*   **⚡ Fast Translator (Gemini Flash Lite):** Delivers rapid, accurate, and literal translations. Perfect for quickly understanding the core meaning of a Chinese text without embellishment.
*   **✍️ Pro Proofreader (Gemini Pro):** Takes the literal draft and refines it into native-level, polished English. It decouples the text from Chinese syntax to ensure a natural flow.

### 2. Audience-Centric Polishing
In **Proofreader Mode**, you don't just get "better English"—you get English tailored to your specific reader.
*   **Target Audience Personas:** Define who will read your text (e.g., "Investors", "Legal Professionals", "Gen Z").
*   **Role-Playing AI:** The AI acts as a representative of that audience to ensure the tone, vocabulary, and style resonate perfectly.

### 3. Contextual Awareness
*   **Context Panel:** Provide background information (or let the AI infer it from uploaded documents) to resolve ambiguities and set the correct atmosphere.
*   **Smart Inference:** Capable of analyzing large text samples to automatically determine the document type, tone, and intended audience.

## 🛠️ Tech Stack

*   **Frontend:** [React 19](https://react.dev/) + TypeScript
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **AI Integration:** [Google GenAI SDK](https://www.npmjs.com/package/@google/genai)
*   **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn
*   A Google Gemini API Key

### Installation

1.  **Navigate to the project directory:**
    ```bash
    cd LinguaFlow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` or `.env.local` file in the root directory and add your Gemini API Key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open your browser and visit `http://localhost:3000`.

## 📖 Usage Guide

1.  **Select Mode:** Toggle between "Translator" (for speed/literal meaning) and "Proofreader" (for publishing).
2.  **Input Text:** Type or paste your Chinese text into the input area.
3.  **Add Context (Optional):** Use the sidebar to add background info or specify a target audience (Proofreader mode only).
4.  **Translate:** Click the translate button.
5.  **Review:** See the result instantly. Switching modes will automatically re-process your last input.

## 📄 License

This project is open-source and available for personal and educational use.
