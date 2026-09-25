const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Opening curtain ----------
const curtain = document.querySelector(".curtain");
function reveal() {
  if (document.body.classList.contains("loaded")) return;
  document.body.classList.add("loaded");
  setTimeout(() => curtain.remove(), reduceMotion ? 0 : 1400);
}
if (reduceMotion) reveal();
else {
  window.addEventListener("load", () => setTimeout(reveal, 500));
  setTimeout(reveal, 2500); // never hold the page hostage to a slow font or image
}

// ---------- Header state ----------
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Mobile overlay menu ----------
const toggle = document.querySelector(".nav-toggle");
const overlay = document.getElementById("overlay-menu");

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  overlay.setAttribute("aria-hidden", String(!open));
}
toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
overlay.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// ---------- Scroll reveals, line drawings, counters ----------
function countUp(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  if (reduceMotion) { el.textContent = target + suffix; return; }
  const start = performance.now();
  const duration = 1800;
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add("in", "is-drawn");
    el.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(el);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

document.querySelectorAll(".reveal, .steps").forEach((el) => io.observe(el));

// ---------- Statement: words light up as you scroll ----------
const statement = document.querySelector("[data-words]");
if (statement) {
  const highlight = new Set(["table.", "scratch,", "love,", "guest"]);
  statement.innerHTML = statement.textContent.trim().split(/\s+/)
    .map((w) => `<span class="w${highlight.has(w) ? " hl" : ""}">${w}</span>`)
    .join(" ");
  const words = statement.querySelectorAll(".w");

  const paint = () => {
    const rect = statement.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the paragraph enters at the bottom third, 1 when it reaches the upper third
    const progress = Math.min(Math.max((vh * 0.85 - rect.top) / (rect.height + vh * 0.35), 0), 1);
    const lit = Math.round(progress * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < lit));
  };
  if (reduceMotion) words.forEach((w) => w.classList.add("on"));
  else {
    window.addEventListener("scroll", () => requestAnimationFrame(paint), { passive: true });
    window.addEventListener("resize", paint);
    paint();
  }
}

// ---------- Menu tabs ----------
const tabs = [...document.querySelectorAll(".menu-tab")];
const indicator = document.querySelector(".tab-indicator");

function moveIndicator(tab) {
  indicator.style.width = tab.offsetWidth + "px";
  indicator.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop + tab.offsetHeight - 1}px)`;
}

function selectTab(tab) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute("aria-controls"));
    panel.classList.toggle("active", on);
    panel.hidden = !on;
  });
  moveIndicator(tab);
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (e) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    next.focus();
    selectTab(next);
  });
});
window.addEventListener("resize", () => moveIndicator(document.querySelector(".menu-tab.active")));
document.fonts && document.fonts.ready.then(() => moveIndicator(document.querySelector(".menu-tab.active")));
moveIndicator(tabs[0]);

// ---------- Testimonials ----------
const quotes = [...document.querySelectorAll(".quote")];
const dots = [...document.querySelectorAll(".quote-dots button")];
const wordsSection = document.querySelector(".words");
let current = 0;
let timer;

function showQuote(n) {
  current = (n + quotes.length) % quotes.length;
  quotes.forEach((q, i) => q.classList.toggle("active", i === current));
  dots.forEach((d, i) => {
    d.classList.remove("active");
    if (i === current) { void d.offsetWidth; d.classList.add("active"); } // restart progress bar
  });
  clearTimeout(timer);
  if (!reduceMotion) timer = setTimeout(() => showQuote(current + 1), 7000);
}
dots.forEach((d, i) => d.addEventListener("click", () => showQuote(i)));
showQuote(0);

// ---------- Occasion rows preselect the enquiry type ----------
document.querySelectorAll(".occasion").forEach((row) =>
  row.addEventListener("click", () => {
    const radio = document.querySelector(`.chips input[value="${row.dataset.type}"]`);
    if (radio) radio.checked = true;
  })
);

// ---------- Enquiry form ----------
const form = document.getElementById("quote-form");
const statusEl = form.querySelector(".form-status");
const card = document.querySelector(".rsvp");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const nameOk = data.name.trim().length > 0;
  const emailOk = /^\S+@\S+\.\S+$/.test(data.email);
  form.querySelector("#f-name").parentElement.classList.toggle("invalid", !nameOk);
  form.querySelector("#f-email").parentElement.classList.toggle("invalid", !emailOk);

  if (!nameOk || !emailOk) {
    statusEl.className = "form-status error";
    statusEl.textContent = "Please add your name and a valid email so we can reply.";
    return;
  }

  const button = form.querySelector("button");
  button.disabled = true;
  statusEl.className = "form-status";
  statusEl.textContent = "Sending…";

  try {
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok || !body.ok) throw new Error(body.error);
    card.querySelector(".thanks").hidden = false;
    card.classList.add("done");
    requestAnimationFrame(() => card.classList.add("is-drawn"));
  } catch (err) {
    statusEl.className = "form-status error";
    statusEl.textContent = err.message || "Something went wrong. Please call or email us instead.";
    button.disabled = false;
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
