/* ============================================================
   Local storage store: student CBT results + chat messages
   ============================================================ */
window.PLH = window.PLH || {};
(function () {
  "use strict";
  function read(k, fb) { try { return JSON.parse(localStorage.getItem(k) || "null") || fb; } catch (e) { return fb; } }
  function write(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  /* ---- results ---- */
  function results() { return read("plh_results", []); }
  function saveResult(r) {
    var all = results();
    r.id = all.length ? Math.max.apply(null, all.map(function (x) { return x.id; })) + 1 : 1;
    r.createdAt = new Date().toISOString();
    all.push(r);
    write("plh_results", all);
    return r;
  }
  function getResult(id) {
    return results().filter(function (r) { return String(r.id) === String(id); })[0] || null;
  }
  function myResults(regNo) {
    return results().filter(function (r) { return r.regNo === regNo; }).sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }
  function topResults(category) {
    return results().filter(function (r) { return !category || r.category === category; })
      .sort(function (a, b) { return b.percentage - a.percentage || a.timeTaken - b.timeTaken; }).slice(0, 10);
  }

  /* ---- chat ---- */
  var SEED = [
    { room: "general", senderName: "Tutor Prince", regNo: "STAFF-001", body: "Welcome to the Prince Learning Hub discussion rooms. Ask your questions here and tutors or classmates will help. 🎓", isQuestion: false },
    { room: "general", senderName: "Amaka Johnson", regNo: "PLH/2026/014", body: "When is the deadline for the CBT practice test?", isQuestion: true },
    { room: "general", senderName: "Tutor Prince", regNo: "STAFF-001", body: "The practice tests are open all session — you can attempt them as many times as you like.", isQuestion: false },
    { room: "CSC101", senderName: "Fatima Musa", regNo: "PLH/2026/031", body: "The COS 101 handout is very detailed, especially the units on number systems.", isQuestion: false },
    { room: "MTH101", senderName: "Tunde Bakare", regNo: "PLH/2026/022", body: "Can someone explain the difference between union and intersection of sets?", isQuestion: true },
    { room: "general", senderName: "Kemi Ade", regNo: "SEN/2023/044", body: "Downloading the handouts works well now — the save dialog asks where to keep the file.", isQuestion: false }
  ];
  function chat(room) {
    var all = read("plh_chat", null);
    if (!all) { all = SEED; write("plh_chat", all); }
    return all.filter(function (m) { return m.room === room; });
  }
  function post(m) {
    var all = read("plh_chat", SEED);
    m.id = all.length ? Math.max.apply(null, all.map(function (x) { return x.id || 0; })) + 1 : 1;
    m.createdAt = new Date().toISOString();
    all.push(m);
    write("plh_chat", all);
    return m;
  }

  /* ---- admin extras (news + lecture status) ---- */
  function extraNews() { return read("plh_news", []); }
  function addNews(n) {
    var all = extraNews();
    n.id = "n" + Date.now();
    n.createdAt = new Date().toISOString();
    all.unshift(n);
    write("plh_news", all);
    return n;
  }
  function removeNews(id) { write("plh_news", extraNews().filter(function (n) { return String(n.id) !== String(id); })); }
  function statusOverride() { return read("plh_status", {}); }
  function setStatus(id, status) {
    var o = statusOverride();
    o[id] = status;
    write("plh_status", o);
  }

  window.PLH.store = {
    results: results, saveResult: saveResult, getResult: getResult, myResults: myResults, topResults: topResults,
    chat: chat, post: post,
    extraNews: extraNews, addNews: addNews, removeNews: removeNews,
    statusOverride: statusOverride, setStatus: setStatus
  };
})();
