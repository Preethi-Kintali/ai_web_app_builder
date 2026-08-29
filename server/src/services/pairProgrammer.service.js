import { askGemini } from './gemini.service.js';
import { getProjectById } from './project.service.js';
import { 
  buildClarifyPrompt, 
  buildSurgicalEditPrompt, 
  buildAnalyzePrompt,
  buildSystemDesignPrompt,
  buildAuthInjectionPrompt,
  buildApiOptionsPrompt
} from '../constants/pairProgrammerPrompts.js';
import { 
  buildRefactorQuestionPrompt, 
  buildDeepRefactorPrompt 
} from '../constants/refactorPrompts.js';
import { buildApiIntegrationAddendum } from '../constants/prompts.js';
import { generateCode } from './generation.service.js';
import { parseMultiFileResponse, mapToObject, bundleFilesToHtml } from '../utils/code.utils.js';
import User from '../models/User.model.js';

// ──────────────────────────────────────────────
// Intent Classification Heuristics
// ──────────────────────────────────────────────
export const classifyIntent = (prompt, hasExistingCode, phase) => {
  const p = prompt.toLowerCase();

  // If we're already questioning, user is probably providing an answer
  if (phase === 'questioning') return 'implement';

  // HEURISTIC: Deep Refactor (Feature 6)
  if (/\b(convert|refactor|migration|responsive|tailwind|bootstrap|typescript|react)\b/i.test(p)) {
    return 'refactor';
  }

  // HEURISTIC: System Design (Feature 5) - Large scale requests
  if (/\b(system architecture|technical roadmap|saas architecture|app from scratch|social media platform|database schema)\b/i.test(p)) {
    // If it's a huge request and we don't have code yet, it's design
    if (!hasExistingCode || p.length > 100) return 'design';
  }

  // HEURISTIC: Feature Injection (Feature 3) - Specific modules
  if (/\b(auth|login|signup|registration|database|email|stripe|payment|cart)\b/i.test(p)) {
    return 'injection';
  }

  // HEURISTIC: API Integration (Feature 2)
  if (/\b(api|fetch|data from|weather|news|crypto|stock|external)\b/i.test(p)) {
    return 'api';
  }

  // Specific "analyze" keywords (Feature 1)
  if (/\b(analyze|review|audit|is this good|feedback on|performance check|accessibility check)\b/i.test(p)) return 'analyze';

  // Vague "improve" requests that need clarification
  if (hasExistingCode && /\b(improve|better|fix UI|change look|make it look better|optimize)\b/i.test(p)) {
    if (p.length < 50) return 'clarify';
  }

  // Fallback to direct generation
  return 'generate';
};

// ──────────────────────────────────────────────
// Main Pair Programmer Session Handler
// ──────────────────────────────────────────────
export const handlePairSession = async (projectId, userId, userPrompt, options = {}) => {
  const { conversationPhase } = options;
  const project = await getProjectById(projectId, userId);
  const currentFiles = mapToObject(project.files);
  const hasExistingCode = Object.keys(currentFiles).length > 0;

  const intent = classifyIntent(userPrompt, hasExistingCode, conversationPhase);
  console.log('--- PAIR PROGRAMMER SESSION ---');
  console.log(`User Prompt: "${userPrompt}"`);
  console.log(`Detected Intent: [${intent}]`);
  console.log(`Conversation Phase: [${conversationPhase}]`);

  // 1. DIRECT GENERATION
  if (intent === 'generate') {
    const result = await generateCode(projectId, userId, userPrompt);
    return { ...result, mode: 'code' };
  }

  // 2. SYSTEM DESIGN (Feature 5)
  if (intent === 'design') {
    const prompt = buildSystemDesignPrompt(userPrompt);
    const aiResponse = await askGemini(prompt);
    
    project.messages.push({ role: 'user', content: userPrompt });
    project.messages.push({ role: 'assistant', content: aiResponse });
    await project.save();

    return {
      mode: 'analysis',
      report: aiResponse,
      messages: project.messages
    };
  }

  // 3. DEEP REFACTOR (Feature 6)
  if (intent === 'refactor') {
    const prompt = conversationPhase === 'questioning' 
      ? buildDeepRefactorPrompt(userPrompt, options.answers, currentFiles)
      : buildRefactorQuestionPrompt(userPrompt, currentFiles);
      
    const aiResponse = await askGemini(prompt);
    console.log('[Refactor] AI Response:', aiResponse);

    if (conversationPhase !== 'questioning') {
      // Step 1: Clarification
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const jsonResult = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);
        
        project.messages.push({ role: 'user', content: userPrompt });
        project.messages.push({ role: 'assistant', content: jsonResult.message });
        await project.save();

        return {
          mode: 'question',
          message: jsonResult.message,
          questions: jsonResult.questions || [],
          options: jsonResult.options || [],
          messages: project.messages
        };
      } catch (err) {
        console.error('[Refactor] Parse error:', err.message);
        // Fallback to direct refactor if JSON fails
      }
    }
    
    // Step 2: Implementation (or fallback)
    const { files, description, changes } = parseMultiFileResponse(aiResponse);

    // Archive current
    if (hasExistingCode) {
      project.versions.push({
        code: project.generatedCode || '',
        files: currentFiles,
        changeDescription: `Refactor: ${userPrompt.substring(0, 50)}...`,
        promptSnapshot: userPrompt,
      });
    }

    project.messages.push({ role: 'user', content: userPrompt });
    project.messages.push({ role: 'assistant', content: description || 'Refactoring complete.' });

    if (files && Object.keys(files).length > 0) {
      project.files = files;
      project.generatedCode = bundleFilesToHtml(files);
    }
    
    await project.save();

    return {
      mode: 'code',
      message: description || 'Refactoring complete.',
      code: project.generatedCode,
      files: mapToObject(project.files),
      changes: changes || [],
      messages: project.messages,
      versions: project.versions,
    };
  }

  // 4. API INTEGRATION (Feature 2)
  if (intent === 'api') {
    const prompt = buildApiOptionsPrompt(userPrompt);
    const aiResponse = await askGemini(prompt);
    console.log('[API] AI Response:', aiResponse);
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonResult = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);
      
      project.messages.push({ role: 'user', content: userPrompt });
      project.messages.push({ role: 'assistant', content: jsonResult.message });
      await project.save();

      return {
        mode: 'question',
        message: jsonResult.message,
        questions: jsonResult.questions || [],
        options: jsonResult.options || [],
        messages: project.messages
      };
    } catch (err) {
      console.error('[API] Parse error:', err.message);
      const result = await generateCode(projectId, userId, userPrompt);
      return { ...result, mode: 'code' };
    }
  }

  // 5. FEATURE INJECTION (Feature 3)
  if (intent === 'injection') {
    const prompt = buildAuthInjectionPrompt(userPrompt, currentFiles);
    const aiResponse = await askGemini(prompt);
    console.log('[Injection] AI Response:', aiResponse);
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonResult = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);
      
      project.messages.push({ role: 'user', content: userPrompt });
      project.messages.push({ role: 'assistant', content: jsonResult.message });
      await project.save();

      return {
        mode: 'question',
        message: jsonResult.message,
        questions: jsonResult.questions || [],
        options: jsonResult.options || [],
        messages: project.messages
      };
    } catch (err) {
      console.error('[Injection] Parse error:', err.message);
      const result = await generateCode(projectId, userId, userPrompt);
      return { ...result, mode: 'code' };
    }
  }

  // 6. CLARIFICATION
  if (intent === 'clarify') {
    const prompt = buildClarifyPrompt(userPrompt, currentFiles);
    const aiResponse = await askGemini(prompt);
    console.log('[Clarify] AI Response:', aiResponse);
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonResult = JSON.parse(jsonMatch ? jsonMatch[0] : aiResponse);
      
      project.messages.push({ role: 'user', content: userPrompt });
      project.messages.push({ role: 'assistant', content: jsonResult.message });
      await project.save();

      return {
        mode: 'question',
        message: jsonResult.message,
        questions: jsonResult.questions || [],
        options: jsonResult.options || [],
        messages: project.messages
      };
    } catch (err) {
      console.error('[Clarify] Parse error:', err.message);
      const result = await generateCode(projectId, userId, userPrompt);
      return { ...result, mode: 'code' };
    }
  }

  // 7. SURGICAL IMPLEMENTATION
  if (intent === 'implement') {
    let preferences = {};
    try {
      const user = await User.findById(userId).select('preferences');
      if (user?.preferences) preferences = user.preferences.toObject?.() ?? user.preferences;
    } catch (_) {}

    // Special logic: If the user chose an API option, enrich the prompt
    let enrichedPrompt = userPrompt;
    if (options.answers?.selectedOption?.label) {
      const opt = options.answers.selectedOption;
      if (['Weather API', 'News API', 'Crypto Prices', 'Generic REST'].includes(opt.label)) {
        const typeMap = { 'Weather API': 'weather', 'News API': 'news', 'Crypto Prices': 'crypto', 'Generic REST': 'generic' };
        const addendum = buildApiIntegrationAddendum(typeMap[opt.label] || 'generic');
        enrichedPrompt = `${userPrompt}\n\n${addendum}`;
      }
    }

    const prompt = buildSurgicalEditPrompt(enrichedPrompt, options.answers, currentFiles, preferences);
    const aiResponse = await askGemini(prompt);
    
    // Parse response (Summary + code blocks)
    const { files, description, changes } = parseMultiFileResponse(aiResponse);

    // Archive current version
    if (hasExistingCode) {
      project.versions.push({
        code: project.generatedCode || '',
        files: currentFiles,
        changeDescription: `Pair Mode: ${userPrompt.substring(0, 50)}...`,
        promptSnapshot: userPrompt,
      });
    }

    // Update project
    project.messages.push({ role: 'user', content: userPrompt });
    project.messages.push({ role: 'assistant', content: description || 'Changes implemented.' });

    if (files && Object.keys(files).length > 0) {
      project.files = files;
      project.generatedCode = bundleFilesToHtml(files);
    }
    
    await project.save();

    return {
      mode: 'code',
      message: description || 'Changes implemented.',
      code: project.generatedCode,
      files: mapToObject(project.files),
      changes: changes || [],
      messages: project.messages,
      versions: project.versions,
    };
  }

  // 7. ARCHITECTURAL ANALYSIS
  if (intent === 'analyze') {
    const prompt = buildAnalyzePrompt(currentFiles);
    const aiResponse = await askGemini(prompt);
    
    project.messages.push({ role: 'user', content: userPrompt });
    project.messages.push({ role: 'assistant', content: aiResponse });
    await project.save();

    return {
      mode: 'analysis',
      report: aiResponse,
      messages: project.messages
    };
  }

  return { mode: 'error', message: 'Unknown intent detected' };
};
