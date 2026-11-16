/* Page behaviour the kit does not provide: the call sheet, review mode and the testimonial wall.
   The nav, phone bar, hover layer, hero entrance and moments are the kit's (system.js, motion.js, moments). */
(function () {
  "use strict";
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ---- Consent-gated event hooks (proposal only; nothing is sent until consent sets window.TOTH_CONSENT) ---- */
  doc.addEventListener("click", function (e) {
    var el = e.target.closest && e.target.closest("[data-track]");
    if (el && window.TOTH_CONSENT === true) { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: el.getAttribute("data-track") }); }
  });

  /* ---- Call sheet ---- */
  var sheet = $("#call-sheet");
  $$("[data-open-call]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (sheet && typeof sheet.showModal === "function") sheet.showModal(); else location.href = "contact.html#call";
    });
  });
  $$("[data-close-call]").forEach(function (b) { b.addEventListener("click", function () { sheet && sheet.close(); }); });
  if (sheet) sheet.addEventListener("click", function (e) { if (e.target === sheet) sheet.close(); });

  /* ---- Review mode (owner-review notes): off by default, remembered per browser ---- */
  var root = doc.documentElement;
  function sync() { $$("[data-review-switch]").forEach(function (s) { s.setAttribute("aria-checked", String(root.getAttribute("data-review") === "on")); }); }
  $$("[data-review-switch]").forEach(function (s) {
    s.addEventListener("click", function () {
      var on = root.getAttribute("data-review") !== "on";
      root.setAttribute("data-review", on ? "on" : "off");
      try { localStorage.setItem("toth-review", on ? "on" : "off"); } catch (e) { /* storage unavailable */ }
      sync();
    });
  });
  sync();
})();
