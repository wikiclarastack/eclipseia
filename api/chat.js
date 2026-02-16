export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

    const { messages, modelType } = req.body;
    const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || "Você é a Eclipse IA.";

    try {
        if (modelType === 'waver') {
            const apiKey = process.env.GEMINI_API_KEY;
            const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

            const formattedContents = messages.map(m => ({
                role: m.role === 'model' ? 'model' : 'user',
                parts: [{ text: m.parts[0].text }]
            }));

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: `INSTRUÇÃO DE SISTEMA: ${SYSTEM_PROMPT}` }] },
                        { role: 'model', parts: [{ text: "Entendido. Sistema configurado." }] },
                        ...formattedContents
                    ]
                })
            });

            const data = await response.json();
            if (data.error) return res.status(500).json({ reply: `Erro Waver: ${data.error.message}` });
            
            return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });

        } else {
            const apiKey = process.env.GROQ_API_KEY;
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        ...messages.map(m => ({
                            role: m.role === 'model' ? 'assistant' : 'user',
                            content: m.parts[0].text
                        }))
                    ]
                })
            });

            const data = await response.json();
            res.status(200).json({ reply: data.choices[0].message.content });
        }
    } catch (error) {
        res.status(500).json({ reply: "Falha na comunicação com os servidores centrais." });
    }
}
