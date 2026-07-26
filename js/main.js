/* ============================================================
   KPR — concept recreation
   ============================================================ */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ----------------------------------------------------------
     SCRAMBLE / DECODE TEXT
  ---------------------------------------------------------- */
  const GLYPHS = "!<>-_\\/[]{}=+*^?#—01";
  const rndGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

  function scrambleTo(el, finalText, duration = 900) {
    if (el._scrambleRaf) cancelAnimationFrame(el._scrambleRaf);
    const start = performance.now();
    const len = finalText.length;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const reveal = Math.floor(p * len);
      let out = finalText.slice(0, reveal);
      for (let i = reveal; i < len; i++) {
        out += finalText[i] === " " ? " " : rndGlyph();
      }
      el.textContent = out;
      if (p < 1) el._scrambleRaf = requestAnimationFrame(tick);
      else { el.textContent = finalText; el._scrambleRaf = null; }
    };
    el._scrambleRaf = requestAnimationFrame(tick);
  }

  // Reveal .scramble elements when they enter the viewport
  const scrambleObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el._done) return;
      el._done = true;
      scrambleTo(el, el.dataset.text, 1000);
      scrambleObserver.unobserve(el);
    });
  }, { threshold: 0.4 });

  function initScrambles() {
    $$(".scramble").forEach((el) => {
      el.dataset.text = el.textContent;
      scrambleObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     PRELOADER
  ---------------------------------------------------------- */
  const FILES = [
    "kpr_core.sys", "keeper_story.dat", "new_eden.map", "signal_v004.wav",
    "tableaux_01.glb", "faction_index.json", "kai_shard.bin", "protocol.cfg",
    "gallery_pack.arc", "mainnet_handshake"
  ];
  const preloader = $("#preloader");
  const prePct = $("#pre-pct");
  const preProgress = $("#pre-progress");
  const preFile = $("#pre-file");
  let progress = 0, fileIdx = 0;

  function stepPreloader() {
    progress = Math.min(100, progress + 2 + Math.random() * 9);
    prePct.textContent = Math.floor(progress);
    preProgress.style.transform = `scaleX(${progress / 100})`;
    if (Math.random() < 0.5) {
      fileIdx = (fileIdx + 1) % FILES.length;
      preFile.textContent = FILES[fileIdx];
    }
    if (progress < 100) {
      setTimeout(stepPreloader, 90 + Math.random() * 160);
    } else {
      prePct.textContent = "100";
      preloader.classList.add("ready");
      $(".pre-center").style.opacity = "0.25";
    }
  }

  function dismissPreloader() {
    if (!preloader.classList.contains("ready") || preloader.classList.contains("done")) return;
    preloader.classList.add("done");
    preloader.classList.remove("show");
    setTimeout(() => preloader.remove(), 500);
    startHeroCycle();
  }

  /* ----------------------------------------------------------
     HERO — rotating word + readout percent
  ---------------------------------------------------------- */
  const HERO_WORDS = ["KEEP", "PROTECT", "REIMAGINE"];
  const heroWord = $("#hero-word");
  let heroIdx = 0, heroTimer = null;

  function startHeroCycle() {
    scrambleTo(heroWord, HERO_WORDS[0], 800);
    heroTimer = setInterval(() => {
      heroIdx = (heroIdx + 1) % HERO_WORDS.length;
      scrambleTo(heroWord, HERO_WORDS[heroIdx], 850);
    }, 2800);
  }

  // Fake telemetry percent drifting around 40–60
  const heroPctEl = $("#hero-pct");
  let heroPct = 0;
  setInterval(() => {
    if (heroPct < 47) heroPct += 1 + ((Math.random() * 3) | 0);
    else heroPct = 40 + ((Math.random() * 20) | 0);
    heroPctEl.textContent = Math.min(99, heroPct);
  }, 420);

  /* ----------------------------------------------------------
     SCROLL — progress bar, theme, subnav
  ---------------------------------------------------------- */
  const progressFill = $("#progress-fill");
  const progressLine = $("#progress-line");
  const sections = $$("#page .sec, #footer");
  const subnavLinks = $$(".frame-subnav a");
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      progressFill.style.transform = `scaleX(${p})`;
      progressLine.style.transform = `scaleX(${p})`;

      // Section under viewport center drives theme + subnav
      const mid = innerHeight * 0.5;
      let current = null;
      for (const sec of sections) {
        const r = sec.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) { current = sec; break; }
      }
      if (current) {
        const theme = current.dataset.theme || "dark";
        if (document.body.dataset.theme !== theme) document.body.dataset.theme = theme;
        const id = current.id;
        subnavLinks.forEach((a) => a.classList.toggle("active", a.dataset.nav === id));
      }
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  /* ----------------------------------------------------------
     MENU
  ---------------------------------------------------------- */
  const menu = $("#menu");
  const burger = $("#burger");

  function setMenu(open) {
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  $("#menu-close").addEventListener("click", () => setMenu(false));
  $(".menu-underlay").addEventListener("click", () => setMenu(false));
  $$(".menu-link, .menu-sub", menu).forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );
  $$(".menu-link", menu).forEach((a) => {
    a.addEventListener("mouseenter", () => {
      const t = $(".ml-text", a);
      scrambleTo(t, t.textContent, 350);
    });
  });

  /* ----------------------------------------------------------
     CONSOLE
  ---------------------------------------------------------- */
  const consoleEl = $("#console");
  const consoleInput = $("#console-input");
  const ciTyped = $("#ci-typed");
  const ciPlaceholder = $("#ci-placeholder");
  const consoleLog = $("#console-log");
  const consoleScroll = $("#console-scroll");

  function setConsole(open) {
    consoleEl.classList.toggle("open", open);
    consoleEl.setAttribute("aria-hidden", String(!open));
    if (open) setTimeout(() => consoleInput.focus(), 300);
  }
  $("#btn-console").addEventListener("click", () => setConsole(true));
  $("#console-close").addEventListener("click", () => setConsole(false));
  $(".console-underlay").addEventListener("click", () => setConsole(false));

  function logLine(text, cls = "") {
    const p = document.createElement("p");
    if (cls) p.className = cls;
    p.textContent = text;
    consoleLog.appendChild(p);
    consoleScroll.scrollTop = consoleScroll.scrollHeight;
  }

  const COMMANDS = {
    help() {
      logLine("//Available commands:", "ok");
      ["HELP — list commands", "STORY — back to the beginning", "GALLERY — view the collection",
       "AUDIO — toggle sound", "VERSION — build info", "CLEAR — purge terminal"]
        .forEach((l) => logLine("  " + l));
    },
    story() { logLine("//Returning to origin…", "ok"); setConsole(false); location.hash = "#hero"; },
    gallery() { logLine("//Opening collection…", "ok"); setConsole(false); location.hash = "#collection"; },
    audio() { toggleAudio(); logLine(`//Audio ${audioOn ? "enabled" : "muted"}`, "ok"); },
    version() { logLine("//KPR Protocol v2.4.1 — build cf95-69476276", "ok"); },
    clear() { consoleLog.innerHTML = ""; logLine("//Terminal purged"); },
    whoami() { logLine("//Keeper #0000 — unminted", "ok"); },
  };

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    logLine("> " + cmd);
    if (COMMANDS[cmd]) COMMANDS[cmd]();
    else logLine(`//Unknown command: ${cmd} — type HELP`, "err");
  }

  consoleInput.addEventListener("input", () => {
    ciTyped.textContent = consoleInput.value;
    ciPlaceholder.classList.toggle("hidden", consoleInput.value.length > 0);
  });
  consoleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      runCommand(consoleInput.value);
      consoleInput.value = "";
      ciTyped.textContent = "";
      ciPlaceholder.classList.remove("hidden");
    }
  });
  $("#ci-enter").addEventListener("click", () => {
    runCommand(consoleInput.value);
    consoleInput.value = "";
    ciTyped.textContent = "";
    ciPlaceholder.classList.remove("hidden");
  });
  $$(".command-item").forEach((b) =>
    b.addEventListener("click", () => runCommand(b.dataset.cmd))
  );

  /* ----------------------------------------------------------
     AUDIO (visual EQ toggle + WebAudio hum after user gesture)
  ---------------------------------------------------------- */
  let audioOn = false, actx = null, hum = null;
  const btnAudio = $("#btn-audio");

  function toggleAudio() {
    audioOn = !audioOn;
    btnAudio.classList.toggle("playing", audioOn);
    if (audioOn) startHum(); else stopHum();
  }
  function startHum() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = actx.createOscillator();
      const osc2 = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = "sine"; osc.frequency.value = 55;
      osc2.type = "sine"; osc2.frequency.value = 55.7;
      gain.gain.value = 0.0;
      gain.gain.linearRampToValueAtTime(0.035, actx.currentTime + 1.2);
      osc.connect(gain); osc2.connect(gain); gain.connect(actx.destination);
      osc.start(); osc2.start();
      hum = { osc, osc2, gain };
    } catch { /* audio unavailable */ }
  }
  function stopHum() {
    if (!hum) return;
    try {
      hum.gain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.3);
      setTimeout(() => { hum.osc.stop(); hum.osc2.stop(); }, 400);
    } catch { /* noop */ }
    hum = null;
  }
  btnAudio.addEventListener("click", toggleAudio);

  // Wallet button → playful console message
  $("#btn-wallet").addEventListener("click", () => {
    setMenu(false);
    setConsole(true);
    logLine("//Wallet bridge offline in this concept build", "err");
  });

  /* ----------------------------------------------------------
     COLLECTION COUNT-UP
  ---------------------------------------------------------- */
  const countEl = $("#count");
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countObserver.disconnect();
      const target = +countEl.dataset.target;
      const start = performance.now(), dur = 1900;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        countEl.textContent = Math.floor(eased * target).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.35 });
  if (countEl) countObserver.observe(countEl);

  /* ----------------------------------------------------------
     LIVE COUNTER drift
  ---------------------------------------------------------- */
  const liveEls = [$("#live-count"), $(".live-count-mirror")].filter(Boolean);
  let live = 28;
  setInterval(() => {
    live = Math.max(21, Math.min(36, live + (Math.random() < 0.5 ? -1 : 1)));
    liveEls.forEach((el) => (el.textContent = live));
  }, 4000);

  /* ----------------------------------------------------------
     BACKGROUND CANVAS — grid, particles, scanline, glitches
  ---------------------------------------------------------- */
  const canvas = $("#bg-canvas");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  const particles = [];
  const glitches = [];
  let scanY = 0, mouseX = 0.5, mouseY = 0.5;

  function resizeCanvas() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  addEventListener("resize", resizeCanvas);
  addEventListener("pointermove", (e) => {
    mouseX = e.clientX / W; mouseY = e.clientY / H;
  }, { passive: true });

  function spawnParticles() {
    particles.length = 0;
    const n = Math.floor((W * H) / 26000);
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() < 0.12 ? 2 : 1,
        green: Math.random() < 0.1,
        a: 0.15 + Math.random() * 0.5,
      });
    }
  }
  spawnParticles();
  addEventListener("resize", spawnParticles);

  function drawGrid() {
    const step = 90;
    const ox = (mouseX - 0.5) * 10, oy = (mouseY - 0.5) * 10;
    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = (ox % step); x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = (oy % step); y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    drawGrid();

    // particles
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.green ? "#c0fb50" : "#fff";
      ctx.fillRect(p.x, p.y, p.r, p.r);
    }
    ctx.globalAlpha = 1;

    // scanline
    scanY = (scanY + 0.6) % (H + 160);
    const grad = ctx.createLinearGradient(0, scanY - 80, 0, scanY);
    grad.addColorStop(0, "rgba(192,251,80,0)");
    grad.addColorStop(1, "rgba(192,251,80,0.05)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 80, W, 80);

    // occasional glitch bars
    if (Math.random() < 0.012 && glitches.length < 3) {
      glitches.push({ y: Math.random() * H, h: 2 + Math.random() * 14, life: 4 + (Math.random() * 6) | 0, dx: (Math.random() - 0.5) * 40 });
    }
    for (let i = glitches.length - 1; i >= 0; i--) {
      const g = glitches[i];
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(g.dx, g.y, W, g.h);
      ctx.fillStyle = "rgba(192,251,80,0.08)";
      ctx.fillRect(-g.dx, g.y + 1, W, 1);
      if (--g.life <= 0) glitches.splice(i, 1);
    }

    requestAnimationFrame(drawFrame);
  }
  drawFrame();

  /* ----------------------------------------------------------
     GLOBAL KEYS
  ---------------------------------------------------------- */
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { setMenu(false); setConsole(false); }
    if (e.key === "Enter" && preloader && preloader.isConnected) dismissPreloader();
  });

  /* ----------------------------------------------------------
     BOOT
  ---------------------------------------------------------- */
  $("#pre-enter").addEventListener("click", dismissPreloader);
  initScrambles();
  onScroll();
  setTimeout(stepPreloader, 350);

  // Test/dev hooks: ?skip (jump past preloader), ?menu, ?console
  const params = new URLSearchParams(location.search);
  if (params.has("skip")) {
    document.documentElement.style.scrollBehavior = "auto";
    const st = document.createElement("style");
    st.textContent = "*{transition:none!important}";
    document.head.appendChild(st);
    preloader.remove();
    startHeroCycle();
  }
  if (params.has("menu")) setMenu(true);
  if (params.has("console")) setConsole(true);
  if (params.has("only")) {
    const target = params.get("only");
    $$("#page .sec, #footer").forEach((sec) => {
      sec.style.display = sec.id === target ? "" : "none";
    });
    const t = document.getElementById(target);
    if (t) document.body.dataset.theme = t.dataset.theme || "dark";
    onScroll();
  }
})();
