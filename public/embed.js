/* ProofBell embeddable widget — vanilla, no deps.
   Usage: <script src="https://proofbell.com/embed.js" data-key="pk_xxx" async></script> */
(function () {
  "use strict";
  var script =
    document.currentScript ||
    document.querySelector("script[data-key][src*='embed.js']") ||
    document.querySelector("script[data-key]");
  if (!script) return;
  var key = script.getAttribute("data-key");
  if (!key) return;
  var base = new URL(script.src).origin;

  function timeAgo(iso) {
    var s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "just now";
    var m = Math.floor(s / 60);
    if (m < 60) return m + (m === 1 ? " minute ago" : " minutes ago");
    var h = Math.floor(m / 60);
    if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
    var d = Math.floor(h / 24);
    return d + (d === 1 ? " day ago" : " days ago");
  }

  function money(cents, currency) {
    if (cents == null) return "";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: (currency || "usd").toUpperCase(),
        maximumFractionDigits: 0,
      }).format(cents / 100);
    } catch {
      return "$" + Math.round(cents / 100);
    }
  }

  function line(ev) {
    var who = ev.name || "Someone";
    var where = ev.location ? " in " + ev.location : "";
    switch (ev.type) {
      case "subscribe":
        return who + where + " just subscribed";
      case "purchase":
        var amt = money(ev.amount_cents, ev.currency);
        return who + where + " just purchased" + (amt ? " (" + amt + ")" : "");
      case "signup":
        return who + where + " just signed up";
      default:
        return ev.title || who + where + " took action";
    }
  }

  function inject(cfg) {
    var pos = cfg.position || "bottom-left";
    var vert = pos.indexOf("top") === 0 ? "top:20px;" : "bottom:20px;";
    var horz = pos.indexOf("right") !== -1 ? "right:20px;" : "left:20px;";
    var dark = cfg.theme === "dark";
    var css =
      ".pbell{position:fixed;z-index:2147483600;" +
      vert +
      horz +
      "max-width:330px;font:14px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" +
      "transform:translateY(12px);opacity:0;transition:transform .35s ease,opacity .35s ease;pointer-events:none}" +
      ".pbell.show{transform:translateY(0);opacity:1}" +
      ".pbell-card{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;" +
      "background:" +
      (dark ? "#1f2937" : "#fff") +
      ";color:" +
      (dark ? "#f3f4f6" : "#111827") +
      ";" +
      "box-shadow:0 8px 30px rgba(0,0,0,.18);border:1px solid " +
      (dark ? "#374151" : "#eef0f3") +
      "}" +
      ".pbell-dot{flex:none;width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;" +
      "background:linear-gradient(135deg,#6366f1,#ec4899);color:#fff;font-size:16px}" +
      ".pbell-msg{font-weight:600}.pbell-meta{font-size:12px;opacity:.6;margin-top:2px}" +
      ".pbell-brand{font-size:10px;opacity:.45;margin-top:6px;text-align:right}" +
      ".pbell-brand a{color:inherit;text-decoration:none}";
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    var box = document.createElement("div");
    box.className = "pbell";
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
    return box;
  }

  function run(cfg, events) {
    if (!events || !events.length) return;
    var box = inject(cfg);
    var i = 0;
    var showMs = (cfg.display_seconds || 5) * 1000;
    var gapMs = (cfg.gap_seconds || 8) * 1000;

    function render(ev) {
      var brand = cfg.hide_branding
        ? ""
        : '<div class="pbell-brand"><a href="https://proofbell.com" target="_blank" rel="noopener">by ProofBell</a></div>';
      box.innerHTML =
        '<div class="pbell-card"><div class="pbell-dot">B</div><div>' +
        '<div class="pbell-msg"></div>' +
        '<div class="pbell-meta"></div>' +
        brand +
        "</div></div>";
      box.querySelector(".pbell-msg").textContent = line(ev);
      box.querySelector(".pbell-meta").textContent = timeAgo(ev.created_at);
    }

    function cycle() {
      render(events[i % events.length]);
      requestAnimationFrame(function () {
        box.classList.add("show");
      });
      setTimeout(function () {
        box.classList.remove("show");
        i++;
        setTimeout(cycle, gapMs);
      }, showMs);
    }
    setTimeout(cycle, 1500);
  }

  fetch(base + "/api/widget/" + encodeURIComponent(key))
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (data) {
      if (data) run(data.config || {}, data.events || []);
    })
    .catch(function () {});
})();
