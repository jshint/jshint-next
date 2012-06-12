"use strict";

var _ = require("underscore");
var utils = require("./utils.js");
var constants = require("./constants.js");

var report, program, scopes, tokens;

// Check for trailing commas in arrays and objects.

function trailingComma(expr) {
	var token = tokens.move(tokens.find(expr.range[1] - 2));

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

	var slice = tokens.getRange(expr.range);
	var token = slice.move(1);
	var prev, curLine, prevLine;

	while (token !== null) {
		if (utils.isPunctuator(token, "(") || utils.isPunctuator(token, "[")) {
			prev = slice.peak(-1);
			curLine = report.lineFromRange(token.range);
			prevLine = report.lineFromRange(prev.range);

			if (curLine !== prevLine && !utils.isPunctuator(prev, ";")) {
				report.addError(constants.errors.MissingSemicolon, prev.range);
			}
		}

		token = slice.next();
	}
}

function missingReturnSemicolon(expr) {
	var cur = tokens.move(tokens.find(expr.range[0]));
	var next = tokens.peak();

	if (report.lineFromRange(next.range) === report.lineFromRange(cur.range))
		return;

	if (next && utils.isPunctuator(next, ";"))
		return;

	if (next && utils.isKeyword(next, "var"))
		return;

	if (next && utils.isKeyword(next, "case"))
		return;

	report.addError(constants.errors.MissingSemicolon, cur.range);
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

function redefinedVariables(name, range) {
	if (scopes.isDefined(name))
		report.addError(constants.warnings.RedefinedVariable, range);
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
		break;
	case "VariableDeclarator":
		redefinedVariables(tree.id.name, tree.id.range);
		scopes.addVariable({ name: tree.id.name });
		break;
	case "FunctionExpression":
	case "FunctionDeclaration":
		if (tree.id && tree.id.name) {
			redefinedVariables(tree.id.name, tree.id.range);
			scopes.addVariable({ name: tree.id.name });
		}

		_.each(tree.params, function (param, key) {
			redefinedVariables(param.name, param.range);
			scopes.addVariable({ name: param.name });
		});
	}

	_.each(tree, function (val, key) {
		if (val === null)
			return;

		if (!_.isObject(val) && !_.isArray(val))
			return;

		switch (val.type) {
		case "FunctionDeclaration":
			scopes.push(val.id.name);
			parse(val);
			scopes.pop();
			break;
		case "FunctionExpression":
			scopes.push("(anon)");
			parse(val);
			scopes.pop();
			break;
		default:
			parse(val);
		}
	});
}

exports.parse = function (opts) {
	report  = new utils.Report(opts.code);
	scopes  = new utils.ScopeStack();
	program = opts.tree;
	tokens  = new utils.Tokens(program.tokens);

	_.each(opts.predefined || {}, function (writeable, name) {
		scopes.addGlobalVariable({
			name: name,
			writeable: writeable
		});
	});

	if (program.errors.length) {
		program.errors.forEach(function (err) {
			var msg = err.message.split(": ")[1];
			report.addError(constants.fromEsprima(msg), err.lineNumber);
		});
	}

	parse(program.body);
	return report;
};
