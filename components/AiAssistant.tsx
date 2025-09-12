
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon, BotIcon, UserIcon } from './icons';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AiAssistantProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ messages, isLoading, error, onSendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="bg-gray-800 rounded-lg flex flex-col h-full shadow-lg">
      <div className="p-4 border-b border-gray-700 flex items-center">
        <BotIcon />
        <h2 className="text-lg font-bold ml-3">Vibe Bot</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"><BotIcon /></div>}
            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'ai' ? 'bg-gray-700' : 'bg-blue-600 text-white'}`}>
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
             {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"><UserIcon /></div>}
          </div>
        ))}
        {isLoading && messages[messages.length-1]?.sender === 'ai' && (
           <div className="flex items-start gap-3">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"><BotIcon /></div>
             <div className="bg-gray-700 p-3 rounded-lg flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2 delay-150"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <div className="p-4 text-red-400 border-t border-gray-700 text-sm">{error}</div>}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Vibe Bot..."
            className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed p-2 rounded-full text-white transition-colors"
            disabled={isLoading}
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};
