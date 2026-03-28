import { askGemini } from './gemini.service.js';
import { getProjectById } from './project.service.js';
import { buildMultiFileGenerationPrompt, buildApiIntegrationAddendum } from '../constants/prompts.js';
import { parseMultiFileResponse, bundleFilesToHtml, mapToObject } from '../utils/code.utils.js';
import User from '../models/User.model.js';

// ──────────────────────────────────────────────
// API Intent Detection — Feature 3
// ──────────────────────────────────────────────
const API_INTENT_PATTERNS = {
  weather: /\b(weather|forecast|temperature|climate|openweather)\b/i,
  news: /\b(news|articles|headlines|newsapi|rss)\b/i,
  crypto: /\b(crypto|cryptocurrency|bitcoin|ethereum|coin|price|coingecko)\b/i,
  quotes: /\b(quote[s]?|motivation|inspire|quotable)\b/i,
  github: /\b(github|repositories|repos|git hub)\b/i,
  generic: /\b(api|fetch|endpoint|rest api|http|axios|data from|external data)\b/i,
};

export const detectApiIntent = (prompt) => {
  for (const [type, pattern] of Object.entries(API_INTENT_PATTERNS)) {
    if (type !== 'generic' && pattern.test(prompt)) return type;
  }
  // generic check only if specific ones didn't match
  if (API_INTENT_PATTERNS.generic.test(prompt)) return 'generic';
  return null;
};

// ──────────────────────────────────────────────
// Main Code Generation — Feature 1 + 3 + 7
// ──────────────────────────────────────────────
export const generateCode = async (projectId, userId, userPrompt) => {
  const project = await getProjectById(projectId, userId);

  // Fetch user preferences for personalization (Feature 7)
  let preferences = {};
  try {
    const user = await User.findById(userId).select('preferences');
    if (user?.preferences) preferences = user.preferences.toObject?.() ?? user.preferences;
  } catch (_) { /* non-critical, continue without preferences */ }

  // Detect API intent and inject addendum (Feature 3)
  const apiType = detectApiIntent(userPrompt);
  let enrichedPrompt = userPrompt;
  if (apiType) {
    const addendum = buildApiIntegrationAddendum(apiType);
    enrichedPrompt = userPrompt + '\n\n' + addendum;
  }

  // Get current files as plain object
  const currentFiles = mapToObject(project.files);

  // Build prompt (multi-file)
  const fullPrompt = buildMultiFileGenerationPrompt(
    project.messages,
    currentFiles,
    enrichedPrompt,
    preferences
  );

  const aiResponse = await askGemini(fullPrompt);
  const { files, description } = parseMultiFileResponse(aiResponse);

  // Archive current version before overwriting (Feature 10)
  if (project.generatedCode || Object.keys(currentFiles).length > 0) {
    const changeDesc = userPrompt.length > 80
      ? userPrompt.substring(0, 80) + '...'
      : userPrompt;
    project.versions.push({
      code: project.generatedCode || '',
      files: currentFiles,
      changeDescription: changeDesc,
      promptSnapshot: userPrompt,
    });
  }

  // Save messages
  project.messages.push({ role: 'user', content: userPrompt });
  const aiMessage = description || 'Here is your generated app!';
  project.messages.push({ role: 'assistant', content: aiMessage });

  // Save multi-file output (as Object, let Mongoose handle Mixed storage)
  if (files && Object.keys(files).length > 0) {
    project.files = files;
    // Also bundle to generatedCode for iframe + public view compatibility
    project.generatedCode = bundleFilesToHtml(files);
  }

  // Auto-title from first prompt
  if (project.title === 'Untitled Project' && project.messages.length <= 2) {
    project.title = userPrompt.length > 50
      ? userPrompt.substring(0, 50) + '...'
      : userPrompt;
  }

  await project.save();

  return {
    message: aiMessage,
    code: project.generatedCode,
    files: mapToObject(project.files),
    title: project.title,
    messages: project.messages,
    versions: project.versions,
    apiIntegrated: !!apiType,
    apiType,
  };
};
