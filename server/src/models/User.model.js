import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Feature 7: Prompt Memory & Personalization
    preferences: {
      theme: { type: String, enum: ['dark', 'light', 'auto'], default: 'dark' },
      framework: { type: String, enum: ['vanilla', 'react', 'vue'], default: 'vanilla' },
      codeStyle: { type: String, enum: ['minimal', 'verbose', 'commented'], default: 'commented' },
      preferredLibraries: { type: [String], default: [] },
      colorScheme: { type: String, default: '' }, // e.g. 'blue', 'purple', 'green'
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
