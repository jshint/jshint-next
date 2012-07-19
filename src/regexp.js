"use strict";

var _ = require("underscore");
var utils = require("./utils.js");
var Events = require("./events.js").Events;

function Tokens(exp) {
	this.exp   = exp;
	this.pos   = 0;
}

Tokens.prototype = {
	get current() {
		return this.peak(0);
	},

	peak: function (offset) {
		var pos = this.pos + (offset || 1);
		var chr = this.exp.charAt(pos);

		return chr === "" ? null : chr;
	},

	next: function () {
		var chr = this.peak();

		if (chr !== null)
			this.pos += 1;

		return chr;
	}
};

_.extend(Tokens.prototype, Events);

exports.register = function (linter) {
	var report = linter.report;

	linter.on("Literal", function (literal) {
		var value = (literal.value || "").toString();
		var range = literal.range;
		var tokens;

		value = value.match(/^\/(.+)\/[igm]?$/);
		if (value === null)
			return;

		tokens = new Tokens(value[1]);

		tokens.on("[", function () {
			tokens.next();

			if (tokens.current === "^") {
				report.addWarning("W009", literal.range, { sym: tokens.current });
				tokens.next();
			}

			if (tokens.current === "]") {
				report.addWarning("W010", literal.range);
			}
		});

		tokens.on(".", function () {
			if (tokens.peak(-1) !== "\\") {
				report.addWarning("W009", literal.range, { sym: tokens.current });
			}
		});

		while (tokens.current) {
			tokens.trigger(tokens.current);
			tokens.next();
		}
	});
};
