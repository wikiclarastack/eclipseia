export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });
    const { messages, modelType, userName } = req.body;
    const manutencaoAtiva = true;
    if (modelType === 'waver' && manutencaoAtiva) {
        return res.status(503).json({ reply: "O motor Eclipse Waver está em manutenção técnica." });
    }
    const SYSTEM_PROMPT = `${process.env.SYSTEM_PROMPT || "Você é a Eclipse IA."} O nome do usuário é ${userName || 'Usuário'}.`;
    try {
        let apiUrl, apiKey, body;
        if (modelType === 'waver') {
            apiKey = process.env.GEMINI_API_KEY;
            apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
            body = {
                contents: [
                    { role: 'user', parts: [{ text: `INSTRUÇÃO: ${SYSTEM_PROMPT}` }] },
                    { role: 'model', parts: [{ text: "Entendido." }] },
                    ...messages.map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.parts[0].text }] }))
                ]
            };
        } else {
            apiKey = process.env.GROQ_API_KEY;
            apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
            body = {
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.parts[0].text }))]
            };
        }
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        const reply = modelType === 'waver' ? data.candidates[0].content.parts[0].text : data.choices[0].message.content;
        res.status(200).json({ reply });
    } catch (error) {
        res.status(500).json({ reply: "Erro na conexão." });
    }
}
