// server.js  (save this as server.js in your project root)

const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));           // to receive JSON from the dashboard
app.use(express.static('public'));                  // your dashboard files go in /public folder

// Your GitHub token comes from Render environment variable (set it in Render dashboard)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('ERROR: Set GITHUB_TOKEN in Render environment variables!');
}

// Simple password protection (set your own password in Render env too)
const ADMIN_PASS = process.env.ADMIN_PASS || 'change-me-right-now';

// --------------------------
// Route: Save data + git push
// --------------------------
app.post('/api/save', (req, res) => {
  // Very light auth
  if (req.headers['x-admin-pass'] !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  const { filename = 'data.json', content } = req.body;

  try {
    // 1. Write the file
    const filePath = path.join(__dirname, 'public', filename);
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));

    // 2. Git commit & push
    execSync('git pull --rebase', { stdio: 'ignore' });
    execSync('git add .', { stdio: 'ignore' });
    execSync(`git commit -m "Dashboard update ${new Date().toISOString()}"`, { stdio: 'ignore' });

    // Use the token for push (Render already has git remote set)
    execSync(`git push https://x-access-token:${GITHUB_TOKEN}@github.com/YOURUSERNAME/YOURREPO.git HEAD:main`, 
             { stdio: 'ignore' });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server (Render uses process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dashboard running on port ${PORT}`);
});
