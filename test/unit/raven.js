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
