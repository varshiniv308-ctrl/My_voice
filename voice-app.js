/* My Voice — frontend logic (vanilla JS) */
(() => {
  "use strict";

  const API = "/api/notes";

  // ── DOM refs ──
  const $ = (id) => document.getElementById(id);
  const btnRecord = $("btn-record");
  const btnRecordLabel = $("btn-record-label");
  const btnClear = $("btn-clear");
  const btnSave = $("btn-save");
  const transcriptEl = $("transcript");
  const titleEl = $("title");
  const statusPill = $("status-pill");
  const statusText = $("status-text");
  const notesList = $("notes-list");
  const emptyState = $("empty-state");
  const noteCount = $("note-count");
  const searchEl = $("search");
  const toastEl = $("toast");

  // ── State ──
  let recognition = null;
  let isRecording = false;
  let interimText = "";
  let finalText = "";

  // ── Helpers ──
  const setStatus = (label, type = "idle") => {
    statusText.textContent = label;
    statusPill.dataset.status = type;
  };

  const setRecording = (on) => {
    isRecording = on;
    btnRecord.setAttribute("aria-pressed", String(on));
    btnRecordLabel.textContent = on ? "Stop recording" : "Start recording";
    document.body.classList.toggle("is-recording", on);
    setStatus(on ? "Recording" : "Idle", on ? "recording" : "idle");
  };

  const updateSaveEnabled = () => {
    btnSave.disabled = transcriptEl.value.trim().length === 0;
  };

  const showToast = (msg, type = "info") => {
    toastEl.textContent = msg;
    toastEl.dataset.type = type;
    toastEl.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => (toastEl.hidden = true), 2400);
  };

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch { return iso; }
  };

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  // ── Speech recognition setup ──
  const initRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      btnRecord.disabled = true;
      btnRecord.title = "Speech recognition not supported in this browser";
      showToast("Speech recognition not supported — you can still type.", "error");
      return null;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = navigator.language || "en-US";

    r.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalText += res[0].transcript + " ";
        else interim += res[0].transcript;
      }
      interimText = interim;
      transcriptEl.value = (finalText + interimText).trim();
      updateSaveEnabled();
    };

    r.onerror = (e) => {
      console.error("[v0] speech recognition error:", e.error);
      showToast(`Recognition error: ${e.error}`, "error");
      stopRecording();
    };

    r.onend = () => {
      // Auto-restart if user is still in recording mode (some browsers stop after silence)
      if (isRecording) {
        try { r.start(); } catch (_) { /* already started */ }
      }
    };

    return r;
  };

  const startRecording = async () => {
    if (!recognition) recognition = initRecognition();
    if (!recognition) return;
    try {
      finalText = transcriptEl.value ? transcriptEl.value + " " : "";
      interimText = "";
      recognition.start();
      setRecording(true);
    } catch (err) {
      console.error("[v0] could not start recognition:", err);
      showToast("Could not start microphone.", "error");
    }
  };

  const stopRecording = () => {
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
    }
    setRecording(false);
  };

  // ── API calls ──
  const fetchNotes = async (q = "") => {
    const url = q ? `${API}?q=${encodeURIComponent(q)}` : API;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load notes");
    return res.json();
  };

  const createNote = async (payload) => {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to save note");
    }
    return res.json();
  };

  const deleteNote = async (id) => {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete note");
  };

  // ── Render ──
  const renderNotes = (notes) => {
    noteCount.textContent = notes.length;
    notesList.innerHTML = "";
    if (notes.length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = searchEl.value
        ? "No notes match your search."
        : "No notes yet — record your first one above.";
      notesList.appendChild(li);
      return;
    }
    notes.forEach((n) => {
      const li = document.createElement("li");
      li.className = "note-item";
      li.innerHTML = `
        <div class="note-head">
          <span class="note-title">${escapeHtml(n.title || "Untitled")}</span>
          <span class="note-meta">${formatDate(n.createdAt)}</span>
        </div>
        <p class="note-body">${escapeHtml(n.text)}</p>
        <div class="note-actions">
          <button class="btn btn-danger-ghost" data-action="delete" data-id="${escapeHtml(n.id)}">
            Delete
          </button>
        </div>
      `;
      notesList.appendChild(li);
    });
  };

  const refreshList = async (q = "") => {
    try {
      const data = await fetchNotes(q);
      renderNotes(data.notes || []);
    } catch (err) {
      console.error("[v0] failed to fetch notes:", err);
      showToast("Could not load notes.", "error");
    }
  };

  // ── Event handlers ──
  btnRecord.addEventListener("click", () => {
    if (isRecording) stopRecording();
    else startRecording();
  });

  btnClear.addEventListener("click", () => {
    transcriptEl.value = "";
    titleEl.value = "";
    finalText = "";
    interimText = "";
    updateSaveEnabled();
  });

  btnSave.addEventListener("click", async () => {
    const text = transcriptEl.value.trim();
    if (!text) return;
    setStatus("Saving…", "saving");
    btnSave.disabled = true;
    try {
      await createNote({ title: titleEl.value.trim(), text });
      transcriptEl.value = "";
      titleEl.value = "";
      finalText = "";
      interimText = "";
      showToast("Note saved", "success");
      await refreshList(searchEl.value.trim());
    } catch (err) {
      console.error("[v0] save failed:", err);
      showToast(err.message || "Save failed", "error");
    } finally {
      setStatus(isRecording ? "Recording" : "Idle", isRecording ? "recording" : "idle");
      updateSaveEnabled();
    }
  });

  transcriptEl.addEventListener("input", updateSaveEnabled);

  notesList.addEventListener("click", async (e) => {
    const btn = e.target.closest('button[data-action="delete"]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (!confirm("Delete this note?")) return;
    try {
      await deleteNote(id);
      showToast("Note deleted", "success");
      await refreshList(searchEl.value.trim());
    } catch (err) {
      console.error("[v0] delete failed:", err);
      showToast("Could not delete note.", "error");
    }
  });

  // Debounced search
  let searchTimer = null;
  searchEl.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => refreshList(searchEl.value.trim()), 200);
  });

  // ── Init ──
  refreshList();
  updateSaveEnabled();
})();
