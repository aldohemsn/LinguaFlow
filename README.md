# LinguaFlow

LinguaFlow is a sophisticated, dual-mode Chinese-to-English translation tool powered by Google's latest Gemini AI models. It bridges the gap between raw literal understanding and professional, audience-tailored localization.

![App Screenshot Placeholder](https://via.placeholder.com/800x400?text=LinguaFlow+Translate+Interface)

## ✨ Features

### 1. Dual-Mode Translation Engine
*   **⚡ Fast Translator (Gemini Flash Lite):** Delivers rapid, accurate, and literal translations. Perfect for quickly understanding the core meaning of a Chinese text without embellishment.
*   **✍️ Pro Proofreader (Gemini Pro):** Takes the literal draft and refines it into native-level, polished English. It decouples the text from Chinese syntax to ensure a natural flow.

### 2. Audience-Centric Polishing
In **Proofreader Mode**, you don't just get "better English"—you get English tailored to your specific reader.
*   **Target Audience Personas:** Define who will read your text (e.g., "Investors", "Legal Professionals", "Gen Z").
*   **Role-Playing AI:** The AI acts as a representative of that audience to ensure the tone, vocabulary, and style resonate perfectly.
*   **Iterative Refinement:** Click "Polish" repeatedly to generate variations or further refine the text.

### 3. Contextual Awareness
*   **Context Panel:** Provide background information (or let the AI infer it from uploaded documents) to resolve ambiguities and set the correct atmosphere.
*   **Smart Inference:** Capable of analyzing large text samples to automatically determine the document type, tone, and intended audience.

### 4. Security & Access Control
*   **Passphrase Authentication:** Protect your deployment with a simple, secure passphrase mechanism.
*   **Secure API Handling:** All AI requests are proxied through a secure Express backend.

## 🛠️ Tech Stack

*   **Frontend:** [React 19](https://react.dev/) + TypeScript + [Vite](https://vitejs.dev/)
*   **Backend:** Node.js + [Express](https://expressjs.com/)
*   **AI:** [Google GenAI SDK](https://www.npmjs.com/package/@google/genai)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/)

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
    Create a `.env` file in the root directory:
    ```env
    PORT=8080
    GEMINI_API_KEY=your_actual_api_key_here
    PASSPHRASE=your_secure_passphrase_here
    ```

### Running the Application

**Development:**
```bash
npm run dev
```

**Production:**
1.  Build the frontend:
    ```bash
    npm run build
    ```
2.  Start the server:
    ```bash
    npm start
    ```

## 📖 Usage Guide

1.  **Login:** Enter your passphrase to unlock the interface.
2.  **Translate:** Type your Chinese text and click "Translate" for a fast, literal draft.
3.  **Refine:** Switch to "Polish" mode, set a Target Audience (e.g., "Academic"), and click "Polish" to transform the text into professional English.
4.  **Context:** Use the sidebar to upload a document for context analysis if your text is part of a larger work.

## 📄 License

This project is open-source and available for personal and educational use.