(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const slides = $$(".slide");
  const navBtns = $$("#nav button");
  const total = slides.length;
  const visited = new Set();
  let current = -1;

  if (new URLSearchParams(location.search).has("debug")) document.body.classList.add("debug");

  /* ---------------- Navigation ---------------- */
  function go(i, { push = true } = {}) {
    i = Math.max(0, Math.min(total - 1, i));
    if (i === current) return;
    slides.forEach((s, n) => s.classList.toggle("active", n === i));
    navBtns.forEach((b, n) => {
      b.setAttribute("aria-current", n === i ? "true" : "false");
      if (visited.has(n)) b.classList.add("visited");
    });
    current = i;
    visited.add(i);
    slides[i].scrollTop = 0;

    const pad = (n) => String(n).padStart(2, "0");
    $("#counter").textContent = `${pad(i)} / ${pad(total - 1)}`;
    $("#progress").style.width = `${(i / (total - 1)) * 100}%`;
    $("#crumb").textContent = slides[i].dataset.title;
    $("#visitedCount").textContent = `${visited.size} / ${total}`;
    $("#visitedMeter").style.width = `${(visited.size / total) * 100}%`;
    document.title = i === 0 ? "Sustainable AI · Digital Twins" : `${slides[i].dataset.title} · Sustainable AI`;
    if (push) history.replaceState(null, "", `#${i}`);
    document.body.classList.remove("nav-open");
    hideLabel();
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go]");
    if (t) go(Number(t.dataset.go));
  });
  $("#prevBtn").addEventListener("click", () => go(current - 1));
  $("#nextBtn").addEventListener("click", () => go(current + 1));
  $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("nav-open"));

  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    if ($("#lightbox").classList.contains("open")) {
      if (e.key === "Escape") closeLightbox();
      return;
    }
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(current + 1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(current - 1); }
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(total - 1);
    else if (e.key.toLowerCase() === "f") togglePresent();
  });

  // Swipe between modules on touch devices (horizontal only)
  let tx = 0, ty = 0;
  $("#stage").addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  $("#stage").addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  window.addEventListener("hashchange", () => go(parseInt(location.hash.slice(1), 10) || 0, { push: false }));

  /* ---------------- Present / fullscreen ---------------- */
  function togglePresent() {
    const on = !document.body.classList.contains("present");
    document.body.classList.toggle("present", on);
    if (on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
    if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }
  $("#presentBtn").addEventListener("click", togglePresent);
  $$("[data-present]").forEach((b) => b.addEventListener("click", togglePresent));
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) document.body.classList.remove("present");
  });

  /* ---------------- Glowing hotspots ---------------- */
  const label = $("#hsLabel");
  function showLabel(hs) {
    const text = hs.dataset.tip || hs.getAttribute("aria-label");
    if (!text) return;
    const r = hs.getBoundingClientRect();
    label.textContent = text;
    label.style.setProperty("--c", getComputedStyle(hs).getPropertyValue("--c"));
    label.style.left = `${r.left + r.width / 2}px`;
    label.style.top = `${r.top}px`;
    label.classList.add("show");
  }
  function hideLabel() { label.classList.remove("show"); }

  $$(".figure.interactive").forEach((fig) => {
    const panel = fig.dataset.detail ? document.getElementById(fig.dataset.detail) : null;
    const spots = $$(".hs", fig);
    const chips = panel ? $$(".detail-list button", panel) : [];
    const items = panel ? $$(".detail-item", panel) : [];
    let pinned = null;

    const light = (key) => {
      spots.forEach((s) => s.classList.toggle("lit", !!key && s.dataset.key === key));
      fig.classList.toggle("focusing", !!key);
    };
    const show = (key) => {
      if (!panel || !key) return;
      if (!items.some((it) => it.dataset.key === key)) return;
      items.forEach((it) => it.classList.toggle("on", it.dataset.key === key));
      chips.forEach((c) => c.classList.toggle("on", c.dataset.key === key));
    };
    const reset = () => { light(pinned); show(pinned || items[0]?.dataset.key); };

    spots.forEach((s) => {
      s.addEventListener("mouseenter", () => { light(s.dataset.key || null); fig.classList.add("focusing"); show(s.dataset.key); showLabel(s); });
      s.addEventListener("mouseleave", () => { hideLabel(); fig.classList.remove("focusing"); reset(); });
      s.addEventListener("focus", () => { show(s.dataset.key); showLabel(s); });
      s.addEventListener("blur", hideLabel);
      s.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!s.dataset.key) return;
        pinned = pinned === s.dataset.key ? null : s.dataset.key;
        light(pinned);
        show(s.dataset.key);
      });
    });

    chips.forEach((c) => {
      c.addEventListener("mouseenter", () => light(c.dataset.key));
      c.addEventListener("mouseleave", () => light(pinned));
      c.addEventListener("click", () => { pinned = c.dataset.key; light(pinned); show(pinned); });
    });

    reset();
  });

  /* ---------------- Tabs ---------------- */
  $$("[data-tabs]").forEach((bar) => {
    const root = bar.parentElement;
    $$("button", bar).forEach((b) => b.addEventListener("click", () => {
      $$("button", bar).forEach((x) => x.classList.toggle("on", x === b));
      $$(".tab-panel", root).forEach((p) => p.classList.toggle("on", p.dataset.panel === b.dataset.tab));
    }));
  });

  /* ---------------- Lightbox ---------------- */
  const lb = $("#lightbox");
  function closeLightbox() { lb.classList.remove("open"); }
  $$("[data-zoom]").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const img = $("img", b.closest(".figure"));
    $("img", lb).src = img.src;
    $("img", lb).alt = img.alt;
    lb.classList.add("open");
  }));
  lb.addEventListener("click", closeLightbox);

  /* ---------------- Ambient telemetry ---------------- */
  const clock = $("#clock");
  const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour12: false }); };
  tick(); setInterval(tick, 1000);
  setInterval(() => { $("#latency").textContent = `${6 + Math.round(Math.random() * 5)} ms`; }, 2200);

  const log = [
    ["o", "observe", "ingesting telemetry · 512 IoT streams · MQTT/Kafka"],
    ["r", "orient", "state estimation · bearing friction +14.2% vs baseline"],
    ["d", "decide", "what-if sandbox · 3 paths · optimal: speed −15%"],
    ["a", "act", "dispatching PLC command · confidence 98.7%"],
    ["o", "observe", "grid feed · solar ramp-down forecast 17:40"],
    ["r", "orient", "carbon intensity rising · 412 gCO₂/kWh"],
    ["d", "decide", "shift batch workload → low-carbon window"],
    ["a", "act", "microgrid-aware failover armed · Scope 2 −8%"],
    ["o", "observe", "city twin · 500+ sources · intersection density ↑"],
    ["r", "orient", "corridor congestion anomaly · sector 7"],
    ["d", "decide", "re-optimize signal plan (4 min loop)"],
    ["a", "act", "green corridor opened for emergency vehicle"],
  ];
  const term = $("#termBody");
  let li = 0;
  const caret = document.createElement("div");
  caret.className = "term-line";
  caret.innerHTML = '<span class="t">$</span> <span class="caret"></span>';
  function pushLine() {
    const [cls, phase, msg] = log[li++ % log.length];
    const line = document.createElement("div");
    line.className = "term-line";
    const t = new Date().toLocaleTimeString([], { hour12: false });
    line.innerHTML = `<span class="t">${t}</span> <span class="${cls}">[${phase}]</span> ${msg}`;
    term.insertBefore(line, caret);
    while (term.children.length > 11) term.removeChild(term.firstChild);
  }
  term.appendChild(caret);
  for (let k = 0; k < 6; k++) pushLine();
  setInterval(pushLine, 1800);

  /* ---------------- Init ---------------- */
  go(parseInt(location.hash.slice(1), 10) || 0, { push: false });
})();
