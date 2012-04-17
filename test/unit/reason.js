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
