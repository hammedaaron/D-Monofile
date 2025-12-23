import React from 'react';

interface LandingProps {
  onNavigate: (route: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  return (
    <div className="w-full text-zinc-200 selection:bg-indigo-500/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black -z-10"></div>
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse -z-10"></div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10"></div>

        <div className="animate-fade-in-up max-w-5xl mx-auto space-y-10 relative z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-md text-xs font-semibold text-zinc-400 mb-6 tracking-widest uppercase shadow-xl">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Powered by HAMSTAR
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-600 drop-shadow-2xl">
            MONOFILE
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-medium text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Turn any codebase into one <span className="text-indigo-400 font-semibold">clean, readable document</span>.
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
            <button 
              onClick={() => onNavigate('auth')}
              className="btn-shine group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => onNavigate('how-it-works')}
              className="px-8 py-4 bg-zinc-950 text-zinc-300 font-medium text-lg rounded-full border border-zinc-800 hover:bg-zinc-900 hover:text-white transition-all hover:border-zinc-600"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* 2. WHAT MONOFILE DOES */}
      <section className="py-32 px-6 bg-zinc-950/50 reveal relative border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Why Monofile?</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Modern applications are messy. Monofile brings order to chaos by flattening structure without losing context.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-lg text-zinc-400 leading-loose">
              <div className="flex gap-4 items-start">
                <div className="mt-1 p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-indigo-400"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">Parses Everything</h3>
                  <p>Folders, subfolders, files. We traverse the entire tree recursively.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-purple-400"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14 2z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">One Readable File</h3>
                  <p>Generates a single structured document. H1 for folders, H2 for files. Clean code blocks.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-emerald-400"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg></div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">Instant Export</h3>
                  <p>Download as .TXT, .PDF, or .DOCX. Ready for documentation or LLM context.</p>
                </div>
              </div>
            </div>

            {/* Visual Representation of Output */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-[#0d0d0d] border border-zinc-800 p-6 md:p-8 rounded-xl shadow-2xl overflow-hidden font-mono text-xs md:text-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="ml-4 text-zinc-500">monofile_output.txt</span>
                </div>
                
                <div className="space-y-4 text-zinc-400">
                  <div className="opacity-50"># MONOFILE GENERATED CODEBASE</div>
                  <div>
                    <span className="text-blue-400">### PATH: src/components</span>
                  </div>
                  <div>
                    <span className="text-purple-400 font-bold">## FILE: Header.tsx</span>
                  </div>
                  <div className="pl-4 border-l-2 border-zinc-800 text-zinc-300">
                    <span className="text-red-400">import</span> React <span className="text-red-400">from</span> <span className="text-green-400">'react'</span>;<br/>
                    <span className="text-red-400">interface</span> <span className="text-yellow-400">Props</span> {'{'}<br/>
                    &nbsp;&nbsp;title: <span className="text-yellow-400">string</span>;<br/>
                    {'}'}<br/>
                    <span className="text-red-400">export const</span> <span className="text-blue-400">Header</span> = ({'{'} title {'}'}) ={'>'} (<br/>
                    &nbsp;&nbsp;{'<'}header{'>'}{'{'}title{'}'}{'<'}header/{'>'}<br/>
                    );
                  </div>
                  <div className="border-t border-dashed border-zinc-800 my-4"></div>
                  <div>
                    <span className="text-blue-400">### PATH: src/utils</span>
                  </div>
                  <div>
                    <span className="text-purple-400 font-bold">## FILE: api.ts</span>
                  </div>
                  <div className="pl-4 border-l-2 border-zinc-800 text-zinc-300">
                    <span className="text-zinc-500">// Fetch logic here...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="py-32 px-6 bg-black reveal border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 text-white">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Upload", desc: "Drag & drop folders, ZIPs, or individual files.", icon: "1" },
              { title: "Parse", desc: "We scan the deep structure of your codebase.", icon: "2" },
              { title: "Flatten", desc: "Directories become headings. Code becomes content.", icon: "3" },
              { title: "Export", desc: "Get a clean TXT/PDF ready for AI or Audit.", icon: "4" }
            ].map((step, i) => (
              <div key={i} className="group relative p-8 border border-zinc-800 rounded-2xl bg-zinc-900/20 hover:bg-zinc-900/60 transition-all hover:-translate-y-2 duration-300">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="text-5xl font-black text-zinc-800 group-hover:text-indigo-900/50 mb-6 transition-colors">{step.icon}</div>
                 <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{step.title}</h3>
                 <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <button 
              onClick={() => onNavigate('how-it-works')}
              className="px-6 py-3 rounded-full border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all text-sm font-semibold tracking-wide uppercase"
            >
              Read the Technical Deep Dive →
            </button>
          </div>
        </div>
      </section>

      {/* 4. WHO IT IS FOR */}
      <section className="py-32 px-6 bg-zinc-950 reveal border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Supported Projects</h2>
            <p className="text-xl text-zinc-400">No limits on file types, languages, or size.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
             <div className="p-10 bg-gradient-to-br from-zinc-900 to-black rounded-3xl border border-zinc-800 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-900/10 rounded-full blur-[80px] group-hover:bg-indigo-900/20 transition-all"></div>
               <h3 className="text-3xl font-bold text-white mb-6 relative z-10">For Developers</h3>
               <ul className="space-y-4 text-zinc-300 text-lg relative z-10">
                 <li className="flex items-center gap-3"><span className="text-indigo-500">✓</span> Understand legacy code fast</li>
                 <li className="flex items-center gap-3"><span className="text-indigo-500">✓</span> Perform comprehensive audits</li>
                 <li className="flex items-center gap-3"><span className="text-indigo-500">✓</span> Onboard new team members</li>
               </ul>
             </div>

             <div className="p-10 bg-gradient-to-br from-zinc-900 to-black rounded-3xl border border-zinc-800 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-900/10 rounded-full blur-[80px] group-hover:bg-purple-900/20 transition-all"></div>
               <h3 className="text-3xl font-bold text-white mb-6 relative z-10">For AI Workflows</h3>
               <ul className="space-y-4 text-zinc-300 text-lg relative z-10">
                 <li className="flex items-center gap-3"><span className="text-purple-500">✓</span> Create perfect LLM context</li>
                 <li className="flex items-center gap-3"><span className="text-purple-500">✓</span> Feed entire apps to Gemini/Claude</li>
                 <li className="flex items-center gap-3"><span className="text-purple-500">✓</span> Generate architectural summaries</li>
               </ul>
             </div>
          </div>
        </div>
      </section>

      {/* 5. ABOUT HAMSTAR */}
      <section className="py-32 px-6 bg-black reveal border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Profile Image */}
            <div className="relative shrink-0">
               <div className="w-48 h-48 md:w-56 md:h-56 rounded-full p-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-zinc-800 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
                 <img 
                   src="hamstar.jpg" 
                   alt="HAMSTAR - Master Developer" 
                   className="w-full h-full object-cover rounded-full border-4 border-black hover:scale-105 transition-transform duration-700" 
                   onError={(e) => {(e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=H&background=000&color=fff&size=256&font-size=0.4'}} 
                 />
               </div>
               <div className="absolute bottom-4 right-4 bg-black border border-zinc-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                 BUILDER
               </div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3">Master Developer</h3>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Built by HAMSTAR</h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                Monofile isn't just a tool; it's a philosophy. Designed by HAMSTAR to prioritize system clarity over complexity. We believe that if humans and machines can't understand code instantly, it's broken.
              </p>
              <div className="inline-block border-l-4 border-indigo-500 pl-6 text-zinc-300 italic">
                "Code should be as readable as a book. Monofile writes the book for you."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-40 px-6 text-center reveal relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] -z-10"></div>
        
        <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight">Ready to Organize?</h2>
        <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">Join the developers turning chaos into clarity. <br/>Monofile is currently <span className="text-white font-semibold">100% Free</span>.</p>
        
        <button 
          onClick={() => onNavigate('auth')}
          className="btn-shine px-16 py-6 bg-white text-black font-bold text-xl rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:shadow-[0_0_70px_rgba(255,255,255,0.4)] transform hover:-translate-y-1"
        >
          Get Started Now
        </button>
        
        <div className="mt-16 flex items-center justify-center gap-2 opacity-50">
           <div className="h-px w-12 bg-zinc-700"></div>
           <p className="text-xs text-zinc-500 tracking-[0.3em] uppercase">Powered by HAMSTAR</p>
           <div className="h-px w-12 bg-zinc-700"></div>
        </div>
      </section>

    </div>
  );
};

export default Landing;