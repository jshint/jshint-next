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
		report.addError(constants.TrailingComma, token.range);
	}
}


// Check for properties named __iterator__. This is a special property
// available only in browsers with JavaScript 1.7 implementation.

function dunderIterator(expr) {
	var prop = expr.property;

	if (prop.type === "Identifier" && prop.name === "__iterator__") {
		report.addError(constants.DunderIterator, prop.range);
	}
}


// Check for properties named __proto__. This special property was
// deprecated long time ago.

function dunderProto(expr) {
	var prop = expr.property;

	if (prop.type === "Identifier" && prop.name === "__proto__") {
		report.addError(constants.DunderProto, prop.range);
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
