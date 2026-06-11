var TestRunner = {
  tests: {},
  results: [],
  add: function(name, fn) { this.tests[name] = fn; },
  assertEqual: function(a,b,msg) { if (a != b) throw { message: msg || ("Assertion failed: " + a + " != " + b) }; },
  assert: function(cond,msg) { if (!cond) throw { message: msg || "Assertion failed" }; },
  _out: function(s) {
    try {
      if (application.activeWindow && application.activeWindow.appendMessage) {
        application.activeWindow.appendMessage(s, 3);
        return;
      }
      if (typeof ActiveXObject !== 'undefined') {
        try {
          var sh = new ActiveXObject('WScript.Shell');
          // Popup(text, seconds, title, type) - type 64 = info icon
          sh.Popup(s, 2, 'TestRunner', 64);
          return;
        } catch (e) {}
      }
      if (typeof messageBox !== 'undefined') {
        try { messageBox('TestRunner', s, 'message-icon'); return; } catch (e) {}
      }
    } catch(e) {}
  },
  run: function(name) {
    this.results = [];
    if (!this.tests[name]) { this._out("Test not found: " + name); return; }
    this._runOne(name, this.tests[name]);
  },
  runAll: function() {
    this.results = [];
    for (var n in this.tests) {
      if (!this.tests.hasOwnProperty(n)) continue;
      this._runOne(n, this.tests[n]);
    }
    this._summary();
  },
  _runOne: function(name, fn) {
    var ok = true, err = null;
    try { fn(); } catch (e) { ok = false; err = e; }
    if (ok) { this._out("OK: " + name); } else { this._out("FAIL: " + name + " -> " + (err && err.message ? err.message : err)); }
    this.results.push({name: name, ok: ok, err: err});
  },
  _summary: function() {
    var total = this.results.length, fail = 0, i;
    for (i = 0; i < total; i++) if (!this.results[i].ok) fail++;
    this._out("Test summary: " + (total - fail) + " passed, " + fail + " failed, " + total + " total");
  }
};
