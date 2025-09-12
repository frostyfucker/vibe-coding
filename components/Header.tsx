
import React from 'react';
import { LogoIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center p-4 border-b border-gray-700">
      <LogoIcon />
      <h1 className="text-2xl font-bold text-white ml-3">Vibe Codin'</h1>
    </header>
  );
};
