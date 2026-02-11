import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllVectors } from "./vectorStore";
import { searchRelevantChunks } from "./rag";

const ai = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

export async function sendMessageToAILA(
  message: string,
  history: any[],
  legalArea: string = "Direito Geral"
) {
  const model = ai.getGenerativeModel({
    model: "gemini-1.5-pro",
  });

  const vectors = await getAllVectors();
  const relevantChunks = await searchRelevantChunks(message, vectors, 6);

  const context =
    relevantChunks.length > 0
      ? relevantChunks.join("\n\n")
      : "Nenhum contexto relevante encontrado.";

  const systemInstruction = `
Você é AILA, assistente jurídica especializada em ${legalArea}.
Use APENAS o contexto fornecido abaixo para fundamentar.

CONTEXTO:
${context}
`;

  const chat = model.startChat({
    history,
    systemInstruction,
    generationConfig: { temperature: 0.1 },
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}
