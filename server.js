const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database setup
const db = new sqlite3.Database('site.db');

// Initialize database
db.serialize(() => {
    // Q&A table
    db.run(`CREATE TABLE IF NOT EXISTS qa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT,
        timestamp INTEGER DEFAULT (strftime('%s', 'now'))
    )`);
    
    // Analytics table
    db.run(`CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL,
        visits INTEGER DEFAULT 1,
        last_visit INTEGER DEFAULT (strftime('%s', 'now'))
    )`);
    
    // GitHub cache table
    db.run(`CREATE TABLE IF NOT EXISTS github_cache (
        id INTEGER PRIMARY KEY,
        data TEXT NOT NULL,
        updated INTEGER DEFAULT (strftime('%s', 'now'))
    )`);
});

// GitHub API integration
const GITHUB_USERNAME = 'wenlixxq1';
const GITHUB_API = `https://api.github.com/users/${GITHUB_USERNAME}`;

async function fetchGitHubData() {
    try {
        const [userResponse, reposResponse] = await Promise.all([
            axios.get(GITHUB_API),
            axios.get(`${GITHUB_API}/repos`)
        ]);
        
        const userData = userResponse.data;
        const reposData = reposResponse.data;
        
        const githubStats = {
            public_repos: userData.public_repos,
            followers: userData.followers,
            following: userData.following,
            total_stars: reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0),
            languages: [...new Set(reposData.map(repo => repo.language).filter(Boolean))].length,
            updated: Date.now()
        };
        
        // Cache in database
        db.run('INSERT OR REPLACE INTO github_cache (id, data, updated) VALUES (1, ?, ?)', 
            [JSON.stringify(githubStats), Math.floor(Date.now() / 1000)]);
        
        return githubStats;
    } catch (error) {
        console.error('GitHub API error:', error.message);
        return null;
    }
}

// Routes

// Get GitHub stats
app.get('/api/github', async (req, res) => {
    // Check cache first
    db.get('SELECT data, updated FROM github_cache WHERE id = 1', async (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        const now = Math.floor(Date.now() / 1000);
        const cacheAge = 3600; // 1 hour
        
        if (row && (now - row.updated) < cacheAge) {
            return res.json(JSON.parse(row.data));
        }
        
        // Fetch fresh data
        const githubData = await fetchGitHubData();
        if (githubData) {
            res.json(githubData);
        } else {
            // Return cached data if available
            if (row) {
                res.json(JSON.parse(row.data));
            } else {
                res.status(500).json({ error: 'Unable to fetch GitHub data' });
            }
        }
    });
});

// Q&A endpoints
app.get('/api/qa', (req, res) => {
    db.all('SELECT * FROM qa ORDER BY timestamp DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

app.post('/api/qa', (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Question is required' });
    }
    
    db.run('INSERT INTO qa (question) VALUES (?)', [question], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: this.lastID, question, answer: null, timestamp: Date.now() });
    });
});

app.put('/api/qa/:id', (req, res) => {
    const { id } = req.params;
    const { answer } = req.body;
    
    db.run('UPDATE qa SET answer = ? WHERE id = ?', [answer, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

app.delete('/api/qa/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM qa WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Analytics endpoints
app.post('/api/analytics', (req, res) => {
    const { section } = req.body;
    if (!section) {
        return res.status(400).json({ error: 'Section is required' });
    }
    
    db.get('SELECT * FROM analytics WHERE section = ?', [section], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (row) {
            db.run('UPDATE analytics SET visits = visits + 1, last_visit = ? WHERE section = ?', 
                [Math.floor(Date.now() / 1000), section]);
        } else {
            db.run('INSERT INTO analytics (section) VALUES (?)', [section]);
        }
        
        res.json({ success: true });
    });
});

app.get('/api/analytics', (req, res) => {
    db.all('SELECT section, visits, last_visit FROM analytics ORDER BY visits DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Initial GitHub data fetch
    fetchGitHubData();
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});