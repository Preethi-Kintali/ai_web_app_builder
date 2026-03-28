import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const versionSchema = new mongoose.Schema({
  // Legacy: single-file code string
  code: { type: String, default: '' },
  // New: multi-file map { 'index.html': '...', 'styles.css': '...', 'script.js': '...' }
  files: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({}),
  },
  changeDescription: { type: String, default: 'Code updated' },
  promptSnapshot: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Untitled Project',
    },
    messages: [messageSchema],

    // Legacy single-file (kept for backward compat & iframe bundling)
    generatedCode: {
      type: String,
      default: '',
    },

    // NEW: multi-file structure
    files: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },

    // Framework/mode metadata
    projectType: {
      type: String,
      enum: ['vanilla', 'react', 'vue'],
      default: 'vanilla',
    },

    versions: [versionSchema],

    isPublic: {
      type: Boolean,
      default: false,
    },

    // Deployment
    deployUrl: { type: String, default: null },
    deployedAt: { type: Date, default: null },
    deployStatus: {
      type: String,
      enum: [null, 'pending', 'live', 'failed'],
      default: null,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
