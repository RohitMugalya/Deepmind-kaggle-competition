import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent } from "../types";

export const generateMotionScript = async (prompt: string): Promise<GeneratedContent> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are an expert Motion Graphics Engineer specializing in Motion Canvas (TypeScript) and HTML5 Canvas API.
    
    Your goal is to accept a natural language description of an animation and return two things:
    1. A valid, production-ready Motion Canvas (TSX) code snippet using @motion-canvas/core and @motion-canvas/2d.
    2. A standalone JavaScript function body that approximates this animation using the standard HTML5 Canvas API (CanvasRenderingContext2D) for an immediate lightweight preview in the browser.

    For the 'previewCode', do not include the function signature, just the body. 
    The body will be executed inside a function with signature: (ctx, width, height, t) where:
    - ctx: CanvasRenderingContext2D
    - width: number (canvas width)
    - height: number (canvas height)
    - t: number (time in seconds, running continuously)

    Ensure the preview code clears the canvas if needed (though the runner might do it, it's safer to do it) and draws the frame for time 't'.
    Make the animation loop seamlessly if possible or just play through.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Create an animation for: ${prompt}`,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          motionCanvasCode: {
            type: Type.STRING,
            description: "The full TSX code for a Motion Canvas project file (e.g., scene.tsx). Should include imports from @motion-canvas/2d etc.",
          },
          previewCode: {
            type: Type.STRING,
            description: "JavaScript function body for HTML5 Canvas. Vars available: ctx, width, height, t. Example: 'ctx.clearRect(0,0,width,height); ctx.fillStyle=\"red\"; ...'",
          },
          explanation: {
            type: Type.STRING,
            description: "A brief explanation of what the code does.",
          },
        },
        required: ["motionCanvasCode", "previewCode", "explanation"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini.");
  }

  try {
    return JSON.parse(text) as GeneratedContent;
  } catch (e) {
    console.error("Failed to parse JSON response", text);
    throw new Error("Invalid JSON response from AI model.");
  }
};