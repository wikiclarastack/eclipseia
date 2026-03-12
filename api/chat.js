import { GoogleGenAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { messages, userName, fileData } = req.body;
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

    try {
        // 1. Processamento de Embeddings (Opcional para RAG futuro)
        // Usando o novo gemini-embedding-2-preview com MRL (768 dimensões)
        const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });
        const lastMessage = messages[messages.length - 1].parts[0].text;
        
        await embedModel.embedContent({
            content: { parts: [{ text: lastMessage }] },
            outputDimensionality: 768,
        });

        // 2. Resposta do Chat (Gemini 2.0 Flash)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: `Você é o Eclipse Intelligence. Usuário: ${userName}. 
            Seja minimalista, use LaTeX para fórmulas complexas e Markdown para códigos.`
        });

        const chat = model.startChat({
            history: messages.slice(0, -1).map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                parts: m.parts
            }))
        });

        // Suporte Multimodal integrado
        let promptParts = [{ text: lastMessage }];
        if (fileData) {
            promptParts.push({
                inlineData: { mimeType: fileData.mimeType, data: fileData.base64 }
            });
        }

        const result = await chat.sendMessage(promptParts);
        const response = await result.response;
        
        res.status(200).json({ reply: response.text() });
    } catch (error) {
        res.status(500).json({ reply: "Falha no núcleo Gemini 2.0. Verifique sua quota." });
    }
}
