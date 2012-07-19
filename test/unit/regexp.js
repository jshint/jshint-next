"use strict";

var _ = require("underscore");
var linter  = require("../../src/jshint.js");
var helpers = require("../lib/helpers.js");
var runner = helpers.createRunner(__dirname, __filename);

exports.testSuccess = function (test) {
	runner(test).test("/hello/g");
	runner(test).test("/hello\s(world)/g");
	test.done();
};

exports.testUnsafeSymbols = function (test) {
	runner(test)
		.addError(1, "W009")
		.test("/h[^...]/");

	runner(test)
		.addError(1, "W009")
		.test("/h.ey/");

	test.done();
};

exports.testEmptyClass = function (test) {
	runner(test)
		.addError(1, "W010")
		.test("/h[]/");

	test.done();
};
