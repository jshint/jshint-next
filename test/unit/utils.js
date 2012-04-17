var _ = require("underscore");
var utils = require("../../src/utils.js");

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
