/* ============================================================
   Staff portal: publish news, delete news, set lecture status
   ============================================================ */
(function () {
  "use strict";
  var U = window.PLH.ui, S = window.PLH.store, D = window.PLH.data;
  var CODE = "prince-admin";

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("adminRoot");
    if (!root) return;
    var ok = sessionStorage.getItem("plh_admin") === CODE;
    paint(root, ok);
  });

  function paint(root, ok) {
    if (!ok) {
      root.innerHTML = '<div class="wrap" style="max-width:520px;padding:60px 24px"><div class="panel">' +
        "<h2 style='font-size:24px'>Staff / Admin Portal</h2><p class='muted small'>Post news, upload materials and manage the lecture timetable.</p>" +
        '<label class="field" style="margin-top:20px">Admin access code</label><input class="f" type="password" id="adminCode" placeholder="Enter access code">' +
        '<p class="small muted" style="margin-top:8px">Default demo code: <code style="background:var(--ink-50);padding:2px 6px">prince-admin</code></p>' +
        '<button class="btn btn-dark btn-block" id="adminUnlock" style="margin-top:18px">Unlock</button></div></div>';
      root.querySelector("#adminUnlock").addEventListener("click", function () {
        var v = root.querySelector("#adminCode").value.trim();
        if (v === CODE) { sessionStorage.setItem("plh_admin", CODE); paint(root, true); }
        else alert("Invalid access code.");
      });
      return;
    }

    var news = S.extraNews().concat(D.news.slice());
    var lectures = D.lectures.slice();
    var tab = "news";

    function render() {
      var body = "";
      if (tab === "news") {
        body = '<div class="split" style="gap:28px;align-items:flex-start">' +
          '<form class="panel" id="newsForm"><h3>Publish news</h3>' +
          '<label class="field" style="margin-top:16px">Headline</label><input class="f" name="title" required placeholder="e.g. CBT timetable released">' +
          '<label class="field" style="margin-top:14px">Category</label><select class="f" name="category">' +
          ["Announcement", "CBT Tests", "Lectures", "Materials", "Calendar", "General"].map(function (c) { return "<option>" + c + "</option>"; }).join("") + "</select>" +
          '<label class="field" style="margin-top:14px">Content</label><textarea class="f" name="body" rows="5" required placeholder="News content…"></textarea>' +
          '<label class="small" style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" name="pinned"> Pin to top</label>' +
          '<button class="btn btn-dark btn-block" style="margin-top:18px">Publish</button></form>' +
          '<div class="panel"><h3>Existing news</h3><ul style="padding:0;margin:12px 0 0">' +
          news.map(function (n) {
            return "<li style='list-style:none;display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--ink-100)'>" +
              "<span style='min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'>" + U.esc(n.title) + "</span>" +
              (String(n.id).charAt(0) === "n"
                ? '<button class="small" data-del="' + n.id + '" style="border:0;background:none;color:#be123c;font-weight:600;cursor:pointer">Delete</button>'
                : '<span class="small muted">built-in</span>') + "</li>";
          }).join("") + "</ul></div></div>";
      } else {
        body = '<div class="panel"><h3>Manage lecture status</h3><ul style="padding:0;margin:12px 0 0">' +
          lectures.map(function (l) {
            var st = S.statusOverride()[l.id] || l.status;
            return "<li style='list-style:none;display:flex;justify-content:space-between;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--ink-100)'>" +
              "<span style='min-width:0'><b>" + U.esc(l.courseCode) + "</b> · " + U.esc(l.title) + "</span>" +
              "<select class='f' style='width:150px' data-status='" + l.id + "'>" +
              ["upcoming", "live", "recorded"].map(function (s) {
                return "<option value='" + s + "'" + (s === st ? " selected" : "") + ">" + s.charAt(0).toUpperCase() + s.slice(1) + "</option>";
              }).join("") + "</select></li>";
          }).join("") + "</ul></div>";
      }

      root.innerHTML = '<div class="wrap" style="padding:52px 24px 60px">' +
        '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px">' +
        [["news", "📰 Publish News"], ["lecture", "🎥 Lectures"]].map(function (t) {
          return '<button class="chip' + (tab === t[0] ? " active" : "") + '" data-tab="' + t[0] + '">' + t[1] + "</button>";
        }).join("") + '<button class="chip" id="adminLock" style="margin-left:auto">Lock</button></div>' + body + "</div>";

      root.addEventListener("click", onTabClick);
      var form = root.querySelector("#newsForm");
      if (form) form.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        S.addNews({
          title: fd.get("title"), body: fd.get("body"), category: fd.get("category"),
          pinned: fd.get("pinned") === "on"
        });
        alert("News published!");
        news = S.extraNews().concat(D.news.slice());
        render();
      });
      root.querySelectorAll("[data-status]").forEach(function (sel) {
        sel.addEventListener("change", function () {
          S.setStatus(sel.getAttribute("data-status"), sel.value);
          alert("Lecture status updated.");
        });
      });
    }

    function onTabClick(e) {
      var t = e.target.closest ? e.target.closest("[data-tab],[data-del],#adminLock") : null;
      if (!t) return;
      if (t.hasAttribute("data-tab")) { tab = t.getAttribute("data-tab"); render(); }
      if (t.hasAttribute("data-del")) {
        if (confirm("Delete this news item?")) {
          S.removeNews(t.getAttribute("data-del"));
          news = S.extraNews().concat(D.news.slice());
          render();
        }
      }
      if (t.id === "adminLock") {
        sessionStorage.removeItem("plh_admin");
        location.reload();
      }
    }

    render();
  }
})();
