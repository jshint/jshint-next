var parser = require('esprima');

var JSHINT = function (args) {
	"use strict";

	var tree = parser.parse(args.code, {
		loc:     true, // Include column-based location data.
		comment: true, // Include a list of all found code comments.
		tokens:  true  // Include a list of all found tokens.
	});

	return {
		tree: tree
	};
};

exports.lint = JSHINT;
