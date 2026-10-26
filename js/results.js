/* ============================================================
   Results: history + leaderboard, and the result slip with corrections
   ============================================================ */
(function () {
  "use strict";
  var U = window.PLH.ui, S = window.PLH.store, T = window.PLH.tests || [];
  var LETTERS = ["A", "B", "C", "D", "E"];

  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("resultSlip")) return drawSlip();
    drawList();
  });

  /* ---------------- list ---------------- */
  function drawList() {
    var root = document.getElementById("resultsRoot");
    if (!root) return;
    var boardCat = "";
    var lookup = "";
    var s = U.getStudent();
    var regNo = s ? s.regNo : null;

    function paint() {
      var mine = regNo ? S.myResults(regNo) : [];
      var top = S.topResults(boardCat);
      var best = mine.length ? Math.max.apply(null, mine.map(function (r) { return r.percentage; })) : 0;
      var avg = mine.length ? Math.round(mine.reduce(function (a, r) { return a + r.percentage; }, 0) / mine.length) : 0;

      root.innerHTML =
        '<div class="wrap" style="padding:56px 24px 30px"><div class="split" style="align-items:flex-start">' +
        "<div><form id='lookupForm' style='display:flex;gap:12px'>" +
        "<input class='f' id='lookupInput' placeholder='Enter your matric / admission number' value='" + U.esc(lookup) + "' style='text-transform:uppercase'>" +
        "<button class='btn btn-dark'>Check Result</button></form>" +
        (regNo
          ? "<h2 style='margin:38px 0 18px;font-size:26px'>Results for <span style='color:var(--gold-600)'>" + U.esc(regNo) + "</span></h2>" +
            '<div class="grid grid-3" style="gap:16px">' +
            [["📝", "Tests taken", mine.length], ["🥇", "Best score", best + "%"], ["📊", "Average", avg + "%"]]
              .map(function (x) {
                return '<div class="panel"><div style="font-size:24px">' + x[0] + "</div>" +
                  "<b style='font-family:var(--serif);font-size:32px;display:block;margin:6px 0'>" + x[1] + "</b>" +
                  '<div class="tag">' + x[2] + "</div></div>";
              }).join("") + "</div>" +
            (mine.length
              ? '<div style="margin-top:22px;overflow:auto"><table class="tbl"><thead><tr><th>Test</th><th>Score</th><th>Time</th><th>Grade</th><th></th></tr></thead><tbody>' +
                mine.map(function (r) {
                  var g = U.grade(r.percentage);
                  return "<tr><td><b>" + U.esc(r.courseCode) + "</b><br><span class='small muted'>" + U.esc(r.testTitle) + "</span></td>" +
                    "<td>" + r.score + "/" + r.total + " <span class='muted small'>(" + r.percentage + "%)</span></td>" +
                    "<td class='muted small'>" + U.fmtDur(r.timeTaken) + "</td>" +
                    '<td><b style="font-family:var(--serif);font-size:22px;color:' + g.c + '">' + g.l + "</b></td>" +
                    '<td style="text-align:right"><a href="' + U.url("pages/result.html") + "?id=" + r.id + "&testId=" + r.testId + '" style="color:#1d4ed8;font-weight:600">View →</a></td></tr>';
                }).join("") + "</tbody></table></div>"
              : '<div class="panel" style="margin-top:22px;text-align:center"><p class="muted">No results recorded yet.</p>' +
                '<a class="btn btn-gold" href="' + U.url("pages/cbt.html") + '">Take a CBT test →</a></div>')
          : '<div class="panel" style="margin-top:26px;text-align:center;padding:52px"><div style="font-size:34px">🔐</div>' +
            "<h3 style='font-size:22px;margin-top:12px'>Log in to view your results</h3>" +
            '<p class="muted">Or look up results with a registration number above.</p>' +
            '<button class="btn btn-dark" id="loginResBtn" style="margin-top:16px">Student Login</button></div>') +
        "</div>" +

        '<aside class="panel" style="padding:0;overflow:hidden">' +
        '<div style="position:relative;overflow:hidden;background:var(--ink-950);color:#fff;padding:26px">' +
        '<div style="position:absolute;inset:0;background:url(' + U.img("graduation.jpg") + ') center/cover;opacity:.2"></div>' +
        "<div style='position:relative'><p class='tag'>Hall of Fame</p><h3 style='color:#fff;font-size:24px;margin:6px 0 0'>Top 10 Leaderboard</h3></div></div>" +
        '<div class="filter-row" style="padding:14px;border-bottom:1px solid var(--ink-100)">' +
        [{ id: "", name: "All" }].concat(U.cats.map(function (c) { return { id: c.id, name: c.name.replace(" School", "") }; })).map(function (c) {
          return '<button class="chip' + (boardCat === c.id ? " active" : "") + '" data-board="' + c.id + '" style="padding:7px 12px;font-size:11px">' + c.name + "</button>";
        }).join("") + "</div>" +
        (top.length
          ? '<ol style="margin:0;padding:0">' + top.map(function (r, i) {
              return "<li style='list-style:none;display:flex;gap:14px;align-items:center;padding:13px 22px;border-bottom:1px solid var(--ink-100)'>" +
                "<span style='width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--serif);" +
                (i === 0 ? "background:var(--gold-400);color:var(--ink-950)" : i < 3 ? "background:var(--ink-900);color:var(--gold-300)" : "background:var(--ink-100);color:var(--ink-500)") + "'>" + (i + 1) + "</span>" +
                '<div style="flex:1;min-width:0"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + U.esc(r.studentName) + "</b>" +
                '<span class="small muted">' + U.esc(r.courseCode) + " · " + U.esc(r.level) + "</span></div>" +
                '<b style="font-family:var(--serif);font-size:19px">' + r.percentage + "%</b></li>";
            }).join("") + "</ol>"
          : '<p class="empty">No scores yet. Be the first.</p>') +
        "</aside></div></div>";

      root.onclick = function (e) {
        var b = e.target.closest ? e.target.closest("[data-board],#loginResBtn") : null;
        if (!b) return;
        if (b.hasAttribute("data-board")) { boardCat = b.getAttribute("data-board"); paint(); }
        if (b.id === "loginResBtn") U.openLogin();
      };
      var form = document.getElementById("lookupForm");
      if (form) form.addEventListener("submit", function (e) {
        e.preventDefault();
        lookup = (document.getElementById("lookupInput").value || "").trim().toUpperCase();
        regNo = lookup || regNo;
        paint();
      });
    }
    paint();
  }

  /* ---------------- result slip ---------------- */
  function drawSlip() {
    var root = document.getElementById("resultSlip");
    var params = new URLSearchParams(location.search);
    var id = params.get("id"), testId = params.get("testId");
    var r = S.getResult(id);
    var t = T.filter(function (x) { return String(x.id) === String(testId); })[0];
    if (!r || !t) {
      root.innerHTML = '<div class="wrap"><p class="empty">Result not found. <a href="' + U.url("pages/results.html") + '" style="color:#1d4ed8">View all results</a></p></div>';
      return;
    }
    var g = U.grade(r.percentage);
    var wrong = r.total - r.score - t.questions.filter(function (q, i) { return r.answers[i] === undefined; }).length;
    var circ = 2 * Math.PI * 54;

    root.innerHTML =
      (params.get("auto") ? '<div class="notice" style="margin:22px auto;max-width:960px">⏱ Time was up — your answers were submitted and marked automatically.</div>' : "") +
      '<div class="result-hero"><div class="bg" style="background-image:url(' + U.img("graduation.jpg") + ')"></div><div class="wrap">' +
      "<div><p class='tag'>Statement of Result · CBT Test</p>" +
      "<h1 style='color:#fff;font-size:36px;margin:10px 0 6px'>" + U.esc(r.studentName) + "</h1>" +
      "<p style='color:#c5cedd;margin:0'>" + U.esc(r.regNo) + "</p>" +
      "<p class='tag' style='margin-top:16px;color:#e6d3a5'>" + U.esc(r.courseCode) + " — " + U.esc(r.testTitle) + "</p>" +
      "<p class='small' style='color:#9aa8c0;margin:0'>" + U.esc(U.catName(r.category) + " · " + U.depName(r.category, r.department) + " · " + r.level) + "</p>" +
      '<p class="small" style="color:#6b7c9a;margin:12px 0 0">' + U.fmtDate(r.createdAt, true) + "</p></div>" +
      '<div class="score-ring"><svg width="150" height="150"><circle cx="75" cy="75" r="54" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="10"/>' +
      '<circle cx="75" cy="75" r="54" fill="none" stroke="#c9a45a" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + circ +
      '" stroke-dashoffset="' + circ * (1 - r.percentage / 100) + '"/></svg>' +
      "<div class='val'><b>" + r.percentage + "%</b><span class='small' style='color:#c5cedd'>" + r.score + " of " + r.total + "</span></div></div></div></div>" +

      '<div class="wrap"><div class="panel" style="padding:0;overflow:hidden;margin-bottom:60px">' +
      '<div class="metric-grid">' +
      [["Grade", g.l, g.c], ["Correct", r.score, "#047857"], ["Incorrect", wrong, "#be123c"], ["Skipped", t.questions.filter(function (q, i) { return r.answers[i] === undefined; }).length, "#4a5b7a"],
       ["Duration", U.fmtDur(r.timeTaken), "#121c31"]]
        .map(function (x) {
          return '<div class="metric"><span>' + x[0] + "</span><b style='color:" + x[2] + "'>" + x[1] + "</b></div>";
        }).join("") + "</div>" +
      '<div style="display:flex;flex-wrap:wrap;gap:12px;padding:26px">' +
      '<a class="btn btn-dark" href="' + U.url("pages/cbt.html") + '">↻ Retake Test</a>' +
      '<a class="btn btn-outline" href="' + U.url("pages/results.html") + '">All My Results</a>' +
      '<button class="btn btn-outline" onclick="window.print()">🖨 Print Result</button></div></div>' +

      '<h2 style="font-size:28px;margin:0 0 22px">📋 Corrections</h2><div style="display:grid;gap:18px;padding-bottom:60px">' +
      t.questions.map(function (q, i) {
        var chosen = r.answers[i];
        var ok = chosen === q.answerIndex;
        var skipped = chosen === undefined;
        return '<div class="correction"><div style="display:flex;justify-content:space-between;gap:18px;align-items:flex-start">' +
          "<h3 style='font-size:18px;line-height:1.5;margin:0'><span style='color:var(--gold-600);font-family:var(--serif)'>" + String(i + 1).padStart(2, "0") + ".</span> " + U.esc(q.question) + "</h3>" +
          '<span class="pill ' + (skipped ? "pill-soon" : ok ? "pill-rec" : "pill-live") + '">' + (skipped ? "Skipped" : ok ? "✓ Correct" : "✗ Wrong") + "</span></div>" +
          '<div class="grid grid-2" style="gap:10px;margin-top:18px">' + q.options.map(function (o, oi) {
            var cls = oi === q.answerIndex ? " correct" : oi === chosen ? " chosen-wrong" : "";
            return '<div class="opt-row' + cls + '"><b>' + LETTERS[oi] + ".</b><span" + (oi === chosen && !ok ? " style='text-decoration:line-through'" : "") + ">" + U.esc(o) + "</span>" +
              (oi === q.answerIndex ? "<span style='margin-left:auto'>✓</span>" : oi === chosen && !ok ? "<span style='margin-left:auto;font-size:11px;text-transform:uppercase'>Your answer</span>" : "") + "</div>";
          }).join("") + "</div>" +
          (q.explanation ? '<div class="explain">💡 <b>Explanation:</b> ' + U.esc(q.explanation) + "</div>" : "") + "</div>";
      }).join("") + "</div></div>";
  }
})();
