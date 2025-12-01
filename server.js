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
// server.js
// Honest News Cloud CMS backend for Render
// Receives JSON from dashboard and commits it to GitHub (site-data.json)

const http = require("http");
const { Buffer } = require("buffer");
const url = require("url");

const PORT = process.env.PORT || 3000;

// ---- GitHub config (from environment, with sane defaults) ----
const GITHUB_OWNER  = process.env.GITHUB_OWNER  || "rrsales";
const GITHUB_REPO   = process.env.GITHUB_REPO   || "Honest-News";
const DATA_FILE_PATH = process.env.DATA_FILE_PATH || "site-data.json";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_TOKEN  = process.env.GITHUB_TOKEN; // MUST be set in Render

if (!GITHUB_TOKEN) {
  console.warn("⚠️ GITHUB_TOKEN is not set. GitHub commits will fail.");
}

// ---- Helpers ----
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "https://rrsales.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function saveToGitHub(jsonString) {
  const apiBase = "https://api.github.com";
  const fileUrl = `${apiBase}/repos/${encodeURIComponent(
    GITHUB_OWNER
  )}/${encodeURIComponent(GITHUB_REPO)}/contents/${encodeURIComponent(
    DATA_FILE_PATH
  )}`;

  const headers = {
    "Authorization": `Bearer ${GITHUB_TOKEN}`,
    "User-Agent": "HonestNews-CMS",
    "Accept": "application/vnd.github+json"
  };

  // 1) Try to get existing file to obtain SHA
  let sha = undefined;
  const currentRes = await fetch(fileUrl, { headers });

  if (currentRes.status === 200) {
    const currentJson = await currentRes.json();
    sha = currentJson.sha;
  } else if (currentRes.status === 404) {
    // no existing file, we'll create it
    sha = undefined;
  } else {
    const text = await currentRes.text();
    throw new Error(
      `GitHub GET failed (${currentRes.status}): ${text}`
    );
  }

  // 2) Prepare content & PUT
  const base64Content = Buffer.from(jsonString, "utf8").toString("base64");
  
  const body = {
    message: "Update site-data.json via Honest News CMS",
    content: base64Content,
    branch: GITHUB_BRANCH
  };

  if (sha) body.sha = sha; // required when updating existing file

  const putRes = await fetch(fileUrl, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    throw new Error(
      `GitHub PUT failed (${putRes.status}): ${text}`
    );
  }

  return await putRes.json();
}

// ---- HTTP SERVER ----
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  // CORS preflight
  if (req.method === "OPTIONS") {
    setCors(res);
    res.writeHead(204);
    return res.end();
  }

  // Health check
  if (req.method === "GET" && parsed.pathname === "/health") {
    setCors(res);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, status: "healthy" }));
  }

  // Save route
  if (req.method === "POST" && parsed.pathname === "/save") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      setCors(res);

      try {
        // Ensure body is valid JSON and pretty-print it
        let parsedJson;
        try {
          parsedJson = JSON.parse(body);
        } catch (e) {
          console.error("Invalid JSON from client:", e);
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({ ok: false, error: "Invalid JSON payload" })
          );
        }

        const pretty = JSON.stringify(parsedJson, null, 2);
        const ghResult = await saveToGitHub(pretty);

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ ok: true, github: ghResult.content?.path || DATA_FILE_PATH })
        );
      } catch (err) {
        console.error("Save error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ ok: false, error: "Server error saving to GitHub" })
        );
      }
    });

    return;
  }

  // Fallback 404
  setCors(res);
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: false, error: "Not found" }));
});

server.listen(PORT, () => {
  console.log("=======================================");
  console.log("Honest News Cloud CMS Server Running");
  console.log("Port:", PORT);
  console.log("GitHub owner:", GITHUB_OWNER);
  console.log("GitHub repo:", GITHUB_REPO);
  console.log("Branch:", GITHUB_BRANCH);
  console.log("File:", DATA_FILE_PATH);
  console.log("=======================================");
});
// --- KEEP ALIVE PING ENDPOINT ---
app.get("/ping", (req, res) => {
  res.json({ ok: true, time: Date.now() });
});
