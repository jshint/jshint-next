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

function unsafeComparison(expr) {
	function isUnsafe(el) {
		if (el.type === "Identifier" && el.name === "undefined")
			return true;

		if (el.type !== "Literal")
			return false;

		return _.any([
			el.value === 0,
			el.value === null,
			el.value === "",
			el.value === false,
			el.value === true
		]);
	}

	if (expr.operator !== "==" && expr.operator !== "!=")
		return;

	if (isUnsafe(expr.left))
		report.addError(constants.warnings.UnsafeComparison, expr.left.range);

	if (isUnsafe(expr.right))
		report.addError(constants.warnings.UnsafeComparison, expr.right.range);
}

// Walk the tree using recursive depth-first search and call
// appropriate lint functions when needed.

function parse(tree) {
	switch (tree.type) {
	case "BinaryExpression":
		bitwiseOperators(tree);
		unsafeComparison(tree);
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
