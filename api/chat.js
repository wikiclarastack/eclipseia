export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

    const { messages, modelType } = req.body;
    const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || "Você é a Eclipse IA, desenvolvida pela EclipseByte Group.";

    try {
        let apiUrl, apiKey, modelName;

        if (modelType === 'waver') {
            apiUrl = 'https://api.openai.com/v1/chat/completions';
            apiKey = process.env.OPENAI_API_KEY;
            modelName = 'gpt-4o-mini'; 
        } else {
            apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
            apiKey = process.env.GROQ_API_KEY;
            modelName = 'llama-3.3-70b-versatile';
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelName,
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
        
        if (data.error) {
            console.error("Erro da API:", data.error);
            return res.status(500).json({ reply: `Erro na API: ${data.error.message}` });
        }

        const reply = data.choices[0].message.content;
        res.status(200).json({ reply });

    } catch (error) {
        res.status(500).json({ reply: "Erro crítico na conexão com o servidor." });
    }
}
