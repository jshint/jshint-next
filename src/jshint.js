"use strict";

var _         = require("underscore");
var parser    = require("esprima");
var utils     = require("./utils.js");
var reason    = require("./reason.js");
var asherah   = require("./asherah.js");
var constants = require("./constants.js");

function Linter(code) {
	this.code    = code;
	this.globals = {};
	this.config  = {};
	this.tree    = {};
	this.events  = {};
	this.report  = new utils.Report(code);

	// Pre-populate globals array with reserved variables,
	// standard ECMAScript globals and user-supplied globals.

	_.extend(
		this.globals,
		constants.reservedVars,
		constants.ecmaIdentifiers
	);
}

Linter.prototype = {
	setGlobals: function (globals) {
		_.extend(this.globals, globals);
	},

	parse: function () {
		this.tree = parser.parse(this.code, {
			range:    true, // Include range-based location data.
			loc:      true, // Include column-based location data.
			comment:  true, // Include a list of all found code comments.
			tokens:   true, // Include a list of all found tokens.
			tolerant: true  // Don't break on non-fatal errors.
		});

		this.report.mixin(reason.parse({
			tree: this.tree,
			code: this.code,
			predefined: this.globals
		}));
	}
};

function JSHINT(args) {
	var linter = new Linter(args.code);
	linter.setGlobals(args.predefined || {});
	linter.parse();

	return {
		tree:   linter.tree,
		report: linter.report
	};
};

exports.Linter = Linter;
exports.lint   = JSHINT;
