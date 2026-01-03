import { GoogleGenAI, Type, Chat } from "@google/genai";
import { FileNode, ConceptBundle } from "../types";

const PROMPT_SUMMARY = `
You are a Principal Software Architect conducting a technical audit.
Analyze the provided codebase structure and content to generate a comprehensive "Codebase Executive Summary".
Format required (Markdown):
# Codebase Executive Summary
## 1. System Overview
## 2. Architecture & Patterns
## 3. Core Capabilities
## 4. Key Technical Components
## 5. Technology Stack
## 6. Ideal Use Cases
`;

const PROMPT_CONTEXT = `
You are an expert AI Data Engineer. Rewrite the essence of this codebase into a logic-dense "AI Context" format.
Output Format (Markdown):
# AI Context Optimized Context
## 1. Architectural Blueprint
## 2. Data Flow & State Management
## 3. Critical Path Analysis
## 4. Key Dependencies
## 5. Developer "Gotchas"
`;

const PROMPT_CONCEPTS = `
Analyze the provided codebase and identify 5 to 10 distinct "Feature Concepts" or "Architectural Bundles".
Examples: "Authentication Flow", "Theming Engine", "Data Persistence Layer", "API Integration Logic", "Responsive UI Framework".
Return ONLY a JSON array of objects with "id" (kebab-case), "name" (Title Case), and "description" (one short sentence).
`;

const PROMPT_RECREATOR = `
You are a 'System Recreator'. Based on the provided codebase and the SELECTED CONCEPTS, generate a 'Recreation Blueprint'.
Goal: Provide exactly what is needed to rebuild ONLY THESE FEATURES in a new project.

Selected Concepts to Extract: {{CONCEPTS}}

Output Format (Markdown):
# Reconstruction DNA Package: [Concept Names]

## 1. Core Logic Rules
[Explicit rules, architectural constraints, and "secret sauce" for this specific feature]

## 2. Data Contract & State
[Detailed explanation of the data shapes and state management specific to these features]

## 3. Implementation Blueprint (Pseudo-Code)
[A condensed, framework-agnostic blueprint for the primary logic]

## 4. Master Reconstructor Prompt
[A high-quality, long-form prompt that a developer can paste into another LLM (like Claude or ChatGPT) to generate the full functional code for these features from scratch based on this blueprint]
`;

const extractJsonArray = (text: string): string => {
  const match = text.match(/\[[\s\S]*\]/);
  return match ? match[0] : text;
};

export const generateAIInsights = async (
  flattenedCode: string, 
  files: FileNode[]
): Promise<{ summary: string; aiContext: string; concepts: ConceptBundle[] }> => {
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview"; 
  const fileTree = files.slice(0, 200).map(f => f.path).join('\n');
  const contextInput = `Structure:\n${fileTree}\n\nContent:\n${flattenedCode.substring(0, 400000)}`;

  const runTask = async (prompt: string, config?: any) => {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ text: prompt }, { text: contextInput }],
        config
      });
      return res.text || "";
    } catch (e: any) {
      console.error(`AI Task Failed: ${e.message}`);
      if (e.message?.includes("API key not valid") || e.message?.includes("INVALID_ARGUMENT") || e.message?.includes("400")) {
          throw new Error("API_KEY_INVALID");
      }
      return `[Insight unavailable: ${e.message}]`;
    }
  };

  const [summary, aiContext, conceptsRaw] = await Promise.all([
    runTask(PROMPT_SUMMARY),
    runTask(PROMPT_CONTEXT),
    runTask(PROMPT_CONCEPTS, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["id", "name", "description"]
        }
      }
    })
  ]);

  let concepts: ConceptBundle[] = [];
  try {
    if (conceptsRaw) {
      const jsonStr = extractJsonArray(conceptsRaw);
      concepts = JSON.parse(jsonStr);
    }
  } catch (e) {
    console.error("Failed to parse concepts JSON. Raw response:", conceptsRaw, e);
    // Fallback if parsing fails
    concepts = [
      { id: 'core-arch', name: 'Core Architecture', description: 'The fundamental structure of the provided codebase.' }
    ];
  }

  return { summary, aiContext, concepts };
};

export const recreateFeatureContext = async (
  flattenedCode: string,
  selectedConcepts: ConceptBundle[]
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  const conceptNames = selectedConcepts.map(c => c.name).join(", ");
  const prompt = PROMPT_RECREATOR.replace("{{CONCEPTS}}", conceptNames);
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        { text: prompt },
        { text: `Context:\n${flattenedCode.substring(0, 400000)}` }
      ]
    });
    return response.text || "Failed to generate extraction.";
  } catch (e: any) {
    console.error(`Recreation Task Failed: ${e.message}`);
    if (e.message?.includes("API key not valid") || e.message?.includes("INVALID_ARGUMENT") || e.message?.includes("400")) {
        throw new Error("API_KEY_INVALID");
    }
    throw e;
  }
};

export const startCodebaseChat = (flattenedCode: string): Chat => {
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || "" });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a Codebase Intelligence Assistant. Analyze this code and answer developer questions based on its contents.\n\nCodebase Context:\n${flattenedCode.substring(0, 400000)}`
    }
  });
};