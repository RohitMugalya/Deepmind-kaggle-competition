import React, { useState, useEffect } from 'react';
import { PromptForm } from './components/PromptForm';
import { CodeView } from './components/CodeView';
import { PreviewPlayer } from './components/PreviewPlayer';
import { generateMotionScript } from './services/geminiService';
import { GeneratedContent, TabView } from './types';
import { Code, Play, Terminal, Zap, FileJson, Info } from 'lucide-react';

export default function App() {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.PREVIEW);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    // Check for API key existence (simulated check as we can't inspect process.env in browser easily without actually using it, 
    // but the service will fail if it's empty during call. Here we just set up initial state.)
    // In a real scenario, we assume the environment is set up.
  }, []);

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateMotionScript(prompt);
      setContent(data);
      // Automatically switch to preview on success
      setActiveTab(TabView.PREVIEW);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while generating the animation.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sample data for initial state or empty state
  const placeholderCode = `// Motion Canvas code will appear here...
import {makeScene2D} from '@motion-canvas/2d';
import {Circle} from '@motion-canvas/2d/lib/components';
import {createRef} from '@motion-canvas/core/lib/utils';
import {all} from '@motion-canvas/core/lib/flow';

export default makeScene2D(function* (view) {
  const myCircle = createRef<Circle>();
  view.add(
    <Circle
      ref={myCircle}
      size={320}
      fill={'lightseagreen'}
    />,
  );

  yield* myCircle().scale(2, 2).to(1, 2);
});`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-200 font-sans selection:bg-cyan-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap size={20} className="text-white" fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
              MotionGen AI
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="hidden sm:inline-flex items-center gap-1">
              <Terminal size={14} />
              <span>v1.0.0</span>
            </span>
            <a 
                href="https://motioncanvas.io/docs/" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
                <FileJson size={14} />
                Docs
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 gap-6">
        
        {/* Prompt Section */}
        <section className="w-full max-w-3xl mx-auto flex flex-col gap-4 mt-8">
          <div className="text-center mb-4 space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Describe your animation.
            </h2>
            <p className="text-gray-400 text-lg">
              Generate <span className="text-cyan-400">Motion Canvas</span> scripts and preview them instantly.
            </p>
          </div>
          
          <PromptForm onSubmit={handleGenerate} isLoading={isLoading} />
          
          {error && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Info size={16} />
              {error}
            </div>
          )}
        </section>

        {/* Workspace */}
        <section className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[500px]">
            {/* Left/Top: Explanation & Tabs */}
            <div className="lg:w-1/3 flex flex-col gap-4">
                 {/* Tabs Mobile only (or general control) */}
                 <div className="flex p-1 bg-gray-900 rounded-lg border border-gray-800">
                    <button
                        onClick={() => setActiveTab(TabView.PREVIEW)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === TabView.PREVIEW 
                            ? 'bg-gray-800 text-cyan-400 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Play size={16} /> Preview
                    </button>
                    <button
                        onClick={() => setActiveTab(TabView.CODE)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                            activeTab === TabView.CODE 
                            ? 'bg-gray-800 text-cyan-400 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Code size={16} /> Source Code
                    </button>
                </div>

                {/* AI Explanation Card */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 flex-1">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                        AI Reasoning
                    </h3>
                    <div className="prose prose-invert prose-sm max-w-none text-gray-400">
                        {isLoading ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-800 rounded w-full"></div>
                                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                            </div>
                        ) : content ? (
                           <p>{content.explanation}</p>
                        ) : (
                            <p>Enter a prompt above to generate a Motion Canvas script. The AI will provide both the source code and a lightweight preview.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Right/Bottom: Main Viewport */}
            <div className="lg:w-2/3 flex flex-col min-h-[400px]">
                {activeTab === TabView.PREVIEW ? (
                    <div className="h-full rounded-lg overflow-hidden ring-1 ring-gray-800 shadow-2xl bg-gray-900">
                        {isLoading ? (
                           <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <div className="relative">
                                    <div className="w-12 h-12 border-4 border-gray-800 border-t-cyan-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                    </div>
                                </div>
                                <p className="animate-pulse font-mono text-sm">Generating scene...</p>
                           </div>
                        ) : (
                            <PreviewPlayer previewCode={content?.previewCode || ''} />
                        )}
                    </div>
                ) : (
                    <div className="h-full rounded-lg overflow-hidden ring-1 ring-gray-800 shadow-2xl">
                         {isLoading ? (
                             <div className="h-full flex items-center justify-center bg-gray-950">
                                 <p className="text-gray-500 animate-pulse font-mono">Writing code...</p>
                             </div>
                         ) : (
                            <CodeView code={content?.motionCanvasCode || placeholderCode} />
                         )}
                    </div>
                )}
            </div>
        </section>
      </main>
    </div>
  );
}