
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getTroubleshootingSteps = async (ipAddress: string): Promise<string> => {
  if (!API_KEY) {
    return "Error: Gemini API key is not configured. Please set the API_KEY environment variable.";
  }
  
  try {
    const prompt = `
      You are a senior network engineering consultant. An Intrusion Prevention System (IPS) at IP address ${ipAddress} is unresponsive to pings.
      Provide a concise, step-by-step troubleshooting guide for a network administrator.
      Use markdown for formatting. Focus on clarity and actionable steps.
      Start with the most common and simplest checks first.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching troubleshooting steps from Gemini:", error);
    if (error instanceof Error) {
        return `An error occurred while contacting the AI service: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI service.";
  }
};
