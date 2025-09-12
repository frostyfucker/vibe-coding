
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { VideoFeed } from './components/VideoFeed';
import { CodeEditor } from './components/CodeEditor';
import { AiAssistant } from './components/AiAssistant';
import { Celebration } from './components/Celebration';
import type { ChatMessage } from './types';
import { startChat, sendMessage } from './services/geminiService';
import type { Chat } from '@google/genai';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(`function helloWorld() {\n  console.log("Hello, Vibe Codin'!");\n}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    const userMessage: ChatMessage = { sender: 'user', text: message };
    setMessages(prev => [...prev, userMessage]);

    try {
      let currentChat = chat;
      if (!currentChat) {
        const newChat = startChat();
        setChat(newChat);
        currentChat = newChat;
      }
      
      const fullPrompt = `Code:\n\`\`\`javascript\n${code}\n\`\`\`\n\nUser Query: ${message}`;
      const aiResponse: ChatMessage = { sender: 'ai', text: '' };
      setMessages(prev => [...prev, aiResponse]);

      const stream = await sendMessage(currentChat, fullPrompt);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setMessages(prev => prev.map((msg, index) => 
          index === prev.length - 1 ? { ...msg, text: msg.text + chunkText } : msg
        ));
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
      setMessages(prev => prev.slice(0, -1)); // Remove the empty AI message placeholder
    } finally {
      setIsLoading(false);
    }
  }, [chat, code]);

  const handleCelebrate = () => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 3000); // Animation duration
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans relative overflow-hidden">
      {celebrating && <Celebration />}
      <Header />
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left Panel: Video Feeds */}
        <div className="flex flex-col w-1/5 min-w-[250px] gap-4">
          <VideoFeed name="You" isLocal={true} />
          <VideoFeed name="Collaborator" isLocal={false} />
          <div className="flex-grow bg-gray-800 rounded-lg p-4 flex flex-col justify-end">
             <button
              onClick={handleCelebrate}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Celebrate!
            </button>
          </div>
        </div>

        {/* Center Panel: Code Editor */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <div className="bg-gray-700 px-4 py-2 text-sm text-gray-400">
            <span>/src/components/Greeting.tsx</span>
          </div>
          <CodeEditor code={code} setCode={setCode} />
        </div>

        {/* Right Panel: AI Assistant */}
        <div className="flex flex-col w-1/4 min-w-[350px]">
          <AiAssistant
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSendMessage={handleSendMessage}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
