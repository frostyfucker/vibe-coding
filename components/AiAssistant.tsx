
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon, BotIcon, UserIcon, PaperclipIcon, XCircleIcon, UploadCloudIcon } from './icons';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AiAssistantProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string, image?: { data: string, type: string }) => void;
}

// FIX: Added 'export' to make the component available for import in other files.
export const AiAssistant: React.FC<AiAssistantProps> = ({ messages, isLoading, error, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<{ data: string, type: string, name: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage({
                data: e.target?.result as string,
                type: file.type,
                name: file.name
            });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || image) {
      onSendMessage(input, image ?? undefined);
      setInput('');
      setImage(null);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(isOver);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      handleDragEvents(e, false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
          handleFileChange(files[0]);
      }
  };

  return (
    <div 
        className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl flex flex-col h-full shadow-2xl relative"
        onDragEnter={(e) => handleDragEvents(e, true)}
    >
      {isDragging && (
          <div 
            className="absolute inset-0 bg-purple-500/20 border-2 border-dashed border-purple-300 rounded-xl z-10 flex flex-col items-center justify-center pointer-events-none"
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDrop={handleDrop}
          >
              <UploadCloudIcon />
              <p className="mt-2 text-lg font-semibold text-purple-200">Drop your image here</p>
          </div>
      )}
      <div className="p-4 border-b border-white/10 flex items-center">
        <BotIcon />
        <h2 className="text-lg font-bold ml-3 text-purple-300">Vibe Bot</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 w-full ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.sender === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/80 flex items-center justify-center"><BotIcon /></div>}
            <div className={`max-w-md rounded-xl p-3 ${msg.sender === 'ai' ? 'bg-gray-700/50' : 'bg-blue-600/80 text-white'}`}>
              {msg.image && <img src={msg.image} alt="user upload" className="rounded-lg mb-2 max-w-full h-auto" />}
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      // FIX: Removed {...props} from SyntaxHighlighter. Spreading these props was causing a type error
                      // because they include properties (like an HTMLElement ref) that are not compatible with the SyntaxHighlighter component.
                      <SyntaxHighlighter style={vscDarkPlus as any} language={match[1]} PreTag="div">{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
                    ) : ( <code className={className} {...props}>{children}</code> );
                  }
                }}
              >{msg.text}</ReactMarkdown>
            </div>
             {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/80 flex items-center justify-center"><UserIcon /></div>}
          </div>
        ))}
        {isLoading && messages[messages.length-1]?.sender === 'ai' && (
           <div className="flex items-start gap-3">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/80 flex items-center justify-center"><BotIcon /></div>
             <div className="bg-gray-700/50 p-3 rounded-xl flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2 delay-150"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <div className="p-4 text-red-400 border-t border-white/10 text-sm">{error}</div>}
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSubmit} className="relative">
          {image && (
            <div className="p-2 bg-gray-900/50 rounded-md mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                    <img src={image.data} className="w-10 h-10 rounded object-cover" />
                    <span className="text-sm text-gray-400 truncate">{image.name}</span>
                </div>
                <button type="button" onClick={() => setImage(null)} className="p-1 text-gray-500 hover:text-white">
                    <XCircleIcon />
                </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} accept="image/*" className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-purple-400 transition-colors">
                <PaperclipIcon />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Vibe Bot or drop an image..."
              className="flex-1 bg-gray-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900/50 disabled:cursor-not-allowed p-3 rounded-full text-white transition-colors" disabled={isLoading}>
              <SendIcon />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
