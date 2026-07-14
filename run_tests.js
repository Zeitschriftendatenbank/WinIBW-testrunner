function runTest() {
  if (typeof TestRunner === 'undefined') {
    Notify.error('TestRunner not loaded');
    return;
  }
  TestRunner.runSelect();
}

function runAllTests() {
  if (typeof TestRunner === 'undefined') {
    Notify.error('TestRunner not loaded');
    return;
  }
  TestRunner.runAll();
}
