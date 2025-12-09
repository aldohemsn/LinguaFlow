# LinguaFlow Production Workflow & Resources

This document outlines the standard operating procedure (SOP) for high-stakes translation using LinguaFlow, detailing the inputs required and the AI resources utilized at each stage.

## 🟢 Workflow Overview

LinguaFlow treats translation not as a single step, but as a **Verification & Reconstruction Pipeline**.

### Step 0: Preparation (Context)
*   **Input**: Full Document (PDF/Text) or Global Context Description.
*   **Action**: The system extracts a "Global Context" (Topic, Tone, Audience).
*   **Model**: `gemini-3-pro-preview` (Reasoning Model)
*   **Purpose**: To ground all subsequent steps in the broader document reality.

---

### Step 1: Insight (Passage Contextualization)
*   **Input**: Raw Source Passage (The text you pasted).
*   **System Inputs**: Global Context (from Step 0), Target Audience.
*   **Action**: The AI identifies the micro-domain, defines key terms, and flags false friends.
*   **Model**: `gemini-3-pro-preview` (Reasoning Model)
*   **User Role**: Review and refine the definitions.

---

### Step 2: Logic (Layman's Explanation)
*   **Input**: Insight (from Step 1).
*   **System Inputs**: Global Context, Target Audience.
*   **Action**: The AI ignores the source structure and explains the *meaning* and *logic* in simple, linear language (The Feynman Technique).
*   **Model**: `gemini-3-pro-preview` (Reasoning Model)
*   **User Role**: **CRITICAL VERIFICATION**. Read the logic. Does it make sense? If the logic is wrong, the translation WILL be wrong. Edit this explanation until it is perfect.

---

### Step 3: Literal (Verified Literal Translation)
*   **Input**: Raw Source Passage.
*   **System Inputs**:
    1.  **Verified Logic** (Your edited Step 2 output) - Acts as the definitive guide for meaning.
    2.  **Global Context** - Background info.
    3.  **Target Audience** & **Purpose**.
*   **Action**: The AI translates the source text **literally** and **completely**. It is allowed to sound like "translationese" to ensure accuracy and completeness.
*   **Model**: `gemini-2.5-flash-lite` (Fast Literal Model)
*   **User Role**: Quick check for missing numbers/clauses.

---

### Step 4: Editor (Professional Polish)
*   **Input**: Literal Translation (from Step 3).
*   **System Inputs**: Global Context, Target Audience, Purpose.
*   **Action**: The AI acts as a native expert editor. It rewrites the literal text to flow naturally and professionally, fixing the "translationese" from Step 3.
*   **Model**: `gemini-3-pro-preview` (Reasoning Model)
*   **User Role**: Final approval.

---

## 🤖 Model Resource Allocation

| Stage | Resource | Justification |
| :--- | :--- | :--- |
| **Logic & Reasoning** | `gemini-3-pro-preview` | Used for Steps 1, 2, and 4. These require deep understanding, domain separation, and stylistic nuance. |
| **Literal Translation** | `gemini-2.5-flash-lite` | Used for Step 3. This model is faster and tends to be more obedient/literal, which is perfect for the "Raw Accuracy" layer. |
