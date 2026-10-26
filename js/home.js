/* ============================================================
   Home page
   ============================================================ */
(function () {
  "use strict";
  var U = window.PLH.ui, S = window.PLH.store, D = window.PLH.data;

  function statusOf(l) { return S.statusOverride()[l.id] || l.status; }

  document.addEventListener("DOMContentLoaded", function () {
    var news = S.extraNews().concat(D.news.slice()).slice(0, 8);
    var live = D.lectures.filter(function (l) { return statusOf(l) === "live"; })[0];
    var upcoming = D.lectures.filter(function (l) { return statusOf(l) === "upcoming"; }).slice(0, 3);
    var stats = { lectures: D.lectures.length, materials: D.materials.length, questions: window.PLH.tests.reduce(function (a, t) { return a + t.questions.length; }, 0), results: S.results().length };

    /* ticker */
    var t = document.getElementById("ticker");
    if (t) {
      var items = news.map(function (n) {
        return '<a href="' + U.url("pages/news.html") + '">★ ' + U.esc(n.title) + "</a>";
      }).join("");
      t.innerHTML = '<div class="label">📰 Latest</div><div class="track"><div class="move">' + items + items + "</div></div>";
    }

    /* hero live card */
    var hero = document.getElementById("heroLive");
    if (hero) {
      hero.innerHTML = live
        ? '<a class="live-card" href="' + U.url("pages/lecture.html") + "?id=" + live.id + '">' +
          '<div class="thumb"><img src="https://img.youtube.com/vi/' + live.videoId + '/hqdefault.jpg" alt="">' +
          '<span class="badge-live">● LIVE NOW</span><span class="play">▶</span></div>' +
          '<div class="body"><div class="tag">' + U.esc(live.courseCode) + " · " + U.esc(live.lecturer) + "</div>" +
          "<h3 style='color:#fff;font-size:22px;margin:8px 0'>" + U.esc(live.title) + "</h3>" +
          "<p style='color:#c5cedd;margin:0'>Enter lecture room →</p></div></a>"
        : '<div class="live-card"><div class="body"><h3 style="color:#fff">No live lecture at the moment</h3><p style="color:#c5cedd">Check the timetable for the next class.</p>' +
          '<a class="btn btn-gold" href="' + U.url("pages/lectures.html") + '">View timetable</a></div></div>';
    }

    /* stats */
    var st = document.getElementById("heroStats");
    if (st) {
      st.innerHTML = [["lectures", "Lectures"], ["materials", "Study materials"], ["questions", "CBT questions"], ["results", "Tests taken"]]
        .map(function (x) { return '<div class="stat"><b>' + stats[x[0]] + "</b><span>" + x[1] + "</span></div>"; }).join("");
    }

    /* news grid */
    var ng = document.getElementById("homeNews");
    if (ng) {
      ng.innerHTML = news.slice(0, 4).map(function (n) {
        return '<a class="panel" style="display:block" href="' + U.url("pages/news.html") + '">' +
          '<div class="tag">' + U.esc(n.category) + "</div>" +
          "<h3 style='font-size:19px;margin:10px 0 8px'>" + U.esc(n.title) + "</h3>" +
          '<p class="small muted" style="margin:0">' + U.esc(n.body.slice(0, 130)) + "…</p></a>";
      }).join("");
    }

    /* upcoming */
    var up = document.getElementById("homeUpcoming");
    if (up) {
      up.innerHTML = upcoming.map(function (l) {
        var d = new Date(l.scheduledAt);
        return '<a href="' + U.url("pages/lecture.html") + "?id=" + l.id + '" class="list-card" style="align-items:center">' +
          '<div style="width:62px;text-align:center;border-right:1px solid var(--ink-100);padding-right:12px">' +
          '<div style="font-family:var(--serif);font-size:28px;line-height:1">' + d.getDate() + "</div>" +
          '<div class="tag" style="letter-spacing:.15em">' + d.toLocaleString("en-GB", { month: "short" }) + "</div></div>" +
          "<div><div class='small' style='color:var(--gold-600);font-weight:600'>" + U.esc(l.courseCode) + "</div>" +
          "<b>" + U.esc(l.title) + "</b><div class='small muted'>" + U.esc(l.lecturer) + "</div></div></a>";
      }).join("") || '<p class="muted">No upcoming lectures.</p>';
    }
  });
})();
