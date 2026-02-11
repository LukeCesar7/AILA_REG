/*
   RAG (Geração aumentada por recuperação)
   - O modelo de ia n responde somente o que sabe, há uma consulta de fatos.
   - Busco conhecimento antes, respondo depois complementando meu raciocínio.
*/



import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

/*
   Utilidades
*/

export function chunkText(text: string, chunkSize = 800): string[] {
  const chunks: string[] = [];
  let i = 0;

  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - 200; // overlap
  }

  return chunks;
}

/*
   Embeddings -
*/

export async function createEmbedding(text: string): Promise<number[]> {
  const model = ai.getGenerativeModel({ model: "text-embedding-004" });
  const res = await model.embedContent(text);
  return res.embedding.values;
}

/*
   Similaridade -
*/

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (magA * magB);
}

/*
   Busca de Sentido (Semântica)
*/

export async function searchRelevantChunks(
  query: string,
  vectors: { vector: number[]; content: string }[],
  topK = 5
): Promise<string[]> {
  const queryEmbedding = await createEmbedding(query);

  return vectors
    .map(v => ({
      score: cosineSimilarity(queryEmbedding, v.vector),
      content: v.content,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(v => v.content);
}
