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
const themeColor = document.querySelector('meta[name="theme-color"]');
// Match Safari's status-bar area to the current header color.
const onScroll = () => {
  const scrolled = window.scrollY > 40;
  header.classList.toggle("scrolled", scrolled);
  themeColor.content = scrolled && !document.body.classList.contains("menu-open") ? "#faf7f1" : "#15231c";
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Mobile overlay menu ----------
const toggle = document.querySelector(".nav-toggle");
const overlay = document.getElementById("overlay-menu");

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  onScroll();
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  overlay.setAttribute("aria-hidden", String(!open));
  overlay.inert = !open;
  if (open) overlay.querySelector("a").focus();
}
toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
overlay.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (!document.body.classList.contains("menu-open")) return;
  if (e.key === "Escape") {
    setMenu(false);
    toggle.focus();
  }
  if (e.key === "Tab") {
    const links = [...overlay.querySelectorAll("a")];
    const first = links[0];
    const last = links[links.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// ---------- Scroll reveals ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add("in", "is-drawn");
    io.unobserve(el);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

document.querySelectorAll(".reveal, .steps").forEach((el) => io.observe(el));

// ---------- Statement: words light up as you scroll ----------
const statement = document.querySelector("[data-words]");
if (statement) {
  const highlight = new Set(["table", "story,", "toast,", "longer."]);
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
    if (!dir && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next = e.key === "Home" ? tabs[0] : e.key === "End" ? tabs[tabs.length - 1] : tabs[(i + dir + tabs.length) % tabs.length];
    next.focus();
    selectTab(next);
  });
});
window.addEventListener("resize", () => moveIndicator(document.querySelector(".menu-tab.active")));
document.fonts && document.fonts.ready.then(() => moveIndicator(document.querySelector(".menu-tab.active")));
moveIndicator(tabs[0]);

// ---------- Quote request preview (no network or storage) ----------
const quoteForm = document.getElementById("quote-preview-form");
quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!quoteForm.reportValidity()) return;

  quoteForm.reset();
  document.getElementById("quote-form-status").textContent =
    "Preview complete. Your request was not sent or saved. A live site would send these details to the catering team for a tailored quote.";
});

document.getElementById("year").textContent = new Date().getFullYear();
