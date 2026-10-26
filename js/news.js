/* ============================================================
   News page
   ============================================================ */
(function () {
  "use strict";
  var U = window.PLH.ui, S = window.PLH.store, D = window.PLH.data;
  var CATIMG = {
    Announcement: "graduation.jpeg", "CBT Tests": "exam.jpg", Exams: "exam.jpg", Lectures: "lecturer.jpg",
    Calendar: "group.webp", Materials: "cmp.jpg", General: "group-study.jpg"
  };

  document.addEventListener("DOMContentLoaded", function () {
    var rows = S.extraNews().concat(D.news.slice()).sort(function (a, b) {
      return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt);
    });
    var root = document.getElementById("newsList");
    if (!root) return;
    if (!rows.length) { root.innerHTML = '<p class="empty">No news has been published yet.</p>'; return; }
    var lead = rows[0], rest = rows.slice(1);
    root.innerHTML =
      '<article class="news-feature"><div style="min-height:320px;background-size:cover;background-position:center;background-image:url(' +
      U.img(CATIMG[lead.category] || "group-study.jpg") + ')"></div><div style="padding:38px">' +
      '<div class="tag">' + U.esc(lead.category) + (lead.pinned ? " · 📌 Pinned" : "") + "</div>" +
      "<h2 style='font-size:30px;margin:14px 0 16px'>" + U.esc(lead.title) + "</h2>" +
      "<p style='white-space:pre-line;color:var(--ink-600)'>" + U.esc(lead.body) + "</p>" +
      '<p class="small muted" style="margin:0">' + U.fmtDate(lead.createdAt, true) + "</p></div></article>" +
      '<div style="margin-top:46px;display:grid;gap:34px">' +
      rest.map(function (n) {
        return '<article class="news-item"><img src="' + U.img(CATIMG[n.category] || "group-study.jpg") + '" alt="">' +
          "<div><div class='tag'>" + U.esc(n.category) + (n.pinned ? " · Pinned" : "") + "</div>" +
          "<h3 style='font-size:23px;margin:10px 0 12px'>" + U.esc(n.title) + "</h3>" +
          "<p style='white-space:pre-line;color:var(--ink-600)'>" + U.esc(n.body) + "</p>" +
          '<p class="small muted" style="margin:0">' + U.fmtDate(n.createdAt, true) + "</p></div></article>";
      }).join("") + "</div>";
  });
})();
