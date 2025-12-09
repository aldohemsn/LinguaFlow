
import { GoogleGenAI } from "@google/genai";
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:8080/api/generate';
const PASSPHRASE = process.env.PASSPHRASE || 'your_passphrase_here';

const TEST_TEXT = `On 29 July 2025, the European Central Bank (ECB) decided to introduce a “climate factor” to protect the Eurosystem against potential declines in the value of the collateral accepted in its refinancing operations, specifically in the event of adverse climate-related transition shocks. The ECB's climate factor will complement the Eurosystem’s existing risk management tools by incorporating forward-looking climate scenario analyses. In short, the ECB will attribute an uncertainty score to individual marketable assets of non-financial corporates used as a collateral based on: a) sector specific stressor (to count for the expected shortfall uniformly in a specific sector in the adverse scenario of the Eurosystem climate stress test); b) issuer specific exposure (based on the methodology for the climate tilting of the Corporate Sector Purchase Programme, i.e. indicators such as greenhouse gas (GHG) performance, disclosure quality, and decarbonisation targets); and c) asset-specific vulnerability (assessing sensitivity to future climate shocks taking into account the asset’s residual maturity). This uncertainty score will underpin the climate factor which may reduce the collateral’s value and limit the amount against which Eurosystem is willing to lend. In practice, this may imply less ECB liquidity when pledging bonds of high-emitting corporate issuers who lack robust emissions disclosures and credible transition plans. The ECB nevertheless expects the initial impact to be limited, given the current low borrowing levels and the modest use of corporate bonds as collateral.`;

async function runTest() {
    console.log("Starting Verification Test...");

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PASSPHRASE}`
    };

    // Step 1: Passage Insight (Background)
    console.log("\n--- Step 1: Passage Insight (Background) ---");
    // Simulate a Global Context from a previously analyzed full document
    const GLOBAL_CONTEXT = "This document is a technical guide on Central Bank collateral eligibility criteria, specifically focusing on environmental risk metrics.";

    const summaryRes = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            text: TEST_TEXT,
            mode: 'BACKGROUND_SUMMARY',
            context: GLOBAL_CONTEXT // Passing global context
        })
    });
    console.log("Status:", summaryRes.status);
    const summaryData = await summaryRes.json();

    if (!summaryData.result) {
        throw new Error("No result in summary data");
    }
    const summary = summaryData.result;
    console.log("Insight Result (should reflect global context):\n", summary);

    // Step 2: Deconstruct (Layman Logic)
    console.log("\n--- Step 2: Layman Logic (Deconstruct) ---");
    // SIMULATE EDIT: In a real app, the user might edit the summary.
    // Here we pass the raw summary as context.
    const logicRes = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            text: TEST_TEXT,
            mode: 'DECONSTRUCT',
            context: summary,
            targetAudience: "Junior Bankers" // Test target audience constraint for layman explanation? 
            // Note: Layman prompt now accepts targetAudience to contextualize "why" we break it down
        })
    });
    const logicData = await logicRes.json();
    const logic = logicData.result;
    console.log("Layman Logic Result:\n", logic);

    // Step 3: Reconstruct (Final Translation)
    console.log("\n--- Step 3: Final Translation (Reconstruct) ---");
    const reconstructionRes = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            text: TEST_TEXT,
            mode: 'RECONSTRUCT',
            // Pass the verified logic + insights
            context: `BACKGROUND INSIGHTS:\n${summary}\n\nVERIFIED LOGIC:\n${logic}`,
            targetAudience: 'Professional Financial Readers',
            purpose: 'INFORMATIVE'
        })
    });
    const reconstructionData = await reconstructionRes.json();
    console.log("Final Translation:", reconstructionData.result);
}

runTest().catch(console.error);
