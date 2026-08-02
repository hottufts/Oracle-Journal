const { useState, useMemo, useEffect } = React;

const STORAGE_KEY = "oracle-entries";
const STORAGE_KEY_DRAFTS = "oracle-card-drafts";

function blankDraft() {
  return {
    id: Date.now(),
    name: "",
    category: CATEGORY_DEFS[0].id,
    tags: [],
    moment: "",
    image: "",
    trigger: "",
    universal: "",
    shadow: "",
    createdAt: new Date().toISOString(),
  };
}

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
    { main: "What's one thing that has never failed to calm you down, even a little?", simple: "Name one thing that always helps, even slightly." },
    { main: "What does your ideal reset actually look like, step by step?", simple: "If you had an hour to reset, what would you actually do?" },
    { main: "Who or what always brings you back to yourself?", simple: "Name a person, place, or thing that reliably grounds you." },
    { main: "What's a place that resets you just by being there?", simple: "Where do you feel instantly calmer?" },
    { main: "What sound, smell, or texture helps you settle?", simple: "Name one sensory thing that calms you down." },
    { main: "What's the difference between what actually resets you and what you just do out of habit?", simple: "Is this helping you reset, or just filling time?" },
    { main: "What's something small you could do right now that would genuinely help?", simple: "What's one small thing you could do in the next 10 minutes?" },
    { main: "What resets you faster than you expect it to?", simple: "What works quicker than you give it credit for?" },
    { main: "What's a ritual you've never written down but always fall back on?", simple: "What's something you do without thinking that always helps?" },
  ],
  witness: [
    { main: "What kept you here, even in the moments it would have been easier not to be?", simple: "What's one thing — a person, a habit, a reason — that held on when you couldn't?" },
    { main: "What does the person you are now know that the person at your lowest point didn't yet?", simple: "What's changed about how you see yourself since then?" },
    { main: "What did asking for help actually give you, that you couldn't have gotten alone?", simple: "Name one thing therapy or support gave you that you didn't expect." },
    { main: "If you could tell yourself back then one true thing, what would it be — not to fix it, just to say it?", simple: "What do you wish someone had told you then?" },
    { main: "What's different about how you handle conflict now compared to a year ago?", simple: "How do you handle disagreements differently than before?" },
    { main: "What's a habit you used to have that quietly disappeared?", simple: "Name a habit you don't have anymore." },
    { main: "What's something you do differently now without even thinking about it?", simple: "What's automatic now that used to take effort?" },
    { main: "What's a reaction you used to have that doesn't happen anymore?", simple: "What used to set you off that doesn't anymore?" },
    { main: "What's changed about what you're willing to tolerate?", simple: "What would you no longer put up with?" },
    { main: "What's different about your mornings now compared to before?", simple: "How do your mornings look different than they used to?" },
    { main: "What's a fear that used to control you that doesn't anymore?", simple: "Name a fear that's lost its grip on you." },
    { main: "What's something about your voice, your boundaries, or your choices that's noticeably different?", simple: "What's one boundary you have now that you didn't before?" },
    { main: "What would past-you be shocked to see you doing casually now?", simple: "What's normal for you now that used to feel impossible?" },
  ],
  release: [
    { main: "What's gone that you haven't said out loud yet?", simple: "Who or what are you actually grieving right now?" },
    { main: "When did you first know, even if you didn't act on it yet?", simple: "What was the moment the ending became obvious?" },
    { main: "What's one specific thing about it you miss — not the whole loss, just one piece?", simple: "Finish this: \u201cI still think about ___.\u201d" },
    { main: "What haven't you dealt with yet about this?", simple: "What part of this are you avoiding?" },
    { main: "Why are you choosing to let this go now, instead of holding on longer?", simple: "Why now, instead of later?" },
    { main: "What does keeping this actually cost you?", simple: "What is holding onto this costing you?" },
    { main: "How will releasing this change the space you have for something else?", simple: "What would you have room for if this was gone?" },
    { main: "What's the difference between releasing this and abandoning it?", simple: "Does letting go feel like giving up, or moving on?" },
    { main: "Why is now the right time, even if it doesn't feel easy?", simple: "What makes now the right time, even if it's hard?" },
    { main: "What becomes possible once this is actually gone?", simple: "What opens up once this is over?" },
    { main: "How does holding onto this keep you stuck exactly where you are?", simple: "How is this keeping you in place?" },
    { main: "What would you gain by letting this be over?", simple: "What do you get by finally letting this end?" },
    { main: "Why does this deserve to be released instead of fixed?", simple: "Is this something to fix, or something to let go of?" },
  ],
  courage: [
    { main: "Is this charge coming from clarity, or from needing to escape something?", simple: "Right before the jump — do you feel focused, or do you feel like you're running?" },
    { main: "What's the difference in how this charge feels compared to the charge that usually means you need Reset instead?", simple: "Does this feel grounded, or does it feel like too much all at once?" },
    { main: "What have you never regretted jumping into, even when it looked reckless from outside?", simple: "Name one leap that turned out right." },
    { main: "Who or what would tell you the truth right now if this charge was the wrong kind?", simple: "Is there someone whose read on this you'd actually trust over your own right now?" },
    { main: "What has jumping first taught you that waiting around never would have?", simple: "Name something you only learned because you moved before you were ready." },
    { main: "What's the version of you that only shows up once you've already committed?", simple: "Who do you become after you jump, that you're not before?" },
    { main: "What are you capable of that people who plan everything out never get to find out about themselves?", simple: "What's the advantage of moving fast that slow movers don't get?" },
    { main: "What's daring you to move right now?", simple: "What's pushing you to act right now?" },
    { main: "What would you do if fear wasn't allowed a vote today?", simple: "What would you do today without fear's opinion?" },
    { main: "What's the boldest version of this decision?", simple: "What's the boldest option on the table?" },
    { main: "What are you done waiting for?", simple: "What are you finally ready to stop waiting on?" },
    { main: "What would it feel like to stop asking permission?", simple: "What would you do if you stopped asking for permission?" },
    { main: "What's the version of this where you go all in?", simple: "What does going all-in look like here?" },
    { main: "What's the risk that's actually worth the burn?", simple: "What risk is worth getting burned for?" },
    { main: "What are you finally ready to blow up in your own life?", simple: "What are you ready to shake up completely?" },
    { main: "What's the move you'd make if you weren't afraid of being too much?", simple: "What would you do if \u201ctoo much\u201d wasn't a concern?" },
  ],
  connection: [
    { main: "Who in your life actually got the time to root, and what made that possible?", simple: "Think of your longest friendship — what did you do differently with them?" },
    { main: "What's the moment you usually pull back, right when a connection starts to deepen?", simple: "What happens right before you start to let someone slip?" },
    { main: "Who feels like they showed up in your life at exactly the right time?", simple: "Name someone whose presence still feels like it wasn't an accident." },
    { main: "What has someone given you just by staying, that you don't say out loud enough?", simple: "What do you appreciate about a specific person that you've never told them?" },
    { main: "Which relationships have you let go of that you still think about?", simple: "Name one connection you wish had gotten more time." },
    { main: "What does it feel like when a connection is real versus just familiar?", simple: "How do you know when someone actually matters to you?" },
    { main: "Who have you been meaning to reach out to, and what's stopping you?", simple: "Who have you been meaning to contact?" },
    { main: "What's something you need from someone that you haven't asked for?", simple: "What do you need that you haven't asked for?" },
    { main: "Who sees the real version of you, not the version you perform?", simple: "Who do you not perform for?" },
    { main: "What would it look like to let someone help you this week?", simple: "Who could you let help you this week?" },
    { main: "What's a relationship you've let coast that deserves more attention?", simple: "What relationship needs more attention than it's getting?" },
    { main: "What do you assume people know about how you feel, that you've never actually said?", simple: "What do you assume someone knows, that you've never actually said?" },
    { main: "Who has earned more trust from you than you've given them?", simple: "Who deserves more trust from you than they currently have?" },
    { main: "What's stopping you from being the one who reaches out first?", simple: "What's stopping you from reaching out first?" },
    { main: "What does it feel like right before you decide someone's safe?", simple: "How do you know when someone feels safe?" },
  ],
  clarity: [
    { main: "What's the question underneath the question you're actually stuck on?", simple: "If you had to ask someone else for help right now, what would you actually ask them?" },
    { main: "What haven't you looked into yet that might change how this decision feels?", simple: "What's one thing you haven't researched yet?" },
    { main: "Who would you talk this through with if you wanted the real answer, not just reassurance?", simple: "Name the person whose questions actually make you think, not just agree." },
    { main: "What did the last \u201cclick\u201d moment feel like, and what led up to it?", simple: "Think of a recent decision that suddenly made sense — what happened right before it clicked?" },
    { main: "What's still unorganized right now that talking it out loud might sort?", simple: "What's the messiest part of this decision in your head right now?" },
    { main: "What decision have you been avoiding because you already know the answer?", simple: "What decision are you avoiding because you already know what you'll choose?" },
    { main: "What would you decide if you trusted your first instinct instead of your fifth?", simple: "What would your gut choose, before you second-guess it?" },
    { main: "What are you waiting to feel before you'll act — and is that fair to wait for?", simple: "What feeling are you waiting for before you act?" },
    { main: "What's the cost of staying undecided?", simple: "What is not deciding costing you?" },
    { main: "Who in your life makes decisions the way you wish you could?", simple: "Who do you admire for how they make decisions?" },
    { main: "What's the question you're actually avoiding asking someone?", simple: "What question are you avoiding asking someone?" },
    { main: "What would you choose if you knew you couldn't get it wrong?", simple: "What would you pick if there was no wrong answer?" },
    { main: "What's cluttering your thinking that has nothing to do with the actual decision?", simple: "What's distracting you that isn't actually part of this decision?" },
  ],
  change: [
    { main: "What kept you moving on the days you couldn't see the end?", simple: "What got you through the worst frustration, even without proof it'd work?" },
    { main: "What does quitting actually promise you, in the moment you want to?", simple: "What would quitting solve, even temporarily?" },
    { main: "How far have you actually come, measured from where you started — not from where you're trying to get?", simple: "What would past-you think if they saw you right now, mid-frustration and all?" },
    { main: "What's different about this version of \u201cstuck\u201d compared to actually being stuck?", simple: "Are you stuck, or just in the part that doesn't feel like progress yet?" },
    { main: "What do you need to hear right now that isn't \u201cyou're almost there\u201d?", simple: "What would actually help today — not motivation, just today?" },
    { main: "What part of you is already gone, even if the rest hasn't caught up yet?", simple: "What part of you has already changed, even if it doesn't feel finished?" },
    { main: "What are you becoming that you don't have a name for yet?", simple: "What are you turning into that you can't quite name?" },
    { main: "What's uncomfortable about this stage that's actually a sign it's working?", simple: "What discomfort right now might actually mean progress?" },
    { main: "What would you be doing right now if you already trusted the outcome?", simple: "What would you do differently if you trusted this would work out?" },
    { main: "What's something you used to need that you don't need anymore?", simple: "What did you used to need that you don't anymore?" },
    { main: "What does \u201cin progress\u201d look like for you today, specifically?", simple: "What does today's version of \u201cin progress\u201d actually look like?" },
    { main: "What's the version of you on the other side of this, waiting for you to catch up?", simple: "What's waiting for you on the other side of this?" },
    { main: "What are you tired of being, even if you're not sure what's next?", simple: "What are you ready to stop being?" },
  ],
  threshold: [
    { main: "What's the first small thing that happens right before you start to slide — before you'd even call it sadness yet?", simple: "What's different about your day on the mornings that turn into hard days?" },
    { main: "Think of the last time you noticed \u201cI'm not okay\u201d too late. What did you miss looking back?", simple: "What's a sign you now know means something, but didn't at the time?" },
    { main: "What do you usually tell yourself in the early stage that makes it easier to ignore?", simple: "What's the excuse you give yourself before a hard stretch?" },
    { main: "What's the first lie you tell yourself when things start slipping?", simple: "What do you tell yourself first, right before things slip?" },
    { main: "Who or what do you avoid when you're heading toward a hard stretch?", simple: "Who or what do you pull away from before a hard stretch?" },
    { main: "What's different about your sleep, appetite, or energy right before a hard patch?", simple: "What changes first — sleep, appetite, or energy?" },
    { main: "What's a warning sign you've ignored more than once?", simple: "What sign have you ignored before, more than once?" },
    { main: "What do you stop reaching out to people about, right before it gets bad?", simple: "What do you stop talking to people about, right before it gets hard?" },
    { main: "What's the difference between a bad day and the start of something longer?", simple: "How do you tell a bad day apart from the start of a hard stretch?" },
    { main: "What would it look like to interrupt this earlier than you did last time?", simple: "What would catching this earlier actually look like?" },
    { main: "Who would notice before you did, if you let them?", simple: "Who would catch this before you do, if you let them?" },
  ],
  reckoning: [
    { main: "What is this feeling actually protecting you from?", simple: "If this feeling went away right now, what would you have to deal with instead?" },
    { main: "What would you have to admit to yourself if you let this feeling be fully true?", simple: "What's the thing you're avoiding by staying upset?" },
    { main: "If this feeling had a specific cause instead of a vague one, what would you guess it actually is?", simple: "What happened in the last 24 hours that this might actually be about?" },
    { main: "Is this feeling about what's happening right now, or is it an old feeling wearing a new situation?", simple: "Does this remind you of a feeling you've had before, in a different situation?" },
    { main: "Think of an intense feeling from your past you never fully unpacked — what was it actually about?", simple: "What's a big feeling from a while back that you still don't fully understand?" },
    { main: "Looking back, what were you protecting yourself from during that time?", simple: "What did you avoid dealing with back then that you can name now?" },
    { main: "If you could explain that old feeling to yourself now, what would you say?", simple: "What do you understand now that you didn't then?" },
    { main: "What feeling do you keep having that you've never actually sat with?", simple: "What feeling keeps showing up that you've never really sat with?" },
    { main: "If this feeling could talk, what would it accuse you of?", simple: "What would this feeling say if it could talk?" },
    { main: "What's the oldest version of this feeling you can remember having?", simple: "When's the earliest you remember feeling this way?" },
    { main: "What would you have to give up believing, for this feeling to make sense?", simple: "What belief would have to change for this feeling to make sense?" },
    { main: "Whose voice does this feeling sound like?", simple: "Does this feeling sound like anyone in particular?" },
    { main: "What's the difference between this feeling and the story you're telling about it?", simple: "What's the feeling itself, versus the story you're telling about it?" },
    { main: "What are you most afraid this feeling means about you?", simple: "What are you afraid this feeling says about you?" },
    { main: "What would change if you let this feeling be right, temporarily?", simple: "What if this feeling was right, just for now?" },
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

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// ---- Main component ----

function OracleConceptBoard() {
  const [entries, setEntries] = useState([]);
  const [cardDrafts, setCardDrafts] = useState([]);
  const [view, setView] = useState("reflect"); // reflect | board | draft
  const [draftSubView, setDraftSubView] = useState("list"); // list | view | edit
  const [editingDraft, setEditingDraft] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [initial] = useState(() => {
    const cat = CATEGORY_DEFS[randomIndex(CATEGORY_DEFS)].id;
    return { category: cat, promptIndex: randomIndex(PROMPTS[cat]) };
  });
  const [activeCategory, setActiveCategory] = useState(initial.category);
  const [promptIndex, setPromptIndex] = useState(initial.promptIndex);
  const [showSimple, setShowSimple] = useState(false);
  const [draft, setDraft] = useState("");
  const [importError, setImportError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // "", "saving", "saved", "error"
  const [saveError, setSaveError] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());

  function toggleExpand(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

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

  async function persistDrafts(data) {
    try {
      await window.storage.set(STORAGE_KEY_DRAFTS, JSON.stringify(data), false);
    } catch (err) {
      // card drafts save silently; the main save indicator covers entries
    }
  }

  // Load saved entries and drafts on mount
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
      }
      try {
        const draftResult = await window.storage.get(STORAGE_KEY_DRAFTS, false);
        if (draftResult && draftResult.value) {
          const parsedDrafts = JSON.parse(draftResult.value);
          if (Array.isArray(parsedDrafts)) setCardDrafts(parsedDrafts);
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

  // Auto-save whenever card drafts change, after initial load
  useEffect(() => {
    if (!loaded) return;
    persistDrafts(cardDrafts);
  }, [cardDrafts, loaded]);

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
    const set = PROMPTS[activeCategory];
    if (set.length <= 1) {
      setPromptIndex(0);
    } else {
      let next = promptIndex;
      while (next === promptIndex) {
        next = randomIndex(set);
      }
      setPromptIndex(next);
    }
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

  function openNewDraft() {
    setEditingDraft(blankDraft());
    setTagInput("");
    setDraftSubView("edit");
  }

  function openExistingDraft(draft) {
    setEditingDraft({ ...draft, tags: [...(draft.tags || [])] });
    setTagInput("");
    setDraftSubView("view");
  }

  function updateEditingField(field, value) {
    setEditingDraft((prev) => ({ ...prev, [field]: value }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    setEditingDraft((prev) => ({
      ...prev,
      tags: prev.tags.includes(t) ? prev.tags : [...prev.tags, t],
    }));
    setTagInput("");
  }

  function removeTag(t) {
    setEditingDraft((prev) => ({ ...prev, tags: prev.tags.filter((x) => x !== t) }));
  }

  function saveDraft() {
    if (!editingDraft || !editingDraft.name.trim()) return;
    setCardDrafts((prev) => {
      const exists = prev.some((d) => d.id === editingDraft.id);
      if (exists) {
        return prev.map((d) => (d.id === editingDraft.id ? editingDraft : d));
      }
      return [editingDraft, ...prev];
    });
    setDraftSubView("view");
  }

  function deleteDraft(id) {
    setCardDrafts((prev) => prev.filter((d) => d.id !== id));
    setDraftSubView("list");
    setEditingDraft(null);
  }

  function exportData() {
    download(
      "oracle-notes.json",
      JSON.stringify(
        { exportedAt: new Date().toISOString(), entries, cardDrafts },
        null,
        2
      )
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
        if (Array.isArray(parsed.cardDrafts)) {
          setCardDrafts(parsed.cardDrafts);
        }
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
        <button
          style={{ ...styles.tab, ...(view === "draft" ? styles.tabActive : {}) }}
          onClick={() => {
            setView("draft");
            setDraftSubView("list");
          }}
        >
          Draft
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
                  <span
                    style={styles.entryTextWrap}
                    onClick={() => toggleExpand(e.id)}
                  >
                    {expandedIds.has(e.id) && e.prompt && (
                      <span style={styles.entryPrompt}>{e.prompt}</span>
                    )}
                    <span style={styles.entryText}>{e.text}</span>
                    <span style={styles.entryDate}>{formatDate(e.date)}</span>
                  </span>
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
                    <div
                      key={e.id}
                      style={styles.boardNote}
                      onClick={() => toggleExpand(e.id)}
                    >
                      {expandedIds.has(e.id) && e.prompt && (
                        <div style={styles.entryPrompt}>{e.prompt}</div>
                      )}
                      <div>{e.text}</div>
                      <div style={styles.entryDate}>{formatDate(e.date)}</div>
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

      {view === "draft" && draftSubView === "list" && (
        <section style={styles.reflectSection}>
          <div style={styles.draftListHeader}>
            <span style={styles.recentLabel}>Card drafts</span>
            <button style={styles.plusBtn} onClick={openNewDraft} aria-label="New card draft">
              +
            </button>
          </div>
          {cardDrafts.length === 0 && (
            <div style={styles.emptyNote}>No cards drafted yet.</div>
          )}
          {cardDrafts.map((d) => (
            <div
              key={d.id}
              style={styles.draftListRow}
              onClick={() => openExistingDraft(d)}
            >
              <span style={styles.draftListName}>{d.name || "Untitled"}</span>
              <span style={styles.draftListMeta}>
                <span style={styles.draftListCategory}>
                  {CATEGORY_DEFS.find((c) => c.id === d.category)?.label}
                </span>
                <span style={styles.draftListDate}>{formatDate(d.createdAt)}</span>
              </span>
            </div>
          ))}
        </section>
      )}

      {view === "draft" && draftSubView === "view" && editingDraft && (
        <section style={styles.reflectSection}>
          <button
            style={styles.backBtn}
            onClick={() => {
              setDraftSubView("list");
              setEditingDraft(null);
            }}
          >
            ← back
          </button>

          <div style={styles.viewHeader}>
            <div>
              <h2 style={styles.viewTitle}>{editingDraft.name || "Untitled"}</h2>
              <div style={styles.viewMeta}>
                {CATEGORY_DEFS.find((c) => c.id === editingDraft.category)?.label}
                {" · "}
                {formatDate(editingDraft.createdAt)}
              </div>
            </div>
            <button style={styles.editBtn} onClick={() => setDraftSubView("edit")}>
              Edit
            </button>
          </div>

          {editingDraft.tags.length > 0 && (
            <div style={styles.tagRow}>
              {editingDraft.tags.map((t) => (
                <span key={t} style={styles.tagChipReadOnly}>
                  {t}
                </span>
              ))}
            </div>
          )}

          <div style={styles.viewFieldBlock}>
            <div style={styles.viewFieldLabel}>What's the one moment that made this real?</div>
            <div style={styles.viewFieldText}>{editingDraft.moment || "—"}</div>
          </div>
          <div style={styles.viewFieldBlock}>
            <div style={styles.viewFieldLabel}>The image</div>
            <div style={styles.viewFieldText}>{editingDraft.image || "—"}</div>
          </div>
          <div style={styles.viewFieldBlock}>
            <div style={styles.viewFieldLabel}>When you'd reach for this card</div>
            <div style={styles.viewFieldText}>{editingDraft.trigger || "—"}</div>
          </div>
          <div style={styles.viewFieldBlock}>
            <div style={styles.viewFieldLabel}>The universal reading</div>
            <div style={styles.viewFieldText}>{editingDraft.universal || "—"}</div>
          </div>
          {editingDraft.shadow && (
            <div style={styles.viewFieldBlock}>
              <div style={styles.viewFieldLabel}>Shadow side</div>
              <div style={styles.viewFieldText}>{editingDraft.shadow}</div>
            </div>
          )}

          <div style={styles.draftActionsRow}>
            <button style={styles.editBtn} onClick={() => setDraftSubView("edit")}>
              Edit
            </button>
            <button style={styles.deleteCardBtn} onClick={() => deleteDraft(editingDraft.id)}>
              Delete card
            </button>
          </div>
        </section>
      )}

      {view === "draft" && draftSubView === "edit" && editingDraft && (
        <section style={styles.reflectSection}>
          <button
            style={styles.backBtn}
            onClick={() => {
              const exists = cardDrafts.some((d) => d.id === editingDraft.id);
              if (exists) {
                setDraftSubView("view");
              } else {
                setDraftSubView("list");
                setEditingDraft(null);
              }
            }}
          >
            ← back
          </button>

          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>Card name</label>
            <input
              style={styles.fieldInput}
              value={editingDraft.name}
              onChange={(e) => updateEditingField("name", e.target.value)}
              placeholder="Working name"
            />
          </div>

          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>Category</label>
            <select
              style={styles.fieldSelect}
              value={editingDraft.category}
              onChange={(e) => updateEditingField("category", e.target.value)}
            >
              {CATEGORY_DEFS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} · {c.nature}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>Tags</label>
            <div style={styles.tagRow}>
              {editingDraft.tags.map((t) => (
                <span key={t} style={styles.tagChip}>
                  {t}
                  <button style={styles.tagRemoveBtn} onClick={() => removeTag(t)}>
                    ×
                  </button>
                </span>
              ))}
              <input
                style={styles.tagInput}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="add tag"
              />
              <button style={styles.tagAddBtn} onClick={addTag}>
                add
              </button>
            </div>
          </div>

          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>
              What's the one moment that made this real for you?
            </label>
            <textarea
              style={styles.fieldTextarea}
              rows={3}
              value={editingDraft.moment}
              onChange={(e) => updateEditingField("moment", e.target.value)}
            />
          </div>

          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>
              If you had to describe this in one image, what is it?
            </label>
            <textarea
              style={styles.fieldTextarea}
              rows={2}
              value={editingDraft.image}
              onChange={(e) => updateEditingField("image", e.target.value)}
            />
          </div>

          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>When would you actually reach for this card?</label>
            <textarea
              style={styles.fieldTextarea}
              rows={2}
              value={editingDraft.trigger}
              onChange={(e) => updateEditingField("trigger", e.target.value)}
            />
          </div>

          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>
              Strip your personal detail away — what's left that anyone could use?
            </label>
            <textarea
              style={styles.fieldTextarea}
              rows={3}
              value={editingDraft.universal}
              onChange={(e) => updateEditingField("universal", e.target.value)}
            />
          </div>

          <div style={styles.fieldBlock}>
            <label style={styles.fieldLabel}>
              Does this card have a shadow side? (optional)
            </label>
            <textarea
              style={styles.fieldTextarea}
              rows={2}
              value={editingDraft.shadow}
              onChange={(e) => updateEditingField("shadow", e.target.value)}
            />
          </div>

          <div style={styles.draftActionsRow}>
            <button style={styles.saveBtn} onClick={saveDraft} disabled={!editingDraft.name.trim()}>
              Save
            </button>
            {cardDrafts.some((d) => d.id === editingDraft.id) && (
              <button style={styles.deleteCardBtn} onClick={() => deleteDraft(editingDraft.id)}>
                Delete card
              </button>
            )}
          </div>
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
  entryTextWrap: {
    flex: 1,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  entryPrompt: {
    fontFamily: "'Fraunces', serif",
    fontStyle: "italic",
    fontSize: 12,
    color: "#A8677A",
    lineHeight: 1.4,
  },
  entryDate: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    color: "#5C5468",
  },
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
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 4,
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

  // Draft mode
  draftListHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  plusBtn: {
    background: "#241F2E",
    border: "1px solid #C9A227",
    color: "#C9A227",
    borderRadius: "50%",
    width: 32,
    height: 32,
    fontSize: 18,
    lineHeight: 1,
    cursor: "pointer",
  },
  draftListRow: {
    background: "#241F2E",
    border: "1px solid #3A3345",
    borderRadius: 4,
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  draftListName: {
    fontFamily: "'Fraunces', serif",
    fontSize: 16,
    color: "#EDE6DD",
  },
  draftListCategory: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: "#A8677A",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  draftListMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 3,
  },
  draftListDate: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    color: "#5C5468",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#8B8299",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    cursor: "pointer",
    padding: 0,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  fieldBlock: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 13,
    color: "#B8AFC4",
    lineHeight: 1.4,
  },
  fieldInput: {
    background: "#1E1927",
    border: "1px solid #3A3345",
    borderRadius: 4,
    color: "#EDE6DD",
    fontFamily: "'Fraunces', serif",
    fontSize: 17,
    padding: "10px 12px",
    outline: "none",
  },
  fieldSelect: {
    background: "#1E1927",
    border: "1px solid #3A3345",
    borderRadius: 4,
    color: "#EDE6DD",
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 14,
    padding: "10px 12px",
    outline: "none",
  },
  fieldTextarea: {
    background: "#1E1927",
    border: "1px solid #3A3345",
    borderRadius: 4,
    color: "#EDE6DD",
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 14,
    padding: 12,
    resize: "vertical",
    outline: "none",
    lineHeight: 1.4,
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
  },
  tagChip: {
    background: "#2E2738",
    border: "1px solid #3A3345",
    borderRadius: 20,
    padding: "5px 6px 5px 12px",
    fontSize: 12,
    color: "#D8D0E0",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  tagRemoveBtn: {
    background: "none",
    border: "none",
    color: "#8B8299",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1,
    padding: "0 2px",
  },
  tagInput: {
    background: "#1E1927",
    border: "1px solid #3A3345",
    borderRadius: 20,
    color: "#EDE6DD",
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 12,
    padding: "6px 12px",
    outline: "none",
    width: 100,
  },
  tagAddBtn: {
    background: "none",
    border: "1px solid #3A3345",
    color: "#8B8299",
    borderRadius: 20,
    padding: "6px 12px",
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    cursor: "pointer",
  },
  draftActionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  viewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  viewTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 500,
    fontSize: 24,
    margin: "0 0 4px",
  },
  viewMeta: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    color: "#A8677A",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  editBtn: {
    background: "none",
    border: "1px solid #C9A227",
    color: "#C9A227",
    borderRadius: 4,
    padding: "9px 16px",
    fontSize: 13,
    fontFamily: "'Work Sans', sans-serif",
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
  },
  tagChipReadOnly: {
    background: "#2E2738",
    border: "1px solid #3A3345",
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 12,
    color: "#D8D0E0",
  },
  viewFieldBlock: { display: "flex", flexDirection: "column", gap: 6 },
  viewFieldLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#8B8299",
  },
  viewFieldText: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 14,
    color: "#D8D0E0",
    lineHeight: 1.5,
  },
  deleteCardBtn: {
    background: "none",
    border: "1px solid #3A3345",
    color: "#A8677A",
    borderRadius: 4,
    padding: "11px 16px",
    fontSize: 13,
    fontFamily: "'Work Sans', sans-serif",
    cursor: "pointer",
  },
};

// ---- Mount ----
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<OracleConceptBoard />);
