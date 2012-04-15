var _ = require("underscore");
var reporter = require("../../src/reporter.js");

exports.testReport = function (test) {
	var report = new reporter.Report();
	test.equal(_.size(report.messages), 0);
	test.equal(_.size(report.errors), 0);
	test.equal(_.size(report.warnings), 0);

	report.addError("Random Error", 1);
	report.addError("Another Error", 2);
	report.addWarning("Random Warning", 3);

	test.equal(_.size(report.messages), 3);
	test.equal(_.size(report.errors), 2);
	test.equal(_.size(report.warnings), 1);

	test.deepEqual(report.errors["1"][0], {
		type: report.ERROR,
		line: 1,
		data: "Random Error"
	});

	test.done();
};

exports.testMixin = function (test) {
	var firstReport = new reporter.Report();
	var secondReport = new reporter.Report();

	firstReport.addError("Random Error", 1);
	secondReport.addError("Another Error", 1);

	firstReport.mixin(secondReport);
	test.equal(firstReport.errors["1"].length, 2);

	test.done();
};
