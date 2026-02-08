export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

    const { messages, prompt } = req.body;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: prompt },
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
        res.status(500).json({ reply: "Erro ao conectar com Groq: " + error.message });
    }
}
