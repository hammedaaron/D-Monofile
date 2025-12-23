import { FileNode, ProcessingStats } from '../types';

// Declare JSZip globally as it is loaded via CDN
declare const JSZip: any;

const IGNORED_FOLDERS = ['.git', 'node_modules', 'dist', 'build', '.next', 'coverage', '__pycache__'];
const IGNORED_FILES = ['.DS_Store', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
const BINARY_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'ico', 'pdf', 'exe', 'bin', 'zip', 'tar', 'gz'];

export const isBinary = (filename: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return BINARY_EXTENSIONS.includes(ext);
};

export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const processFiles = async (fileList: FileList): Promise<FileNode[]> => {
  const files: FileNode[] = [];
  
  // Convert FileList to Array
  const rawFiles = Array.from(fileList);
  
  // Check for ZIPs first
  const zipFiles = rawFiles.filter(f => f.name.endsWith('.zip'));
  const normalFiles = rawFiles.filter(f => !f.name.endsWith('.zip'));

  // Process Normal Files
  for (const file of normalFiles) {
    const path = file.webkitRelativePath || file.name;
    if (shouldIgnore(path)) continue;
    if (isBinary(path)) continue;

    try {
      const content = await readFileContent(file);
      files.push({
        path,
        name: file.name,
        extension: file.name.split('.').pop() || '',
        content,
        size: file.size
      });
    } catch (e) {
      console.warn(`Failed to read file: ${file.name}`);
    }
  }

  // Process ZIP Files (using JSZip from CDN)
  if (zipFiles.length > 0 && typeof JSZip !== 'undefined') {
    for (const zipFile of zipFiles) {
      try {
        const zip = await JSZip.loadAsync(zipFile);
        const entries = Object.keys(zip.files);
        
        for (const filename of entries) {
          if (shouldIgnore(filename)) continue;
          if (zip.files[filename].dir) continue;
          if (isBinary(filename)) continue;

          const content = await zip.files[filename].async('string');
          files.push({
            path: filename, // ZIP paths are usually relative roots
            name: filename.split('/').pop() || filename,
            extension: filename.split('.').pop() || '',
            content,
            size: content.length // Approximation
          });
        }
      } catch (e) {
        console.error("Error unzipping", e);
        throw new Error("Failed to process ZIP file.");
      }
    }
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
};

const shouldIgnore = (path: string): boolean => {
  const parts = path.split('/');
  // Check if any part of the path is in ignored folders
  if (parts.some(part => IGNORED_FOLDERS.includes(part))) return true;
  // Check filename
  const filename = parts[parts.length - 1];
  if (IGNORED_FILES.includes(filename)) return true;
  return false;
};

export const calculateStats = (files: FileNode[]): ProcessingStats => {
  const stats: ProcessingStats = {
    totalFiles: files.length,
    totalLines: 0,
    totalSize: 0,
    fileTypes: {}
  };

  files.forEach(f => {
    stats.totalSize += f.size;
    stats.totalLines += f.content.split('\n').length;
    const type = f.extension.toUpperCase() || 'UNKNOWN';
    stats.fileTypes[type] = (stats.fileTypes[type] || 0) + 1;
  });

  return stats;
};

export const generateFlattenedDocument = (files: FileNode[]): string => {
  let output = `# MONOFILE GENERATED CODEBASE\n`;
  output += `# Generated at: ${new Date().toISOString()}\n`;
  output += `# File Count: ${files.length}\n`;
  output += `================================================================================\n\n`;

  files.forEach(file => {
    const parts = file.path.split('/');
    const fileName = parts.pop();
    const folderStructure = parts.join(' > ');

    output += `\n`;
    if (folderStructure) {
      output += `### PATH: ${folderStructure}\n`;
    }
    output += `## FILE: ${fileName}\n`;
    output += `\`\`\`${file.extension}\n`;
    output += file.content;
    output += `\n\`\`\`\n`;
    output += `\n--------------------------------------------------------------------------------\n`;
  });

  return output;
};

export const downloadStringAsFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};