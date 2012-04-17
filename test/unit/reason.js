"use strict";

var _ = require("underscore");
var linter  = require("../../src/jshint.js");
var helpers = require("../lib/helpers.js");
var fixtures = new helpers.Fixtures(__dirname, __filename);

exports.testEsprimaErrors = function (test) {
	helpers.runner(test)
		.addError(3, "E002")
		.test(fixtures.get("esprima.js"));

	test.done();
};

exports.testTrailingComma = function (test) {
	helpers.runner(test)
		.addError(2, "E001")
		.addError(4, "E001")
		.addError(9, "E001")
		.test(fixtures.get("trailing.js"));

	test.done();
};
