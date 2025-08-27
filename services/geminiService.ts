import { GoogleGenAI, Type } from "@google/genai";

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

export const getDeviceInfo = async (ipAddress: string): Promise<any> => {
  if (!API_KEY) {
    return { error: "Gemini API key is not configured." };
  }
  
  try {
    const prompt = `
      You are a network device information simulator. For the IP address ${ipAddress}, generate a plausible but fictional JSON object representing a network device. 
      The device can be a firewall or a switch. Make the data realistic.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ipAddress: { type: Type.STRING },
            deviceType: { type: Type.STRING },
            vendor: { type: Type.STRING },
            model: { type: Type.STRING },
            osVersion: { type: Type.STRING },
            uptime: { type: Type.STRING },
            openPorts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  port: { type: Type.INTEGER },
                  service: { type: Type.STRING },
                  protocol: { type: Type.STRING }
                },
                required: ["port", "service", "protocol"]
              }
            }
          },
          required: ["ipAddress", "deviceType", "vendor", "model", "osVersion", "uptime", "openPorts"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching device info from Gemini:", error);
    if (error instanceof Error) {
        return { error: `An error occurred while contacting the AI service: ${error.message}` };
    }
    return { error: "An unknown error occurred while contacting the AI service." };
  }
};
