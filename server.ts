import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("pickleboom.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gender TEXT CHECK(gender IN ('Nam', 'Nữ')) NOT NULL,
    tier TEXT NOT NULL,
    base_rating REAL NOT NULL,
    current_rating REAL NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    t1p1_id INTEGER,
    t1p2_id INTEGER,
    t2p1_id INTEGER,
    t2p2_id INTEGER,
    t1_score INTEGER,
    t2_score INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(t1p1_id) REFERENCES members(id),
    FOREIGN KEY(t1p2_id) REFERENCES members(id),
    FOREIGN KEY(t2p1_id) REFERENCES members(id),
    FOREIGN KEY(t2p2_id) REFERENCES members(id)
  );
`);

// Migration: Add role column if it doesn't exist
try {
  db.prepare("ALTER TABLE members ADD COLUMN role TEXT DEFAULT 'user'").run();
} catch (e) {
  // Column already exists or other error
}

const app = express();
app.use(express.json());

// Middleware to check for admin/moderator roles
const checkAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const role = req.headers['x-user-role'];
  if (role === 'admin' || role === 'moderator') {
    next();
  } else {
    res.status(403).json({ error: "Permission denied. Admin or Moderator role required." });
  }
};

// API Routes
app.get("/api/members", (req, res) => {
  const members = db.prepare("SELECT * FROM members ORDER BY current_rating DESC").all();
  res.json(members);
});

app.get("/api/members/:id", (req, res) => {
  const member = db.prepare("SELECT * FROM members WHERE id = ?").get(req.params.id);
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(member);
});

app.get("/api/members/:id/adjustments", (req, res) => {
  const adjustments = db.prepare("SELECT * FROM adjustments WHERE member_id = ? ORDER BY created_at DESC").all(req.params.id);
  res.json(adjustments);
});

app.get("/api/members/:id/matches", (req, res) => {
  const matches = db.prepare(`
    SELECT m.*, 
      p1.name as t1p1_name, p2.name as t1p2_name, 
      p3.name as t2p1_name, p4.name as t2p2_name
    FROM matches m
    JOIN members p1 ON m.t1p1_id = p1.id
    JOIN members p2 ON m.t1p2_id = p2.id
    JOIN members p3 ON m.t2p1_id = p3.id
    JOIN members p4 ON m.t2p2_id = p4.id
    WHERE t1p1_id = ? OR t1p2_id = ? OR t2p1_id = ? OR t2p2_id = ?
    ORDER BY created_at DESC
  `).all(req.params.id, req.params.id, req.params.id, req.params.id);
  res.json(matches);
});

app.post("/api/matches", checkAuth, (req, res) => {
  const { t1p1_id, t1p2_id, t2p1_id, t2p2_id, t1_score, t2_score } = req.body;
  
  const transaction = db.transaction(() => {
    // Record the match
    db.prepare(
      "INSERT INTO matches (t1p1_id, t1p2_id, t2p1_id, t2p2_id, t1_score, t2_score) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(t1p1_id, t1p2_id, t2p1_id, t2p2_id, t1_score, t2_score);

    const winValue = 0.02;
    const loseValue = -0.02;

    const t1_won = t1_score > t2_score;
    const t1_adj = t1_won ? winValue : loseValue;
    const t2_adj = t1_won ? loseValue : winValue;

    const players = [
      { id: t1p1_id, adj: t1_adj, desc: t1_won ? "Thắng trận" : "Thua trận" },
      { id: t1p2_id, adj: t1_adj, desc: t1_won ? "Thắng trận" : "Thua trận" },
      { id: t2p1_id, adj: t2_adj, desc: t1_won ? "Thua trận" : "Thắng trận" },
      { id: t2p2_id, adj: t2_adj, desc: t1_won ? "Thua trận" : "Thắng trận" },
    ];

    for (const p of players) {
      // Update rating
      db.prepare("UPDATE members SET current_rating = current_rating + ? WHERE id = ?").run(p.adj, p.id);
      // Record adjustment
      db.prepare(
        "INSERT INTO adjustments (member_id, type, value, description) VALUES (?, ?, ?, ?)"
      ).run(p.id, 'match', p.adj, p.desc);
    }
  });

  transaction();
  res.json({ success: true });
});

app.post("/api/members", checkAuth, (req, res) => {
  const { name, gender, tier, base_rating } = req.body;
  const info = db.prepare(
    "INSERT INTO members (name, gender, tier, base_rating, current_rating) VALUES (?, ?, ?, ?, ?)"
  ).run(name, gender, tier, base_rating, base_rating);
  res.json({ id: info.lastInsertRowid });
});

app.put("/api/members/:id", checkAuth, (req, res) => {
  const { name, gender, tier, current_rating } = req.body;
  db.prepare(
    "UPDATE members SET name = ?, gender = ?, tier = ?, current_rating = ? WHERE id = ?"
  ).run(name, gender, tier, current_rating, req.params.id);
  res.json({ success: true });
});

app.delete("/api/members/:id", checkAuth, (req, res) => {
  db.prepare("DELETE FROM members WHERE id = ?").run(req.params.id);
  db.prepare("DELETE FROM adjustments WHERE member_id = ?").run(req.params.id);
  res.json({ success: true });
});

app.post("/api/adjust", checkAuth, (req, res) => {
  const { member_id, value, description } = req.body;
  const transaction = db.transaction(() => {
    db.prepare(
      "INSERT INTO adjustments (member_id, type, value, description) VALUES (?, ?, ?, ?)"
    ).run(member_id, 'manual', value, description);
    
    db.prepare(
      "UPDATE members SET current_rating = current_rating + ? WHERE id = ?"
    ).run(value, member_id);
  });
  transaction();
  res.json({ success: true });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PickleBoom Server running on http://localhost:${PORT}`);
  });
}

startServer();
