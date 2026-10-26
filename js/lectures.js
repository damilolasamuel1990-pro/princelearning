/* ============================================================
   Lectures: listing page + lecture room (video + discussion)
   ============================================================ */
(function () {
  "use strict";
  var U = window.PLH.ui, S = window.PLH.store, D = window.PLH.data;

  function statusOf(l) { return S.statusOverride()[l.id] || l.status; }
  function badge(status) {
    if (status === "live") return '<span class="pill pill-live">● Live</span>';
    if (status === "upcoming") return '<span class="pill pill-soon">Upcoming</span>';
    return '<span class="pill pill-rec">Recorded</span>';
  }
  function card(l) {
    return '<a class="lecture-card" href="' + U.url("pages/lecture.html") + "?id=" + l.id + '">' +
      '<div class="thumb"><img src="https://img.youtube.com/vi/' + l.videoId + '/hqdefault.jpg" alt="">' +
      '<span style="position:absolute;left:14px;top:14px">' + badge(statusOf(l)) + "</span></div>" +
      '<div style="padding:22px"><div class="tag">' + U.esc(l.courseCode) + "</div>" +
      '<h3 style="font-size:19px;margin:8px 0 10px;line-height:1.3">' + U.esc(l.title) + "</h3>" +
      '<p class="small muted" style="margin:0">👨‍🏫 ' + U.esc(l.lecturer) + "</p>" +
      '<p class="small muted" style="margin:6px 0 0">📅 ' + U.fmtDate(l.scheduledAt, true) + " · ⏱ " + l.durationMin + " min</p></div></a>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("lectureGrid");
    if (grid) {
      var groups = [
        ["Live now", D.lectures.filter(function (l) { return statusOf(l) === "live"; })],
        ["Upcoming lectures", D.lectures.filter(function (l) { return statusOf(l) === "upcoming"; })],
        ["Recorded lectures", D.lectures.filter(function (l) { return statusOf(l) === "recorded"; }).reverse()]
      ];
      grid.innerHTML = groups.filter(function (g) { return g[1].length; }).map(function (g) {
        return "<section><div class='tag'>" + g[0] + "</div>" +
          "<h2 style='font-size:30px;margin:10px 0 22px'>" + g[0] + "</h2>" +
          "<div class='grid grid-3'>" + g[1].map(card).join("") + "</div></section>";
      }).join("") || '<p class="empty">No lectures have been scheduled yet.</p>';
      return;
    }

    /* ---------- lecture room ---------- */
    var room = document.getElementById("lectureRoom");
    if (!room) return;
    var id = new URLSearchParams(location.search).get("id");
    var l = D.lectures.filter(function (x) { return String(x.id) === String(id); })[0] || D.lectures[0];
    var norm = function (s) { return String(s).toUpperCase().replace(/[^A-Z0-9]/g, ""); };
    var mats = D.materials.filter(function (m) { return norm(m.courseCode) === norm(l.courseCode); });
    var others = D.lectures.filter(function (x) { return x.id !== l.id; }).slice(0, 4);

    document.title = l.title + " — Prince Learning Hub";
    room.innerHTML =
      "<div class='video-box'><iframe src='https://www.youtube-nocookie.com/embed/" + l.videoId +
      "?rel=0' title='" + U.esc(l.title) + "' allowfullscreen allow='autoplay; encrypted-media'></iframe></div>" +
      "<div class='panel' style='margin-top:22px'><div style='display:flex;flex-wrap:wrap;gap:10px;align-items:center'>" +
      badge(statusOf(l)) + "<span class='chip'>" + U.esc(l.courseCode) + "</span></div>" +
      "<h1 style='font-size:32px;margin:16px 0 8px'>" + U.esc(l.title) + "</h1>" +
      "<div class='small muted'>👨‍🏫 " + U.esc(l.lecturer) + " · 📅 " + U.fmtDate(l.scheduledAt, true) + " · ⏱ " + l.durationMin + " minutes</div>" +
      "<p style='margin-top:18px;color:var(--ink-600)'>" + U.esc(l.description) + "</p></div>" +
      (mats.length
        ? "<div class='panel' style='margin-top:20px'><h3>Lecture materials</h3><ul style='padding:0;margin:14px 0 0'>" +
          mats.map(function (m) {
            return '<li style="list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid var(--ink-100)">' +
              "<span><b>" + U.esc(m.title) + "</b><br><span class='small muted'>" + U.esc(m.fileName) + "</span></span>" +
              '<a class="btn btn-outline" href="' + U.url("downloads/" + m.fileName) + '" download="' + m.fileName + '" data-file="' + m.fileName + '">⬇ Download</a></li>';
          }).join("") + "</ul></div>"
        : "") +
      "<div style='margin-top:34px'><h2 style='font-size:24px'>More lectures</h2><div class='grid grid-2' style='margin-top:18px'>" +
      others.map(card).join("") + "</div></div>";

    room.addEventListener("click", function (e) {
      var a = e.target.closest("a[download]");
      if (!a) return;
      e.preventDefault();
      U.download(U.url("downloads/" + a.getAttribute("data-file")), a.getAttribute("data-file"));
    });

    /* discussion beside the video */
    var chatBox = document.getElementById("lectureChat");
    if (chatBox && window.PLH.chat) window.PLH.chat.mount(chatBox, "lecture-" + l.id, "Lecture Discussion");
  });
})();
