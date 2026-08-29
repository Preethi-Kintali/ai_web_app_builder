import * as pairProgrammerService from '../services/pairProgrammer.service.js';

/**
 * Main entry point for Pair Programmer mode
 * POST /api/pair
 */
export const handlePairRequest = async (req, res, next) => {
  const { projectId, prompt, conversationPhase, answers } = req.body;
  const userId = req.user.id;

  if (!projectId || !prompt) {
    return res.status(400).json({ message: 'Project ID and prompt are required' });
  }

  try {
    const result = await pairProgrammerService.handlePairSession(projectId, userId, prompt, {
      conversationPhase,
      answers
    });
    
    res.json(result);
  } catch (err) {
    next(err);
  }
};
