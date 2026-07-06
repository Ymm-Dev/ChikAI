'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Moon, Sun, Send, MessageCircle, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
        },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantMessage += chunk;

          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex]?.role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: assistantMessage,
              };
            }
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again! 😅',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto h-screen flex flex-col">
        {/* Header - Minimalist */}
        <header className={`px-6 py-4 flex items-center justify-between border-b transition-colors duration-300 ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white/80 backdrop-blur-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ChikAI
              </h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Chismis time!
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        {/* Messages - Clean & Minimal */}
        <div className={`flex-1 overflow-y-auto px-6 py-6 space-y-4 transition-colors duration-300 ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-xl shadow-pink-500/20 mb-6">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Uy, musta na?
              </h2>
              <p className={`text-sm max-w-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Share mo naman ang chika! 💬
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${
                  m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500'
                }`}>
                  {m.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                {/* Message */}
                <div className={`max-w-[70%] ${
                  m.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'
                }`}>
                  <div className={`rounded-2xl px-4 py-2.5 transition-all ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/10'
                      : isDark
                        ? 'bg-gray-700 text-gray-100'
                        : 'bg-white text-gray-800 shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                  <span className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {m.role === 'user' ? 'Ikaw' : 'ChikAI'}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Clean & Minimal */}
        <div className={`px-6 py-4 border-t transition-colors duration-300 ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white/80 backdrop-blur-sm'
        }`}>
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ano ang chika mo?"
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-full border transition-all duration-200 text-sm focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-pink-500 focus:border-transparent'
                  : 'bg-gray-100 border-transparent text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:bg-white'
              }`}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isLoading || !input.trim()
                  ? isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 active:scale-95'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Footer - Developer Credit */}
        <div className={`px-6 py-3 text-center border-t transition-colors duration-300 ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white/50'
        }`}>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Built by{' '}
            <a 
              href="https://github.com/ymm-dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`font-medium transition-colors ${
                isDark 
                  ? 'text-pink-400 hover:text-pink-300' 
                  : 'text-pink-500 hover:text-pink-600'
              }`}
            >
              Ymm-Dev
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}