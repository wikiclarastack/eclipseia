import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { messages, prompt } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: prompt }] },
                { role: "model", parts: [{ text: "Entendido. Sou a Eclipse IA, pronta para ajudar." }] },
            ],
        });

        const lastUserMsg = messages[messages.length - 1].parts[0].text;
        const result = await chat.sendMessage(lastUserMsg);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        res.status(500).json({ reply: "Erro ao processar: " + error.message });
    }
}
