import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { messages, userName, fileData } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({ reply: "Configuração incompleta: GEMINI_API_KEY ausente." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `Você é o Eclipse Intelligence. Usuário: ${userName}.`
        });

        const history = (messages || []).slice(0, -1).map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.parts[0].text }]
        }));

        const chat = model.startChat({ history });

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
        res.status(200).json({ reply: response.text() });

    } catch (error) {
        const isQuota = error.message.includes("429") || error.message.includes("quota");
        res.status(200).json({ 
            reply: isQuota 
                ? "Limite de mensagens atingido. Aguarde 60 segundos e tente novamente." 
                : `Erro técnico: ${error.message}` 
        });
    }
}
