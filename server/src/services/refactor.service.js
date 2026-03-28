import { askGemini } from './gemini.service.js';
import { getProjectById } from './project.service.js';
import { buildRefactorPrompt } from '../constants/prompts.js';
import { parseMultiFileResponse, bundleFilesToHtml, mapToObject } from '../utils/code.utils.js';

export const REFACTOR_ACTIONS = [
  'optimize',
  'make-responsive',
  'convert-to-react',
  'improve-ui',
  'add-dark-mode',
  'improve-accessibility',
];

export const refactorCode = async (projectId, userId, action) => {
  if (!REFACTOR_ACTIONS.includes(action)) {
    const err = new Error(`Invalid refactor action. Valid actions: ${REFACTOR_ACTIONS.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const project = await getProjectById(projectId, userId);

  // Build files context — prefer multi-file, fall back to generatedCode
  let currentFiles = mapToObject(project.files);
  if (!currentFiles || Object.keys(currentFiles).length === 0) {
    if (project.generatedCode) {
      currentFiles = { 'index.html': project.generatedCode };
    } else {
      const err = new Error('No code to refactor. Generate an app first.');
      err.statusCode = 400;
      throw err;
    }
  }

  const prompt = buildRefactorPrompt(action, currentFiles);
  const aiResponse = await askGemini(prompt);
  const { files, description } = parseMultiFileResponse(aiResponse);

  // Archive current before overwriting
  project.versions.push({
    code: project.generatedCode || '',
    files: Object.fromEntries(project.files || new Map()),
    changeDescription: `Refactored: ${action.replace(/-/g, ' ')}`,
    promptSnapshot: `refactor:${action}`,
  });

  // Human-readable action labels
  const actionLabels = {
    optimize: '⚡ Optimize Code',
    'make-responsive': '📱 Make Responsive',
    'convert-to-react': '⚛️ Convert to React',
    'improve-ui': '🎨 Improve UI/UX',
    'add-dark-mode': '🌙 Add Dark Mode',
    'improve-accessibility': '♿ Improve Accessibility',
  };

  const aiMessage = description || `${actionLabels[action]} refactoring complete!`;
  project.messages.push({ role: 'user', content: `🔧 ${actionLabels[action]}` });
  project.messages.push({ role: 'assistant', content: aiMessage });

  if (files && Object.keys(files).length > 0) {
    project.files = new Map(Object.entries(files));
    project.generatedCode = bundleFilesToHtml(files);
  }

  await project.save();

  return {
    message: aiMessage,
    code: project.generatedCode,
    files: mapToObject(project.files),
    messages: project.messages,
    versions: project.versions,
    action,
  };
};
