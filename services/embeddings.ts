import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_API_KEY
);

/*
   Divide textos de tamanho considerável em partes menores.
 */
export function chunkText(text: string, chunkSize = 800): string[] {
  const chunks: string[] = [];
  let i = 0;

  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - 200; // overlap - estudar impactos!!!
  }

  return chunks;
}

/*
   Cria associações matemáticas próximas de um texto
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const result = await model.embedContent(text);
  return result.embedding.values;
}
