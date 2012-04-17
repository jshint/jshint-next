"use strict";

var errorMessages = [
	[ "E001", "Trailing comma causes errors in some versions of IE.", "TrailingComma" ],
	[ "E002", "'with' statement is prohibited in strict mode.", "StrictModeWith" ],
	[ "E003", "'return' can be used only within functions.", "IllegalReturn" ],
	[ "E004", "'__iterator__' property is only available in JavaScript 1.7.", "DunderIterator" ],
	[ "E005", "'__proto___' property is deprecated.", "DunderProto" ]
];

errorMessages.forEach(function (msg) {
	exports[msg[2]] = {
		code: msg[0],
		desc: msg[1]
	};
});

exports.fromEsprima = function (msg) {
	var mapping = {
		"Illegal return statement": "IllegalReturn",
		"Strict mode code may not include a with statement": "StrictModeWith"
	};

	return exports[mapping[msg]];
};
