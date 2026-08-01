const { useState, useMemo, useEffect } = React;

const STORAGE_KEY = "oracle-entries";

// ---- Nature icons (simple line-art, no emoji) ----

function NatureIcon({ id, size = 20, color = "#C9A227" }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (id) {
    case "reset": // still water — horizontal wave lines
      return (
        <svg {...common}>
          <path d="M2 9c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
          <path d="M2 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
          <path d="M2 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
        </svg>
      );
    case "witness": // ripples — concentric circles
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="12" r="6" opacity="0.7" />
          <circle cx="12" cy="12" r="10" opacity="0.4" />
        </svg>
      );
    case "release": // falling leaves
      return (
        <svg {...common}>
          <path d="M12 3c4 1 6 5 4 9-2 3-6 3-8 0-1.5-2.5 0-6 4-9z" />
          <path d="M12 12v7" />
          <path d="M9 20l3-2 3 2" opacity="0.5" />
        </svg>
      );
    case "courage": // wildfire — flame
      return (
        <svg {...common}>
          <path d="M12 2c1 3-2 4-2 7a3 3 0 006 0c0-1.5-1-2-1-3.5 2 1.5 3 4 3 6.5a6 6 0 11-12 0c0-4 3-6 6-10z" />
        </svg>
      );
    case "connection": // roots
      return (
        <svg {...common}>
          <path d="M12 3v6" />
          <path d="M12 9c-2 1-3 3-3 6" />
          <path d="M12 9c2 1 3 3 3 6" />
          <path d="M9 15c-1.5 1-2 3-2 5" />
          <path d="M15 15c1.5 1 2 3 2 5" />
          <path d="M12 15v6" />
        </svg>
      );
    case "clarity": // low tide — wave with exposed dots
      return (
        <svg {...common}>
          <path d="M3 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
          <circle cx="6" cy="17" r="0.8" fill={color} stroke="none" />
          <circle cx="11" cy="19" r="0.8" fill={color} stroke="none" />
          <circle cx="16" cy="16.5" r="0.8" fill={color} stroke="none" />
          <circle cx="19" cy="18.5" r="0.8" fill={color} stroke="none" />
        </svg>
      );
    case "change": // metamorphosis — chrysalis / wings
      return (
        <svg {...common}>
          <path d="M12 4v16" />
          <path d="M12 8c-3-2-7-1-7 2s4 3 7 1" />
          <path d="M12 8c3-2 7-1 7 2s-4 3-7 1" />
          <path d="M12 15c-2-1.5-5-1-5 1.5s3 2.5 5 1" opacity="0.6" />
          <path d="M12 15c2-1.5 5-1 5 1.5s-3 2.5-5 1" opacity="0.6" />
        </svg>
      );
    case "threshold": // frost crystal
      return (
        <svg {...common}>
          <path d="M12 2v20" />
          <path d="M4 8l16 8" />
          <path d="M20 8L4 16" />
          <path d="M12 6l-2 2M12 6l2 2M12 18l-2-2M12 18l2-2" />
        </svg>
      );
    case "reckoning": // storm front — cloud
      return (
        <svg {...common}>
          <path d="M6 15a4 4 0 010-8 5 5 0 019.6-1.5A4.5 4.5 0 0118 15H6z" />
          <path d="M10 18l-1.5 3" />
          <path d="M14 18l-1.5 3" />
        </svg>
      );
    default:
      return null;
  }
}

// ---- Data ----

const CATEGORY_DEFS = [
  { id: "reset", label: "Reset", nature: "still water", blurb: "Return to self." },
  { id: "witness", label: "Witness", nature: "ripples", blurb: "Look into the mirror." },
  { id: "release", label: "Release", nature: "falling leaves", blurb: "Let go and grieve." },
  { id: "courage", label: "Courage", nature: "wildfire", blurb: "Hold space for growth." },
  { id: "connection", label: "Connection", nature: "roots", blurb: "Extend your hand." },
  { id: "clarity", label: "Clarity", nature: "low tide", blurb: "Seek the truth." },
  { id: "change", label: "Change", nature: "metamorphosis", blurb: "Sit with becoming." },
  { id: "threshold", label: "Threshold", nature: "first frost", blurb: "Catch yourself before you fall." },
  { id: "reckoning", label: "Reckoning", nature: "storm front", blurb: "Own your truth." },
];

const PROMPTS = {
  reset: [
    { main: "What's the first thing you notice has gone quiet in you — a person, a routine, a value — when you've drifted from yourself?", simple: "What do you stop doing, that you'd normally never skip, when you're not okay?" },
    { main: "Whose voice do you need to actually listen to right now, even if part of you doesn't want to?", simple: "Who or what have you been tuning out that you need to let back in?" },
    { main: "What does \u201cquiet\u201d actually require right now — less input, less movement, less noise, or something else?", simple: "What's one thing you could remove from today to make space?" },
    { main: "What told you, this time, that it was time to come back?", simple: "What was the moment you realized you needed to reset?" },
  ],
  witness: [
    { main: "What kept you here, even in the moments it would have been easier not to be?", simple: "What's one thing — a person, a habit, a reason — that held on when you couldn't?" },
    { main: "What does the person you are now know that the person at your lowest point didn't yet?", simple: "What's changed about how you see yourself since then?" },
    { main: "What did asking for help actually give you, that you couldn't have gotten alone?", simple: "Name one thing therapy or support gave you that you didn't expect." },
    { main: "If you could tell yourself back then one true thing, what would it be — not to fix it, just to say it?", simple: "What do you wish someone had told you then?" },
  ],
  release: [
    { main: "What's gone that you haven't said out loud yet?", simple: "Who or what are you actually grieving right now?" },
    { main: "When did you first know, even if you didn't act on it yet?", simple: "What was the moment the ending became obvious?" },
    { main: "What's one specific thing about it you miss — not the whole loss, just one piece?", simple: "Finish this: \u201cI still think about ___.\u201d" },
    { main: "What haven't you dealt with yet about this?", simple: "What part of this are you avoiding?" },
  ],
  courage: [
    { main: "Is this charge coming from clarity, or from needing to escape something?", simple: "Right before the jump — do you feel focused, or do you feel like you're running?" },
    { main: "What's the difference in how this charge feels compared to the charge that usually means you need Reset instead?", simple: "Does this feel grounded, or does it feel like too much all at once?" },
    { main: "What have you never regretted jumping into, even when it looked reckless from outside?", simple: "Name one leap that turned out right." },
    { main: "Who or what would tell you the truth right now if this charge was the wrong kind?", simple: "Is there someone whose read on this you'd actually trust over your own right now?" },
    { main: "What has jumping first taught you that waiting around never would have?", simple: "Name something you only learned because you moved before you were ready." },
    { main: "What's the version of you that only shows up once you've already committed?", simple: "Who do you become after you jump, that you're not before?" },
    { main: "What are you capable of that people who plan everything out never get to find out about themselves?", simple: "What's the advantage of moving fast that slow movers don't get?" },
  ],
  connection: [
    { main: "Who in your life actually got the time to root, and what made that possible?", simple: "Think of your longest friendship — what did you do differently with them?" },
    { main: "What's the moment you usually pull back, right when a connection starts to deepen?", simple: "What happens right before you start to let someone slip?" },
    { main: "Who feels like they showed up in your life at exactly the right time?", simple: "Name someone whose presence still feels like it wasn't an accident." },
    { main: "What has someone given you just by staying, that you don't say out loud enough?", simple: "What do you appreciate about a specific person that you've never told them?" },
    { main: "Which relationships have you let go of that you still think about?", simple: "Name one connection you wish had gotten more time." },
    { main: "What does it feel like when a connection is real versus just familiar?", simple: "How do you know when someone actually matters to you?" },
  ],
  clarity: [
    { main: "What's the question underneath the question you're actually stuck on?", simple: "If you had to ask someone else for help right now, what would you actually ask them?" },
    { main: "What haven't you looked into yet that might change how this decision feels?", simple: "What's one thing you haven't researched yet?" },
    { main: "Who would you talk this through with if you wanted the real answer, not just reassurance?", simple: "Name the person whose questions actually make you think, not just agree." },
    { main: "What did the last \u201cclick\u201d moment feel like, and what led up to it?", simple: "Think of a recent decision that suddenly made sense — what happened right before it clicked?" },
    { main: "What's still unorganized right now that talking it out loud might sort?", simple: "What's the messiest part of this decision in your head right now?" },
  ],
  change: [
    { main: "What kept you moving on the days you couldn't see the end?", simple: "What got you through the worst frustration, even without proof it'd work?" },
    { main: "What does quitting actually promise you, in the moment you want to?", simple: "What would quitting solve, even temporarily?" },
    { main: "How far have you actually come, measured from where you started — not from where you're trying to get?", simple: "What would past-you think if they saw you right now, mid-frustration and all?" },
    { main: "What's different about this version of \u201cstuck\u201d compared to actually being stuck?", simple: "Are you stuck, or just in the part that doesn't feel like progress yet?" },
    { main: "What do you need to hear right now that isn't \u201cyou're almost there\u201d?", simple: "What would actually help today — not motivation, just today?" },
  ],
  threshold: [
    { main: "What's the first small thing that happens right before you start to slide — before you'd even call it sadness yet?", simple: "What's different about your day on the mornings that turn into hard days?" },
    { main: "Think of the last time you noticed \u201cI'm not okay\u201d too late. What did you miss looking back?", simple: "What's a sign you now know means something, but didn't at the time?" },
    { main: "What do you usually tell yourself in the early stage that makes it easier to ignore?", simple: "What's the excuse you give yourself before a hard stretch?" },
  ],
  reckoning: [
    { main: "What is this feeling actually protecting you from?", simple: "If this feeling went away right now, what would you have to deal with instead?" },
    { main: "What would you have to admit to yourself if you let this feeling be fully true?", simple: "What's the thing you're avoiding by staying upset?" },
    { main: "If this feeling had a specific cause instead of a vague one, what would you guess it actually is?", simple: "What happened in the last 24 hours that this might actually be about?" },
    { main: "Is this feeling about what's happening right now, or is it an old feeling wearing a new situation?", simple: "Does this remind you of a feeling you've had before, in a different situation?" },
  ],
};

const STOPWORDS = new Set([
  "the","a","an","and","or","but","if","then","of","to","in","on","for","with",
  "is","are","was","were","be","been","being","it","its","this","that","i",
  "you","your","my","me","we","us","they","them","he","she","him","her",
  "at","as","by","from","not","no","so","do","did","does","have","has","had",
  "would","could","should","just","like","get","got","when","what","who",
  "how","why","there","here","about","into","up","out","still","before",
  "after","than","too","very","really","almost","again","some","something",
  "someone","anything","nothing","around","because","right","now"
]);

// ---- Helpers ----

function wordFrequency(entries) {
  const counts = {};
  entries.forEach((e) => {
    const words = e.text
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w));
    words.forEach((w) => {
      counts[w] = (counts[w] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .filter(([, c]) => c > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
}

function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function randomIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

// ---- Main component ----

function OracleConceptBoard() {
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState("reflect"); // reflect | board
  const [activeCategory, setActiveCategory] = useState("reset");
  const [promptIndex, setPromptIndex] = useState(0);
  const [showSimple, setShowSimple] = useState(false);
  const [draft, setDraft] = useState("");
  const [importError, setImportError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // "", "saving", "saved", "error"
  const [saveError, setSaveError] = useState("");

  async function persistEntries(data) {
    setSaveStatus("saving");
    setSaveError("");
    try {
      const result = await window.storage.set(STORAGE_KEY, JSON.stringify(data), false);
      if (result) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
        setSaveError("Storage returned no result.");
      }
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err && err.message ? err.message : String(err));
    }
  }

  // Load saved entries on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY, false);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          if (Array.isArray(parsed)) setEntries(parsed);
        }
      } catch (err) {
        // key doesn't exist yet on first use — that's fine
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Auto-save whenever entries change, after initial load
  useEffect(() => {
    if (!loaded) return;
    persistEntries(entries);
  }, [entries, loaded]);

  const currentSet = PROMPTS[activeCategory];
  const currentPrompt = currentSet[promptIndex % currentSet.length];
  const activeDef = CATEGORY_DEFS.find((c) => c.id === activeCategory);

  const categoryCounts = useMemo(() => {
    const counts = {};
    CATEGORY_DEFS.forEach((c) => (counts[c.id] = 0));
    entries.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [entries]);

  const thinnestCategory = useMemo(() => {
    let min = Infinity;
    let id = null;
    CATEGORY_DEFS.forEach((c) => {
      if (categoryCounts[c.id] < min) {
        min = categoryCounts[c.id];
        id = c.id;
      }
    });
    return id;
  }, [categoryCounts]);

  const frequentWords = useMemo(() => wordFrequency(entries), [entries]);

  function switchCategory(catId) {
    setActiveCategory(catId);
    setPromptIndex(randomIndex(PROMPTS[catId]));
    setShowSimple(false);
  }

  function newPrompt() {
    setPromptIndex(randomIndex(PROMPTS[activeCategory]));
    setShowSimple(false);
  }

  function saveEntry() {
    if (!draft.trim()) return;
    setEntries((prev) => [
      {
        id: Date.now(),
        category: activeCategory,
        prompt: showSimple ? currentPrompt.simple : currentPrompt.main,
        text: draft.trim(),
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
    setDraft("");
    newPrompt();
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function exportData() {
    download(
      "oracle-notes.json",
      JSON.stringify({ exportedAt: new Date().toISOString(), entries }, null, 2)
    );
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed.entries)) throw new Error("bad shape");
        setEntries(parsed.entries);
        setImportError("");
      } catch {
        setImportError("Couldn't read that file — expecting an oracle-notes.json export.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.eyebrow}>Concept Board</div>
        <h1 style={styles.title}>Notes Toward a Deck</h1>
        <div style={styles.saveIndicator}>
          {saveStatus === "saving" && "saving…"}
          {saveStatus === "saved" && "saved"}
          {saveStatus === "error" && (
            <span>
              couldn't save{saveError ? `: ${saveError}` : ""} —{" "}
              <button style={styles.retryBtn} onClick={() => persistEntries(entries)}>
                retry
              </button>
              {" · export a backup below"}
            </span>
          )}
        </div>
      </header>

      <nav style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(view === "reflect" ? styles.tabActive : {}) }}
          onClick={() => setView("reflect")}
        >
          Reflect
        </button>
        <button
          style={{ ...styles.tab, ...(view === "board" ? styles.tabActive : {}) }}
          onClick={() => setView("board")}
        >
          Board
        </button>
      </nav>

      {view === "reflect" && (
        <section style={styles.reflectSection}>
          <div style={styles.categoryRow}>
            {CATEGORY_DEFS.map((c) => (
              <button
                key={c.id}
                onClick={() => switchCategory(c.id)}
                style={{
                  ...styles.categoryPill,
                  ...(activeCategory === c.id ? styles.categoryPillActive : {}),
                }}
              >
                <NatureIcon id={c.id} size={15} color={activeCategory === c.id ? "#C9A227" : "#8B8299"} />
                <span style={styles.pillNature}>{c.nature}</span>
                <span style={styles.categoryCount}>{categoryCounts[c.id]}</span>
              </button>
            ))}
          </div>

          <div style={styles.promptCard}>
            <div style={styles.promptIconWrap}>
              <NatureIcon id={activeCategory} size={34} color="#A8677A" />
            </div>
            <div style={styles.promptLabel}>
              <span style={styles.promptLabelNature}>{activeDef.nature}</span>
              <span style={styles.promptLabelCategory}> · {activeDef.label}</span>
            </div>
            <p style={styles.promptText}>
              {showSimple ? currentPrompt.simple : currentPrompt.main}
            </p>
            <div style={styles.promptActions}>
              <button style={styles.shuffleBtn} onClick={newPrompt}>
                different question
              </button>
              {!showSimple && (
                <button style={styles.natureBtn} onClick={() => setShowSimple(true)}>
                  guided path →
                </button>
              )}
              {showSimple && (
                <button style={styles.natureBtn} onClick={() => setShowSimple(false)}>
                  ← back to original
                </button>
              )}
            </div>
          </div>

          <textarea
            style={styles.textarea}
            placeholder="Write in your own words. Nothing here gets finished for you."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
          />
          <button style={styles.saveBtn} onClick={saveEntry} disabled={!draft.trim()}>
            Add to board
          </button>

          {entries.length > 0 && (
            <div style={styles.recentList}>
              <div style={styles.recentLabel}>Recent notes</div>
              {entries.slice(0, 5).map((e) => (
                <div key={e.id} style={styles.entryRow}>
                  <span style={styles.entryTag}>
                    {CATEGORY_DEFS.find((c) => c.id === e.category)?.label}
                  </span>
                  <span style={styles.entryText}>{e.text}</span>
                  <button style={styles.deleteBtn} onClick={() => removeEntry(e.id)} aria-label="Delete note">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {view === "board" && (
        <section style={styles.boardSection}>
          <div style={styles.boardGrid}>
            {CATEGORY_DEFS.map((c) => (
              <div key={c.id} style={styles.boardCol}>
                <div style={styles.boardColHeader}>
                  <span style={styles.boardColTitleRow}>
                    <NatureIcon id={c.id} size={20} color="#A8677A" />
                    <span style={styles.boardColTitle}>
                      {c.nature} <span style={styles.boardColNature}>· {c.label}</span>
                    </span>
                  </span>
                  <span style={styles.boardColCount}>{categoryCounts[c.id]}</span>
                </div>
                <div style={styles.boardColBlurb}>{c.blurb}</div>
                <div style={styles.boardBar}>
                  <div
                    style={{
                      ...styles.boardBarFill,
                      width: `${Math.min(100, categoryCounts[c.id] * 20)}%`,
                    }}
                  />
                </div>
                {entries
                  .filter((e) => e.category === c.id)
                  .map((e) => (
                    <div key={e.id} style={styles.boardNote}>
                      {e.text}
                    </div>
                  ))}
                {categoryCounts[c.id] === 0 && (
                  <div style={styles.emptyNote}>Nothing here yet.</div>
                )}
              </div>
            ))}
          </div>

          {entries.length >= 2 && (
            <div style={styles.gapBlock}>
              <div style={styles.gapLabel}>Thinnest category</div>
              <p style={styles.gapText}>
                <strong>{CATEGORY_DEFS.find((c) => c.id === thinnestCategory)?.label}</strong> has the
                fewest notes. A question aimed there:
              </p>
              <p style={styles.gapPrompt}>
                {PROMPTS[thinnestCategory][randomIndex(PROMPTS[thinnestCategory])].main}
              </p>
              <button
                style={styles.gapBtn}
                onClick={() => {
                  switchCategory(thinnestCategory);
                  setView("reflect");
                }}
              >
                Answer this →
              </button>
            </div>
          )}

          {frequentWords.length > 0 && (
            <div style={styles.wordBlock}>
              <div style={styles.gapLabel}>Words you keep returning to</div>
              <div style={styles.wordRow}>
                {frequentWords.map(([w, c]) => (
                  <span key={w} style={styles.wordChip}>
                    {w} <span style={styles.wordCount}>×{c}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <footer style={styles.footer}>
        <div style={styles.footerLabel}>Keep your notes safe</div>
        <div style={styles.footerBtnRow}>
          <button style={styles.footerBtn} onClick={exportData} disabled={entries.length === 0}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v13" />
              <path d="M7 11l5 5 5-5" />
              <path d="M4 20h16" />
            </svg>
            Export backup
          </button>
          <label style={styles.footerBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A8677A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21V8" />
              <path d="M7 13l5-5 5 5" />
              <path d="M4 4h16" />
            </svg>
            Restore from backup
            <input type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
          </label>
        </div>
        {importError && <span style={styles.importError}>{importError}</span>}
      </footer>
    </div>
  );
}

// ---- Style tokens ----
// Palette: ink #191521, surface #241F2E, ivory #EDE6DD, gold #C9A227, dusty rose #A8677A, line #3A3345

const styles = {
  page: {
    minHeight: "100vh",
    background: "#191521",
    color: "#EDE6DD",
    fontFamily: "'Work Sans', sans-serif",
    padding: "32px 20px 60px",
    maxWidth: 640,
    margin: "0 auto",
  },
  header: { marginBottom: 28 },
  eyebrow: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#A8677A",
    marginBottom: 8,
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 500,
    fontSize: 32,
    margin: "0 0 8px",
    letterSpacing: "-0.01em",
  },
  saveIndicator: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: "#8B8299",
    marginTop: 10,
    minHeight: 14,
  },
  retryBtn: {
    background: "none",
    border: "none",
    color: "#C9A227",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 24,
    borderBottom: "1px solid #3A3345",
  },
  tab: {
    background: "none",
    border: "none",
    color: "#8B8299",
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    padding: "10px 4px",
    marginRight: 20,
    cursor: "pointer",
    borderBottom: "2px solid transparent",
  },
  tabActive: {
    color: "#EDE6DD",
    borderBottom: "2px solid #C9A227",
  },
  reflectSection: { display: "flex", flexDirection: "column", gap: 16 },
  categoryRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  categoryPill: {
    background: "#241F2E",
    border: "1px solid #3A3345",
    color: "#B8AFC4",
    borderRadius: 20,
    padding: "7px 14px",
    fontSize: 12.5,
    fontFamily: "'Work Sans', sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  categoryPillActive: {
    background: "#2E2738",
    borderColor: "#C9A227",
    color: "#EDE6DD",
  },
  pillNature: { fontFamily: "'Work Sans', sans-serif" },
  pillCategory: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    color: "#8B8299",
    fontStyle: "italic",
  },
  categoryCount: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: "#8B8299",
  },
  promptCard: {
    background: "#241F2E",
    border: "1px solid #3A3345",
    borderRadius: 4,
    padding: "22px 20px",
    position: "relative",
  },
  promptIconWrap: {
    position: "absolute",
    top: 18,
    right: 18,
    opacity: 0.85,
  },
  promptLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#C9A227",
    marginBottom: 10,
  },
  promptLabelNature: {},
  promptLabelCategory: {
    color: "#8B8299",
    fontStyle: "italic",
    textTransform: "none",
  },
  promptText: {
    fontFamily: "'Fraunces', serif",
    fontSize: 19,
    lineHeight: 1.45,
    margin: "0 0 14px",
  },
  promptActions: { display: "flex", gap: 16, flexWrap: "wrap" },
  shuffleBtn: {
    background: "none",
    border: "none",
    color: "#8B8299",
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    cursor: "pointer",
    padding: 0,
  },
  natureBtn: {
    background: "none",
    border: "none",
    color: "#A8677A",
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    cursor: "pointer",
    padding: 0,
    fontStyle: "italic",
  },
  textarea: {
    background: "#1E1927",
    border: "1px solid #3A3345",
    borderRadius: 4,
    color: "#EDE6DD",
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 14,
    padding: 14,
    resize: "vertical",
    outline: "none",
  },
  saveBtn: {
    background: "#C9A227",
    border: "none",
    color: "#191521",
    fontFamily: "'Work Sans', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    padding: "11px 18px",
    borderRadius: 4,
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  recentList: { marginTop: 8, display: "flex", flexDirection: "column", gap: 6 },
  recentLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#8B8299",
    marginBottom: 4,
  },
  entryRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
    borderBottom: "1px solid #2A2433",
    padding: "8px 0",
  },
  entryTag: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    color: "#A8677A",
    textTransform: "uppercase",
    flexShrink: 0,
    width: 90,
  },
  entryText: { fontSize: 13, color: "#D8D0E0", flex: 1, lineHeight: 1.4 },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#8B8299",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    padding: "0 2px",
  },
  boardSection: { display: "flex", flexDirection: "column", gap: 24 },
  boardGrid: { display: "flex", flexDirection: "column", gap: 18 },
  boardCol: {
    background: "#241F2E",
    border: "1px solid #3A3345",
    borderRadius: 4,
    padding: "16px 18px",
  },
  boardColHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  boardColTitleRow: { display: "flex", alignItems: "center", gap: 8 },
  boardColTitle: { fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 500 },
  boardColNature: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 13,
    fontStyle: "italic",
    color: "#A8677A",
  },
  boardColCount: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#C9A227" },
  boardColBlurb: { fontSize: 12, color: "#8B8299", margin: "4px 0 10px" },
  boardBar: {
    height: 3,
    background: "#3A3345",
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  boardBarFill: { height: "100%", background: "#A8677A" },
  boardNote: {
    fontSize: 13,
    color: "#D8D0E0",
    lineHeight: 1.4,
    padding: "8px 0",
    borderTop: "1px solid #2A2433",
  },
  emptyNote: { fontSize: 12, color: "#5C5468", fontStyle: "italic", paddingTop: 4 },
  gapBlock: {
    background: "#241F2E",
    border: "1px solid #C9A227",
    borderRadius: 4,
    padding: "18px 20px",
  },
  gapLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#C9A227",
    marginBottom: 8,
  },
  gapText: { fontSize: 13, color: "#D8D0E0", margin: "0 0 10px" },
  gapPrompt: {
    fontFamily: "'Fraunces', serif",
    fontSize: 16,
    lineHeight: 1.4,
    margin: "0 0 14px",
  },
  gapBtn: {
    background: "none",
    border: "1px solid #C9A227",
    color: "#C9A227",
    borderRadius: 4,
    padding: "8px 14px",
    fontSize: 13,
    fontFamily: "'Work Sans', sans-serif",
    cursor: "pointer",
  },
  wordBlock: { padding: "0 2px" },
  wordRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  wordChip: {
    background: "#241F2E",
    border: "1px solid #3A3345",
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 12,
    color: "#D8D0E0",
  },
  wordCount: { color: "#8B8299", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 },
  footer: {
    marginTop: 36,
    paddingTop: 18,
    borderTop: "1px solid #3A3345",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  footerLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#5C5468",
  },
  footerBtnRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  footerBtn: {
    background: "#241F2E",
    border: "1px solid #3A3345",
    color: "#B8AFC4",
    borderRadius: 4,
    padding: "9px 14px",
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },
  importError: { fontSize: 12, color: "#A8677A" },
};

// ---- Mount ----
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<OracleConceptBoard />);
