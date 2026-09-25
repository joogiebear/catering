// Mobile nav
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

toggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Menu tabs
document.querySelectorAll(".tab").forEach((tab) =>
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.toggle("active", t === tab);
      t.setAttribute("aria-selected", String(t === tab));
    });
    document.querySelectorAll(".menu-panel").forEach((panel) =>
      panel.classList.toggle("active", panel.id === tab.dataset.tab)
    );
  })
);

// Quote form
const form = document.getElementById("quote-form");
const status = form.querySelector(".form-status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));

  if (!data.name.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) {
    status.className = "form-status error";
    status.textContent = "Please add your name and a valid email address.";
    return;
  }

  const button = form.querySelector("button");
  button.disabled = true;
  status.className = "form-status";
  status.textContent = "Sending...";

  try {
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok || !body.ok) throw new Error(body.error || "Something went wrong.");
    form.reset();
    status.className = "form-status success";
    status.textContent = "Thanks! We'll be in touch within 24 hours.";
  } catch (err) {
    status.className = "form-status error";
    status.textContent = err.message || "Something went wrong. Please call or email us instead.";
  } finally {
    button.disabled = false;
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
