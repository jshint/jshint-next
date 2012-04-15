"use strict";

var parser   = require("esprima");
var reporter = require("./reporter.js");
var reason   = require("./reason.js");
var raven    = require("./raven.js");
var asherah  = require("./asherah.js");

var JSHINT = function (args) {
	var report = new reporter.Report(args.code);
	var tree = parser.parse(args.code, {
		range:    true, // Include range-based location data.
		loc:      true, // Include column-based location data.
		comment:  true, // Include a list of all found code comments.
		tokens:   true, // Include a list of all found tokens.
		tolerant: true  // Don't break on non-fatal errors.
	});

	// Check provided JavaScript code using three modules:
	//
	// * Reason checks for things that can break your application in
	//   at least one browser (trailing commas, arguments.callee in
	//   strict mode, etc.
	//
	// * Raven checks for potentially dangerous things (loose comparison
	//   with null, confusing use of +, etc.)
	//
	// * Asherah enforces general JavaScript practices (semicolons, eval,
	//   simpler array initialization, etc.)
	//
	// Each module returns its own report that then can be combined into
	// the final report.

	report.mixin(reason.parse(tree, args.code));
	// report.mixin(raven.parse(tree));
	// report.mixin(asherah.parse(tree));

	return {
		tree:   tree,
		report: report
	};
};

exports.lint = JSHINT;
