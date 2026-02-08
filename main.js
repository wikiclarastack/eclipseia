let messages = [];
const systemPrompt = "Você é a Eclipse IA, uma inteligência artificial livre e prestativa, desenvolvida pelo EclipseByte Group (https://discord.gg/kPmfCXCUZf). Foco em velocidade e sem travas.";

function startChat() {
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('chat-screen').classList.remove('hidden');
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const container = document.getElementById('chat-container');
    const text = input.value.trim();

    if (!text) return;

    appendMessage('user', text);
    input.value = '';

    const userMsg = { role: 'user', parts: [{ text }] };
    messages.push(userMsg);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, prompt: systemPrompt })
        });

        const data = await response.json();
        appendMessage('model', data.reply);
        messages.push({ role: 'model', parts: [{ text: data.reply }] });
    } catch (e) {
        appendMessage('model', 'Erro ao conectar. Tente novamente.');
    }
}

function appendMessage(role, text) {
    const container = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}
