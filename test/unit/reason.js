"use strict";

var _ = require("underscore");
var linter  = require("../../src/jshint.js");
var helpers = require("../lib/helpers.js");
var runner = helpers.createRunner(__dirname, __filename);

exports.testEsprimaErrors = function (test) {
	runner(test)
		.addError(3, "E002")
		.testFile("esprima.js");

	test.done();
};

exports.testTrailingComma = function (test) {
	runner(test)
		.addError(2, "E001")
		.addError(4, "E001")
		.addError(9, "E001")
		.testFile("trailing.js");

	test.done();
};

exports.testDunderIterator = function (test) {
	runner(test)
		.addError(19, "E004")
		.testFile("iterator.js");

	test.done();
};

exports.testDunderProto = function (test) {
	runner(test)
		.addError(7, "E005")
		.addError(8, "E005")
		.addError(10, "E005")
		.addError(29, "E005")
		.addError(33, "E005")
		.testFile("proto.js");

	test.done();
};

exports.testMissingSemicolon = function (test) {
	runner(test)
		.addError(6, "E006")
		.addError(29, "E006")
		.addError(31, "E006")
		.testFile("asi.js");

	test.done();
};

exports.testDebugger = function (test) {
	runner(test)
		.addError(5, "E007")
		.testFile("debugger.js");

	test.done();
};

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
