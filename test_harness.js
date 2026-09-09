var TestRunner = {
  tests: {},
  results: [],
  _messageStack: [],
  _appendMessagesToActiveWindow: function () {
    try {
      if (!application || !application.activeWindow) return;
      for (var i = 0; i < this._messageStack.length; i++) {
        var m = this._messageStack[i];
        try { application.activeWindow.appendMessage(m.text, m.style); } catch (e) { }
      }
      this._messageStack = [];
    } catch (e) { }
  },
  add: function (name, fn) { this.tests[name] = fn; },
  assertEqual: function (a, b, msg) { if (a != b) throw { message: msg || ("Assertion failed: " + a + " != " + b) }; },
  assert: function (cond, msg) { if (!cond) throw { message: msg || "Assertion failed" }; },
  _out: function (s) {
    Notify.popup(s, 'TestRunner', 'message-icon', 3);
    try { this._messageStack.push({ text: s, style: 3 }); } catch (e) { }
  },
  run: function (name) {
    this.results = [];
    if (!this.tests[name]) { this._out("Test not found: " + name); return; }
    this._runOne(name, this.tests[name]);
  },
  runAll: function () {
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
   * @param {string} url - URL of the system
   * @param {string} user - user id to switch to
   * @param {string} searchCmd - search command to run after login
   * @param {string} label - optional friendly label for prompts
   * @returns {string|boolean} - returns the screen code if successful, or false if skipped
   */
  runWithKennung: function (url, user, searchCmd, label) {
    var url = url || getProfileString('testrunner', 'url', 'pica3://ibw0.dnb.de:1042');
    var user = user || getProfileString('testrunner', 'user', '6098');
    var cmd = searchCmd || getProfileString('testrunner', 'searchCmd', '');
    var lab = label || '';


    var thePrompter = utility.newPrompter();
    var doLogin = false;
    try { doLogin = thePrompter.confirm('Test Login', 'Möchten Sie den Test ' + lab + ' mit der Kennung ' + user + ' ausführen?'); } catch (e) { doLogin = false; }
    if (!doLogin) {
      // signal skip to caller via throw
      return false;
    }


    // perform login via Users.switchTo (assumed available)
    if (activeWindow.getVariable("P3GUK") != user) {
      var switched = Users.switchTo(user);
      // Some Users implementations may return false/undefined while the
      // login actually succeeded (P3GUK updated asynchronously). Accept
      // cases where P3GUK now matches the requested user.
      if (!switched && activeWindow.getVariable("P3GUK") != user) {
        Notify.error('Anmeldung fehlgeschlagen für Benutzer ' + user);
        return false;
      }
    }

    if (cmd) {
      //activeWindow.command(cmd, false);
      MISC.wait(cmd, { timeout: 60000, pollInterval: 250 });
      Notify.info('Suche nach ' + cmd);
    }
    return MISC.checkScreen();
  },
  _runOne: function (name, fn) {
    var ok = true, err = null, skipped = false;
    try { fn(); } catch (e) {
      if (e && e.skip) { skipped = true; err = null; ok = null; }
      else { ok = false; err = e; }
    }
    if (skipped) { this._out("SKIP: " + name); this.results.push({ name: name, ok: null, skipped: true, err: null }); return; }
    if (ok) { this._out("OK: " + name); } else { this._out("FAIL: " + name + " -> " + (err && err.message ? err.message : err)); }
    this.results.push({ name: name, ok: ok, skipped: false, err: err });
  },
  _summary: function () {
    var total = this.results.length, fail = 0, skip = 0, i;
    for (i = 0; i < total; i++) {
      if (this.results[i].skipped) skip++;
      else if (!this.results[i].ok) fail++;
    }
    var passed = total - fail - skip;
    this._out("Test summary: " + passed + " passed, " + fail + " failed, " + skip + " skipped, " + total + " total");
    try { this._appendMessagesToActiveWindow(); } catch (e) { }
  }
};

/**
 * Show a popup with all available tests and let the user pick one to run.
 * Uses the utility.newPrompter().select dialog which expects a '\n'-separated list.
 * Returns the selected test name or null when cancelled.
 */
TestRunner.runSelect = function () {
  var names = [];
  for (var n in this.tests) {
    if (!this.tests.hasOwnProperty(n)) continue;
    names.push(n);
  }
  if (names.length === 0) {
    this._out('No tests available');
    return null;
  }
  var list = names.join('\n');
  var thePrompter = utility.newPrompter();
  try {
    var choice = thePrompter.select('Run Test', 'Select a test to run', list);
  } catch (e) {
    // If the prompter cannot be created or user cancelled
    this._out('Test selection cancelled');
    return null;
  }
  if (!choice) {
    this._out('Test selection cancelled');
    return null;
  }
  // run the selected test
  this.run(choice);
  return choice;
};
