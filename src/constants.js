"use strict";

// Identifiers provided by the ECMAScript standard

exports.reservedVars = {
	undefined : false,
	arguments : false,
	NaN       : false
};

exports.ecmaIdentifiers = {
	Array              : false,
	Boolean            : false,
	Date               : false,
	decodeURI          : false,
	decodeURIComponent : false,
	encodeURI          : false,
	encodeURIComponent : false,
	Error              : false,
	"eval"             : false,
	EvalError          : false,
	Function           : false,
	hasOwnProperty     : false,
	isFinite           : false,
	isNaN              : false,
	JSON               : false,
	Math               : false,
	Number             : false,
	Object             : false,
	parseInt           : false,
	parseFloat         : false,
	RangeError         : false,
	ReferenceError     : false,
	RegExp             : false,
	String             : false,
	SyntaxError        : false,
	TypeError          : false,
	URIError           : false
};


// Errors and warnings

var errors = [
	[ "E001", "Trailing comma causes errors in some versions of IE.", "TrailingComma" ],
	[ "E002", "'with' statement is prohibited in strict mode.", "StrictModeWith" ],
	[ "E003", "'return' can be used only within functions.", "IllegalReturn" ],
	[ "E004", "'__iterator__' property is only available in JavaScript 1.7.", "DunderIterator" ],
	[ "E005", "'__proto___' property is deprecated.", "DunderProto" ],
	[ "E006", "Missing semicolon.", "MissingSemicolon" ],
	[ "E007", "Unexpected debugger statement.", "DebuggerStatement" ],
	[ "E008", "'arguments.callee' is prohibited in strict mode.", "CalleeStrictMode" ],
	[ "E009", "Undefined variable in strict mode.", "UndefinedVariableStrictMode" ]
];

var warnings = [
	[ "W001", "Bitwise operator. (mistyped logical operator?)", "BitwiseOperator" ],
	[ "W002", "Unsafe comparison.", "UnsafeComparison" ],
	[ "W003", "Redefined variable.", "RedefinedVariable" ],
	[ "W004", "Undefined variable.", "UndefinedVariable" ],
	[ "W005", "Avoid arguments.caller.", "ArgumentsCaller" ],
	[ "W006", "Avoid arguments.callee.", "ArgumentsCallee" ],
	[ "W007", "Object arguments outside of a function body.", "GlobalArguments" ]
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
