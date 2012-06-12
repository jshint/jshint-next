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
		.addErrors([2, 4, 9], "E001")
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
		.addErrors([7, 8, 10, 29, 33], "E005")
		.testFile("proto.js");

	test.done();
};

exports.testMissingSemicolon = function (test) {
	runner(test)
		.addErrors([6, 29, 31], "E006")
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
		.addErrors([5, 6, 7, 8, 9, 10, 11], "W001")
		.testFile("bitwise.js");

	test.done();
};

exports.testUnsafeComparison = function (test) {
	var lines = [2, 5, 8, 11, 14, 17, 28, 31, 34, 37, 40, 43];
	runner(test)
		.addErrors(lines, "W002")
		.testFile("comparison.js");

	test.done();
};

exports.testShadow = function (test) {
	runner(test)
		.addErrors([3, 4, 8, 12, 16, 17], "W003")
		.testFile("shadow.js");

	test.done();
};
