(() => {
  // ===== CONFIG =====
  // Use your Formspree endpoint from the contact page
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/xykdypnr";

  // Optional: include where the user was (helpful for you)
  const getPagePath = () => location.pathname;

  // ===== STATE =====
  const storageKey = "unitech_chat_transcript_v1";
  const stateKey = "unitech_chat_state_v1";

  const loadTranscript = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); }
    catch { return []; }
  };

  const saveTranscript = (t) => localStorage.setItem(storageKey, JSON.stringify(t));

  const loadState = () => {
    try { return JSON.parse(localStorage.getItem(stateKey) || "{}"); }
    catch { return {}; }
  };

  const saveState = (s) => localStorage.setItem(stateKey, JSON.stringify(s));

  // ===== RESET / START OVER =====
const DEFAULT_QUICK_REPLIES = [
  "My laptop/PC is slow",
  "It won’t turn on / black screen",
  "Virus / pop-ups",
  "Crashing / blue screen",
  "Wi-Fi / internet issues",
  "Upgrades (SSD/RAM) / new setup",
  "Tutoring / computer lessons",
  "Business IT support",
  "Website help",
  "Send my enquiry to Uni-Tech"
];

function startOverChat() {
  // Reset runtime data
  transcript = [];
  botState = {};

  // Persist reset
  saveTranscript(transcript);
  saveState(botState);

  // Clear UI
  bodyEl.innerHTML = "";
  quickEl.innerHTML = "";

  // Re-run greeting + default chips
  defaultGreeting();
  scrollToBottom();
}



  let transcript = loadTranscript();
  let botState = loadState();

  // ===== UI: inject widget =====
  const fab = document.createElement("button");
  fab.className = "chat-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Open chat");
  fab.innerHTML = `<span class="dot" aria-hidden="true"></span> Chat`;

  const panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Uni-Tech chat");

  panel.innerHTML = `
    <div class="chat-header">
      <div>
        <strong>Uni-Tech Chat</strong>
        <small>Not monitored live — we’ll reply by email.</small>
      </div>
      <button class="chat-reset" id="chatReset" type="button" title="Start over">↻</button>
      <button class="chat-close" type="button" aria-label="Close chat">✕</button>
    </div>

    <div class="chat-body" id="chat-body"></div>

    <div class="chat-quick" id="chat-quick"></div>

    <form class="chat-input" id="chat-form" autocomplete="off">
      <input id="chat-text" type="text" placeholder="Type your message…" />
      <button class="chat-send" type="submit">Send</button>
    </form>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const bodyEl = panel.querySelector("#chat-body");
  const quickEl = panel.querySelector("#chat-quick");
  const closeBtn = panel.querySelector(".chat-close");
  const formEl = panel.querySelector("#chat-form");
  const textEl = panel.querySelector("#chat-text");
  const resetBtn = panel.querySelector("#chatReset");
  const isTouchDevice = () =>
  window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  // On mobile, don’t pop the keyboard until the user taps the chat area
bodyEl.addEventListener("click", () => {
  textEl.focus();
});


resetBtn.addEventListener("click", (e) => {
  e.preventDefault();
  startOverChat();
});


  const scrollToBottom = () => {
    bodyEl.scrollTop = bodyEl.scrollHeight;
  };

  const addMsg = (from, text, meta = "") => {
    const msg = { from, text, meta, ts: Date.now(), page: getPagePath() };
    transcript.push(msg);
    saveTranscript(transcript);

    const div = document.createElement("div");
    div.className = `chat-msg ${from === "bot" ? "bot" : "user"}`;
    div.innerHTML = `
      <div>${escapeHtml(text).replace(/\n/g, "<br>")}</div>
      ${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ""}
    `;
    bodyEl.appendChild(div);
    scrollToBottom();
  };

  const setQuickReplies = (chips) => {
    quickEl.innerHTML = "";
    if (!chips || !chips.length) return;

    chips.forEach((label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chat-chip";
      b.textContent = label;
      b.addEventListener("click", () => handleUser(label));
      quickEl.appendChild(b);
    });
  };
  const ensureQuickReplies = () => {
  // If we are collecting details (handoff flow), we intentionally show no chips
  if (botState?.mode === "handoff") return;

  // If there are no chips currently, restore defaults
  if (!quickEl.children.length) {
    setQuickReplies(DEFAULT_QUICK_REPLIES);
  }
};


  const open = () => {
  panel.classList.add("open");

  // Don’t auto-open keyboard on phones
  if (!isTouchDevice()) {
    textEl.focus();
  } else {
    // optional: focus the close button instead (no keyboard)
    closeBtn.focus();
  }

  scrollToBottom();
};


  const close = () => {
    panel.classList.remove("open");
    fab.focus();
  };

  fab.addEventListener("click", () => {
    panel.classList.contains("open") ? close() : open();
  });
  closeBtn.addEventListener("click", close);

  // ===== Bot logic =====
  const FAQ = [
  // Booking / process
  {
    keys: ["book", "booking", "appointment", "call back", "callback", "quote", "enquiry", "inquire", "enquire"],
    reply:
      "No problem — we can get you booked in.\n\nTo give an accurate quote, please tell me:\n• PC or laptop?\n• Brand/model (if you know it)\n• What’s happening + when it started\n• Any error messages\n• Your postcode (Kent area)\n\nIf you’d like, tap “Send my enquiry to Uni-Tech” and I’ll forward it."
  },

  // Pricing
  {
    keys: ["price", "prices", "cost", "how much", "pricing", "fee", "charges", "rate"],
    reply:
      "Pricing depends on the issue, but we keep it simple:\n• Diagnosis first\n• We confirm a quote before any paid work begins\n• No surprise costs\n\nTell me what’s happening and I can send it to Uni-Tech for a quote."
  },

  // Turnaround
  {
    keys: ["turnaround", "how long", "same day", "urgent", "fast", "timeframe"],
    reply:
      "Turnaround depends on the job and parts availability.\nCommon jobs can often be turned around quickly, and we’ll always give you realistic expectations.\n\nWhat’s the issue (and is it a PC or laptop)?"
  },

  // Slow computer
  {
    keys: ["slow", "lag", "freezing", "takes ages", "spinning", "hangs", "performance"],
    reply:
      "If your computer is slow/freezing, common causes are:\n• Low storage space / failing drive\n• Too many startup apps\n• Updates running in the background\n• Malware\n• Old HDD (SSD upgrade helps massively)\n\nQuick question: is it mainly slow on startup, or slow all the time?\n\nIf you want, I can send your details to Uni-Tech for a proper diagnosis/quote."
  },

  // Won't turn on / no display
  {
    keys: ["won't turn on", "wont turn on", "not turning on", "no power", "black screen", "no display", "beeping"],
    reply:
      "That’s frustrating — let’s narrow it down.\n\n1) Any lights/fans when you press power?\n2) Laptop: does the charging light come on?\n3) PC: does it beep or show anything at all?\n\nIf you reply with those, I can suggest next steps — or I can send it to Uni-Tech to arrange a diagnosis."
  },

  // Blue screen / crashes
  {
    keys: ["blue screen", "bsod", "crash", "restarts", "keeps restarting", "error code", "stop code"],
    reply:
      "If you’re getting crashes/blue screens, it’s often:\n• Driver issues\n• Windows corruption\n• Failing storage (SSD/HDD)\n• RAM problems\n• Overheating\n\nIf you can, tell me the STOP CODE (or a photo of it) and when it happens.\n\nYou can also tap “Send my enquiry to Uni-Tech” and we’ll take it from there."
  },

  // Overheating / loud fan
  {
    keys: ["overheat", "overheating", "fan loud", "hot", "thermal", "shuts down", "temperature"],
    reply:
      "Overheating is usually dust build-up, fan issues, or old thermal paste — and it can cause slowdowns or shutdowns.\n\nIs it:\n• Loud fan all the time?\n• Shutting down randomly?\n• Hot even when idle?\n\nIf you share the device model, Uni-Tech can quote and book it in."
  },

  // Virus / malware
  {
    keys: ["virus", "malware", "hacked", "pop up", "popup", "ads", "redirect", "trojan", "spyware"],
    reply:
      "We can remove malware, secure the system, and help prevent reinfection.\n\nQuick check — which best matches?\n1) Pop-ups / browser redirects\n2) Antivirus warning\n3) Accounts compromised (email/social)\n\nReply with 1, 2, or 3 — or tap “Send my enquiry to Uni-Tech”."
  },

  // Email/account compromised
  {
    keys: ["email hacked", "account hacked", "password", "phished", "phishing", "compromised", "someone logged in"],
    reply:
      "If you think an account is compromised:\n• Change password (from a clean device if possible)\n• Turn on 2-factor authentication\n• Check forwarding rules / recovery email\n\nImportant: don’t share passwords here.\n\nIf you tell me which account (e.g. Gmail/Outlook) and what happened, I can send it to Uni-Tech for help."
  },

  // Wi-Fi / Internet issues
  {
    keys: ["wifi", "wi-fi", "internet", "router", "disconnect", "no connection", "network"],
    reply:
      "Wi-Fi issues can be the router, ISP, device settings, or interference.\n\nQuick questions:\n• Is it just one device, or all devices?\n• Are you using Wi-Fi or ethernet?\n• Any router lights flashing unusually?\n\nIf you want, send the details to Uni-Tech and we’ll guide you."
  },

  // Printer help
  {
    keys: ["printer", "printing", "won't print", "wont print", "paper jam", "ink", "scanner"],
    reply:
      "Printer issues are common — usually drivers, Wi-Fi pairing, or queue problems.\n\nTell me:\n• Printer make/model\n• Is it connected via Wi-Fi or USB?\n• What happens when you print?\n\nYou can also tap “Send my enquiry to Uni-Tech” to get help booked in."
  },

  // New setup / upgrades
  {
    keys: ["upgrade", "ssd", "ram", "new pc", "new laptop", "setup", "set up", "transfer", "data transfer"],
    reply:
      "We can help with upgrades and new device setup:\n• SSD/RAM upgrades (big speed boost)\n• New PC/laptop setup\n• Data transfer\n• Email/accounts setup\n\nWhat device do you have now, and what are you trying to achieve?"
  },

  // Data recovery
  {
    keys: ["data recovery", "recover files", "lost files", "deleted", "hard drive", "ssd failed", "drive failed"],
    reply:
      "If you’ve lost files, stop using the device as much as possible — continued use can overwrite recoverable data.\n\nTell me:\n• What happened (deleted, drive failed, accidental format)\n• What type of device/drive\n\nIf you tap “Send my enquiry to Uni-Tech”, we can advise the safest next steps."
  },

  // Tutoring
  {
    keys: ["tutor", "tutorial", "lesson", "teach", "computer lessons", "computer literacy"],
    reply:
      "Yep — we offer patient 1-to-1 tutoring.\nCommon topics:\n• Email and attachments\n• Files/folders\n• Online safety\n• Settings and everyday use\n\nWhat would you like help with?"
  },

  // Business IT support
  {
    keys: ["business", "company", "office", "it support", "small business", "work devices", "managed"],
    reply:
      "For small business IT support we can help with:\n• Device setup\n• Troubleshooting\n• Security basics (updates, backups, antivirus)\n• Ongoing support\n\nRoughly how many devices do you need help with (1–3, 4–10, 10+)?"
  },

  // Websites
  {
    keys: ["website", "site", "web", "domain", "hosting", "seo", "google", "not secure", "https"],
    reply:
      "We can create or improve websites (clean, mobile-friendly, professional).\n\nTell me:\n• Do you already have a website/domain?\n• What type of business and what pages you want?\n• Do you need email addresses (like enquiries@…)?\n\nIf you tap “Send my enquiry to Uni-Tech”, we’ll reply with next steps."
  }
];

  const defaultGreeting = () => {
  addMsg(
    "bot",
    "Hi! I’m the Uni-Tech helper bot.\n\nWhat can I help with today?",
    "Tip: You can type normally, or tap a quick option below."
  );
  setQuickReplies(DEFAULT_QUICK_REPLIES);
};


  const matchFAQ = (text) => {
    const t = text.toLowerCase();
    for (const item of FAQ) {
      if (item.keys.some(k => t.includes(k))) return item.reply;
    }
    return null;
  };

  const handleUser = async (text) => {
    const cleaned = text.trim();
    if (!cleaned) return;

    addMsg("user", cleaned);

    // If user requests handoff
    if (/send.*enquiry|send.*query|contact you|email you|human|speak to someone|book/i.test(cleaned)) {
      await startHandoff();
      return;
    }

    // If we’re currently collecting handoff details
    if (botState.mode === "handoff") {
      await continueHandoff(cleaned);
      return;
    }

    // FAQ match
    const reply = matchFAQ(cleaned);
    if (reply) {
      addMsg("bot", reply);
      setQuickReplies(["Send my enquiry to Uni-Tech", "Anything else"]);
      return;
    }

    // Lightweight fallback
    addMsg("bot",
      "Got it. I can either try a quick suggestion, or I can send this straight to Uni-Tech so you get a proper reply.\n\nWhat would you prefer?"
    );
    setQuickReplies(["Try a quick suggestion", "Send my enquiry to Uni-Tech"]);
    botState.lastUser = cleaned;
    saveState(botState);
  };

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    handleUser(textEl.value);
    textEl.value = "";
  });

  // ===== Handoff flow (collect details + send to Formspree) =====
  const startHandoff = async () => {
    botState = { mode: "handoff", step: 1, details: {} };
    saveState(botState);

    addMsg("bot", "No problem — I’ll send this to Uni-Tech.\n\nFirst, what’s your name?");

    setQuickReplies([]);
  };

  const continueHandoff = async (answer) => {
  const d = botState.details || {};
  const a = (answer || "").trim();

  // Step 1: Name
  if (botState.step === 1) {
    d.name = a;
    botState.details = d;
    botState.step = 2;
    saveState(botState);

    addMsg("bot", "Nice one. What email should we reply to?");
    return;
  }

  // Step 2: Email
  if (botState.step === 2) {
    if (!isValidEmail(a)) {
      addMsg("bot", "That email doesn’t look quite right — can you double-check it?");
      return;
    }

    d.email = a;
    botState.details = d;
    botState.step = 3;
    saveState(botState);

    addMsg("bot", "Thanks. What’s your postcode (Kent area)?");
    return;
  }

  // Step 3: Postcode
  if (botState.step === 3) {
    d.postcode = a;
    botState.details = d;
    botState.step = 4;
    saveState(botState);

    addMsg("bot", "What service is this about? (e.g. repair, virus removal, website)");
    return;
  }

  // Step 4: Service
  if (botState.step === 4) {
    d.service = a;
    botState.details = d;
    botState.step = 5;
    saveState(botState);

    addMsg(
      "bot",
      "Finally, briefly describe the issue/request (any device model, symptoms, error messages, etc.)."
    );
    return;
  }

  // Step 5: Message + send
  if (botState.step === 5) {
    d.message = a;
    botState.details = d;
    saveState(botState);

    addMsg("bot", "Sending it now…");

    try {
      await sendToFormspree(d);
      addMsg("bot", "Done ✅ We’ve sent your enquiry to Uni-Tech. You’ll get a reply by email.");
      setQuickReplies(["Start a new chat"]);
      botState = {};
      saveState(botState);
    } catch (err) {
      addMsg("bot", "Sorry — it didn’t send. Please try again, or email enquiries@uni-tech.co.uk.");
      setQuickReplies(["Try sending again", "Start a new chat"]);
      botState.mode = "handoff";
      botState.step = 5; // stay on message step so they can re-send
      saveState(botState);
    }
    return;
  }
};


  async function sendToFormspree(details) {
    // Create a readable transcript (last ~25 messages to avoid huge submissions)
    const lastMsgs = transcript.slice(-25);
    const transcriptText = lastMsgs.map(m => {
      const who = m.from === "bot" ? "Bot" : "User";
      const when = new Date(m.ts).toLocaleString();
      return `[${when}] ${who}: ${m.text} (page: ${m.page})`;
    }).join("\n");

    const fd = new FormData();
    fd.append("name", details.name || "");
    fd.append("email", details.email || "");
    fd.append("service", details.service || "");
    fd.append("message", details.message || "");
    fd.append("page", getPagePath());
    fd.append("transcript", transcriptText);
    fd.append("_subject", "New website chat enquiry (Uni-Tech)");
    fd.append("postcode", details.postcode || "");


    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: fd,
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) throw new Error("Formspree failed");
  }

  // ===== helpers =====
  function isValidEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  // ===== boot =====
  // Render existing transcript into the UI
  const renderTranscript = () => {
    bodyEl.innerHTML = "";
    transcript.forEach(m => {
      const div = document.createElement("div");
      div.className = `chat-msg ${m.from === "bot" ? "bot" : "user"}`;
      div.innerHTML = `<div>${escapeHtml(m.text).replace(/\n/g,"<br>")}</div>`;
      bodyEl.appendChild(div);
    });
    scrollToBottom();
  };

  renderTranscript();
  ensureQuickReplies();


  // If empty transcript, greet
  if (!transcript.length) defaultGreeting();

  // If user hits “Start a new chat”
  quickEl.addEventListener("click", (e) => {
    const t = e.target?.textContent || "";
    if (t === "Start a new chat") {
      transcript = [];
      botState = {};
      saveTranscript(transcript);
      saveState(botState);
      bodyEl.innerHTML = "";
      defaultGreeting();
    }
    if (t === "Try sending again") {
      addMsg("bot", "Okay — please re-send the last message (issue/request) and I’ll try again.");
      botState.mode = "handoff";
      botState.step = 5;
      saveState(botState);
      setQuickReplies([]);
    }
    if (t === "Try a quick suggestion") {
      addMsg("bot",
        "Quick suggestion:\n• Restart the device\n• Check for Windows updates\n• Run a malware scan\n\nIf you tell me what device you have and what exactly is happening, I can be more specific — or I can send it to Uni-Tech."
      );
      setQuickReplies(["Send my enquiry to Uni-Tech"]);
    }
  });
})();
