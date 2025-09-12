
import React from 'react';

const ConfettiPiece: React.FC<{ index: number }> = ({ index }) => {
  const colors = ['bg-yellow-400', 'bg-pink-500', 'bg-blue-400', 'bg-green-400', 'bg-purple-500', 'bg-red-500'];
  const size = Math.random() * 8 + 6; // 6px to 14px
  const duration = Math.random() * 2 + 3; // 3s to 5s
  const delay = Math.random() * 2; // 0s to 2s
  const initialX = Math.random() * 100; // 0% to 100%
  const initialRotation = Math.random() * 360; // 0 to 360deg
  const finalRotation = initialRotation + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 720 + 360);

  const style: React.CSSProperties = {
    '--initial-x': `${initialX}vw`,
    '--duration': `${duration}s`,
    '--delay': `${delay}s`,
    '--initial-rotation': `${initialRotation}deg`,
    '--final-rotation': `${finalRotation}deg`,
    width: `${size}px`,
    height: `${size}px`,
  } as React.CSSProperties;

  return (
    <div
      className={`absolute top-0 opacity-0 animate-fall ${colors[index % colors.length]}`}
      style={style}
    >
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) translateX(var(--initial-x)) rotate(var(--initial-rotation));
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(var(--initial-x)) rotate(var(--final-rotation));
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall var(--duration) linear var(--delay) forwards;
          left: var(--initial-x);
        }
      `}</style>
    </div>
  );
};

export const Celebration: React.FC = () => {
  const confettiCount = 100;
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: confettiCount }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </div>
  );
};
