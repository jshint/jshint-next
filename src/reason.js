"use strict";

var _ = require("underscore");
var utils = require("./utils.js");
var constants = require("./constants.js");

var report, program;

// Check for trailing commas in arrays and objects.

function trailingComma(expr) {
	var tokens = utils.getRange(program.tokens, expr.range);
	var token = tokens[tokens.length - 2];

	if (_.all([token.type === "Punctuator", token.value === "," ], _.identity)) {
		report.addError(constants.errors.TrailingComma, token.range);
	}
}


// Check for properties named __iterator__. This is a special property
// available only in browsers with JavaScript 1.7 implementation.

function dunderIterator(expr) {
	var prop = expr.property;

	if (prop.type === "Identifier" && prop.name === "__iterator__") {
		report.addError(constants.errors.DunderIterator, prop.range);
	}
}


// Check for properties named __proto__. This special property was
// deprecated long time ago.

function dunderProto(expr) {
	var prop = expr.property;

	if (prop.type === "Identifier" && prop.name === "__proto__") {
		report.addError(constants.errors.DunderProto, prop.range);
	}
}


// Check for missing semicolons but only when they have a potential
// of breaking things due to automatic semicolon insertion.

function missingSemicolon(expr) {
	var type = expr.expression.type;

	if (type !== "CallExpression" && type !== "MemberExpression")
		return;

	var tokens = utils.getRange(program.tokens, expr.range);
	_.each(tokens, function (token, i) {
		if (i === 0)
			return;

		if (!utils.isPunctuator(token, "(") && !utils.isPunctuator(token, "["))
			return;

		var prev = tokens[i - 1];
		var tokenLine = report.lineFromRange(token.range);
		var prevLine = report.lineFromRange(prev.range);

		if (tokenLine === prevLine)
			return;

		if (!utils.isPunctuator(prev, ";")) {
			report.addError(constants.errors.MissingSemicolon, prev.range);
		}
	});
}

function missingReturnSemicolon(expr) {
	var tokens = utils.getRange(program.tokens, expr.range, 2);

	if (report.lineFromRange(tokens[1].range) === report.lineFromRange(tokens[0].range))
		return;

	if (tokens[1] && utils.isPunctuator(tokens[1], ";"))
		return;

	if (tokens[1] && utils.isKeyword(tokens[1], "var"))
		return;

	if (tokens[1] && utils.isKeyword(tokens[1], "case"))
		return;

	report.addError(constants.errors.MissingSemicolon, tokens[0].range);
}

// Check for debugger statements. You really don't want them in your
// production code.

function unexpectedDebugger(expr) {
	report.addError(constants.errors.DebuggerStatement, expr.range);
}


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
	case "ArrayExpression":
		trailingComma(tree);
		break;
	case "ObjectExpression":
		trailingComma(tree);
		break;
	case "MemberExpression":
		dunderIterator(tree);
		dunderProto(tree);
		break;
	case "ExpressionStatement":
		missingSemicolon(tree);
		break;
	case "ReturnStatement":
		missingReturnSemicolon(tree);
		break;
	case "DebuggerStatement":
		unexpectedDebugger(tree);
		break;
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

	if (program.errors.length) {
		program.errors.forEach(function (err) {
			var msg = err.message.split(": ")[1];
			report.addError(constants.fromEsprima(msg), err.lineNumber);
		});
	}

	parse(program.body);
	return report;
};
