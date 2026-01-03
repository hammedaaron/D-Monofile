import React, { useState, useRef, useEffect } from 'react';
import { GeneratedOutputs, ConceptBundle, ChatMessage } from '../types';
import { DownloadIcon, CopyIcon, CheckCircleIcon, SparklesIcon, LoaderIcon } from './Icons';
import { downloadStringAsFile } from '../services/fileService';
import { recreateFeatureContext, startCodebaseChat } from '../services/geminiService';
import { marked } from 'marked';

interface ViewerProps {
  outputs: GeneratedOutputs;
  onUpdateOutputs?: (newOutputs: GeneratedOutputs) => void;
  onRequestKeyUpdate?: () => void;
}

const Viewer: React.FC<ViewerProps> = ({ outputs, onUpdateOutputs, onRequestKeyUpdate }) => {
  const [activeTab, setActiveTab] = useState<'flattened' | 'summary' | 'context' | 'recreator' | 'intelligence'>('flattened');
  const [copied, setCopied] = useState(false);
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatInstance = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatting]);

  const getContent = () => {
    switch (activeTab) {
      case 'flattened': return outputs.flattened;
      case 'summary': return outputs.summary;
      case 'context': return outputs.aiContext;
      case 'recreator': return outputs.recreatedContext || '';
      default: return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'txt' | 'md') => {
    const content = getContent();
    const prefix = activeTab === 'flattened' ? 'monofile_codebase' : `monofile_${activeTab}`;
    downloadStringAsFile(content, `${prefix}.${format}`, 'text/plain');
  };

  const toggleConcept = (id: string) => {
    setSelectedConcepts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExecuteRecreator = async () => {
    if (selectedConcepts.length === 0) return;
    setIsExecuting(true);
    setExecError(null);
    setProgress(5);
    setLoadingStatus('Initializing extraction engine...');

    const simulateProgress = (start: number, end: number, duration: number, status: string) => {
      setLoadingStatus(status);
      return new Promise<void>((resolve) => {
        let current = start;
        const interval = setInterval(() => {
          current += (end - start) / (duration / 100);
          if (current >= end) {
            clearInterval(interval);
            setProgress(end);
            resolve();
          } else {
            setProgress(current);
          }
        }, 100);
      });
    };

    try {
      // Phase 1: Local Analysis
      await simulateProgress(5, 30, 800, 'Analyzing selected architectural modules...');
      
      const apiPromise = (async () => {
        const conceptsToProcess = outputs.concepts.filter(c => selectedConcepts.includes(c.id));
        return await recreateFeatureContext(outputs.flattened, conceptsToProcess);
      })();

      // Phase 2: AI Sequencing
      setLoadingStatus('Handshaking with Gemini AI for DNA extraction...');
      const apiTimeout = setTimeout(() => {
        setLoadingStatus('Sequencing logic gates and data flows...');
        setProgress(65);
      }, 1500);

      const result = await apiPromise;
      clearTimeout(apiTimeout);

      // Phase 3: Finalizing
      setLoadingStatus('Finalizing Reconstruction DNA Package...');
      setProgress(100);
      
      setTimeout(() => {
        if (onUpdateOutputs) {
          onUpdateOutputs({ ...outputs, recreatedContext: result });
        }
        setIsExecuting(false);
      }, 600);

    } catch (e: any) {
      console.error(e);
      setIsExecuting(false);
      if (e.message === "API_KEY_INVALID" || e.message === "API_KEY_MISSING") {
        setExecError("Authentication failure. Check your Google API Key.");
        if (onRequestKeyUpdate) onRequestKeyUpdate();
      } else {
        setExecError(`DNA sequencing failed: ${e.message}`);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isChatting) return;

    if (!chatInstance.current) {
      chatInstance.current = startCodebaseChat(outputs.flattened);
    }

    const message = userInput.trim();
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: message }]);
    setIsChatting(true);

    try {
      const response = await chatInstance.current.sendMessage({ message });
      setChatMessages(prev => [...prev, { role: 'model', text: response.text || "No response." }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'model', text: `Error: ${err.message}` }]);
    } finally {
      setIsChatting(false);
    }
  };

  const isRichText = activeTab === 'summary' || activeTab === 'context' || (activeTab === 'recreator' && outputs.recreatedContext);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[750px] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative group/viewer">
      {/* Header / Tabs */}
      <div className="flex flex-col lg:flex-row items-center justify-between border-b border-zinc-800 bg-zinc-900/50 p-3 gap-3">
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-black/40 p-1 rounded-xl border border-zinc-800/50">
          {(['flattened', 'summary', 'context', 'recreator', 'intelligence'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setExecError(null);
              }}
              className={`px-3 py-2 text-[10px] md:text-xs font-black rounded-lg transition-all duration-300 uppercase tracking-widest ${
                activeTab === tab
                  ? 'bg-white text-black shadow-lg shadow-white/5 scale-105'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {tab === 'flattened' && 'Source'}
              {tab === 'summary' && 'Audit'}
              {tab === 'context' && 'AI Brain'}
              {tab === 'recreator' && 'DNA'}
              {tab === 'intelligence' && (
                <span className="flex items-center gap-2">
                  Intelligence <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-2">
          {activeTab !== 'intelligence' && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"
              >
                {copied ? <CheckCircleIcon /> : <CopyIcon />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => handleDownload('md')}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"
              >
                <DownloadIcon /> .MD
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative flex-1 overflow-hidden bg-[#050505] flex flex-col">
        {activeTab === 'intelligence' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                    <div className="p-4 bg-indigo-500/10 rounded-full mb-4 text-indigo-400">
                      <SparklesIcon />
                    </div>
                    <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">Codebase Chat</h4>
                    <p className="text-zinc-500 text-xs">Ask specific questions about the structure, logic, or potential bugs in this codebase.</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/10' 
                        : 'bg-zinc-900/80 border border-zinc-800 text-zinc-300 markdown-body'
                    }`}>
                      {msg.role === 'model' ? (
                        <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.text, { async: false }) as string }} />
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Processing Code...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
             </div>
             <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex gap-2">
                <input 
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask about this codebase..."
                  className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!userInput.trim() || isChatting}
                  className="bg-white text-black px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50"
                >
                  Ask
                </button>
             </form>
          </div>
        ) : activeTab === 'recreator' && !outputs.recreatedContext && !isExecuting ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 overflow-y-auto">
             <div className="text-center max-w-2xl mb-12 animate-fade-in-up">
                <div className="inline-block p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 mb-6 animate-bounce">
                  <SparklesIcon />
                </div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Stack Extraction</h3>
                <p className="text-zinc-500 text-lg font-medium">Identify key features to rip out and turn into a portable reconstruction blueprint.</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full mb-12 max-w-4xl">
                {outputs.concepts.length > 0 ? outputs.concepts.map(concept => (
                  <button
                    key={concept.id}
                    onClick={() => toggleConcept(concept.id)}
                    className={`text-left p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group/concept ${
                      selectedConcepts.includes(concept.id)
                        ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.1)] scale-[1.02]'
                        : 'bg-zinc-900/20 border-zinc-800/40 hover:border-zinc-700 hover:bg-zinc-800/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${selectedConcepts.includes(concept.id) ? 'text-indigo-400' : 'text-zinc-400'}`}>
                         {concept.name}
                       </span>
                       <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                         selectedConcepts.includes(concept.id) ? 'bg-indigo-500 border-indigo-400' : 'border-zinc-800'
                       }`}>
                         {selectedConcepts.includes(concept.id) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                       </div>
                    </div>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider leading-relaxed line-clamp-2 transition-colors group-hover/concept:text-zinc-400">
                      {concept.description}
                    </p>
                  </button>
                )) : (
                  <div className="col-span-full py-10 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">No modular concepts detected.</p>
                  </div>
                )}
             </div>

             {execError && (
               <div className="mb-6 p-4 bg-red-900/20 border border-red-800/40 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse max-w-lg text-center">
                 {execError}
               </div>
             )}

             <button
               onClick={handleExecuteRecreator}
               disabled={selectedConcepts.length === 0}
               className={`group flex items-center gap-4 px-14 py-6 rounded-full font-black text-xl transition-all duration-700 transform ${
                 selectedConcepts.length > 0 
                  ? 'bg-white text-black hover:scale-105 shadow-[0_0_60px_rgba(255,255,255,0.1)] active:scale-95' 
                  : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
               }`}
             >
               <SparklesIcon />
               TRIGGER STACK EXTRACTION ({selectedConcepts.length})
             </button>
          </div>
        ) : isExecuting ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black px-12 animate-fade-in">
             <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse mb-1">
                        System Operation: Extract
                      </span>
                      <span className="text-[14px] font-black text-white uppercase tracking-tighter">
                        {loadingStatus}
                      </span>
                   </div>
                   <span className="text-2xl font-black text-zinc-500 tabular-nums">
                     {Math.round(progress)}%
                   </span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="w-full h-4 bg-zinc-950 rounded-full border border-zinc-800/50 overflow-hidden relative shadow-inner">
                   <div 
                    className="h-full bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-500 transition-all duration-300 ease-out relative"
                    style={{ width: `${progress}%` }}
                   >
                     {/* Scanning Line Effect */}
                     <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                     {/* Internal Pattern */}
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-30"></div>
                   </div>
                </div>
                
                <div className="mt-12 grid grid-cols-4 gap-2">
                   {[...Array(4)].map((_, i) => (
                     <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-700 ${
                          progress > (i * 25) ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-zinc-900'
                        }`} 
                     />
                   ))}
                </div>
                
                <div className="mt-12 text-center">
                   <div className="inline-flex items-center gap-3 bg-zinc-900/50 px-5 py-2 rounded-full border border-zinc-800">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                         AI Sequencing Active
                      </span>
                   </div>
                </div>
             </div>
          </div>
        ) : isRichText ? (
          <div 
            className="w-full h-full p-10 md:p-16 overflow-y-auto markdown-body animate-fade-in-up scroll-smooth"
            dangerouslySetInnerHTML={{ __html: marked.parse(getContent(), { async: false }) as string }}
          />
        ) : (
          <div className="w-full h-full relative">
            <textarea
                readOnly
                value={getContent()}
                className="w-full h-full p-10 bg-transparent text-zinc-400 font-mono text-sm resize-none focus:outline-none leading-relaxed selection:bg-indigo-500/40"
                spellCheck={false}
            />
            {activeTab === 'flattened' && (
                <div className="absolute top-4 right-10 text-[10px] font-black text-zinc-700 uppercase tracking-widest pointer-events-none">
                    Raw_Flattened_Payload.txt
                </div>
            )}
          </div>
        )}
        
        {(activeTab === 'recreator' && outputs.recreatedContext) && (
           <button 
             onClick={() => onUpdateOutputs?.({...outputs, recreatedContext: undefined})}
             className="absolute top-6 right-10 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 text-[10px] font-black text-zinc-400 px-5 py-2.5 rounded-2xl hover:text-white hover:border-indigo-500/50 transition-all z-20 uppercase tracking-widest shadow-2xl"
           >
             ← Modify Stack
           </button>
        )}

        {activeTab !== 'intelligence' && <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />}
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default Viewer;