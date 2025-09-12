
import React, { useEffect, useRef } from 'react';
import { UserIcon, VideoOffIcon, MicOffIcon } from './icons';

interface VideoFeedProps {
  name: string;
  isLocal?: boolean;
  stream: MediaStream | null;
  isMicMuted?: boolean;
  isCameraOff?: boolean;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ name, isLocal = false, stream, isMicMuted = false, isCameraOff = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const showVideo = stream && !isCameraOff;

  return (
    <div className="bg-gray-800 rounded-lg p-3 flex flex-col aspect-video shadow-lg">
      <div className="relative flex-1 bg-black rounded-md overflow-hidden flex items-center justify-center">
        {showVideo ? (
          <video ref={videoRef} autoPlay muted={isLocal} className="w-full h-full object-cover"></video>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <VideoOffIcon />
            <p className="mt-2 text-sm">Video Off</p>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-md text-sm text-white flex items-center gap-1.5">
          {isMicMuted && <MicOffIcon className="h-4 w-4" />}
          <span>{name}</span>
        </div>
      </div>
    </div>
  );
};
