export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

    const { messages } = req.body;
    const API_KEY = process.env.GROQ_API_KEY;
    const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || "Você é a Eclipse IA, desenvolvida pela EclipseByte Group.";

    if (!API_KEY) {
        return res.status(500).json({ reply: "Erro: Chave de API não configurada." });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    ...messages.map(m => ({
                        role: m.role === 'model' ? 'assistant' : 'user',
                        content: m.parts[0].text
                    }))
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const reply = data.choices[0].message.content;
        res.status(200).json({ reply });
    } catch (error) {
        res.status(500).json({ reply: "Erro na conexão com o servidor." });
    }
}
