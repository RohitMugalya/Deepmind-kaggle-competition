import React, { useState } from 'react';
import { PromptForm } from './components/PromptForm';
import { CodeView } from './components/CodeView';
import { PreviewPlayer } from './components/PreviewPlayer';
import { generateMotionScript } from './services/geminiService';
import { GeneratedContent, TabView } from './types';
import { Code, Play, Terminal, Zap, FileJson, Info, LayoutTemplate } from 'lucide-react';

export default function App() {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.PREVIEW);

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
        <div className="max-w-full mx-6 h-16 flex items-center justify-between">
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
              <span>v1.1.0</span>
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

      {/* Main Content - Workflow Layout */}
      <main className="flex-1 flex flex-col lg:flex-row w-full p-4 gap-4 overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Left Sidebar: Controls & Pipeline */}
        <section className="lg:w-1/3 xl:w-1/4 flex flex-col gap-4 bg-gray-900/30 rounded-lg p-4 border border-gray-800/50">
          <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
             <LayoutTemplate size={14} />
             <span>Workflow Pipeline</span>
          </div>

          <div className="flex flex-col gap-6 flex-1">
             {/* Step 1: Input */}
             <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-300">1. Define Animation</label>
                 <PromptForm onSubmit={handleGenerate} isLoading={isLoading} />
                 <p className="text-xs text-gray-500">Describe the concept, objects, and motion.</p>
             </div>

             {/* Step 2: Output Controls */}
             <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-300">2. View Output</label>
                 <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setActiveTab(TabView.PREVIEW)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-all border ${
                            activeTab === TabView.PREVIEW 
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-sm' 
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                        }`}
                    >
                        <Play size={16} /> Preview
                    </button>
                    <button
                        onClick={() => setActiveTab(TabView.CODE)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-all border ${
                            activeTab === TabView.CODE 
                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-sm' 
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                        }`}
                    >
                        <Code size={16} /> Code
                    </button>
                </div>
             </div>

             {/* Status / Error Area */}
             <div className="flex-1 bg-gray-950/50 rounded-md border border-gray-800 p-4 overflow-auto">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System Status</h3>
                {isLoading ? (
                    <div className="flex items-center gap-2 text-cyan-400 text-sm animate-pulse">
                        <Zap size={14} />
                        Generating pipeline...
                    </div>
                ) : error ? (
                    <div className="flex items-start gap-2 text-red-400 text-sm">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : content ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            Generation complete
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                            Time: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-600 text-sm italic">
                        Ready for input.
                    </div>
                )}
             </div>
          </div>
        </section>

        {/* Right Area: Workspace Viewport */}
        <section className="flex-1 flex flex-col min-h-[400px]">
            {activeTab === TabView.PREVIEW ? (
                <div className="h-full rounded-lg overflow-hidden ring-1 ring-gray-800 shadow-2xl bg-gray-900 relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 space-y-4 bg-gray-900/90 z-10 backdrop-blur-sm">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-gray-800 border-t-cyan-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <p className="animate-pulse font-mono text-sm tracking-widest uppercase text-cyan-500">Synthesizing</p>
                        </div>
                    ) : null}
                    <PreviewPlayer previewCode={content?.previewCode || ''} />
                </div>
            ) : (
                <div className="h-full rounded-lg overflow-hidden ring-1 ring-gray-800 shadow-2xl relative">
                     {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
                             <p className="text-gray-500 animate-pulse font-mono">Writing source code...</p>
                        </div>
                     ) : null}
                    <CodeView code={content?.motionCanvasCode || placeholderCode} />
                </div>
            )}
        </section>
      </main>
    </div>
  );
}
