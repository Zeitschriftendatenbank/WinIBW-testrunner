function runTest(name) {
  if (typeof TestRunner === 'undefined') {
    var msg = 'TestRunner not loaded';
    try {
      if (typeof ActiveXObject !== 'undefined') {
        try {
          var sh = new ActiveXObject('WScript.Shell');
          sh.Popup(msg, 2, 'Run Tests', 64);
          return;
        } catch (e) { }
      }
      activeWindow.appendMessage(msg, 1);
      return;

    } catch (e) { }
    return;
  }
  TestRunner.run(name);
}

function runAllTests() {
  if (typeof TestRunner === 'undefined') {
    var msg = 'TestRunner not loaded';
    try {
      if (typeof ActiveXObject !== 'undefined') {
        try {
          var sh = new ActiveXObject('WScript.Shell');
          sh.Popup(msg, 2, 'Run Tests', 64);
          return;
        } catch (e) { }
      }
      activeWindow.appendMessage(msg, 1);
      return;
    } catch (e) { }
    return;
  }
  TestRunner.runAll();
}
