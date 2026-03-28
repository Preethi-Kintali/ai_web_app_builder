import { getProjectById } from './project.service.js';
import { bundleFilesToHtml, mapToObject } from '../utils/code.utils.js';

// ─────────────────────────────────────────────────────
// Mock Netlify deployment (used when no NETLIFY_TOKEN)
// ─────────────────────────────────────────────────────
const mockDeploy = async (projectId, title) => {
  // Simulate async deploy delay
  await new Promise(r => setTimeout(r, 1200));
  const slug = (title || 'app').toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 24);
  return {
    url: `https://${slug}-${projectId.slice(-6)}.netlify.app`,
    status: 'live',
  };
};

// ─────────────────────────────────────────────────────
// Real Netlify deploy via Files API
// ─────────────────────────────────────────────────────
const netlifyDeploy = async (files, title) => {
  const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;

  // Create a new site
  const siteRes = await fetch('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NETLIFY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: (title || 'prompt2page').toLowerCase().replace(/[^a-z0-9]/g, '-') }),
  });

  if (!siteRes.ok) {
    throw new Error(`Netlify site creation failed: ${siteRes.statusText}`);
  }

  const site = await siteRes.json();

  // Calculate SHA1 hashes for files (Netlify Files API requirement)
  const { createHash } = await import('crypto');
  const fileDigests = {};
  const fileContents = {};

  const entries = files instanceof Map
    ? Object.fromEntries(files)
    : files;

  for (const [filename, content] of Object.entries(entries)) {
    const hash = createHash('sha1').update(content, 'utf8').digest('hex');
    fileDigests[`/${filename}`] = hash;
    fileContents[`/${filename}`] = content;
  }

  // Initiate deploy
  const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NETLIFY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ files: fileDigests }),
  });

  if (!deployRes.ok) {
    throw new Error(`Netlify deploy failed: ${deployRes.statusText}`);
  }

  const deploy = await deployRes.json();

  // Upload required files
  for (const [path, content] of Object.entries(fileContents)) {
    if (deploy.required.includes(fileDigests[path])) {
      await fetch(`https://api.netlify.com/api/v1/deploys/${deploy.id}/files${path}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${NETLIFY_TOKEN}`,
          'Content-Type': 'application/octet-stream',
        },
        body: content,
      });
    }
  }

  return {
    url: `https://${site.name}.netlify.app`,
    status: 'live',
  };
};

// ─────────────────────────────────────────────────────
// Main deploy function
// ─────────────────────────────────────────────────────
export const deployProject = async (projectId, userId) => {
  const project = await getProjectById(projectId, userId);

  const files = mapToObject(project.files);
  const hasMultiFile = files && Object.keys(files).length > 0;

  if (!hasMultiFile && !project.generatedCode) {
    const err = new Error('No code to deploy. Generate an app first.');
    err.statusCode = 400;
    throw err;
  }

  // Ensure we have multi-file structure
  let deployFiles = files;
  if (!hasMultiFile) {
    // Bundle single HTML file into multi-file for deployment
    deployFiles = { 'index.html': project.generatedCode };
  }

  // Set status to pending
  project.deployStatus = 'pending';
  await project.save();

  try {
    const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
    const result = NETLIFY_TOKEN
      ? await netlifyDeploy(deployFiles, project.title)
      : await mockDeploy(projectId, project.title);

    project.deployUrl = result.url;
    project.deployStatus = 'live';
    project.deployedAt = new Date();
    await project.save();

    return {
      url: result.url,
      status: 'live',
      deployedAt: project.deployedAt,
      isMock: !NETLIFY_TOKEN,
    };
  } catch (err) {
    project.deployStatus = 'failed';
    await project.save();
    throw err;
  }
};

export const getDeployStatus = async (projectId, userId) => {
  const project = await getProjectById(projectId, userId);
  return {
    status: project.deployStatus,
    url: project.deployUrl,
    deployedAt: project.deployedAt,
  };
};
