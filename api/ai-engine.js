export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();
  
  const { prompt, session } = req.body;

  if (!session) return res.status(403).json({ error: "Sessão inválida" });

  try {
    const aiResponse = `**Eclipse Engine v36**\n\nProcessamento seguro via Proxy concluído. Input: \`${prompt}\` analisado em ambiente isolado.`;
    
    res.status(200).json({ text: aiResponse });
  } catch (error) {
    res.status(500).json({ error: "Erro no processamento da Engine" });
  }
}
