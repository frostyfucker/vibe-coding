
import React, { useEffect, useRef } from 'react';
import { UserIcon, VideoOffIcon } from './icons';

interface VideoFeedProps {
  name: string;
  isLocal?: boolean;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ name, isLocal = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isLocal) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing media devices.", err);
        });
    }
  }, [isLocal]);

  return (
    <div className="bg-gray-800 rounded-lg p-3 flex flex-col aspect-video shadow-lg">
      <div className="relative flex-1 bg-black rounded-md overflow-hidden flex items-center justify-center">
        {isLocal ? (
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover"></video>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <VideoOffIcon />
            <p className="mt-2 text-sm">Video Off</p>
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-md text-sm text-white">
          {name}
        </div>
      </div>
    </div>
  );
};
