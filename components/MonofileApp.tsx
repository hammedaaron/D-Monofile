
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Uploader from './Uploader';
import StatsBar from './StatsBar';
import Viewer from './Viewer';
import { processFiles, calculateStats, generateFlattenedDocument } from '../services/fileService';
import { generateAIInsights } from '../services/geminiService';
import { saveMonofileToCloud } from '../services/databaseService';
import { AppStatus, FileNode, GeneratedOutputs, ProcessingStats } from '../types';
import { LoaderIcon, CheckCircleIcon, SparklesIcon, CloudSyncIcon } from './Icons';

const SESSION_KEY = 'monofile_session';

const MonofileApp: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [outputs, setOutputs] = useState<GeneratedOutputs>({ flattened: '', summary: '', aiContext: '', concepts: [] });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showKeyPicker, setShowKeyPicker] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (terminalEndRef.current) {
        terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Check for Key Selection
  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setShowKeyPicker(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeyPicker = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setShowKeyPicker(false);
  };

  // Session Recovery
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

  const handleFilesSelected = useCallback(async (fileList: FileList) => {
    setStatus(AppStatus.PARSING);
    setErrorMsg(null);
    setLogs([]);
    setIsSynced(false);
    addLog("System starting ingestion...");

    try {
      const files = await processFiles(fileList);
      if (files.length === 0) throw new Error("No valid files found.");

      addLog(`Metadata extraction success: ${files.length} nodes.`);
      const fileStats = calculateStats(files);
      setStats(fileStats);
      addLog(`Disk analysis: ${fileStats.totalLines} lines mapped.`);

      const flattened = generateFlattenedDocument(files);
      setOutputs(prev => ({ ...prev, flattened }));

      setStatus(AppStatus.PROCESSING_AI);
      addLog("Handshaking with Gemini 3 Flash Preview...");
      
      try {
        const { summary, aiContext, concepts } = await generateAIInsights(flattened, files);
        addLog("AI processing completed successfully.");
        setOutputs({ flattened, summary, aiContext, concepts });
      } catch (aiError: any) {
        if (aiError.message === "API_KEY_INVALID" || aiError.message === "API_KEY_MISSING") {
            addLog("! CRITICAL: API Key rejected by Google.");
            setErrorMsg("The provided API key is invalid. Please update your settings.");
            setShowKeyPicker(true);
        } else {
            addLog(`! AI Task Exception: ${aiError.message}`);
            setErrorMsg(`AI Error: ${aiError.message}`);
        }
      }

      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      addLog(`FATAL: ${err.message}`);
      setErrorMsg(err.message);
      setStatus(AppStatus.ERROR);
    }
  }, []);

  const handleCloudSync = async () => {
    if (!stats || isSyncing || isSynced) return;
    
    setIsSyncing(true);
    addLog("Initializing Supabase Cloud Sync...");
    
    try {
      const projectName = `Monofile_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}`;
      await saveMonofileToCloud(projectName, stats, outputs);
      setIsSynced(true);
      addLog("Cloud Sync Successful. Entry persisted to 'monofiles' table.");
    } catch (err: any) {
      addLog(`! Sync Error: ${err.message}`);
      alert(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center relative overflow-hidden min-h-[90vh]">
      {/* Key Picker Overlay */}
      {showKeyPicker && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl max-w-lg text-center shadow-2xl animate-fade-in-up">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
               <SparklesIcon />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Setup API Engine</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              To process your codebase, Monofile requires a valid Google Gemini API key. 
              Please select a paid GCP project key from the dialog.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleOpenKeyPicker}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-zinc-200 transition-all"
              >
                Configure API Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                className="text-[10px] text-zinc-600 uppercase tracking-widest font-black hover:text-zinc-400"
              >
                Learn about billing & keys
              </a>
            </div>
          </div>
        </div>
      )}

      <main className="w-full max-w-6xl z-10 flex flex-col items-center pt-12 pb-20 px-4">
        <div className="text-center mb-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[10px] font-black text-zinc-500 mb-4 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Cloud Core Active
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-600">
            MONOFILE
          </h1>
        </div>

        {status === AppStatus.IDLE && <Uploader onFilesSelected={handleFilesSelected} isProcessing={false} />}

        {(status === AppStatus.PARSING || status === AppStatus.PROCESSING_AI) && (
          <div className="w-full max-w-3xl">
            <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex items-center justify-between font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                    <span>System_Log.sh</span>
                </div>
                <div className="h-64 p-6 font-mono text-xs overflow-y-auto space-y-1 bg-[#050505]">
                    {logs.map((log, i) => (
                        <div key={i} className={`${log.includes('!') ? 'text-amber-500' : 'text-zinc-400'}`}>
                            <span className="text-indigo-500/70 mr-2">➜</span> {log}
                        </div>
                    ))}
                    <div ref={terminalEndRef} />
                </div>
            </div>
          </div>
        )}

        {status === AppStatus.COMPLETE && stats && (
          <div className="w-full">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <CheckCircleIcon />
                <span className="font-black text-[10px] uppercase tracking-widest">Codebase Decoded</span>
              </div>
              
              <button 
                onClick={handleCloudSync}
                disabled={isSyncing || isSynced}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${
                  isSynced 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                }`}
              >
                {isSyncing ? <LoaderIcon /> : isSynced ? <CheckCircleIcon /> : <CloudSyncIcon />}
                {isSyncing ? 'Syncing...' : isSynced ? 'Synced to Cloud' : 'Sync to Cloud'}
              </button>

              <button 
                onClick={() => setShowKeyPicker(true)}
                className="text-[10px] text-zinc-600 hover:text-white transition-all uppercase tracking-widest font-black ml-2"
              >
                Change Key
              </button>
            </div>
            <StatsBar stats={stats} />
            <Viewer 
              outputs={outputs} 
              onUpdateOutputs={(newOutputs) => {
                setOutputs(newOutputs);
                localStorage.setItem(SESSION_KEY, JSON.stringify({ stats, outputs: newOutputs }));
              }} 
              onRequestKeyUpdate={() => setShowKeyPicker(true)}
            />
          </div>
        )}

        {status === AppStatus.ERROR && (
           <div className="text-center p-12 bg-red-900/10 border border-red-800/30 rounded-3xl max-w-xl">
             <h3 className="text-red-400 font-black mb-2 uppercase tracking-widest">Critical Error</h3>
             <p className="text-zinc-400 text-sm mb-6">{errorMsg}</p>
             <div className="flex gap-4 justify-center">
                <button onClick={() => setStatus(AppStatus.IDLE)} className="px-8 py-3 bg-white text-black rounded-full font-black text-xs uppercase">Retry</button>
                <button onClick={() => setShowKeyPicker(true)} className="px-8 py-3 bg-zinc-800 text-white rounded-full font-black text-xs uppercase">Fix Key</button>
             </div>
           </div>
        )}
      </main>
    </div>
  );
};

export default MonofileApp;
