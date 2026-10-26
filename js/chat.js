/* ============================================================
   Discussion rooms (shared widget + page)
   ============================================================ */
window.PLH = window.PLH || {};
(function () {
  "use strict";
  var U = window.PLH.ui, S = window.PLH.store;
  var ROOMS = [
    { id: "general", name: "General Lounge", desc: "Open to all students" },
    { id: "CSC101", name: "CSC 101", desc: "Computer Science" },
    { id: "MTH101", name: "MTH 101", desc: "Mathematics" },
    { id: "GST101", name: "GST 101", desc: "Use of English" },
    { id: "PHY101", name: "PHY 101", desc: "Physics" }
  ];
  var AVA = ["bg-a", "bg-b", "bg-c", "bg-d", "bg-e", "bg-f"];
  function toneFor(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return ["#364562", "#957037", "#4a5b7a", "#0f766e", "#9f1239", "#2286a8"][h % 6];
  }

  function mount(el, room, title, subtitle) {
    var replyTo = null, onlyQ = false, myId = null;
    el.className = "chat-shell";
    el.innerHTML =
      '<div class="chat-head"><div><h3 style="font-size:19px;margin:0">' + U.esc(title) + "</h3>" +
      (subtitle ? '<p class="small muted" style="margin:2px 0 0">' + U.esc(subtitle) + "</p>" : "") + "</div>" +
      '<button class="chip" id="qOnly">❓ Questions only</button></div>' +
      '<div class="chat-log" id="chatLog"></div>' +
      '<div id="replyBar"></div>' +
      '<form class="chat-form" id="chatForm">' +
      '<button type="button" class="chip" id="askBtn" style="white-space:nowrap">❓ Ask</button>' +
      '<input class="f" id="chatInput" placeholder="Write a message…" autocomplete="off">' +
      '<button class="btn btn-dark">Send</button></form>';

    function paint() {
      var all = S.chat(room);
      var byId = {};
      all.forEach(function (m) { if (m.id) byId[m.id] = m; });
      var shown = onlyQ ? all.filter(function (m) { return m.isQuestion || (m.replyTo && byId[m.replyTo] && byId[m.replyTo].isQuestion); }) : all;
      var log = el.querySelector("#chatLog");
      var s = U.getStudent();
      log.innerHTML = shown.length
        ? shown.map(function (m) {
            var mine = s && m.regNo === s.regNo;
            var staff = /^STAFF/.test(m.regNo);
            var parent = m.replyTo ? byId[m.replyTo] : null;
            return '<div class="msg' + (mine ? " mine" : "") + (m.isQuestion ? " q" : "") + '">' +
              '<div class="ava" style="background:' + (staff ? "#121c31" : toneFor(m.regNo)) + ';color:' + (staff ? "#d8bb7a" : "#fff") + '">' +
              U.esc(m.senderName.charAt(0).toUpperCase()) + "</div>" +
              '<div><div class="who">' + (mine ? "You" : U.esc(m.senderName)) + (staff ? ' <b style="color:#957037">· TUTOR</b>' : "") + " · " + U.fmtDate(m.createdAt, true) + "</div>" +
              '<div class="bubble">' +
              (m.isQuestion ? '<div class="tag" style="color:#957037;margin-bottom:4px">❓ Question</div>' : "") +
              (parent ? '<div class="reply">↪ <b>' + U.esc(parent.senderName) + ":</b> " + U.esc(parent.body.slice(0, 80)) + "</div>" : "") +
              U.esc(m.body) + "</div>" +
              '<button class="small" data-reply="' + (m.id || "") + '" style="background:none;border:0;color:#957037;font-weight:600;cursor:pointer;padding:2px 0;opacity:.75">' +
              (m.isQuestion ? "Answer" : "Reply") + "</button></div></div>";
          }).join("")
        : '<p class="empty">No messages yet. Start the conversation.</p>';
      log.scrollTop = log.scrollHeight;
    }

    el.addEventListener("click", function (e) {
      var r = e.target.closest ? e.target.closest("[data-reply]") : null;
      if (r) {
        var id = Number(r.getAttribute("data-reply"));
        replyTo = S.chat(room).filter(function (m) { return m.id === id; })[0] || null;
        el.querySelector("#replyBar").innerHTML = replyTo
          ? '<div style="padding:9px 16px;background:var(--ink-50);font-size:12px;display:flex;justify-content:space-between"><span>Replying to <b>' +
            U.esc(replyTo.senderName) + "</b>: " + U.esc(replyTo.body.slice(0, 60)) +
            '</span><button id="clearReply" style="border:0;background:none;cursor:pointer">✕</button></div>'
          : "";
        if (replyTo) el.querySelector("#clearReply").addEventListener("click", function () { replyTo = null; el.querySelector("#replyBar").innerHTML = ""; });
      }
      if (e.target.id === "qOnly") {
        onlyQ = !onlyQ;
        e.target.classList.toggle("active", onlyQ);
        paint();
      }
      if (e.target.id === "askBtn") {
        e.target.classList.toggle("active");
        el.querySelector("#chatInput").placeholder = e.target.classList.contains("active")
          ? "Type your question for the tutor…" : "Write a message…";
      }
    });

    el.querySelector("#chatForm").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!U.requireLogin()) return;
      var input = el.querySelector("#chatInput");
      var body = input.value.trim();
      if (!body) return;
      var s = U.getStudent();
      S.post({
        room: room, senderName: s.name, regNo: s.regNo, body: body,
        isQuestion: el.querySelector("#askBtn").classList.contains("active"),
        replyTo: replyTo ? replyTo.id : null
      });
      input.value = "";
      replyTo = null;
      el.querySelector("#replyBar").innerHTML = "";
      paint();
    });

    paint();
    setInterval(paint, 3000);
  }

  window.PLH.chat = { mount: mount, rooms: ROOMS };

  document.addEventListener("DOMContentLoaded", function () {
    var host = document.getElementById("chatWidget");
    if (!host) return;
    var side = document.getElementById("roomList");
    var room = "general";
    function renderSide() {
      side.innerHTML = ROOMS.map(function (r) {
        return '<button class="chip' + (r.id === room ? " active" : "") + '" data-room="' + r.id + '" style="display:block;text-align:left;width:100%;margin-bottom:8px">' +
          "<b>#" + U.esc(r.name) + "</b><br><span style='opacity:.75;font-size:11px'>" + U.esc(r.desc) + "</span></button>";
      }).join("");
      side.onclick = function (e) {
        var b = e.target.closest("[data-room]");
        if (!b) return;
        room = b.getAttribute("data-room");
        renderSide();
        host.innerHTML = "";
        var cur = ROOMS.filter(function (r) { return r.id === room; })[0];
        mount(host, room, cur.name, cur.desc);
      };
    }
    renderSide();
    var cur = ROOMS[0];
    mount(host, room, cur.name, cur.desc);
  });
})();
