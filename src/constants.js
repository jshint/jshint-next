"use strict";

// Errors and warnings

var errors = [
	[ "E001", "Trailing comma causes errors in some versions of IE.", "TrailingComma" ],
	[ "E002", "'with' statement is prohibited in strict mode.", "StrictModeWith" ],
	[ "E003", "'return' can be used only within functions.", "IllegalReturn" ],
	[ "E004", "'__iterator__' property is only available in JavaScript 1.7.", "DunderIterator" ],
	[ "E005", "'__proto___' property is deprecated.", "DunderProto" ],
	[ "E006", "Missing semicolon.", "MissingSemicolon" ],
	[ "E007", "Unexpected debugger statement.", "DebuggerStatement" ]
];

var warnings = [
	[ "W001", "Bitwise operator. (mistyped logical operator?)", "BitwiseOperator" ],
	[ "W002", "Unsafe comparison.", "UnsafeComparison" ]
];

exports.errors = {};
exports.warnings = {};

errors.forEach(function (msg) {
	exports.errors[msg[2]] = {
		code: msg[0],
		desc: msg[1]
	};
});

warnings.forEach(function (msg) {
	exports.warnings[msg[2]] = {
		code: msg[0],
		desc: msg[1]
	};
});

exports.fromEsprima = function (msg) {
	var mapping = {
		"Illegal return statement": "IllegalReturn",
		"Strict mode code may not include a with statement": "StrictModeWith"
	};

	return exports.errors[mapping[msg]];
};
