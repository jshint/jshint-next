"use strict";

var _ = require("underscore");
var utils = require("./utils.js");
var constants = require("./constants.js");

var report, program;

function bitwiseOperators(expr) {
	var ops = {
		"|"  : true,
		"&"  : true,
		"^"  : true,
		"~"  : true,
		"<<" : true,
		">>" : true,
		">>>": true
	};

	if (expr.operator && ops[expr.operator] === true) {
		report.addError(constants.warnings.BitwiseOperator, expr.range);
	}
}

// Walk the tree using recursive depth-first search and call
// appropriate lint functions when needed.

function parse(tree) {
	switch (tree.type) {
	case "BinaryExpression":
		bitwiseOperators(tree);
		break;
	case "UnaryExpression":
		bitwiseOperators(tree);
	}

	_.each(tree, function (val, key) {
		if (_.isObject(val) || _.isArray(val))
			parse(val);
	});
}

exports.parse = function (tree, source) {
	report = new utils.Report(source);
	program = tree;

	parse(program.body);
	return report;
};
