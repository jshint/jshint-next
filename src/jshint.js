"use strict";

var _         = require("underscore");
var parser    = require("esprima");
var utils     = require("./utils.js");
var reason    = require("./reason.js");
var asherah   = require("./asherah.js");
var constants = require("./constants.js");

var JSHINT = function (args) {
	var report = new utils.Report(args.code);
	var tree = parser.parse(args.code, {
		range:    true, // Include range-based location data.
		loc:      true, // Include column-based location data.
		comment:  true, // Include a list of all found code comments.
		tokens:   true, // Include a list of all found tokens.
		tolerant: true  // Don't break on non-fatal errors.
	});

	// Pre-populate globals array with reserved variables,
	// standard ECMAScript globals and user-supplied globals.
	var globals = _.extend({},
		constants.reservedVars,
		constants.ecmaIdentifiers,
		args.predefined || {});

	// Check provided JavaScript code using three modules:
	//
	// * Reason checks for things that can break your application in
	//   at least one browser and other potentially dangerous things
	//   (loose comparison with null, confusing use of +, etc.)
	//
	// * Asherah enforces general JavaScript practices (semicolons, eval,
	//   simpler array initialization, etc.)
	//
	// Each module returns its own report that then can be combined into
	// the final report.

	report.mixin(reason.parse({
		tree:       tree,
		code:       args.code,
		predefined: globals
	}));

	// report.mixin(asherah.parse(tree, args.code));

	return {
		tree:   tree,
		report: report
	};
};

exports.lint = JSHINT;
