function runTest(name) {
  if (typeof TestRunner === 'undefined') {
    Notify.error('TestRunner not loaded');
    return;
  }
  TestRunner.run(name);
}

function runAllTests() {
  if (typeof TestRunner === 'undefined') {
    Notify.error('TestRunner not loaded');
    return;
  }
  TestRunner.runAll();
}