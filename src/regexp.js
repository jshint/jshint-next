"use strict";

var _      = require("underscore");
var events = require("events");

function Tokens(exp) {
	this.exp = exp;
	this.pos = 0;
	this.emitter = new events.EventEmitter();
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

		tokens.emitter.on("[", function () {
			tokens.next();

			if (tokens.current === "^") {
				report.addWarning("W009", literal.range, { sym: tokens.current });
				tokens.next();
			}

			if (tokens.current === "]") {
				report.addWarning("W010", literal.range);
			}
		});

		tokens.emitter.on(".", function () {
			if (tokens.peak(-1) !== "\\") {
				report.addWarning("W009", literal.range, { sym: tokens.current });
			}
		});

		while (tokens.current) {
			tokens.emitter.emit(tokens.current);
			tokens.next();
		}
	});
};
