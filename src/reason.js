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

// Catch cases where you put a new line after a `return` statement
// by mistake.

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

// Disallow bitwise operators: they are slow in JavaScript and
// more often than not are simply typoed logical operators.

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

// Complain about comparisons that can blow up because of type
// coercion.

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

// Complain about variables defined twice.

function redefinedVariables(name, range) {
	if (scopes.isDefined(name))
		report.addError(constants.warnings.RedefinedVariable, range);
}

// Check if identifier is a free variable and record its
// use. Later in the code we'll use that to spot undefined
// variables.

function recordIdentifier(ident) {
	var index = tokens.find(ident.range[0]);
	var token, prev, next;

	if (index > 0) {
		token = tokens.move(index);
		prev  = tokens.peak(-1);
		next  = tokens.peak(1) || {};

		// This identifier is a property key, not a free variable.

		if (utils.isPunctuator(next, ":") && !utils.isPunctuator(prev, "?"))
			return;

		// This identifier is a property itself, not a free variable.

		if (utils.isPunctuator(prev, "."))
			return;

		// Operators typeof and delete do not raise runtime errors
		// even if the base object of a reference is null, so we don't
		// need to display warnings in these cases.

		if (utils.isKeyword(prev, "typeof") || utils.isKeyword(prev, "delete")) {

			// Unless you're trying to subscript a null references. That
			// will throw a runtime error.

			if (!utils.isPunctuator(next, ".") && !utils.isPunctuator(next, "["))
				return;
		}
	}

	scopes.addUse(ident.name, ident.range);
}

// Look for arguments.callee and arguments.caller usage and warn about
// them. In strict mode, instead of warning about arguments.callee, return
// an error.

function checkArgumentsIdentifier(ident) {
	if (scopes.current.name === "(global)") {
		if (ident.name === "arguments")
			report.addError(constants.warnings.GlobalArguments, ident.range);

		return;
	}

	if (ident.name !== "callee" && ident.name !== "caller")
		return;

	var index = tokens.find(ident.range[0]);

	if (index < 1)
		return;

	tokens.move(index);

	if (utils.isPunctuator(tokens.peak(-1), ".") && utils.isIdentifier(tokens.peak(-2), "arguments")) {
		switch (ident.name) {
		case "caller":
			report.addError(constants.warnings.ArgumentsCaller, ident.range);
			break;
		case "callee":
			if (scopes.isStrictMode())
				report.addError(constants.errors.CalleeStrictMode, ident.range);
			else
				report.addError(constants.warnings.ArgumentsCallee, ident.range);
		}
	}
}

// Look for arguments["callee"] and arguments["caller"] usage and warn about
// them. In strict mode, instead of warning about arguments["callee"], return
// an error. Basically same as checkArgumentsIdentifier but for [] notation.
//
// It'd be nice to DRY this out later.

function checkArgumentsLiteral(literal) {
	if (scopes.current.name === "(global)")
		return;

	if (literal.value !== "callee" && literal.value !== "caller")
		return;

	var index = tokens.find(literal.range[0]);

	if (index < 1)
		return;

	tokens.move(index);

	if (utils.isPunctuator(tokens.peak(-1), "[") && utils.isIdentifier(tokens.peak(-2), "arguments")) {
		switch (literal.value) {
		case "caller":
			report.addError(constants.warnings.ArgumentsCaller, literal.range);
			break;
		case "callee":
			if (scopes.isStrictMode())
				report.addError(constants.errors.CalleeStrictMode, literal.range);
			else
				report.addError(constants.warnings.ArgumentsCallee, literal.range);
		}
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
		break;
	case "MemberExpression":
		dunderIterator(tree);
		dunderProto(tree);
		break;
	case "ExpressionStatement":
		if (tree.expression.type === "Literal" && tree.expression.value === "use strict")
			scopes.current.strict = true;

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
		_.each(tree.params, function (param, key) {
			redefinedVariables(param.name, param.range);
			scopes.addVariable({ name: param.name });
		});
		break;
	case "Identifier":
		recordIdentifier(tree);
		checkArgumentsIdentifier(tree);
		break;
	case "Literal":
		checkArgumentsLiteral(tree);
		break;
	}

	_.each(tree, function (val, key) {
		if (val === null)
			return;

		if (!_.isObject(val) && !_.isArray(val))
			return;

		switch (val.type) {
		case "FunctionDeclaration":
			scopes.addVariable({ name: val.id.name });
			scopes.push(val.id.name);
			parse(val);
			scopes.pop();
			break;
		case "FunctionExpression":
			if (val.id && val.id.type === "Identifier")
				scopes.addVariable({ name: val.id.name });

			scopes.push("(anon)");
			parse(val);
			scopes.pop();
			break;
		case "WithStatement":
			scopes.runtimeOnly = true;
			parse(val);
			scopes.runtimeOnly = false;
			break;
		case "Identifier":
			parse(val);
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

	// Go over all stacks and find all variables that were used
	// but never defined.

	_.each(scopes.stack, function (env) {
		_.each(env.uses, function (ranges, name) {
			if (scopes.isDefined(name, env))
				return;

			_.each(ranges, function (range) {
				if (scopes.isStrictMode(env))
					return void report.addError(constants.errors.UndefinedVariableStrictMode, range);
				report.addError(constants.warnings.UndefinedVariable, range);
			});
		});
	});

	return report;
};
