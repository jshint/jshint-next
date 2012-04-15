"use strict";

var _ = require("underscore");
var linter  = require("../../src/jshint.js");
var helpers = require("../lib/helpers.js");
var fixtures = new helpers.Fixtures(__dirname, __filename);

exports.testEsprimaErrors = function (test) {
	var report = linter.lint({ code: fixtures.get("esprima.js") }).report;
	var error = report.errors["3"][0];

	test.equal(error.line, 3);
	test.equal(error.data.code, "E002");

	test.done();
};

exports.testTrailingComma = function (test) {
	var report = linter.lint({ code: fixtures.get("trailing.js") }).report;
	var error;

	test.equal(report.errors["-1"].length, 3);
	test.equal(_.size(report.errors), 1);

	error = report.errors["-1"][0];
	test.equal(error.data.code, "E001");

	error = report.errors["-1"][1];
	test.equal(error.data.code, "E001");

	error = report.errors["-1"][2];
	test.equal(error.data.code, "E001");

	test.done();
};
