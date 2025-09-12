
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VideoFeed } from './components/VideoFeed';
import { CodeEditor } from './components/CodeEditor';
import { AiAssistant } from './components/AiAssistant';
import { Celebration } from './components/Celebration';
import type { ChatMessage } from './types';
import { startChat, sendMessage } from './services/geminiService';
import type { Chat } from '@google/genai';
import { CallIcon, HangUpIcon, MicOnIcon, MicOffIcon, CameraOnIcon, CameraOffIcon, PanelLeftIcon, PanelRightIcon, CelebrateIcon } from './components/icons';

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
  
  // New Layout State
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(288); // 18rem
  const [rightPanelWidth, setRightPanelWidth] = useState(400); // 25rem
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);


  // Get user media on component mount
  useEffect(() => {
    async function getMedia() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
        } catch (err) {
            console.error("Error accessing media devices.", err);
            setError("Could not access camera or microphone. Please check permissions.");
        }
    }
    getMedia();
      
    // Cleanup stream on unmount
    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    }
  }, []);

  const handleSendMessage = useCallback(async (message: string, image?: { data: string, type: string }) => {
    if (!message.trim() && !image) return;
    
    setIsLoading(true);
    setError(null);
    
    const userMessage: ChatMessage = { sender: 'user', text: message, image: image?.data };
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

      const stream = await sendMessage(currentChat, fullPrompt, image);

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
    const pc1 = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    const pc2 = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current = pc1;

    pc1.onicecandidate = event => { if (event.candidate) pc2.addIceCandidate(event.candidate); };
    pc2.onicecandidate = event => { if (event.candidate) pc1.addIceCandidate(event.candidate); };
    pc2.ontrack = event => { setRemoteStream(event.streams[0]); };
    localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));

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
        localStream.getAudioTracks().forEach(track => { track.enabled = !track.enabled; });
        setIsMicMuted(prev => !prev);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
        localStream.getVideoTracks().forEach(track => { track.enabled = !track.enabled; });
        setIsCameraOff(prev => !prev);
    }
  };

  // Resizing logic
  const handleMouseDown = (panel: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    if (panel === 'left') isResizingLeft.current = true;
    if (panel === 'right') isResizingRight.current = true;
  };

  const handleMouseUp = useCallback(() => {
    isResizingLeft.current = false;
    isResizingRight.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingLeft.current) {
        const newWidth = e.clientX;
        if (newWidth > 200 && newWidth < 500) { // Min/max width
            setLeftPanelWidth(newWidth);
        }
    }
    if (isResizingRight.current) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 300 && newWidth < 800) {
            setRightPanelWidth(newWidth);
        }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 animate-gradient-xy -z-10">
        <style>{`
            @keyframes gradient-xy {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            .animate-gradient-xy {
                background-size: 200% 200%;
                animation: gradient-xy 15s ease infinite;
            }
        `}</style>
      </div>

      {celebrating && <Celebration />}
      <Header />
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Left Panel: Video & Controls */}
        <div
          className={`flex flex-col gap-4 transition-all duration-300 ease-in-out ${leftPanelCollapsed ? 'w-0 -ml-4' : ''}`}
          style={{ width: leftPanelCollapsed ? 0 : leftPanelWidth }}
        >
          <div className="flex flex-col gap-4 min-w-[200px] h-full overflow-hidden">
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-2 flex flex-col gap-4 h-full">
              <h2 className="text-lg font-bold px-2 text-purple-300">Collaboration Hub</h2>
              <VideoFeed name="You" stream={localStream} isLocal={true} isMicMuted={isMicMuted} isCameraOff={isCameraOff} />
              <VideoFeed name="Collaborator" stream={remoteStream} isLocal={false} />
              <div className="flex-grow"></div>
              {/* Controls */}
              <div className="flex flex-col gap-2">
                 <div className="grid grid-cols-2 gap-2">
                     <button onClick={toggleMic} disabled={!localStream} className={`control-btn ${isMicMuted ? 'bg-red-600/70 hover:bg-red-600' : 'bg-gray-600/50 hover:bg-gray-600/80'}`}>
                         {isMicMuted ? <MicOffIcon /> : <MicOnIcon />} <span>{isMicMuted ? 'Unmute' : 'Mute'}</span>
                     </button>
                     <button onClick={toggleCamera} disabled={!localStream} className={`control-btn ${isCameraOff ? 'bg-red-600/70 hover:bg-red-600' : 'bg-gray-600/50 hover:bg-gray-600/80'}`}>
                         {isCameraOff ? <CameraOffIcon /> : <CameraOnIcon />} <span>{isCameraOff ? 'Cam On' : 'Cam Off'}</span>
                     </button>
                 </div>
                 {!isCallActive ? (
                     <button onClick={startCall} disabled={!localStream} className="control-btn bg-green-600/70 hover:bg-green-600"><CallIcon /> Start Call</button>
                 ) : (
                     <button onClick={hangUp} className="control-btn bg-red-600/70 hover:bg-red-600"><HangUpIcon /> Hang Up</button>
                 )}
                 <button onClick={handleCelebrate} className="control-btn bg-purple-600/70 hover:bg-purple-600"><CelebrateIcon /> Celebrate!</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Left Resizer & Collapse Toggle */}
        <div className="flex items-center">
            <div onMouseDown={handleMouseDown('left')} className="w-1.5 h-full cursor-col-resize hover:bg-purple-500/50 transition-colors duration-200"></div>
            <button onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)} className="h-12 w-6 bg-gray-700/50 hover:bg-purple-600/80 rounded-r-lg flex items-center justify-center -ml-1">
                <PanelLeftIcon className={`h-5 w-5 transition-transform duration-300 ${leftPanelCollapsed ? 'rotate-180' : ''}`} />
            </button>
        </div>


        {/* Center Panel: Code Editor */}
        <div className="flex-1 flex flex-col bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-0">
          <div className="bg-black/30 px-4 py-2 text-sm text-gray-400 border-b border-white/10">
            <span>/src/components/Greeting.tsx</span>
          </div>
          <CodeEditor code={code} setCode={setCode} />
        </div>

        {/* Right Resizer & Collapse Toggle */}
         <div className="flex items-center">
            <button onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)} className="h-12 w-6 bg-gray-700/50 hover:bg-purple-600/80 rounded-l-lg flex items-center justify-center -mr-1 z-10">
                <PanelRightIcon className={`h-5 w-5 transition-transform duration-300 ${rightPanelCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <div onMouseDown={handleMouseDown('right')} className="w-1.5 h-full cursor-col-resize hover:bg-purple-500/50 transition-colors duration-200"></div>
        </div>
        
        {/* Right Panel: AI Assistant */}
        <div
            className={`flex flex-col gap-4 transition-all duration-300 ease-in-out ${rightPanelCollapsed ? 'w-0 -mr-4' : ''}`}
            style={{ width: rightPanelCollapsed ? 0 : rightPanelWidth }}
        >
             <div className="min-w-[300px] h-full overflow-hidden">
                <AiAssistant
                    messages={messages}
                    isLoading={isLoading}
                    error={error}
                    onSendMessage={handleSendMessage}
                />
             </div>
        </div>
      </main>
      <style>{`
        .control-btn {
            @apply w-full font-bold py-2 px-3 rounded-lg transition-all duration-200 text-base flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50;
        }
      `}</style>
    </div>
  );
};

export default App;
