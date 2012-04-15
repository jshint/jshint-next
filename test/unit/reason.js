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

	test.equal(_.size(report.errors), 3);
	test.equal(report.errors["2"][0].data.code, "E001");
	test.equal(report.errors["4"][0].data.code, "E001");
	test.equal(report.errors["9"][0].data.code, "E001");

	test.done();
};
