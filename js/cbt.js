/* ============================================================
   CBT: choose a test, write it with a timer, submit and score
   ============================================================ */
(function () {
  "use strict";
  var U = window.PLH.ui, S = window.PLH.store, T = window.PLH.tests || [];
  var LETTERS = ["A", "B", "C", "D", "E"];
  var session = null, timer = null;

  function matching(cat, dep, level) {
    return T.filter(function (t) {
      if (t.category !== cat) return false;
      if (dep !== "ALL" && t.department !== dep && t.department !== "ALL") return false;
      return (t.levels || [t.level]).indexOf(level) >= 0;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("cbtRoot");
    if (!root) return;
    var s = U.getStudent();
    var sel = {
      category: (s && s.category) || "university",
      department: (s && s.department) || "CSC",
      level: (s && s.level) || "100 Level"
    };
    if (session) return;
    drawSelect(root, sel);
  });

  /* ---------------- test selection ---------------- */
  function drawSelect(root, sel) {
    function paint() {
      var cat = U.cats.filter(function (c) { return c.id === sel.category; })[0] || U.cats[0];
      if (!cat.departments.some(function (d) { return d.id === sel.department; })) sel.department = cat.departments[0].id;
      var dep = cat.departments.filter(function (d) { return d.id === sel.department; })[0] || cat.departments[0];
      if (dep.levels.indexOf(sel.level) < 0) sel.level = dep.levels[0];
      var tests = matching(sel.category, sel.department, sel.level);
      var s = U.getStudent();
      var mine = s && s.category === sel.category && s.department === sel.department && s.level === sel.level;

      root.innerHTML =
        '<section class="page-head"><div class="bg" style="background-image:url(' + U.img("exam.jpg") + ')"></div><div class="scrim"></div>' +
        '<div class="wrap"><div class="crumbs"><a href="' + U.url("index.html") + '">Home</a> › <span class="cur">CBT</span></div>' +
        "<p class='eyebrow light' style='margin-top:18px'>CBT Centre</p>" +
        "<h1>Computer Based Tests</h1>" +
        "<p>Separate tests for University, Polytechnic, Secondary and Primary students. Choose your school, department and level, then start your timed test.</p></div></section>" +

        '<div class="wrap" style="margin-top:-38px"><div class="grid grid-4" style="position:relative;z-index:2">' +
        U.cats.map(function (c) {
          return '<button class="photo-card" data-cat="' + c.id + '" style="text-align:left;cursor:pointer;border:0;padding:0;' +
            (sel.category === c.id ? "outline:2px solid var(--gold-400);outline-offset:3px" : "") + '">' +
            '<img src="' + U.img(c.image) + '" alt="" style="aspect-ratio:3/4"><div class="overlay"></div>' +
            '<div class="txt"><h3 style="font-size:21px;color:#fff;margin:0">' + c.name + "</h3></div></button>";
        }).join("") + "</div></div>" +

        '<div class="wrap" style="padding-top:38px">' +
        '<div class="panel">' +
        (cat.departments.length > 1
          ? "<p class='tag'>" + (sel.category === "secondary" ? "Section" : "Department / Programme") + "</p><div class='filter-row' style='margin:14px 0 22px'>" +
            cat.departments.map(function (d) {
              return '<button class="chip' + (d.id === sel.department ? " active" : "") + '" data-dep="' + d.id + '">' + U.esc(d.name) + "</button>";
            }).join("") + "</div>"
          : "") +
        "<p class='tag'>" + (sel.category === "university" ? "Level" : "Class") + "</p><div class='filter-row' style='margin-top:14px'>" +
        dep.levels.map(function (l) {
          return '<button class="chip gold' + (l === sel.level ? " active" : "") + '" data-lvl="' + l + '">' + l + "</button>";
        }).join("") + "</div></div>" +

        '<div style="margin:44px 0 18px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:18px;border-bottom:1px solid var(--ink-100);padding-bottom:16px">' +
        "<div><p class='tag'>Available tests</p><h2 style='font-size:32px;margin:8px 0 0'>" +
        U.esc(U.catName(sel.category) + " · " + U.depName(sel.category, sel.department) + " · " + sel.level) + "</h2></div>" +
        (mine
          ? '<span class="pill pill-soon">✓ Your class</span>'
          : s
            ? '<button class="btn btn-outline" id="myClassBtn">Show my class</button>'
            : '<button class="btn btn-dark" id="loginCta">Log in to start a test</button>') +
        "</div>" +

        (tests.length
          ? '<div class="grid grid-3">' + tests.map(function (t) {
              return '<article class="panel" style="display:flex;flex-direction:column">' +
                "<div style='display:flex;justify-content:space-between;align-items:center'><span class='pill pill-rec' style='background:var(--ink-900);color:var(--gold-300)'>" +
                U.esc(t.code) + "</span>" + (t.semester ? "<span class='small muted'>" + U.esc(t.semester) + "</span>" : "") + "</div>" +
                "<h3 style='font-size:20px;margin:16px 0 10px;line-height:1.3'>" + U.esc(t.title) + "</h3>" +
                '<p class="small muted" style="flex:1">' + U.esc(t.description) + "</p>" +
                '<div class="small muted" style="border-top:1px solid var(--ink-100);margin-top:16px;padding-top:14px;display:flex;gap:18px">' +
                "<span>📝 " + t.questions.length + " questions</span><span>⏰ " + t.durationMin + " mins</span></div>" +
                '<button class="btn btn-dark btn-block" style="margin-top:18px" data-start="' + t.id + '">▶ Start Test</button></article>';
            }).join("") + "</div>"
          : '<p class="empty">No tests have been set for this class yet.</p>') +
        '<div class="panel" style="margin:44px 0 60px"><h3>Test instructions</h3><ol class="tight" style="color:var(--ink-600);line-height:2">' +
        "<li>The timer starts as soon as you click Start Test.</li><li>Each question has one correct answer.</li>" +
        "<li>Use Next / Previous or the question navigator to move around.</li>" +
        "<li>Keyboard shortcuts: A–D to choose an answer, N / P to move.</li>" +
        "<li>Answers are submitted automatically when time runs out.</li></ol></div></div>";

      root.onclick = function (e) {
        var el = e.target.closest ? e.target.closest("[data-cat],[data-dep],[data-lvl],[data-start],#loginCta,#myClassBtn") : null;
        if (!el) return;
        if (el.hasAttribute("data-cat")) sel.category = el.getAttribute("data-cat");
        else if (el.hasAttribute("data-dep")) sel.department = el.getAttribute("data-dep");
        else if (el.hasAttribute("data-lvl")) sel.level = el.getAttribute("data-lvl");
        else if (el.id === "loginCta") { U.openLogin(); return; }
        else if (el.id === "myClassBtn") {
          var me = U.getStudent();
          sel.category = me.category; sel.department = me.department; sel.level = me.level;
        } else if (el.hasAttribute("data-start")) {
          openStart(Number(el.getAttribute("data-start")));
          return;
        }
        paint();
      };
    }
    paint();
  }

  function openStart(testId) {
    if (!U.requireLogin()) return;
    var t = T.filter(function (x) { return x.id === testId; })[0];
    var s = U.getStudent();
    var back = document.createElement("div");
    back.className = "modal-back";
    back.innerHTML = '<div class="modal" style="grid-template-columns:1fr;max-width:460px">' +
      '<div style="background:var(--ink-950);color:#fff;padding:26px 30px"><div class="tag">' + U.esc(t.code) + " · CBT Test</div>" +
      "<h2 style='color:#fff;font-size:24px;margin:8px 0 6px'>" + U.esc(t.title) + "</h2>" +
      "<p class='small' style='color:#c5cedd;margin:0'>" + U.esc(t.level + (t.semester ? " · " + t.semester : "")) + "</p></div>" +
      '<div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--ink-100)">' +
      '<div style="padding:22px;text-align:center;border-right:1px solid var(--ink-100)"><b style="font-family:var(--serif);font-size:28px">' + t.questions.length +
      "</b><div class='tag'>Questions</div></div>" +
      '<div style="padding:22px;text-align:center"><b style="font-family:var(--serif);font-size:28px">' + t.durationMin +
      ":00</b><div class='tag'>Minutes</div></div></div>" +
      '<div style="padding:26px 30px"><p class="small">Candidate: <b>' + U.esc(s.name) + "</b> (" + U.esc(s.regNo) + ")</p>" +
      '<p class="small muted">The timer will start immediately. Good luck!</p>' +
      '<div style="display:flex;gap:12px;margin-top:20px"><button class="btn btn-outline" style="flex:1" id="startCancel">Cancel</button>' +
      '<button class="btn btn-gold" style="flex:1" id="startGo">Start now</button></div></div></div>';
    document.body.appendChild(back);
    back.addEventListener("click", function (e) {
      if (e.target === back || e.target.id === "startCancel") back.remove();
      if (e.target.id === "startGo") { back.remove(); start(t); }
    });
  }

  /* ---------------- the test ---------------- */
  function start(t) {
    var qs = t.questions.map(function (q, i) { return { q: q, i: i }; });
    for (var i = qs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), tmp = qs[i]; qs[i] = qs[j]; qs[j] = tmp;
    }
    session = { test: t, startedAt: Date.now(), answers: {}, current: 0, questions: qs.map(function (x) { return x.q; }), submitting: false };
    document.title = t.code + " — Test in progress";
    paintExam();
    timer = setInterval(tick, 250);
    window.addEventListener("keydown", keys);
    window.scrollTo(0, 0);
  }

  function remaining() {
    return Math.max(0, session.test.durationMin * 60 - Math.floor((Date.now() - session.startedAt) / 1000));
  }
  function tick() {
    if (!session) return;
    var r = remaining();
    var el = document.getElementById("timerBox");
    if (el) {
      el.className = "timer" + (r <= 60 ? " danger" : r <= 180 ? " warn" : "");
      el.textContent = "⏰ " + String(Math.floor(r / 60)).padStart(2, "0") + ":" + String(r % 60).padStart(2, "0");
    }
    var bar = document.getElementById("timeBar");
    if (bar) bar.style.width = (r / (session.test.durationMin * 60)) * 100 + "%";
    if (r === 0 && !session.submitting) submit(true);
  }

  function keys(e) {
    if (!session || session.submitting) return;
    var k = e.key.toUpperCase();
    var li = LETTERS.indexOf(k);
    var q = session.questions[session.current];
    if (li >= 0 && li < q.options.length) choose(li);
    else if (k === "N" || e.key === "ArrowRight") go(session.current + 1);
    else if (k === "P" || e.key === "ArrowLeft") go(session.current - 1);
  }

  function choose(idx) {
    session.answers[session.current] = idx;
    paintExam();
  }
  function go(i) {
    session.current = Math.max(0, Math.min(session.questions.length - 1, i));
    paintExam();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function paintExam() {
    var root = document.getElementById("cbtRoot");
    var q = session.questions[session.current];
    var answered = Object.keys(session.answers).length;
    var total = session.questions.length;

    root.innerHTML =
      '<div class="exam-bar"><div class="wrap">' +
      "<div><div class='tag'>" + U.esc(session.test.code + " · " + session.test.title) + "</div>" +
      "<div class='small' style='color:#c5cedd'>" + U.esc((U.getStudent() || {}).name || "") + " · " + U.esc((U.getStudent() || {}).regNo || "") + "</div></div>" +
      '<div style="display:flex;align-items:center;gap:22px"><div class="small" style="text-align:right">Answered<br><b style="font-family:var(--serif);font-size:20px;color:#fff">' +
      answered + " / " + total + "</b></div><div class='timer' id='timerBox'>⏰ 00:00</div></div></div>" +
      '<div class="progress"><span id="timeBar" style="width:100%"></span></div></div>' +

      '<div class="wrap" style="padding:36px 24px 60px"><div style="display:grid;grid-template-columns:1fr 320px;gap:28px;align-items:start" class="exam-grid">' +
      '<div class="panel" style="padding:38px">' +
      "<p class='tag'>Question " + (session.current + 1) + " of " + total + "</p>" +
      '<h2 style="font-size:26px;line-height:1.45;margin:14px 0 26px">' + U.esc(q.question) + "</h2>" +
      '<div style="display:grid;gap:12px">' + q.options.map(function (o, i) {
        var on = session.answers[session.current] === i;
        return '<button class="option' + (on ? " selected" : "") + '" data-opt="' + i + '"><span class="letter">' + LETTERS[i] + "</span><span>" + U.esc(o) + "</span></button>";
      }).join("") + "</div>" +
      '<div style="display:flex;justify-content:space-between;gap:12px;margin-top:32px;border-top:1px solid var(--ink-100);padding-top:22px">' +
      '<button class="btn btn-outline" id="prevBtn"' + (session.current === 0 ? " disabled" : "") + ">← Previous</button>" +
      (session.current < total - 1
        ? '<button class="btn btn-dark" id="nextBtn">Next →</button>'
        : '<button class="btn btn-gold" id="finishBtn">✓ Finish &amp; Submit</button>') +
      "</div></div>" +

      '<aside class="panel"><h3 style="font-size:18px">Question Navigator</h3>' +
      '<div class="navigator' + (total > 20 ? " scroll" : "") + '" style="margin-top:16px">' +
      session.questions.map(function (_, i) {
        var done = session.answers[i] !== undefined;
        return '<button class="nav-btn' + (done ? " done" : "") + (i === session.current ? " cur" : "") + '" data-go="' + i + '">' + (i + 1) + "</button>";
      }).join("") + "</div>" +
      '<div class="small muted" style="margin-top:16px;display:grid;gap:8px">' +
      '<div><span style="display:inline-block;width:12px;height:12px;background:var(--ink-900);border-radius:3px"></span> Answered</div>' +
      '<div><span style="display:inline-block;width:12px;height:12px;border:1px solid var(--ink-200);background:var(--paper);border-radius:3px"></span> Not answered</div></div>' +
      '<button class="btn btn-gold btn-block" id="submitBtn" style="margin-top:22px">Submit Test</button></aside></div></div>';

    root.onclick = function (e) {
      var el = e.target.closest ? e.target.closest("[data-opt],[data-go],#prevBtn,#nextBtn,#finishBtn,#submitBtn") : null;
      if (!el) return;
      if (el.hasAttribute("data-opt")) choose(Number(el.getAttribute("data-opt")));
      else if (el.hasAttribute("data-go")) go(Number(el.getAttribute("data-go")));
      else if (el.id === "prevBtn") go(session.current - 1);
      else if (el.id === "nextBtn") go(session.current + 1);
      else confirmSubmit();
    };
  }

  function confirmSubmit() {
    var answered = Object.keys(session.answers).length, total = session.questions.length;
    var back = document.createElement("div");
    back.className = "modal-back";
    back.innerHTML = '<div class="modal" style="grid-template-columns:1fr;max-width:440px"><div style="padding:36px;text-align:center">' +
      "<h2 style='font-size:26px'>Submit test?</h2><p class='muted'>You have answered <b>" + answered + "</b> of <b>" + total + "</b> questions." +
      (answered < total ? "<br><span style='color:#b45309'>" + (total - answered) + " question(s) are still unanswered.</span>" : "") + "</p>" +
      '<div style="display:flex;gap:12px;margin-top:24px"><button class="btn btn-outline" style="flex:1" id="cBack">Return to test</button>' +
      '<button class="btn btn-dark" style="flex:1" id="cGo">Submit now</button></div></div></div>';
    document.body.appendChild(back);
    back.addEventListener("click", function (e) {
      if (e.target === back || e.target.id === "cBack") back.remove();
      if (e.target.id === "cGo") { back.remove(); submit(false); }
    });
  }

  function submit(auto) {
    if (!session || session.submitting) return;
    session.submitting = true;
    clearInterval(timer);
    window.removeEventListener("keydown", keys);
    var s = U.getStudent() || { name: "Student", regNo: "N/A", category: "university", department: "CSC", level: "100 Level" };
    var t = session.test, score = 0;
    t.questions.forEach(function (q, i) {
      if (session.answers[i] === q.answerIndex) score++;
    });
    var pct = Math.round((score / t.questions.length) * 100);
    var rec = {
      studentName: s.name, regNo: s.regNo, testId: t.id, courseCode: t.code, testTitle: t.title,
      category: t.category, department: t.department, level: t.level,
      score: score, total: t.questions.length, percentage: pct,
      timeTaken: Math.min(t.durationMin * 60, Math.round((Date.now() - session.startedAt) / 1000)),
      durationSec: t.durationMin * 60,
      answers: session.answers
    };
    var saved = S.saveResult(rec);
    session = null;
    location.href = U.url("pages/result.html") + "?id=" + saved.id + (auto ? "&auto=1" : "") + "&testId=" + t.id;
  }
})();
