/**
 * My Voice — Backend
 * REST API for voice notes, with simple JSON file persistence.
 *
 *  GET    /api/notes?q=...    list/search notes
 *  POST   /api/notes          create note { title?, text }
 *  DELETE /api/notes/:id      delete note by id
 *  GET    /                   serves voice-app.html
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "voice-notes.json");

app.use(express.json({ limit: "256kb" }));

// Serve static frontend files from project root
app.use(express.static(__dirname, { index: false }));

// Default route → frontend
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "voice-app.html"));
});

// ── Persistence helpers ──
async function readNotes() {
  try {
    const buf = await fsp.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(buf);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === "ENOENT") return [];
    console.error("[voice-server] readNotes error:", err.message);
    return [];
  }
}

async function writeNotes(notes) {
  const tmp = DATA_FILE + ".tmp";
  await fsp.writeFile(tmp, JSON.stringify(notes, null, 2), "utf8");
  await fsp.rename(tmp, DATA_FILE);
}

// Initialize empty file if missing
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

// ── Validation ──
function validateNoteInput(body) {
  if (!body || typeof body !== "object") return "Invalid payload";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return "Note text is required";
  if (text.length > 5000) return "Note text exceeds 5000 characters";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : "";
  return { title, text };
}

// ── Routes ──

// List / search notes
app.get("/api/notes", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim().toLowerCase();
    const notes = await readNotes();
    let filtered = notes;
    if (q) {
      filtered = notes.filter(
        (n) =>
          (n.title || "").toLowerCase().includes(q) ||
          (n.text || "").toLowerCase().includes(q)
      );
    }
    // Newest first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ notes: filtered, total: filtered.length });
  } catch (err) {
    console.error("[voice-server] GET /api/notes:", err.message);
    res.status(500).json({ error: "Failed to load notes" });
  }
});

// Create note
app.post("/api/notes", async (req, res) => {
  const result = validateNoteInput(req.body);
  if (typeof result === "string") {
    return res.status(400).json({ error: result });
  }
  try {
    const notes = await readNotes();
    const note = {
      id: crypto.randomUUID(),
      title: result.title,
      text: result.text,
      createdAt: new Date().toISOString(),
    };
    notes.push(note);
    await writeNotes(notes);
    res.status(201).json(note);
  } catch (err) {
    console.error("[voice-server] POST /api/notes:", err.message);
    res.status(500).json({ error: "Failed to save note" });
  }
});

// Delete note
app.delete("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid id" });
  }
  try {
    const notes = await readNotes();
    const next = notes.filter((n) => n.id !== id);
    if (next.length === notes.length) {
      return res.status(404).json({ error: "Note not found" });
    }
    await writeNotes(next);
    res.json({ success: true });
  } catch (err) {
    console.error("[voice-server] DELETE /api/notes/:id:", err.message);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// 404 for unknown API routes
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`My Voice server running on http://localhost:${PORT}`);
});
