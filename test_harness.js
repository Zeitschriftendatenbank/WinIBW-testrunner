var TestRunner = {
  tests: {},
  results: [],
  _messageStack: [],
  _appendMessagesToActiveWindow: function() {
    try {
      if (!application || !application.activeWindow) return;
      for (var i = 0; i < this._messageStack.length; i++) {
        var m = this._messageStack[i];
        try { application.activeWindow.appendMessage(m.text, m.style); } catch (e) {}
      }
      this._messageStack = [];
    } catch (e) {}
  },
  add: function(name, fn) { this.tests[name] = fn; },
  assertEqual: function(a,b,msg) { if (a != b) throw { message: msg || ("Assertion failed: " + a + " != " + b) }; },
  assert: function(cond,msg) { if (!cond) throw { message: msg || "Assertion failed" }; },
  _out: function(s) {
    Notify.popup(s, 'TestRunner', 'message-icon', 3);
    try { this._messageStack.push({ text: s, style: 3 }); } catch (e) {}
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
  /**
   * Called from inside a test to ensure the test runs under a specific Kennung.
   * Performs prompt/login/search flow synchronously. If the user declines, the
   * function throws an object with {skip:true} which the runner treats as a skip.
   * @param {string} user - user id to switch to
   * @param {string} searchCmd - search command to run after login
   * @param {string} label - optional friendly label for prompts
   */
  runWithKennung: function(user, searchCmd, label) {
    var user = user || '6098';
    var cmd = searchCmd || '\\ZOE tit cinema';
    var lab = label || '';
    if(activeWindow.getVariable("P3GUK") === user) {
      return true;
    }
  
    var thePrompter = utility.newPrompter();
    var doLogin = false;
    try { doLogin = thePrompter.confirm('Test Login', 'Möchten Sie den Test ' + lab + ' mit der Kennung ' + user + ' ausführen?'); } catch (e) { doLogin = false; }
    if (!doLogin) {
      // signal skip to caller via throw
      return false;
    }

    // perform login via Users.switchTo (assumed available)
    var winId = Users.switchTo(user);
    if (!winId) {
      Notify.error('Login failed for user ' + user);
    }

    activeWindow.command(cmd, false);

    var ok = MISC.checkScreen(['8A','7A','IT','SC']);
    if (!ok) {
      activeWindow.closeWindow();
      throw 'Screen not correct after login';
    }
    return true;
  },
  _runOne: function(name, fn) {
    var ok = true, err = null, skipped = false;
    try { fn(); } catch (e) {
      if (e && e.skip) { skipped = true; err = null; ok = null; }
      else { ok = false; err = e; }
    }
    if (skipped) { this._out("SKIP: " + name); this.results.push({name: name, ok: null, skipped: true, err: null}); return; }
    if (ok) { this._out("OK: " + name); } else { this._out("FAIL: " + name + " -> " + (err && err.message ? err.message : err)); }
    this.results.push({name: name, ok: ok, skipped: false, err: err});
  },
  _summary: function() {
    var total = this.results.length, fail = 0, skip = 0, i;
    for (i = 0; i < total; i++) {
      if (this.results[i].skipped) skip++;
      else if (!this.results[i].ok) fail++;
    }
    var passed = total - fail - skip;
    this._out("Test summary: " + passed + " passed, " + fail + " failed, " + skip + " skipped, " + total + " total");
    try { this._appendMessagesToActiveWindow(); } catch (e) {}
  }
};
