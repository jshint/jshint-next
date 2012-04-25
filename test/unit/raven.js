"use strict";

var _ = require("underscore");
var linter = require("../../src/jshint.js");
var helpers = require("../lib/helpers.js");
var runner = helpers.createRunner(__dirname, __filename);

exports.testBitwiseOperators = function (test) {
	runner(test)
		.addError(5, "W001")
		.addError(6, "W001")
		.addError(7, "W001")
		.addError(8, "W001")
		.addError(9, "W001")
		.addError(10, "W001")
		.addError(11, "W001")
		.testFile("bitwise.js");

	test.done();
};

exports.testUnsafeComparison = function (test) {
	runner(test)
		.addError(2, "W002")
		.addError(5, "W002")
		.addError(8, "W002")
		.addError(11, "W002")
		.addError(14, "W002")
		.addError(17, "W002")
		.addError(28, "W002")
		.addError(31, "W002")
		.addError(34, "W002")
		.addError(37, "W002")
		.addError(40, "W002")
		.addError(43, "W002")
		.testFile("comparison.js");

	test.done();
};
