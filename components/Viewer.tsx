import React, { useState, useRef, useEffect } from 'react';
import { GeneratedOutputs, ConceptBundle, ChatMessage } from '../types';
import { DownloadIcon, CopyIcon, CheckCircleIcon, SparklesIcon, LoaderIcon } from './Icons';
import { downloadStringAsFile } from '../services/fileService';
import { recreateFeatureContext, startCodebaseChat } from '../services/geminiService';
import { marked } from 'marked';

interface ViewerProps {
  outputs: GeneratedOutputs;
  onUpdateOutputs?: (newOutputs: GeneratedOutputs) => void;
}

const Viewer: React.FC<ViewerProps> = ({ outputs, onUpdateOutputs }) => {
  const [activeTab, setActiveTab] = useState<'flattened' | 'summary' | 'context' | 'recreator' | 'intelligence'>('flattened');
  const [copied, setCopied] = useState(false);
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  
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
    try {
      const conceptsToProcess = outputs.concepts.filter(c => selectedConcepts.includes(c.id));
      const result = await recreateFeatureContext(outputs.flattened, conceptsToProcess);
      if (onUpdateOutputs) {
        onUpdateOutputs({ ...outputs, recreatedContext: result });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
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
              onClick={() => setActiveTab(tab)}
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
             <div className="text-center max-w-2xl mb-12">
                <div className="inline-block p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 mb-6 animate-bounce">
                  <SparklesIcon />
                </div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Stack Extraction</h3>
                <p className="text-zinc-500 text-lg font-medium">Select the logic modules you want to "rip out" and turn into a portable reconstruction prompt.</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full mb-12 max-w-4xl">
                {outputs.concepts.map(concept => (
                  <button
                    key={concept.id}
                    onClick={() => toggleConcept(concept.id)}
                    className={`text-left p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden ${
                      selectedConcepts.includes(concept.id)
                        ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.1)]'
                        : 'bg-zinc-900/20 border-zinc-800/40 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                       <span className={`text-xs font-black uppercase tracking-widest ${selectedConcepts.includes(concept.id) ? 'text-indigo-400' : 'text-zinc-400'}`}>
                         {concept.name}
                       </span>
                       <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                         selectedConcepts.includes(concept.id) ? 'bg-indigo-500 border-indigo-400 scale-125' : 'border-zinc-800'
                       }`} />
                    </div>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider leading-relaxed line-clamp-2">
                      {concept.description}
                    </p>
                  </button>
                ))}
             </div>

             <button
               onClick={handleExecuteRecreator}
               disabled={selectedConcepts.length === 0}
               className={`group flex items-center gap-4 px-14 py-6 rounded-full font-black text-xl transition-all duration-700 ${
                 selectedConcepts.length > 0 
                  ? 'bg-white text-black hover:scale-105 shadow-[0_0_60px_rgba(255,255,255,0.1)]' 
                  : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
               }`}
             >
               <SparklesIcon />
               EXTRACT DNA ({selectedConcepts.length})
             </button>
          </div>
        ) : isExecuting ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black">
             <div className="relative mb-10 w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
                <div className="absolute inset-2 border-2 border-indigo-500/40 rounded-full animate-pulse"></div>
                <div className="text-indigo-400 animate-spin-slow scale-150">
                    <LoaderIcon />
                </div>
             </div>
             <p className="text-white font-black tracking-[0.5em] text-[10px] uppercase animate-pulse">Sequencing logic modules...</p>
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
             ← Edit Extraction
           </button>
        )}

        {activeTab !== 'intelligence' && <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />}
      </div>
    </div>
  );
};

export default Viewer;