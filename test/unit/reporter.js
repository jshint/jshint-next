var _ = require("underscore");
var reporter = require("../../src/reporter.js");

exports.testReport = function (test) {
	var report = new reporter.Report();
	test.equal(_.size(report.messages), 0);
	test.equal(_.size(report.errors), 0);
	test.equal(_.size(report.warnings), 0);

	report.addError(1, "Random Error");
	report.addError(2, "Another Error");
	report.addWarning(3, "Random Warning");

	test.equal(_.size(report.messages), 3);
	test.equal(_.size(report.errors), 2);
	test.equal(_.size(report.warnings), 1);

	test.deepEqual(report.errors["1"][0], {
		type: reporter.ERROR,
		line: 1,
		data: "Random Error"
	});

	test.done();
};

exports.testMixin = function (test) {
	var firstReport = new reporter.Report();
	var secondReport = new reporter.Report();

	firstReport.addError(1, "Random Error");
	secondReport.addError(1, "Another Error");

	firstReport.mixin(secondReport);
	test.equal(firstReport.errors["1"].length, 2);

	test.done();
};
