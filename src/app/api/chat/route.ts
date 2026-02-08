import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...messages
        ],
      }),
    });

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Erro na Eclipse IA' }, { status: 500 });
  }
}
