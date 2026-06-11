WinIBW-testrunner — Usage
==================

This folder contains unit tests for ZDB helper functions. Two runner helpers are provided:

- `runAllTests()` — runs all tests in the loaded test suite.
- `runTest(name)` — runs a single test by name.

Examples
--------

Run all tests from the WinIBW4 Script Manager or a script:

```javascript
// Ensure test_harness.js, zdb.js and the test files (e.g. zdb.tests.js) are loaded
runAllTests();
```

Run a single test (use an exact test name as added in `zdb.tests.js`):

```javascript
// Example names from zdb.tests.js
runTest('parseField_simple');
runTest('arrayUnique_and_diff');
```

Notes
-----

- If the TestRunner harness is not loaded, `runAllTests()` and `runTest()` will attempt to notify you via `WScript.Shell.Popup` (if available) or by appending a message to the active WinIBW4 window.
- Tests are defined using `TestRunner.add(name, fn)` in `zdb.tests.js`.
- Open the tests in `zdb.tests.js` to see available test names.

Writing tests
-------------

Tests live alongside the harness and subject code. Follow these guidelines:

- Include `test_harness.js` and the code under test (e.g. `zdb.js`) before your test file.
- Add tests with `TestRunner.add(name, fn)` where `name` is a short identifier and `fn` contains assertions.

Example test:

```javascript
TestRunner.add("my_function_basic", function() {
	var out = ZDB.myFunction("input");
	TestRunner.assert(out === "expected", "myFunction returned unexpected value");
});
```

- Use `TestRunner.assert(condition, message)` for simple checks. The test harness will report failures and continue.
- Keep tests small and focused: one logical assertion group per test name.
- Name tests with a descriptive prefix (module) and short description (e.g. `parseField_simple`).

Running only one test from code or Script Manager uses `runTest('test_name')` as documented above.

