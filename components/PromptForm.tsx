import React, { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative flex items-center bg-gray-900 rounded-lg border border-gray-700 shadow-xl overflow-hidden">
        <div className="pl-4 text-gray-400">
          <Sparkles size={20} />
        </div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your animation (e.g., 'A red circle bouncing on a blue floor with squash and stretch')"
          className="w-full bg-transparent text-gray-100 px-4 py-4 focus:outline-none placeholder-gray-500 font-medium"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className={`mr-2 p-2 rounded-md transition-all duration-200 ${
            prompt.trim() && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </div>
    </form>
  );
};