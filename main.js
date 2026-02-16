<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eclipse Intelligence</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <style>
        body { font-family: 'Inter', sans-serif; background: #fff; color: #111; overflow: hidden; }
        .intro-overlay { position: fixed; inset: 0; background: #fff; z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .sidebar { background: #fcfcfc; border-right: 1px solid #eee; }
        .chat-container { max-width: 700px; margin: 0 auto; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .message-row { border-bottom: 1px solid #f5f5f5; padding: 40px 0; }
        .ai-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #999; margin-bottom: 15px; display: block; }
        pre { background: #f8f8f8 !important; border: 1px solid #eee; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; }
        @media (prefers-color-scheme: dark) {
            body, .intro-overlay { background: #111; color: #eee; }
            .sidebar { background: #0a0a0a; border-right: 1px solid #222; }
            .message-row { border-bottom: 1px solid #1a1a1a; }
            pre { background: #1a1a1a !important; border-color: #333; }
        }
    </style>
</head>
<body class="flex h-screen">

    <div id="intro" class="intro-overlay">
        <div id="intro-content" class="w-full max-w-sm px-8">
            <h1 class="text-2xl font-light tracking-tighter mb-8 text-center">ECLIPSE <span class="font-bold">INTELLIGENCE</span></h1>
            <div id="boot-logs" class="font-mono text-[10px] text-zinc-500 space-y-1 mb-8"></div>
            <button id="start-btn" onclick="startApp()" class="w-full py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded opacity-0 transition-opacity duration-1000">INICIALIZAR INSTÂNCIA</button>
        </div>
    </div>

    <aside class="w-64 sidebar flex flex-col p-6 hidden md:flex">
        <div class="mb-10">
            <div class="text-[10px] font-black tracking-widest text-zinc-400 mb-4 uppercase">Sessões</div>
            <button onclick="createNewChat()" class="w-full text-left p-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">+ Nova Conversa</button>
        </div>

        <input type="text" id="search" oninput="renderList(this.value)" placeholder="Filtrar histórico..." class="bg-transparent border-b border-zinc-200 dark:border-zinc-800 p-2 text-xs mb-6 outline-none">

        <nav id="chat-list" class="flex-1 overflow-y-auto no-scrollbar space-y-1"></nav>

        <div class="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <label class="text-[9px] font-bold text-zinc-400 block mb-2 uppercase">Configuração de Motor</label>
            <select id="model-select" class="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 p-2 rounded text-xs">
                <option value="ia">Eclipse IA (Padrão)</option>
                <option value="waver">Eclipse Waver (Complexo)</option>
            </select>
        </div>
    </aside>

    <main class="flex-1 flex flex-col relative">
        <header class="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8">
            <span id="header-title" class="text-xs font-medium text-zinc-500 italic">Pronto para nova tarefa</span>
            <button onclick="clearHistory()" class="text-[10px] text-red-500 font-bold uppercase tracking-widest">Wipe Data</button>
        </header>

        <div id="chat-flow" class="flex-1 overflow-y-auto no-scrollbar">
            <div id="messages-wrapper" class="chat-container"></div>
        </div>

        <div class="p-8">
            <div class="chat-container">
                <div class="relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
                    <textarea id="user-input" rows="1" oninput="autoResize(this)" onkeydown="checkKey(event)" placeholder="Digite seu comando..." class="w-full bg-transparent p-2 text-sm outline-none resize-none max-h-48"></textarea>
                    <div class="flex justify-between items-center mt-2 px-2">
                        <span class="text-[10px] text-zinc-400">Pressione Enter para enviar</span>
                        <button onclick="send()" class="text-[10px] font-bold uppercase tracking-widest hover:text-blue-500">Enviar</button>
                    </div>
                </div>
                <p class="text-[10px] text-center text-zinc-400 mt-6">O Eclipse pode gerar informações imprecisas. Verifique fatos importantes.</p>
            </div>
        </div>
    </main>

    <script>
        let chats = JSON.parse(localStorage.getItem('eclipse_v51')) || [];
        let currentId = null;

        // Intro Logic
        const logs = [
            "Verificando integridade dos motores...",
            "Conectando ao Eclipse IA (Llama-3)...",
            "Estabelecendo link com Eclipse Waver (Gemini)...",
            "Sincronizando banco de dados local...",
            "Sistema operacional pronto."
        ];

        async function runIntro() {
            const container = document.getElementById('boot-logs');
            for(let log of logs) {
                const p = document.createElement('p');
                p.innerText = `> ${log}`;
                container.appendChild(p);
                await new Promise(r => setTimeout(r, 600));
            }
            document.getElementById('start-btn').classList.remove('opacity-0');
        }
        runIntro();

        function startApp() {
            document.getElementById('intro').style.display = 'none';
            if(chats.length > 0) { currentId = chats[0].id; render(); } else { createNewChat(); }
        }

        // Chat Logic
        function autoResize(el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        }

        function checkKey(e) { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }

        async function send() {
            const input = document.getElementById('user-input');
            const modelType = document.getElementById('model-select').value;
            const val = input.value.trim();
            if(!val) return;

            const activeChat = chats.find(c => c.id === currentId);
            activeChat.messages.push({ role: 'user', parts: [{ text: val }] });
            if(activeChat.title === 'Nova Conversa') activeChat.title = val.substring(0, 30);
            
            input.value = ''; input.style.height = 'auto';
            render();

            const loader = document.createElement('div');
            loader.className = 'message-row text-[10px] text-zinc-400 px-4 animate-pulse uppercase font-bold';
            loader.innerText = 'Processando requisição...';
            document.getElementById('messages-wrapper').appendChild(loader);

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: activeChat.messages, modelType })
                });
                const data = await res.json();
                loader.remove();
                activeChat.messages.push({ role: 'model', parts: [{ text: data.reply }] });
                save(); render();
            } catch(e) { loader.innerText = "ERRO NA RESPOSTA."; }
        }

        function render() {
            const wrapper = document.getElementById('messages-wrapper');
            wrapper.innerHTML = '';
            const chat = chats.find(c => c.id === currentId);
            if(!chat) return;

            document.getElementById('header-title').innerText = chat.title;

            chat.messages.forEach(m => {
                const isAI = m.role === 'model';
                const div = document.createElement('div');
                div.className = "message-row";
                div.innerHTML = `
                    <span class="ai-label">${isAI ? 'ECLIPSE OUTPUT' : 'INPUT USUÁRIO'}</span>
                    <div class="text-sm leading-relaxed">${isAI ? marked.parse(m.parts[0].text) : m.parts[0].text}</div>
                `;
                wrapper.appendChild(div);
            });
            document.querySelectorAll('pre code').forEach(hljs.highlightElement);
            document.getElementById('chat-flow').scrollTop = document.getElementById('chat-flow').scrollHeight;
            renderList();
        }

        function renderList(filter = '') {
            const l = document.getElementById('chat-list'); l.innerHTML = '';
            chats.filter(c => c.title.toLowerCase().includes(filter.toLowerCase())).forEach(c => {
                const d = document.createElement('div');
                d.className = `p-3 text-[11px] rounded cursor-pointer flex justify-between ${c.id === currentId ? 'bg-zinc-100 dark:bg-zinc-900 font-bold' : 'text-zinc-500'}`;
                d.onclick = () => { currentId = c.id; render(); };
                d.innerHTML = `<span class="truncate pr-2 uppercase tracking-tighter">${c.title}</span><span onclick="event.stopPropagation(); deleteChat(${c.id})">✕</span>`;
                l.appendChild(d);
            });
        }

        function createNewChat() {
            const id = Date.now();
            chats.unshift({ id, title: 'Nova Conversa', messages: [] });
            currentId = id; save(); render();
        }

        function deleteChat(id) {
            chats = chats.filter(c => c.id !== id);
            if(chats.length > 0) currentId = chats[0].id; else createNewChat();
            save(); render();
        }

        function clearHistory() { if(confirm('Wipe all local data?')) { localStorage.removeItem('eclipse_v51'); location.reload(); } }
        function save() { localStorage.setItem('eclipse_v51', JSON.stringify(chats)); }
    </script>
</body>
</html>
