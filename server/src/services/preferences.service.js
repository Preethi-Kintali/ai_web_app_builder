import User from '../models/User.model.js';

export const getUserPreferences = async (userId) => {
  const user = await User.findById(userId).select('preferences');
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user.preferences || getDefaultPreferences();
};

export const updateUserPreferences = async (userId, updates) => {
  const allowedKeys = ['theme', 'framework', 'codeStyle', 'preferredLibraries', 'colorScheme'];
  const sanitized = {};
  for (const key of allowedKeys) {
    if (updates[key] !== undefined) sanitized[`preferences.${key}`] = updates[key];
  }

  if (Object.keys(sanitized).length === 0) {
    const err = new Error('No valid preference fields provided.');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: sanitized },
    { new: true, runValidators: true }
  ).select('preferences');

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return user.preferences;
};

export const getDefaultPreferences = () => ({
  theme: 'dark',
  framework: 'vanilla',
  codeStyle: 'commented',
  preferredLibraries: [],
  colorScheme: '',
});
