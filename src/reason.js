"use strict";

var _ = require("underscore");
var utils = require("./utils.js");
var constants = require("./constants.js");

var report, program;

function trailingComma(expr) {
	var tokens = utils.getRange(program.tokens, expr.range);
	var token = tokens[tokens.length - 2];

	if (_.all([token.type === "Punctuator", token.value === "," ], _.identity)) {
		report.addError(constants.TrailingComma, token.range);
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

exports.parse = function (tree, source) {
	report = new utils.Report(source);
	program = tree;

	if (program.errors.length) {
		program.errors.forEach(function (err) {
			var msg = err.message.split(": ")[1];
			report.addError(constants.fromEsprima(msg), err.lineNumber);
		});
	}

	parse(program.body);
	return report;
};
