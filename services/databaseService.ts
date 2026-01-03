
import { supabase } from './supabaseClient';
import { GeneratedOutputs, ProcessingStats } from '../types';

export const saveMonofileToCloud = async (
  projectName: string,
  stats: ProcessingStats,
  outputs: GeneratedOutputs
) => {
  const { data, error } = await supabase
    .from('monofiles')
    .insert([
      {
        project_name: projectName,
        total_files: stats.totalFiles,
        total_lines: stats.totalLines,
        total_size: stats.totalSize,
        flattened_content: outputs.flattened,
        summary: outputs.summary,
        ai_context: outputs.aiContext,
        concepts: JSON.stringify(outputs.concepts),
        created_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) {
    throw new Error(`Cloud Sync Failed: ${error.message}`);
  }

  return data;
};
