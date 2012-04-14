"use strict";

var _ = require("underscore");
var reporter = require("./reporter.js");
var utils = require("./utils.js");

var report;
var program;

function transformEsprimaErrors() {
	var errors = program.errors;

	errors.forEach(function (error) {
		report.addError(error.lineNumber, error.message.split(": ")[1]);
	});
}

function checkArray(array) {
	var tokens = utils.getRange(program.tokens, array.range);
	var token = tokens[tokens.length - 2];

	if (_.all([token.type === "Punctuator", token.value === "," ], _.identity))
		report.addError(-1, "Trailing comma.");
}

function parseTree(tree) {
	if (tree.type === "ArrayExpression")
		checkArray(tree);

	_.each(tree, function (val, key) {
		if (!_.isObject(val) && !_.isArray(val))
			return;

		parseTree(val);
	});
}

function parse(tree) {
	report = new reporter.Report();
	program = tree;

	if (tree.errors.length)
		transformEsprimaErrors();

	parseTree(program.body);

	return report;
}

exports.parse = parse;
