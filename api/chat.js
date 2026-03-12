import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { messages, userName, fileData } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ reply: "Erro: GEMINI_API_KEY não configurada no servidor." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        // Modelo Gemini 2.0 Flash (Mais estável e rápido para multimodal)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: `Você é o Eclipse Intelligence. Usuário: ${userName}. Responda de forma técnica e elegante.`
        });

        // Converte o histórico para o formato correto da SDK
        const history = messages.slice(0, -1).map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.parts[0].text }]
        }));

        const chat = model.startChat({ history });

        // Monta o prompt final (Texto + Arquivo se houver)
        let promptParts = [{ text: messages[messages.length - 1].parts[0].text }];
        
        if (fileData && fileData.base64) {
            promptParts.push({
                inlineData: {
                    mimeType: fileData.mimeType,
                    data: fileData.base64
                }
            });
        }

        const result = await chat.sendMessage(promptParts);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });

    } catch (error) {
        console.error("Erro na API Gemini:", error);
        res.status(500).json({ 
            reply: `Erro no servidor: ${error.message}. Verifique os logs da Vercel.` 
        });
    }
}
