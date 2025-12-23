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

export const generateAIInsights = async (
  flattenedCode: string, 
  files: FileNode[]
): Promise<{ summary: string; aiContext: string; concepts: ConceptBundle[] }> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview"; 
  const fileTree = files.map(f => f.path).join('\n');
  const contextInput = `Structure:\n${fileTree}\n\nContent:\n${flattenedCode.substring(0, 500000)}`;

  const [summaryRes, contextRes, conceptsRes] = await Promise.all([
    ai.models.generateContent({ model, contents: [{ text: PROMPT_SUMMARY }, { text: contextInput }] }),
    ai.models.generateContent({ model, contents: [{ text: PROMPT_CONTEXT }, { text: contextInput }] }),
    ai.models.generateContent({ 
      model, 
      contents: [{ text: PROMPT_CONCEPTS }, { text: contextInput }],
      config: { 
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
      }
    })
  ]);

  let concepts: ConceptBundle[] = [];
  try {
    concepts = JSON.parse(conceptsRes.text || "[]");
  } catch (e) {
    console.error("Failed to parse concepts", e);
  }

  return {
    summary: summaryRes.text || "",
    aiContext: contextRes.text || "",
    concepts
  };
};

export const recreateFeatureContext = async (
  flattenedCode: string,
  selectedConcepts: ConceptBundle[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  const conceptNames = selectedConcepts.map(c => c.name).join(", ");
  const prompt = PROMPT_RECREATOR.replace("{{CONCEPTS}}", conceptNames);

  const response = await ai.models.generateContent({
    model,
    contents: [
      { text: prompt },
      { text: `Codebase Context:\n${flattenedCode.substring(0, 500000)}` }
    ]
  });

  return response.text || "Failed to generate recreation package.";
};

export const startCodebaseChat = (flattenedCode: string): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a Codebase Intelligence Assistant. 
      You have access to the entire flattened codebase provided below. 
      Your goal is to answer developer questions, explain logic, suggest refactors, and identify bugs based EXCLUSIVELY on this context.
      
      Codebase Context:
      ${flattenedCode.substring(0, 500000)}
      `
    }
  });
};