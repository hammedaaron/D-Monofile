import React from 'react';

interface HowItWorksProps {
  onNavigate: (route: string) => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigate }) => {
  return (
    <div className="w-full text-zinc-200 bg-black min-h-screen selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <button onClick={() => onNavigate('landing')} className="text-xl font-black tracking-tighter text-white hover:text-indigo-400 transition-colors">MONOFILE</button>
           <button onClick={() => onNavigate('auth')} className="text-xs font-bold bg-white text-black px-5 py-2 rounded-full hover:bg-zinc-200 transition-colors">Get Started</button>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
            <div className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-indigo-400 mb-6 tracking-widest uppercase">
                Technical Deep Dive
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
                Under the Hood
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed mb-20">
                Monofile isn't just a file joiner. It's an intelligent ingestion engine designed to bridge the gap between complex file systems and linear LLM context windows.
            </p>

            <div className="space-y-24 relative">
                {/* Connecting Line */}
                <div className="absolute left-[19px] md:left-[43px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-zinc-800 via-indigo-900/50 to-zinc-800"></div>

                {/* Step 1 */}
                <section className="relative pl-12 md:pl-24">
                    <div className="absolute left-0 md:left-[26px] top-1 w-10 h-10 rounded-full bg-black border-4 border-zinc-800 flex items-center justify-center z-10">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
                    </div>
                    <span className="text-indigo-500 font-mono text-xs tracking-widest uppercase mb-3 block">Phase 01</span>
                    <h2 className="text-3xl font-bold text-white mb-6">Recursive Ingestion</h2>
                    <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                        When you drop a folder or ZIP, Monofile initiates a recursive walk through the directory tree. Unlike standard uploaders, we don't just grab files; we map the **relational structure**.
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-4 text-zinc-500 text-sm">
                        <li className="flex gap-3 items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800"><span className="text-indigo-500 font-bold">✓</span> Binary Exclusion (.exe, .png)</li>
                        <li className="flex gap-3 items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800"><span className="text-indigo-500 font-bold">✓</span> Noise Reduction (node_modules)</li>
                    </ul>
                </section>

                {/* Step 2 */}
                <section className="relative pl-12 md:pl-24">
                    <div className="absolute left-0 md:left-[26px] top-1 w-10 h-10 rounded-full bg-black border-4 border-zinc-800 flex items-center justify-center z-10">
                         <div className="w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]"></div>
                    </div>
                     <span className="text-purple-500 font-mono text-xs tracking-widest uppercase mb-3 block">Phase 02</span>
                    <h2 className="text-3xl font-bold text-white mb-6">Contextual Flattening</h2>
                    <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                        LLMs struggle when code is stripped of its location. Monofile injects the filepath as a header before every code block. This allows the AI to understand "where" code lives, not just "what" it is.
                    </p>
                    <div className="bg-[#0d0d0d] p-6 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-400 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
                        <span className="text-zinc-600 block mb-2">// Output Structure</span>
                        <span className="text-blue-400">### PATH: src/auth/login.ts</span><br/>
                        <span className="text-purple-400 font-bold">## FILE: login.ts</span><br/>
                        <span className="text-zinc-500">```typescript</span><br/>
                        <span className="text-red-400">export const</span> <span className="text-yellow-300">Login</span> = () ={'>'} {'{'}...{'}'}<br/>
                        <span className="text-zinc-500">```</span>
                    </div>
                </section>

                {/* Step 3 */}
                <section className="relative pl-12 md:pl-24">
                    <div className="absolute left-0 md:left-[26px] top-1 w-10 h-10 rounded-full bg-black border-4 border-zinc-800 flex items-center justify-center z-10">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
                    </div>
                     <span className="text-emerald-500 font-mono text-xs tracking-widest uppercase mb-3 block">Phase 03</span>
                    <h2 className="text-3xl font-bold text-white mb-6">Architectural Analysis (Gemini 2.5)</h2>
                    <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                        Once flattened, Monofile sends a compressed representation to **Google's Gemini 2.5 Flash model**. We prompt for two distinct outputs:
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl hover:border-emerald-500/30 transition-colors">
                            <h3 className="text-white font-bold mb-2">Executive Summary</h3>
                            <p className="text-sm text-zinc-400">A human-readable explanation of what the app does, tech stack, and key features. Perfect for Readme.md.</p>
                        </div>
                        <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-xl hover:border-emerald-500/30 transition-colors">
                            <h3 className="text-white font-bold mb-2">AI Context Blueprint</h3>
                            <p className="text-sm text-zinc-400">A dense, logic-heavy summary optimized for pasting into other AI sessions to "prime" them instantly.</p>
                        </div>
                    </div>
                </section>

                 {/* Step 4 */}
                 <section className="relative pl-12 md:pl-24">
                    <div className="absolute left-0 md:left-[26px] top-1 w-10 h-10 rounded-full bg-black border-4 border-zinc-800 flex items-center justify-center z-10">
                        <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
                    </div>
                     <span className="text-white font-mono text-xs tracking-widest uppercase mb-3 block">Phase 04</span>
                    <h2 className="text-3xl font-bold text-white mb-6">Local-First Privacy</h2>
                    <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                        Aside from the optional AI analysis step, **Monofile runs entirely in your browser**. Your files are processed in memory using the browser's File API. We do not store your code on our servers. 
                    </p>
                </section>
            </div>

            <div className="mt-32 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to organize your code?</h2>
                <button 
                  onClick={() => onNavigate('auth')}
                  className="btn-shine px-12 py-5 bg-white text-black font-bold text-lg md:text-xl rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] transform hover:-translate-y-1"
                >
                  Start Flattening Free
                </button>
            </div>
        </div>
      </main>
      
      <footer className="py-8 text-center border-t border-zinc-900 mt-12 bg-black">
           <p className="text-xs text-zinc-600 uppercase tracking-widest">Powered by HAMSTAR</p>
      </footer>
    </div>
  );
};

export default HowItWorks;