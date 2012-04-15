"use strict";

var _ = require("underscore");
var reporter = require("./reporter.js");
var utils = require("./utils.js");
var constants = require("./constants.js");

var report, program;

function trailingComma(expr) {
	var tokens = utils.getRange(program.tokens, expr.range);
	var token = tokens[tokens.length - 2];

	if (_.all([token.type === "Punctuator", token.value === "," ], _.identity)) {
		report.addError(-1, constants.TrailingComma);
	}
}

// Walk the tree using recursive depth-first search and call
// appropriate lint functions when needed.

function parse(tree) {
	switch (tree.type) {
	case "ArrayExpression":
		trailingComma(tree);
		break;
	case "ObjectExpression":
		trailingComma(tree);
	}

	_.each(tree, function (val, key) {
		if (_.isObject(val) || _.isArray(val))
			parse(val);
	});
}

exports.parse = function (tree) {
	report = new reporter.Report();
	program = tree;

	if (program.errors.length) {
		program.errors.forEach(function (err) {
			var msg = err.message.split(": ")[1];
			report.addError(err.lineNumber, constants.fromEsprima(msg));
		});
	}

	parse(program.body);
	return report;
};
