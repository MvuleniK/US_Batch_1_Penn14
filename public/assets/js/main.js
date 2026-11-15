/* Top of the Hill — PoC behaviour. Vanilla JS, no dependencies.
   Every feature degrades gracefully: without JS the nav is still reachable via
   the footer, FAQs are native <details>, and all tabs' panels remain readable. */
(function () {
  "use strict";

  var doc = document;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  /* ---- Consent-gated event tracking (proposal only) -------------------------
     Events listed in the assessment: appointment_cta_click, call_ortho_click,
     call_pedo_click, patient_forms_click. Nothing is sent until a consent
     mechanism sets window.TOTH_CONSENT = true. No analytics vendor is wired in. */
  function track(name) {
    if (window.TOTH_CONSENT !== true) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name });
  }
  doc.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-track]");
    if (el) track(el.getAttribute("data-track"));
  });

  /* ---- Sticky header shadow ---- */
  var header = $(".header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-stuck", window.scrollY > 4); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile menu ---- */
  var menu = $("#menu");
  var openBtn = $("#menu-open");
  var closeBtn = $("#menu-close");
  var lastFocus = null;
  function setMenu(open) {
    if (!menu || !openBtn) return;
    menu.classList.toggle("is-open", open);
    openBtn.setAttribute("aria-expanded", String(open));
    doc.body.classList.toggle("no-scroll", open);
    if (open) { lastFocus = doc.activeElement; closeBtn && closeBtn.focus(); }
    else if (lastFocus) { lastFocus.focus(); }
  }
  if (menu && openBtn) {
    openBtn.addEventListener("click", function () { setMenu(true); });
    closeBtn && closeBtn.addEventListener("click", function () { setMenu(false); });
    doc.addEventListener("keydown", function (e) {
      if (!menu.classList.contains("is-open")) return;
      if (e.key === "Escape") { setMenu(false); return; }
      if (e.key === "Tab") { /* keep focus inside the open menu */
        var f = $$("a, button", menu).filter(function (n) { return n.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.matchMedia("(min-width: 1140px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });
  }

  /* ---- "Which office?" call sheet (native <dialog>) ---- */
  var sheet = $("#call-sheet");
  $$("[data-open-call]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (sheet && typeof sheet.showModal === "function") { sheet.showModal(); }
      else { window.location.href = "contact.html#call"; }
    });
  });
  $$("[data-close-call]").forEach(function (b) { b.addEventListener("click", function () { sheet && sheet.close(); }); });
  if (sheet) {
    sheet.addEventListener("click", function (e) { if (e.target === sheet) sheet.close(); });
  }

  /* ---- Hide mobile bar while the footer is in view, so it never covers footer content ---- */
  var bar = $(".mobilebar");
  var footer = $(".footer");
  if (bar && footer && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      bar.classList.toggle("is-hidden", entries[0].isIntersecting);
    }, { rootMargin: "0px 0px -10% 0px" }).observe(footer);
  }

  /* ---- Tabs (ARIA tabs pattern with arrow-key support) ---- */
  $$("[data-tabs]").forEach(function (root) {
    var tabs = $$('[role="tab"]', root);
    var panels = tabs.map(function (t) { return doc.getElementById(t.getAttribute("aria-controls")); });
    function select(i, focus) {
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        if (panels[n]) panels[n].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") n = 0;
        else if (e.key === "End") n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
    });
    var wanted = (location.hash || "").replace("#", "");
    var start = tabs.findIndex(function (t) { return t.getAttribute("aria-controls") === wanted; });
    select(start > -1 ? start : 0);
    window.addEventListener("hashchange", function () {
      var h = location.hash.replace("#", "");
      var idx = tabs.findIndex(function (t) { return t.getAttribute("aria-controls") === h; });
      if (idx > -1) select(idx);
    });
  });

  /* ---- Testimonials: filter + progressive reveal ---- */
  var qGrid = $("#quote-grid");
  if (qGrid) {
    var quotes = $$(".quote", qGrid);
    var more = $("#quote-more");
    var search = $("#quote-search");
    var count = $("#quote-count");
    var PAGE = 12, shown = PAGE;
    function render() {
      var term = (search && search.value || "").trim().toLowerCase();
      var matches = 0, visible = 0;
      quotes.forEach(function (q) {
        var hit = !term || q.textContent.toLowerCase().indexOf(term) > -1;
        if (hit) matches++;
        var show = hit && (term ? true : visible < shown);
        if (show) visible++;
        q.hidden = !show;
      });
      if (count) count.textContent = "Showing " + visible + " of " + matches + (term ? " matching" : "") + " testimonials";
      if (more) more.hidden = !!term || visible >= matches;
    }
    more && more.addEventListener("click", function () { shown += PAGE; render(); });
    search && search.addEventListener("input", render);
    render();
  }

  /* ---- Review mode: show or hide owner-review source notes ----
     ON by default for the owner review (set early by an inline script in <head>).
     Turn it off for the clean, launch-style view. Preference is remembered per browser. */
  var root = doc.documentElement;
  function setReview(on) {
    root.setAttribute("data-review", on ? "on" : "off");
    $$("[data-review-switch]").forEach(function (s) { s.setAttribute("aria-checked", String(on)); });
    try { localStorage.setItem("toth-review", on ? "on" : "off"); } catch (e) { /* storage unavailable */ }
  }
  var reviewOn = root.getAttribute("data-review") !== "off";
  $$("[data-review-switch]").forEach(function (s) {
    s.setAttribute("aria-checked", String(reviewOn));
    s.addEventListener("click", function () { setReview(root.getAttribute("data-review") === "off"); });
  });

  /* ---- Footer year ---- */
  $$("[data-year]").forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
})();
