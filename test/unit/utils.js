var _ = require("underscore");
var linter = require("../../src/jshint.js");
var utils = require("../../src/utils.js");
var helpers = require("../lib/helpers.js");

var fixtures = new helpers.Fixtures(__dirname, __filename);

exports.testReport = function (test) {
	var report = new utils.Report();

	test.equal(_.size(report.messages), 0);
	test.equal(report.errors.length, 0);
	test.equal(report.warnings.length, 0);

	report.addError("Random Error", 1);
	report.addError("Another Error", 2);
	report.addWarning("Random Warning", 3);

	test.equal(_.size(report.messages), 3);
	test.equal(report.errors.length, 2);
	test.equal(report.warnings.length, 1);

	test.deepEqual(report.errors[0], {
		type: report.ERROR,
		line: 1,
		data: "Random Error"
	});

	test.done();
};

exports.testMixin = function (test) {
	var firstReport = new utils.Report();
	var secondReport = new utils.Report();

	firstReport.addError("Random Error", 1);
	secondReport.addError("Another Error", 1);

	firstReport.mixin(secondReport);
	test.equal(firstReport.errors.length, 2);

	test.done();
};

exports.testTokens = function (test) {
	var code = fixtures.get("simple_file.js");
	var tokens = new utils.Tokens(linter.lint({ code: code }).tree.tokens);
	var slice = tokens.getRange([ 0, 27 ]);

	test.equal(slice.length, 3);
	test.equal(slice.current.value, "var");
	test.equal(slice.next().value, "number");
	test.equal(slice.next().value, "=");

	test.done();
};

exports.testScopeStack = function (test) {
	var scope = new utils.ScopeStack();
	test.equal(scope.length, 1);
	test.equal(scope.getCurrent().name, "(global)");

	scope.addVariable("weebly");
	test.ok(scope.isDefined("weebly"));

	scope.push("(anon)");
	test.equal(scope.length, 2);
	test.equal(scope.getCurrent().name, "(anon)");

	scope.addVariable("wobly");
	test.ok(scope.isDefined("wobly"));
	test.ok(scope.isDefined("weebly"));

	scope.addGlobalVariable("stuff");
	test.ok(scope.isDefined("stuff"));

	scope.pop();
	test.equal(scope.length, 1);
	test.equal(scope.getCurrent().name, "(global)");
	test.ok(scope.isDefined("weebly"));
	test.ok(scope.isDefined("stuff"));
	test.ok(!scope.isDefined("wobly"));

	test.done();
};
