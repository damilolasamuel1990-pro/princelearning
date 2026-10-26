/* ============================================================
   Prince Learning Hub — shared UI (header, footer, login, chat)
   ============================================================ */
window.PLH = window.PLH || {};
(function () {
  "use strict";
  var BASE = window.PLH_BASE || "./";
  var D = function () { return window.PLH.data || { news: [], lectures: [], materials: [] }; };

  /* ---------------- helpers ---------------- */
  function url(p) { return BASE + p; }
  function img(p) { return BASE + "images/" + p; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(iso, withTime) {
    var d = new Date(iso);
    var o = { day: "numeric", month: "short", year: "numeric" };
    if (withTime) { o.hour = "2-digit"; o.minute = "2-digit"; }
    return d.toLocaleString("en-GB", o);
  }
  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }
  function fmtDur(sec) { return Math.floor(sec / 60) + "m " + String(sec % 60).padStart(2, "0") + "s"; }
  function grade(p) {
    if (p >= 70) return { l: "A", t: "Excellent", c: "#047857" };
    if (p >= 60) return { l: "B", t: "Very Good", c: "#0f766e" };
    if (p >= 50) return { l: "C", t: "Good", c: "#0369a1" };
    if (p >= 45) return { l: "D", t: "Fair", c: "#b45309" };
    if (p >= 40) return { l: "E", t: "Pass", c: "#c2410c" };
    return { l: "F", t: "Fail", c: "#be123c" };
  }

  /* ---------------- brand marks ---------------- */
  function crest(size) {
    return '<svg class="mark" width="' + size + '" height="' + size + '" viewBox="38 0 164 134" aria-hidden="true">' +
      '<path d="M62 88 C50 66 58 45 80 35" fill="none" stroke="#2286A8" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M94 33 L79 27 L79 45 Z" fill="#2286A8" transform="rotate(-16 79 36)"/>' +
      '<path d="M120 14 L123.4 22.2 L132.2 22.9 L125.5 28.8 L127.3 37.5 L120 33.1 L112.7 37.5 L114.5 28.8 L107.8 22.9 L116.6 22.2 Z" fill="#E9A13B"/>' +
      '<path d="M120 2 V8 M107 8 L111 12.5 M133 8 L129 12.5" stroke="#E9A13B" stroke-width="2.6" stroke-linecap="round"/>' +
      '<circle cx="137" cy="18" r="3.3" fill="#E9A13B"/><circle cx="148" cy="22" r="3.1" fill="#E9A13B"/>' +
      '<circle cx="158" cy="29" r="2.9" fill="#E9A13B"/><circle cx="167" cy="39" r="2.7" fill="#E9A13B"/>' +
      '<circle cx="173" cy="51" r="2.5" fill="#E9A13B"/><circle cx="177" cy="64" r="2.3" fill="#E9A13B"/>' +
      '<path d="M58 88 C82 90 102 96 120 108 C138 96 158 90 182 88 L182 97 C158 99 138 105 120 117 C102 105 82 99 58 97 Z" fill="#2286A8"/>' +
      '<path d="M120 108 C102 96 82 90 58 88 L58 74 C82 76 104 82 120 94 Z" fill="#fff" stroke="#163E63" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M120 108 C138 96 158 90 182 88 L182 74 C158 76 136 82 120 94 Z" fill="#fff" stroke="#163E63" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M120 117 L111 126 L120 121 L129 126 Z" fill="#2286A8"/>' +
      '<circle cx="92" cy="57" r="3.2" fill="#2286A8"/><circle cx="120" cy="47" r="3.8" fill="#2286A8"/><circle cx="148" cy="57" r="3.2" fill="#2286A8"/>' +
      '<path d="M92 97 L92 62 L106 75 L120 53 L134 75 L148 62 L148 97 Z" fill="#163E63"/>' +
      '<path d="M92 88 H148 V97 H92 Z" fill="#2286A8"/></svg>';
  }
  function lockup(size) {
    var tone = { navy: "#F2F6FA", teal: "#8FD2E6", gold: "#E9A13B", page: "#12233A" };
    var letters = "KNOWLEDGE · GROWTH · EXCELLENCE".split(""), tag = "";
    for (var i = 0; i < letters.length; i++) {
      var phi = (i - (letters.length - 1) / 2) * (88 / (letters.length - 1));
      var rad = (phi * Math.PI) / 180;
      tag += '<text transform="translate(' + (120 + 102 * Math.sin(rad)).toFixed(2) + " " + (122 + 102 * Math.cos(rad)).toFixed(2) +
        ") rotate(" + phi.toFixed(2) + ')" text-anchor="middle" dominant-baseline="central" fill="' + tone.navy +
        '" font-family="Inter, Arial, sans-serif" font-size="7" font-weight="600">' + esc(letters[i]) + "</text>";
    }
    return '<svg class="logo-lockup" width="' + size + '" height="' + size + '" viewBox="0 0 240 240" role="img" aria-label="Prince Learning Hub">' +
      '<path d="M40.8 201.2 A 112 112 0 0 0 40.8 42.8" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="3"/>' +
      '<path d="M199.2 42.8 A 112 112 0 0 1 199.2 201.2" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="3"/>' +
      '<g transform="translate(0,10) scale(1)">' + crest(0).replace(/<svg[^>]*>|<\/svg>/g, "") + "</g>" +
      '<text x="120" y="160" text-anchor="middle" fill="' + tone.navy + '" font-family="Fraunces, Georgia, serif" font-size="36" font-weight="700" letter-spacing="2">PRINCE</text>' +
      '<text x="120" y="181" text-anchor="middle" fill="' + tone.teal + '" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="5.5">• LEARNING •</text>' +
      '<path d="M62 198 H102 M138 198 H178" stroke="' + tone.teal + '" stroke-width="2"/>' +
      '<text x="120" y="205" text-anchor="middle" fill="' + tone.teal + '" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="5">HUB</text>' +
      tag + "</svg>";
  }

  /* ---------------- student session ---------------- */
  var CATS = [
    { id: "university", name: "University", image: "westland.jpg", idLabel: "Matriculation number", ph: "e.g. CSC/2026/014",
      departments: [
        { id: "CSC", name: "Computer Science", levels: ["100 Level", "200 Level", "300 Level", "400 Level"] },
        { id: "SEN", name: "Software Engineering", levels: ["100 Level", "200 Level", "300 Level", "400 Level"] },
        { id: "CPE", name: "Computer Engineering", levels: ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level"] }
      ] },
    { id: "polytechnic", name: "Polytechnic", image: "polytechnic.jpg", idLabel: "Matriculation number", ph: "e.g. ND/COM/2026/031",
      departments: [
        { id: "ND-CSC", name: "ND Computer Science", levels: ["ND 1", "ND 2"] },
        { id: "HND-SWD", name: "HND Software & Web Development", levels: ["HND 1", "HND 2"] },
        { id: "HND-NCC", name: "HND Networking & Cloud Computing", levels: ["HND 1", "HND 2"] },
        { id: "HND-CYB", name: "HND Cybersecurity & Data Protection", levels: ["HND 1", "HND 2"] },
        { id: "HND-AI", name: "HND Artificial Intelligence", levels: ["HND 1", "HND 2"] }
      ] },
    { id: "secondary", name: "Secondary School", image: "secondary.jpg", idLabel: "Admission number", ph: "e.g. SSS/2026/112",
      departments: [
        { id: "JSS", name: "Junior Secondary (JSS)", levels: ["JSS 1", "JSS 2", "JSS 3"] },
        { id: "SSS", name: "Senior Secondary (SSS)", levels: ["SSS 1", "SSS 2", "SSS 3"] }
      ] },
    { id: "primary", name: "Primary School", image: "primary.jpeg", idLabel: "Admission number", ph: "e.g. PRY/2026/045",
      departments: [{ id: "PRI", name: "Primary School", levels: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"] }] }
  ];

  function getStudent() {
    try { return JSON.parse(localStorage.getItem("plh_student") || "null"); } catch (e) { return null; }
  }
  function setStudent(s) {
    if (s) localStorage.setItem("plh_student", JSON.stringify(s)); else localStorage.removeItem("plh_student");
    renderHeader(); renderFooter();
  }
  function catName(id) { var c = CATS.filter(function (x) { return x.id === id; })[0]; return c ? c.name : id; }
  function depName(cat, dep) {
    var c = CATS.filter(function (x) { return x.id === cat; })[0];
    if (!c) return dep;
    var d = c.departments.filter(function (x) { return x.id === dep; })[0];
    return d ? d.name : dep;
  }

  /* ---------------- header / footer ---------------- */
  var NAV = [
    ["index.html", ""], ["lectures.html", "Lectures"], ["materials.html", "Materials"],
    ["cbt.html", "CBT"], ["results.html", "Results"], ["news.html", "News"], ["chat.html", "Discussions"]
  ];

  function renderHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    var s = getStudent();
    var navHtml = NAV.map(function (n) {
      return '<a href="' + url("pages/" + n[0]) + '" class="' + (page === n[0] ? "active" : "") + '">' + n[1] + "</a>";
    }).join("");
    var right = s
      ? '<div class="header-actions"><span class="avatar">' + esc(s.name.charAt(0).toUpperCase()) + "</span>" +
        '<div class="user-meta"><b>' + esc(s.name) + "</b><span>" + esc(s.level) + " · " + esc(catName(s.category)) + "</span></div>" +
        '<button class="icon-btn" id="signoutBtn" title="Sign out">⎋</button></div>'
      : '<div class="header-actions"><button class="btn btn-dark" id="loginBtn">Student Login</button></div>';

    el.innerHTML =
      '<div class="topbar"><div class="wrap">' +
      '<div class="grp"><a href="https://wa.me/2347036042766" target="_blank" rel="noopener">WhatsApp: 07036042766</a>' +
      '<a href="mailto:damilolasamuel1990@gmail.com">damilolasamuel1990@gmail.com</a></div>' +
      '<div class="grp"><span>2025 / 2026 Academic Session</span><a href="' + url("pages/admin.html") + '">Staff Portal</a></div>' +
      "</div></div>" +
      '<header class="site-header"><div class="wrap">' +
      '<a class="brand" href="' + url("index.html") + '">' + crest(46) +
      '<span><span class="name">Prince</span><span class="sub">Learning Hub</span></span></a>' +
      '<nav class="nav">' + navHtml + "</nav>" + right +
      '<button class="burger" id="burgerBtn" aria-label="Menu">☰</button>' +
      '</div><div class="mobile-nav" id="mobileNav">' + navHtml + "</div></header>";

    var lb = document.getElementById("loginBtn");
    if (lb) lb.addEventListener("click", openLogin);
    var so = document.getElementById("signoutBtn");
    if (so) so.addEventListener("click", function () { setStudent(null); location.reload(); });
    var bg = document.getElementById("burgerBtn");
    if (bg) bg.addEventListener("click", function () {
      var m = document.getElementById("mobileNav");
      m.style.display = m.style.display === "block" ? "none" : "block";
    });
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    el.innerHTML = '<footer class="site-footer"><div class="wrap"><div class="cols">' +
      '<div class="footer-brand">' + lockup(190) +
      '<p style="margin-top:18px;max-width:320px;font-size:14px">An online campus for university, polytechnic, secondary and primary students, with lectures, PDF course materials, CBT tests and tutor support.</p></div>' +
      "<div><h4>Academics</h4><ul>" +
      '<li><a href="' + url("pages/lectures.html") + '">Online Lectures</a></li>' +
      '<li><a href="' + url("pages/materials.html") + '">Course Materials</a></li>' +
      '<li><a href="' + url("pages/cbt.html") + '">CBT Tests</a></li>' +
      '<li><a href="' + url("pages/results.html") + '">Results</a></li></ul></div>' +
      "<div><h4>Community</h4><ul>" +
      '<li><a href="' + url("pages/chat.html") + '">Discussions</a></li>' +
      '<li><a href="' + url("pages/news.html") + '">News &amp; Notices</a></li>' +
      '<li><a href="' + url("pages/admin.html") + '">Staff Portal</a></li></ul></div>' +
      "<div><h4>Contact Us</h4><ul>" +
      '<li>WhatsApp / Call<br><b style="color:#fff;font-size:17px">07036042766</b></li>' +
      '<li>Email<br><a href="mailto:damilolasamuel1990@gmail.com" style="color:#fff">damilolasamuel1990@gmail.com</a></li>' +
      "<li>Course Lecturer: <b style='color:#fff'>Mr. Damilola</b></li></ul></div>" +
      "</div><div class='footer-bottom'><span>© " + new Date().getFullYear() +
      " Prince Learning Hub. All rights reserved.</span><span>Photography courtesy of Pexels contributors</span></div></div></footer>";
  }

  /* ---------------- login modal ---------------- */
  function openLogin() {
    var s = getStudent() || {};
    var cat = s.category || "university";
    var wrap = document.createElement("div");
    wrap.className = "modal-back";
    wrap.id = "loginModal";
    var catBtns = CATS.map(function (c) {
      return '<button type="button" class="cat-btn' + (c.id === cat ? " on" : "") + '" data-cat="' + c.id + '">' +
        '<span class="dot">' + (c.id === cat ? "✓" : "") + "</span>" + c.name + "</button>";
    }).join("");
    wrap.innerHTML = '<div class="modal">' +
      '<div class="pic" id="loginPic" style="background-image:url(' + img((CATS.filter(function (c) { return c.id === cat; })[0] || CATS[0]).image) + ')">' +
      '<div class="scrim"></div><div class="quote">“Education is the passport to the future.”<br><span style="font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#d8bb7a">— Malcolm X</span></div></div>' +
      '<div class="form"><button class="close" id="loginClose">✕</button>' +
      "<h2 style='font-size:28px;margin-top:18px'>Student Login</h2>" +
      "<p class='muted small'>Tell us who you are so we can show your class's tests.</p>" +
      "<label class='field' style='margin-top:22px'>I am a student of</label>" +
      "<div class='cat-grid'>" + catBtns + "</div>" +
      "<div id='loginFields'></div>" +
      "<button class='btn btn-dark btn-block' id='loginSubmit' style='margin-top:22px'>Continue</button>" +
      '<p class="muted" style="font-size:11.5px;text-align:center;margin-top:12px">Your details are used for CBT results and discussions.</p>' +
      "</div></div>";
    document.body.appendChild(wrap);

    function paintFields() {
      var c = CATS.filter(function (x) { return x.id === cat; })[0];
      var dep = s.department && c.departments.some(function (d) { return d.id === s.department; }) ? s.department : c.departments[0].id;
      var dObj = c.departments.filter(function (d) { return d.id === dep; })[0];
      var lvl = s.level && dObj.levels.indexOf(s.level) >= 0 ? s.level : dObj.levels[0];
      document.getElementById("loginFields").innerHTML =
        (c.departments.length > 1
          ? "<label class='field' style='margin-top:18px'>" + (cat === "secondary" ? "Section" : "Department / Programme") + "</label>" +
            "<select class='f' id='f_dep'>" + c.departments.map(function (d) {
              return "<option value='" + d.id + "'" + (d.id === dep ? " selected" : "") + ">" + d.name + "</option>";
            }).join("") + "</select>"
          : "") +
        "<div style='display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px'>" +
        "<div><label class='field'>" + (cat === "university" ? "Level" : "Class / Level") + "</label><select class='f' id='f_level'>" +
        dObj.levels.map(function (l) { return "<option" + (l === lvl ? " selected" : "") + ">" + l + "</option>"; }).join("") + "</select></div>" +
        "<div><label class='field'>" + c.idLabel + "</label><input class='f' id='f_reg' value='" + esc(s.regNo || "") + "' placeholder='" + c.ph + "' style='text-transform:uppercase'></div></div>" +
        "<div style='margin-top:16px'><label class='field'>Full name</label><input class='f' id='f_name' value='" + esc(s.name || "") + "' placeholder='e.g. Amaka Johnson'></div>";

      var depSel = document.getElementById("f_dep");
      if (depSel) depSel.addEventListener("change", function () { s.department = depSel.value; paintFields(); });
      var lvlSel = document.getElementById("f_level");
      if (lvlSel) lvlSel.addEventListener("change", function () { s.level = lvlSel.value; });
    }
    paintFields();

    wrap.addEventListener("click", function (e) {
      var cb = e.target.closest ? e.target.closest(".cat-btn") : null;
      if (cb) {
        cat = cb.getAttribute("data-cat");
        s.category = cat;
        s.department = CATS.filter(function (c) { return c.id === cat; })[0].departments[0].id;
        wrap.querySelectorAll(".cat-btn").forEach(function (b) {
          var on = b.getAttribute("data-cat") === cat;
          b.classList.toggle("on", on);
          b.querySelector(".dot").textContent = on ? "✓" : "";
        });
        document.getElementById("loginPic").style.backgroundImage = "url(" + img((CATS.filter(function (c) { return c.id === cat; })[0]).image) + ")";
        paintFields();
      }
      if (e.target.id === "loginClose" || e.target === wrap) wrap.remove();
      if (e.target.id === "loginSubmit") {
        var name = (document.getElementById("f_name").value || "").trim();
        var reg = (document.getElementById("f_reg").value || "").trim().toUpperCase();
        if (name.length < 3) return alert("Please enter your full name.");
        if (reg.length < 3) return alert("Please enter a valid registration number.");
        setStudent({
          name: name, regNo: reg, category: cat,
          department: (document.getElementById("f_dep") || {}).value || CATS.filter(function (c) { return c.id === cat; })[0].departments[0].id,
          level: (document.getElementById("f_level") || {}).value || "100 Level"
        });
        wrap.remove();
        location.reload();
      }
    });
  }

  /* ---------------- whatsapp float ---------------- */
  function renderWhatsApp() {
    var w = document.createElement("div");
    w.className = "wa";
    w.innerHTML = '<div id="waCard" style="display:none"><div class="card">' +
      '<div class="top"><span style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center">💬</span>' +
      "<div><b style='font-size:14px'>Prince Learning Hub</b><br><span style='font-size:11px;opacity:.8'>Typically replies within minutes</span></div></div>" +
      '<div class="msgline"><span>Hello 👋 Need help with lectures, course materials or your CBT test? Chat with us on WhatsApp.</span></div>' +
      '<div class="actions"><a class="btn" style="background:#25d366;color:#fff" href="https://wa.me/2347036042766" target="_blank" rel="noopener">Chat on WhatsApp</a>' +
      '<p class="small muted" style="text-align:center;margin:0">07036042766 · <a href="mailto:damilolasamuel1990@gmail.com" style="text-decoration:underline">Email us</a></p></div>' +
      "</div></div>" +
      '<button class="fab" id="waFab" aria-label="Chat on WhatsApp">' +
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>';
    document.body.appendChild(w);
    document.getElementById("waFab").addEventListener("click", function () {
      var c = document.getElementById("waCard");
      c.style.display = c.style.display === "block" ? "none" : "block";
    });
  }

  /* ---------------- download helper ---------------- */
  function download(href, fileName, onDone) {
    var done = function (msg, cls) {
      var t = document.createElement("div");
      t.className = "toast";
      t.innerHTML = "<div class='row'><div>" + msg + "</div></div>" +
        "<div class='bar'><a href='" + href + "' target='_blank' rel='noopener' class='small' style='color:#1d4ed8;text-decoration:underline'>Open in a new tab instead</a>" +
        "<button class='btn btn-outline' style='padding:8px 14px;font-size:12px'>Close</button></div>";
      t.querySelector("button").addEventListener("click", function () { t.remove(); });
      document.body.appendChild(t);
      if (cls === "ok") setTimeout(function () { t.remove(); }, 9000);
      if (onDone) onDone();
    };
    var picker = window.showSaveFilePicker;
    var save = function (handle) {
      fetch(href, { cache: "no-store" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.blob();
      }).then(function (blob) {
        if (handle) {
          return handle.createWritable().then(function (w) {
            return w.write(blob).then(function () { return w.close(); }).then(function () {
              done("✓ <b>" + esc(fileName) + "</b> (" + (blob.size / 1024).toFixed(0) + " KB) saved to the folder you chose.", "ok");
            });
          });
        }
        var u = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = u; a.download = fileName;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
        done("✓ <b>" + esc(fileName) + "</b> (" + (blob.size / 1024).toFixed(0) + " KB) downloaded. Check your Downloads folder.", "ok");
      }).catch(function () {
        done("⚠ The file could not be saved automatically. Choose <b>Open in a new tab instead</b>, then use your browser's download button.");
      });
    };
    if (typeof picker === "function") {
      picker({ suggestedName: fileName, types: [{ description: "PDF document", accept: { "application/pdf": [".pdf"] } }] })
        .then(save).catch(function (e) {
          if (e && e.name === "AbortError") return;
          save(null);
        });
    } else save(null);
  }

  /* ---------------- public api ---------------- */
  window.PLH.ui = {
    url: url, img: img, esc: esc, fmtDate: fmtDate, fmtSize: fmtSize, fmtDur: fmtDur, grade: grade,
    crest: crest, lockup: lockup, cats: CATS, catName: catName, depName: depName,
    getStudent: getStudent, requireLogin: function () { if (!getStudent()) { openLogin(); return false; } return true; },
    openLogin: openLogin, download: download, data: D
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    renderWhatsApp();
  });
})();
