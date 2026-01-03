import { FileNode, ProcessingStats } from '../types';

declare const JSZip: any;

const IGNORED_FOLDERS = ['.git', 'node_modules', 'dist', 'build', '.next', 'coverage', '__pycache__', '.gradle', '.idea', 'vendor', 'Pods', 'target'];
const IGNORED_FILES = ['.DS_Store', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];

// Specific extensions to treat as text for analysis
const TEXT_EXTENSIONS = [
  'html', 'css', 'js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx', 'json', 'yaml', 'yml', 'xml', 'md', 'txt',
  'py', 'rb', 'php', 'go', 'rs', 'java', 'kt', 'c', 'cpp', 'h', 'hpp', 'cs', 'sh', 'bash',
  'sol', 'wasm', 'abi', 'contract', 'dockerfile', 'gradle', 'properties', 'toml', 'env', 'local',
  'dart', 'swift', 'm', 'h', 'cmake', 'makefile', 'proto'
];

const BINARY_EXTENSIONS = [
  'apk', 'aab', 'ipa', 'exe', 'msi', 'app', 'dmg', 'pkg', 'deb', 'rpm', 'appimage',
  'png', 'jpg', 'jpeg', 'gif', 'ico', 'pdf', 'zip', 'tar', 'gz', 'jar', 'war', 'node', 'whl',
  'pb', 'tflite', 'bin', 'dll', 'so', 'dylib'
];

export const isBinary = (filename: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  // If it's in our text list, it's definitely not binary
  if (TEXT_EXTENSIONS.includes(ext)) return false;
  // Check if it's in the known binary list or doesn't have an extension
  return BINARY_EXTENSIONS.includes(ext) || !filename.includes('.');
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
  const rawFiles = Array.from(fileList);
  
  const zipFiles = rawFiles.filter(f => f.name.endsWith('.zip'));
  const normalFiles = rawFiles.filter(f => !f.name.endsWith('.zip'));

  for (const file of normalFiles) {
    const path = file.webkitRelativePath || file.name;
    if (shouldIgnore(path)) continue;

    try {
      if (isBinary(path)) {
        files.push({
          path,
          name: file.name,
          extension: file.name.split('.').pop() || '',
          content: `[INGESTED BINARY METADATA: ${file.name} | Size: ${file.size} bytes | Platform: ${detectPlatform(file.name)}]`,
          size: file.size
        });
      } else {
        const content = await readFileContent(file);
        files.push({
          path,
          name: file.name,
          extension: file.name.split('.').pop() || '',
          content,
          size: file.size
        });
      }
    } catch (e) {
      console.warn(`Failed to read file: ${file.name}`);
    }
  }

  if (zipFiles.length > 0 && typeof JSZip !== 'undefined') {
    for (const zipFile of zipFiles) {
      try {
        const zip = await JSZip.loadAsync(zipFile);
        const entries = Object.keys(zip.files);
        
        for (const filename of entries) {
          if (shouldIgnore(filename)) continue;
          if (zip.files[filename].dir) continue;

          if (isBinary(filename)) {
            files.push({
              path: filename,
              name: filename.split('/').pop() || filename,
              extension: filename.split('.').pop() || '',
              content: `[INGESTED BINARY IN ZIP: ${filename}]`,
              size: 0
            });
          } else {
            const content = await zip.files[filename].async('string');
            files.push({
              path: filename,
              name: filename.split('/').pop() || filename,
              extension: filename.split('.').pop() || '',
              content,
              size: content.length
            });
          }
        }
      } catch (e) {
        console.error("Error unzipping", e);
      }
    }
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
};

const detectPlatform = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['apk', 'aab'].includes(ext!)) return 'Android';
  if (['ipa'].includes(ext!)) return 'iOS';
  if (['exe', 'msi'].includes(ext!)) return 'Windows Desktop';
  if (['dmg', 'pkg'].includes(ext!)) return 'macOS Desktop';
  if (['deb', 'rpm'].includes(ext!)) return 'Linux';
  if (['sol'].includes(ext!)) return 'Blockchain/Web3';
  if (['jar', 'war', 'whl'].includes(ext!)) return 'Backend Package';
  return 'General Asset';
};

const shouldIgnore = (path: string): boolean => {
  const parts = path.split('/');
  if (parts.some(part => IGNORED_FOLDERS.includes(part))) return true;
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
    if (!f.content.startsWith('[INGESTED BINARY')) {
        stats.totalLines += f.content.split('\n').length;
    }
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