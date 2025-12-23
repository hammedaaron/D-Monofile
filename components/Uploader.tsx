import React, { useRef, useState } from 'react';
import { UploadIcon } from './Icons';

interface UploaderProps {
  onFilesSelected: (files: FileList) => void;
  isProcessing: boolean;
}

const Uploader: React.FC<UploaderProps> = ({ onFilesSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-10">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer group
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10' 
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={`p-4 rounded-full bg-zinc-800 mb-4 transition-transform group-hover:scale-110 ${isDragging ? 'bg-indigo-500 text-white' : 'text-zinc-400'}`}>
          <UploadIcon />
        </div>
        
        <h3 className="text-xl font-semibold text-zinc-100 mb-2">
          Drop your project here
        </h3>
        <p className="text-zinc-400 mb-6 max-w-md">
          Supports ZIP, Folders (Chrome/Edge), or individual files. 
          We parse everything recursively.
        </p>

        <div className="flex gap-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
          />
          <button 
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md text-sm font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Select Files
          </button>
          
          <input
            type="file"
            ref={folderInputRef}
            className="hidden"
            // @ts-ignore - webkitdirectory is standard in modern browsers but TS might complain
            webkitdirectory="" 
            directory=""
            multiple
            onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
          />
          <button 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
            onClick={(e) => {
              e.stopPropagation();
              folderInputRef.current?.click();
            }}
          >
            Select Folder
          </button>
        </div>
      </div>
    </div>
  );
};

export default Uploader;