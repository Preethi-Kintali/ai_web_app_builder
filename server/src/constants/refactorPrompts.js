import { buildFilesContext } from './prompts.js';
import { PAIR_PROGRAMMER_SYSTEM_PROMPT } from './pairProgrammerPrompts.js';

export const buildRefactorQuestionPrompt = (userPrompt, currentFiles) => {
  const filesContext = buildFilesContext(currentFiles);

  return `${PAIR_PROGRAMMER_SYSTEM_PROMPT}

The user wants to perform a deep refactor: "${userPrompt}"

CURRENT PROJECT FILES:
${filesContext}

Your task is to ask 1-2 clarifying questions about the target architecture.
For example, if converting to React:
- Ask about component structure (hooks, state management).
- Provide 2-3 specific architectural options as clickable choices.

RESPONSE FORMAT (Strict JSON):
{
  "message": "I'll help you refactor this project. Before we begin the conversion, let's decide on the internal structure.",
  "questions": ["How would you like to organize the components?"],
  "options": [
    { "label": "Functional Components (Hooks)", "description": "Modern React with useState/useEffect. Clean and maintainable." },
    { "label": "Styled Components", "description": "CSS-in-JS for better scoped styling." },
    { "label": "Single-File React", "description": "All components in script.js for simplicity (using CDN)." }
  ]
}`;
};

export const buildDeepRefactorPrompt = (userPrompt, answers, currentFiles) => {
  const filesContext = buildFilesContext(currentFiles);
  const answersContext = answers ? `\nUSER PREFERENCES FOR REFACTOR:\n${JSON.stringify(answers, null, 2)}` : '';

  return `${PAIR_PROGRAMMER_SYSTEM_PROMPT}

Transform the project according to the refactor request and user preferences.
REFACTOR REQUEST: "${userPrompt}"${answersContext}

CURRENT PROJECT FILES:
${filesContext}

RULES:
1. Maintain all existing business logic and features.
2. Completely rewrite the UI/Architecture as requested (e.g., from Vanilla JS to React functional components).
3. Use a Browser-compatible React CDN in index.html if converting to React.
4. List every specific structural change in the CHANGES_MADE section.

RESPONSE FORMAT:
CHANGES_MADE:
- [Change 1]
- [Change 2]

\`\`\`html:index.html
...
\`\`\`
...`;
};
