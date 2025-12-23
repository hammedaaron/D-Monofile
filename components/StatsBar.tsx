import React from 'react';
import { ProcessingStats } from '../types';

interface StatsBarProps {
  stats: ProcessingStats;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Heuristic: 1 token per 4 characters for code/text
  const estimatedTokens = Math.ceil(stats.totalSize / 4);

  const topExtensions = Object.entries(stats.fileTypes)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3)
    .map(([ext]) => ext)
    .join(', ');

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-5xl mx-auto mb-10">
      <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-2xl backdrop-blur-sm group hover:border-zinc-700 transition-colors">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Files</p>
        <p className="text-2xl font-black text-white">{stats.totalFiles}</p>
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-2xl backdrop-blur-sm group hover:border-zinc-700 transition-colors">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Disk Size</p>
        <p className="text-2xl font-black text-white">{formatSize(stats.totalSize)}</p>
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-2xl backdrop-blur-sm group hover:border-zinc-700 transition-colors">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Lines</p>
        <p className="text-2xl font-black text-white">{stats.totalLines.toLocaleString()}</p>
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-2xl backdrop-blur-sm group hover:border-zinc-700 transition-colors">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Est. Tokens</p>
        <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-indigo-400">{(estimatedTokens / 1000).toFixed(1)}k</p>
            <span className="text-[10px] text-zinc-600 font-bold">/ 2M</span>
        </div>
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-2xl backdrop-blur-sm group hover:border-zinc-700 transition-colors col-span-2 md:col-span-1">
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Stack DNA</p>
        <p className="text-sm font-black text-zinc-100 truncate">{topExtensions || 'N/A'}</p>
      </div>
    </div>
  );
};

export default StatsBar;