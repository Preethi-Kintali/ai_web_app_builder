import api from './api';

/**
 * Sends a message to the Pair Programmer API
 * @param {string} projectId - Current project ID
 * @param {string} prompt - User message/prompt
 * @param {string} conversationPhase - Current phase ('idle' | 'questioning')
 * @param {Object} answers - User answers to AI questions (if any)
 */
export const sendPairMessageAPI = async (projectId, prompt, conversationPhase = 'idle', answers = null) => {
  const response = await api.post('/pair', {
    projectId,
    prompt,
    conversationPhase,
    answers
  });
  return response.data;
};
