import { askGemini } from './gemini.service.js';
import { getProjectById } from './project.service.js';
import { buildEnhancedFixPrompt } from '../constants/prompts.js';
import { parseFixResponse, bundleFilesToHtml, mapToObject } from '../utils/code.utils.js';

export const fixCode = async (projectId, userId) => {
  const project = await getProjectById(projectId, userId);

  const files = mapToObject(project.files);
  const hasMultiFile = files && Object.keys(files).length > 0;

  if (!hasMultiFile && !project.generatedCode) {
    const err = new Error('No code to fix. Generate an app first.');
    err.statusCode = 400;
    throw err;
  }

  // Use multi-file or fall back to single file
  let filesForFix = files;
  if (!hasMultiFile && project.generatedCode) {
    filesForFix = { 'index.html': project.generatedCode };
  }

  const aiResponse = await askGemini(buildEnhancedFixPrompt(filesForFix));
  const { errors, fixedFiles } = parseFixResponse(aiResponse);

  // Archive current code before fixing
  project.versions.push({
    code: project.generatedCode || '',
    files: hasMultiFile ? Object.fromEntries(project.files) : {},
    changeDescription: 'Auto-fixed by AI',
    promptSnapshot: 'fix:auto',
  });

  const errorCount = errors.length;
  const criticalCount = errors.filter(e => e.severity === 'critical').length;
  const aiMessage = errorCount === 0
    ? '✅ No errors found — your code looks clean!'
    : `🔧 Found and fixed ${errorCount} issue${errorCount !== 1 ? 's' : ''} (${criticalCount} critical).`;

  project.messages.push({ role: 'user', content: '🔧 Fix any errors in my code' });
  project.messages.push({ role: 'assistant', content: aiMessage });

  if (fixedFiles && Object.keys(fixedFiles).length > 0) {
    project.files = new Map(Object.entries(fixedFiles));
    project.generatedCode = bundleFilesToHtml(fixedFiles);
  }

  await project.save();

  return {
    message: aiMessage,
    code: project.generatedCode,
    files: mapToObject(project.files),
    errors,
    messages: project.messages,
    versions: project.versions,
  };
};
