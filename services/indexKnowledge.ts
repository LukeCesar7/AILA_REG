/*
   Indexação de conhecimento ( Preparando dados para o futuro )
   - Vislumbro textos jurídicos oficiais (que eu forneci via compilado txt)
   - Preciso quebrar os textos em partes bem pequenas
   - O resultado é cada parte em vetores numéricos.
*/

import { OFFICIAL_SOURCES } from "./seedData";
import { chunkText, createEmbedding } from "./rag";
import { saveVector, isIndexed, setIndexed } from "./vectorStore";

export async function indexAILAKnowledge() {
  const alreadyIndexed = await isIndexed();

  if (alreadyIndexed) {
    console.log("📚 Base jurídica já indexada");
    return;
  }

  console.log("📚 Indexando base jurídica...");

  for (const source of OFFICIAL_SOURCES) {
    const res = await fetch(source.path);
    const text = await res.text();

    const chunks = chunkText(text);

    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk);
      await saveVector(embedding, chunk);
    }
  }

  await setIndexed();
  console.log("✅ Indexação concluída");
}
