import { generateContent } from '../config/gemini.config.js';
import { getProjectById } from './project.service.js';
import { buildEnhancedExplainPrompt } from '../constants/prompts.js';
import { mapToObject } from '../utils/code.utils.js';

export const explainCode = async (projectId, userId) => {
  const project = await getProjectById(projectId, userId);

  // Prefer multi-file, fall back to single generatedCode
  const files = mapToObject(project.files);
  const hasMultiFile = files && Object.keys(files).length > 0;

  if (!hasMultiFile && !project.generatedCode) {
    const err = new Error('No code to explain yet. Generate an app first.');
    err.statusCode = 400;
    throw err;
  }

  // Build file context for the prompt
  let explainFiles = files;
  if (!hasMultiFile && project.generatedCode) {
    explainFiles = { 'index.html': project.generatedCode };
  }

  const prompt = buildEnhancedExplainPrompt(explainFiles);
  const response = await generateContent(prompt);
  if (!response) throw new Error('Gemini returned an empty response');
  return response;
};
