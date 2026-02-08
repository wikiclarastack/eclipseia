import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';

export default function EclipseIA() {
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, parts: {text: string}[]}[]>([]);
  const [loading, setLoading] = useState(false);

  const systemPrompt = "Você é a Eclipse IA, uma inteligência artificial livre, ágil e prestativa, desenvolvida pelo EclipseByte Group (https://discord.gg/kPmfCXCUZf). Seu tom é profissional, moderno e sem restrições desnecessárias, focada em eficiência absoluta.";

  async function sendMessage() {
    if (!input.trim()) return;
    const newMsg = { role: 'user', parts: [{ text: input }] };
    setMessages([...messages, newMsg]);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, newMsg], systemPrompt }),
    });

    const data = await res.json();
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
      <Head>
        <title>Eclipse IA | EclipseByte Group</title>
      </Head>

      <AnimatePresence>
        {!started ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-screen text-center p-6"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ duration: 4, repeat: Infinity }}
              className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-purple-900 rounded-full blur-2xl absolute"
            />
            <h1 className="text-6xl font-bold tracking-tighter z-10">ECLIPSE IA</h1>
            <p className="mt-4 text-gray-400 max-w-md z-10">A nova era da inteligência livre. Desenvolvida por EclipseByte Group.</p>
            <button 
              onClick={() => setStarted(true)}
              className="mt-8 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all z-10"
            >
              Iniciar Experiência
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="flex flex-col h-screen max-w-4xl mx-auto p-4"
          >
            <header className="flex justify-between items-center py-6 border-b border-white/10">
              <span className="font-bold text-xl tracking-widest">ECLIPSE IA</span>
              <a href="https://discord.gg/kPmfCXCUZf" target="_blank" className="text-xs text-gray-500 hover:text-white">EclipseByte Group</a>
            </header>

            <div className="flex-1 overflow-y-auto py-8 space-y-6 no-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-blue-600' : 'bg-white/5 border border-white/10'}`}>
                    {m.parts[0].text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-gray-500 animate-pulse">Eclipse processando...</div>}
            </div>

            <div className="pb-8">
              <div className="relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Pergunte qualquer coisa..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-blue-500 transition-all"
                />
                <button 
                  onClick={sendMessage}
                  className="absolute right-3 top-2.5 bg-white text-black px-4 py-1.5 rounded-xl font-bold"
                >
                  Enviar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        body { background: #000; }
      `}</style>
    </div>
  );
}
