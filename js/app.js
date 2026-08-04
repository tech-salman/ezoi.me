/* ezoi.me — interactivity: cookies, theme, navigation, caching */
(function () {
  "use strict";

  var THEME_COOKIE = "ezoi_theme";
  var CONSENT_COOKIE = "ezoi_consent";
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

  /* ---------- Cookies ---------- */
  function setCookie(name, value, maxAge) {
    try {
      document.cookie =
        encodeURIComponent(name) + "=" + encodeURIComponent(value) +
        ";path=/;max-age=" + (maxAge || COOKIE_MAX_AGE) +
        ";samesite=lax;secure";
    } catch (e) {}
  }
  function getCookie(name) {
    try {
      var m = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) { return null; }
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    var dark = theme !== "light";
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", String(dark));
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      btn.textContent = dark ? "☀" : "☾";
    }
  }
  function initTheme() {
    var saved = getCookie(THEME_COOKIE);
    if (!saved) {
      var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
      saved = prefersLight ? "light" : "dark";
    }
    applyTheme(saved);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
        var next = current === "light" ? "dark" : "light";
        applyTheme(next);
        setCookie(THEME_COOKIE, next);
        toast(next === "light" ? "Light theme enabled" : "Dark theme enabled");
      });
    }
  }

  /* ---------- Cookie consent banner ---------- */
  function initConsent() {
    var banner = document.getElementById("cookie-banner");
    if (!banner) return;
    if (getCookie(CONSENT_COOKIE)) {
      banner.hidden = true;
      return;
    }
    banner.hidden = false;
    var accept = document.getElementById("cookie-accept");
    var reject = document.getElementById("cookie-reject");
    var close = document.getElementById("cookie-close");
    function decide(choice) {
      setCookie(CONSENT_COOKIE, choice);
      banner.hidden = true;
      toast(choice === "accepted" ? "Thanks! Preferences saved." : "Only essential cookies used.");
    }
    if (accept) accept.addEventListener("click", function () { decide("accepted"); });
    if (reject) reject.addEventListener("click", function () { decide("rejected"); });
    if (close) close.addEventListener("click", function () { decide("accepted"); });
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  /* ---------- Sidebar menu (existing behavior, enhanced) ---------- */
  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var sidebar = document.getElementById("sidebar-menu");
    var overlay = document.querySelector(".menu-overlay");
    if (!toggle || !sidebar) return;

    function close() {
      sidebar.classList.remove("is-open");
      if (overlay) overlay.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      sidebar.setAttribute("aria-hidden", "true");
    }
    function open() {
      sidebar.classList.add("is-open");
      if (overlay) overlay.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      sidebar.setAttribute("aria-hidden", "false");
    }
    toggle.addEventListener("click", function () {
      if (sidebar.classList.contains("is-open")) close(); else open();
    });
    if (overlay) overlay.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sidebar.classList.contains("is-open")) close();
    });
    // close after navigating
    sidebar.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    window.__closeMenu = close;
  }

  /* ---------- Active nav highlight (scroll spy) ---------- */
  function initScrollSpy() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("section[id], [id].section"));
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".sidebar-nav a"));
    if (!sections.length || !navLinks.length) return;
    function onScroll() {
      var pos = window.scrollY + 120;
      var current = null;
      sections.forEach(function (s) {
        if (s.offsetTop <= pos) current = s.id;
      });
      navLinks.forEach(function (a) {
        var href = a.getAttribute("href") || "";
        a.classList.toggle("active", href.indexOf("#" + current) !== -1 || href === "/" + current);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll progress bar ---------- */
  function initProgress() {
    var bar = document.getElementById("scroll-progress");
    if (!bar) return;
    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (h.scrollTop || window.scrollY) / max * 100 : 0;
      bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    if (!btn) return;
    function onScroll() {
      btn.classList.toggle("show", (window.scrollY || document.documentElement.scrollTop) > 500);
    }
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Copy email ---------- */
  function initCopyEmail() {
    var btn = document.getElementById("copy-email");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var email = btn.getAttribute("data-email") || "salman.nadeem.com@gmail.com";
      var done = function () { toast("Email copied to clipboard"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { fallbackCopy(email); done(); });
      } else { fallbackCopy(email); done(); }
    });
  }
  function fallbackCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) {}
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".panel, .top-banner"));
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in-view"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    items.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  /* ---------- Smooth in-page scroll ---------- */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (window.__closeMenu) window.__closeMenu();
      }
    });
  }

  /* ---------- Register service worker ---------- */
  function initSW() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js").catch(function () {});
      });
    }
  }

  /* ---------- Boot ---------- */
  function boot() {
    initTheme();
    initConsent();
    initMenu();
    initScrollSpy();
    initProgress();
    initBackToTop();
    initCopyEmail();
    initReveal();
    initSmoothScroll();
    initSW();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
