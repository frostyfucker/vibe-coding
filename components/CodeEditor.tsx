
import React from 'react';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode }) => {
  return (
    <div className="flex-1 p-2 bg-gray-900">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-full bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none"
        spellCheck="false"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  );
};
