/* ============================================================
   Materials page — filter, search and download PDF handouts
   ============================================================ */
(function () {
  "use strict";
  var U = window.PLH.ui, D = window.PLH.data;
  var IMG = {
    CSC101: "cmp.jpg", "COS 101": "cmp.jpg", "MTH 101": "cmp", MTH101: "cmp",
    "CPE 101": "cmp.jpg", "CPE 201": "cmp.jpg", "CPE 301": "cmp.jpg",
    "CPE 401": "cmp.jpg", "CPE 501": "cmp.jpg", "NCC 311": "cmp.jpg", NCC311: "cmp.jpg",
    "NCC 321": "cmp.jpg", "CYB 311": "cmp.jpg", CYB311: "cmp.jpg", "CYB 321": "cmp.jpg",
    "GST 101": "cmp.jpg", GST101: "cmp.jpg"
  };
  function cover(m) {
    if (m.category === "primary") return "cmp.jpg";
    if (m.category === "secondary") return "cmp.jpg";
    if (/HND-NCC/.test(m.department)) return "cmp.jpg";
    if (/HND-CYB/.test(m.department)) return "cmp.jpg";
    if (/HND-AI/.test(m.department)) return "cmp.jpg";
    if (/CPE/.test(m.department)) return "cmp.jpg";
    if (/^MTH/.test(m.courseCode)) return "cmp.jpg";
    if (/^GST/.test(m.courseCode)) return "cmp.jpg";
    return IMG[m.courseCode] || "cmp.jpg";
  }

  var state = { category: "ALL", department: "ALL", q: "" };

  document.addEventListener("DOMContentLoaded", function () {
    var s = U.getStudent();
    if (s) state.category = s.category;
    renderChips();
    render();
  });

  function renderChips() {
    var bar = document.getElementById("catChips");
    if (bar) {
      bar.innerHTML = [{ id: "ALL", name: "All Materials" }].concat(U.cats).map(function (c) {
        return '<button class="chip' + (state.category === c.id ? " active" : "") + '" data-cat="' + c.id + '">' + c.name + "</button>";
      }).join("");
      bar.onclick = function (e) {
        var b = e.target.closest("[data-cat]");
        if (!b) return;
        state.category = b.getAttribute("data-cat");
        state.department = "ALL";
        renderChips();
        renderDepChips();
        render();
      };
    }
    renderDepChips();
  }

  function renderDepChips() {
    var bar = document.getElementById("depChips");
    if (!bar) return;
    var cat = U.cats.filter(function (c) { return c.id === state.category; })[0];
    if (!cat) { bar.innerHTML = ""; return; }
    bar.innerHTML = [{ id: "ALL", name: "All departments" }].concat(cat.departments).map(function (d) {
      return '<button class="chip gold' + (state.department === d.id ? " active" : "") + '" data-dep="' + d.id + '">' + U.esc(d.name) + "</button>";
    }).join("");
    bar.onclick = function (e) {
      var b = e.target.closest("[data-dep]");
      if (!b) return;
      state.department = b.getAttribute("data-dep");
      renderDepChips();
      render();
    };
  }

  function render() {
    var list = D.materials.filter(function (m) {
      var okCat = state.category === "ALL" || m.category === state.category;
      var okDep = state.department === "ALL" || m.department === state.department;
      var q = state.q.toLowerCase();
      var okQ = !q || (m.title + " " + m.courseCode + " " + m.description + " " + m.level).toLowerCase().indexOf(q) >= 0;
      return okCat && okDep && okQ;
    });
    var count = document.getElementById("matCount");
    if (count) count.textContent = list.length + " PDF document" + (list.length === 1 ? "" : "s");
    var root = document.getElementById("matGrid");
    if (!root) return;
    if (!list.length) { root.innerHTML = '<p class="empty">No materials match your selection yet.</p>'; return; }
    root.innerHTML = list.map(function (m) {
      var name = m.fileName;
      return '<article class="doc-card">' +
        '<a href="' + U.url("downloads/" + name) + '" download="' + name + '" data-file="' + name + '" data-id="' + m.id + '" style="position:absolute;inset:0;z-index:5" aria-label="Download ' + U.esc(m.title) + '"></a>' +
        '<div class="cover"><img src="' + U.img(cover(m)) + '" alt=""><span class="code">' + U.esc(m.courseCode) + '</span><span class="pdf">PDF</span></div>' +
        '<div class="body"><div class="tag">' + (m.category === "ALL" ? "All students" : U.esc(U.catName(m.category) + " · " + U.depName(m.category, m.department) + " · " + m.level)) + "</div>" +
        "<h3 style='font-size:19px;margin:10px 0 8px;line-height:1.3'>" + U.esc(m.title) + "</h3>" +
        '<p class="small muted" style="flex:1">' + U.esc(m.description) + "</p>" +
        '<div class="meta"><span>📄 PDF · ' + U.fmtSize(m.sizeBytes) + "</span><span style='margin-left:auto'>⬇ " + m.downloads + " downloads</span></div>" +
        '<span class="btn btn-dark btn-block" style="margin-top:18px">⬇ Download PDF</span>' +
        "</div></article>";
    }).join("");

    root.onclick = function (e) {
      var a = e.target.closest("a[download]");
      if (!a) return;
      e.preventDefault();
      U.download(U.url("downloads/" + a.getAttribute("data-file")), a.getAttribute("data-file"), function () {
        var m = D.materials.filter(function (x) { return String(x.id) === a.getAttribute("data-id"); })[0];
        if (m) { m.downloads++; render(); }
      });
    };
    var q = document.getElementById("matSearch");
    if (q && !q.dataset.bound) {
      q.dataset.bound = "1";
      q.addEventListener("input", function () { state.q = q.value; render(); });
    }
  }
})();
