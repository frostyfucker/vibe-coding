
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VideoFeed } from './components/VideoFeed';
import { CodeEditor } from './components/CodeEditor';
import { AiAssistant } from './components/AiAssistant';
import { Celebration } from './components/Celebration';
import type { ChatMessage } from './types';
import { startChat, sendMessage } from './services/geminiService';
import type { Chat } from '@google/genai';
import { CallIcon, HangUpIcon, MicOnIcon, MicOffIcon, CameraOnIcon, CameraOffIcon } from './components/icons';

const App: React.FC = () => {
  const [code, setCode] = useState<string>(`function helloWorld() {\n  console.log("Hello, Vibe Codin'!");\n}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  // WebRTC State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Media Controls State
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);


  // Get user media on component mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
      })
      .catch(err => {
        console.error("Error accessing media devices.", err);
        setError("Could not access camera or microphone. Please check permissions.");
      });
      
    // Cleanup stream on unmount
    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    }
  }, []);

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
  
  // WebRTC Call Logic (Simulated)
  const startCall = async () => {
    if (!localStream) {
        setError("Local video stream is not available.");
        return;
    }
    
    setIsCallActive(true);

    // For demonstration, we'll create two peer connections to simulate a call locally
    const pc1 = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    const pc2 = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current = pc1; // Store for hangup

    pc1.onicecandidate = event => {
        if (event.candidate) {
            pc2.addIceCandidate(event.candidate);
        }
    };

    pc2.onicecandidate = event => {
        if (event.candidate) {
            pc1.addIceCandidate(event.candidate);
        }
    };

    pc2.ontrack = event => {
        setRemoteStream(event.streams[0]);
    };

    localStream.getTracks().forEach(track => {
        pc1.addTrack(track, localStream);
    });

    try {
        const offer = await pc1.createOffer();
        await pc1.setLocalDescription(offer);
        await pc2.setRemoteDescription(offer);

        const answer = await pc2.createAnswer();
        await pc2.setLocalDescription(answer);
        await pc1.setRemoteDescription(answer);
    } catch (err) {
        console.error("WebRTC handshake failed", err);
        setError("Failed to start video call.");
        hangUp();
    }
  };

  const hangUp = () => {
      pcRef.current?.close();
      pcRef.current = null;
      setRemoteStream(null);
      setIsCallActive(false);
  };

  const toggleMic = () => {
    if (localStream) {
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsMicMuted(prev => !prev);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
        localStream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setIsCameraOff(prev => !prev);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans relative overflow-hidden">
      {celebrating && <Celebration />}
      <Header />
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left Panel: Video Feeds & Controls */}
        <div className="flex flex-col w-1/5 min-w-[250px] gap-4">
          <VideoFeed name="You" stream={localStream} isLocal={true} isMicMuted={isMicMuted} isCameraOff={isCameraOff} />
          <VideoFeed name="Collaborator" stream={remoteStream} isLocal={false} />
          <div className="flex-grow bg-gray-800 rounded-lg p-4 flex flex-col justify-end gap-3">
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={toggleMic}
                    disabled={!localStream}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg flex items-center justify-center gap-2 ${isMicMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'} disabled:bg-gray-700 disabled:cursor-not-allowed`}
                >
                    {isMicMuted ? <MicOffIcon /> : <MicOnIcon />}
                    <span>{isMicMuted ? 'Unmute' : 'Mute'}</span>
                </button>
                 <button
                    onClick={toggleCamera}
                    disabled={!localStream}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg flex items-center justify-center gap-2 ${isCameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'} disabled:bg-gray-700 disabled:cursor-not-allowed`}
                >
                    {isCameraOff ? <CameraOffIcon /> : <CameraOnIcon />}
                    <span>{isCameraOff ? 'Cam On' : 'Cam Off'}</span>
                </button>
            </div>
            {!isCallActive ? (
                 <button
                    onClick={startCall}
                    disabled={!localStream}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg flex items-center justify-center gap-2"
                >
                    <CallIcon />
                    Start Call
                </button>
            ) : (
                <button
                    onClick={hangUp}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg flex items-center justify-center gap-2"
                >
                    <HangUpIcon />
                    Hang Up
                </button>
            )}
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
