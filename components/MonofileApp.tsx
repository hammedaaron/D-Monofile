import React, { useState, useCallback, useEffect, useRef } from 'react';
import Uploader from './Uploader';
import StatsBar from './StatsBar';
import Viewer from './Viewer';
import { processFiles, calculateStats, generateFlattenedDocument } from '../services/fileService';
import { generateAIInsights } from '../services/geminiService';
import { AppStatus, FileNode, GeneratedOutputs, ProcessingStats } from '../types';
import { LoaderIcon, CheckCircleIcon } from './Icons';

const SESSION_KEY = 'monofile_session';

const MonofileApp: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [outputs, setOutputs] = useState<GeneratedOutputs>({ flattened: '', summary: '', aiContext: '', concepts: [] });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (terminalEndRef.current) {
        terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Load Session on Mount
  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.stats && parsed.outputs && parsed.outputs.flattened) {
          setStats(parsed.stats);
          setOutputs(parsed.outputs);
          setStatus(AppStatus.COMPLETE);
        }
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  // Save Session
  useEffect(() => {
    if (status === AppStatus.COMPLETE && outputs.flattened) {
      const sessionData = { stats, outputs, timestamp: Date.now() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }
  }, [status, stats, outputs]);

  const handleFilesSelected = useCallback(async (fileList: FileList) => {
    setStatus(AppStatus.PARSING);
    setErrorMsg(null);
    setLogs([]);
    addLog("Initializing ingestion engine...");
    addLog(`Targeting ${fileList.length} root entries...`);

    try {
      const files = await processFiles(fileList);
      if (files.length === 0) throw new Error("No valid files found.");

      addLog(`Success: ${files.length} files parsed recursively.`);
      const fileStats = calculateStats(files);
      setStats(fileStats);
      addLog(`Metrics: ${fileStats.totalLines} lines found. Flattening document...`);

      const flattened = generateFlattenedDocument(files);
      setOutputs(prev => ({ ...prev, flattened }));

      setStatus(AppStatus.PROCESSING_AI);
      addLog("Handshaking with Gemini 3 Flash Preview...");
      addLog("Streaming architecture to AI context window...");
      
      try {
        addLog("Discovering DNA Concepts and feature bundles...");
        const { summary, aiContext, concepts } = await generateAIInsights(flattened, files);
        addLog(`Pattern recognition complete. Found ${concepts.length} core concepts.`);
        addLog("Compiling architectural summary...");
        setOutputs({ flattened, summary, aiContext, concepts });
      } catch (aiError: any) {
        addLog(`! AI Error: ${aiError.message}`);
        setErrorMsg(aiError.message);
        setOutputs(prev => ({ ...prev, summary: 'Partial failure.', concepts: [] }));
      }

      addLog("Ingestion cycle complete. Ready for recreation.");
      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      addLog(`FATAL ERROR: ${err.message}`);
      setErrorMsg(err.message);
      setStatus(AppStatus.ERROR);
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[128px] pointer-events-none" />

      <main className="w-full max-w-6xl z-10 flex flex-col items-center pt-12 pb-20 px-4">
        <div className="text-center mb-10 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-md text-[10px] font-black text-zinc-500 mb-4 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_#6366f1]"></span>
            System Ready
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-600 drop-shadow-2xl">
            MONOFILE
          </h1>
        </div>

        {status === AppStatus.IDLE && (
          <div className="w-full animate-fade-in-up">
            <Uploader onFilesSelected={handleFilesSelected} isProcessing={false} />
          </div>
        )}

        {(status === AppStatus.PARSING || status === AppStatus.PROCESSING_AI) && (
          <div className="w-full max-w-3xl animate-fade-in-up">
            <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">System_Log.sh</span>
                    <div className="w-10"></div>
                </div>
                <div className="h-64 p-6 font-mono text-xs overflow-y-auto space-y-1 scrollbar-hide bg-[#050505]">
                    {logs.map((log, i) => (
                        <div key={i} className={`${log.includes('!') ? 'text-amber-500' : 'text-zinc-400'}`}>
                            <span className="text-indigo-500/70 mr-2">➜</span> {log}
                        </div>
                    ))}
                    <div className="flex items-center gap-2 text-indigo-400 mt-2">
                        <div className="w-1 h-3 bg-indigo-500 animate-pulse"></div>
                        <span className="animate-pulse">_</span>
                    </div>
                    <div ref={terminalEndRef} />
                </div>
            </div>
            <p className="text-center mt-6 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                Do not close browser during ingestion
            </p>
          </div>
        )}

        {status === AppStatus.COMPLETE && stats && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <CheckCircleIcon />
                <span className="font-black text-[10px] uppercase tracking-widest">Codebase Decoded</span>
              </div>
              <button 
                onClick={() => { setStatus(AppStatus.IDLE); localStorage.removeItem(SESSION_KEY); }}
                className="text-[10px] text-zinc-600 hover:text-white transition-all uppercase tracking-widest font-black p-2 border border-zinc-900 hover:border-zinc-700 rounded-xl"
              >
                New Session
              </button>
            </div>
            <StatsBar stats={stats} />
            <Viewer outputs={outputs} onUpdateOutputs={setOutputs} />
          </div>
        )}

        {status === AppStatus.ERROR && (
           <div className="text-center p-12 bg-red-900/10 border border-red-800/30 rounded-3xl max-w-xl">
             <h3 className="text-red-400 font-black mb-2 uppercase tracking-widest">Ingestion Halted</h3>
             <p className="text-zinc-400 text-sm mb-6">{errorMsg}</p>
             <button onClick={() => setStatus(AppStatus.IDLE)} className="px-8 py-3 bg-red-800 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all">Retry Process</button>
           </div>
        )}
      </main>
    </div>
  );
};

export default MonofileApp;