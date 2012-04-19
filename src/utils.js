"use strict";

var _ = require("underscore");

function Report(source) {
	this.ERROR   = 1;
	this.WARNING = 2;

	this.messages = {};
	this.ranges = [];
	this.source = source;
}

Report.prototype = {
	lineFromRange: function (range) {
		var lines = this.source.slice(0, range[0]).split("\n");
		return lines.length || -1;
	},

	get errors() {
		var ret = [];
		var self = this;

		_.each(self.messages, function (pool, line) {
			_.each(pool, function (msg) {
				if (msg.type === self.ERROR) {
					ret.push(msg);
				}
			});
		});

		return ret;
	},

	get warnings() {
		var ret = [];
		var self = this;

		_.each(self.messages, function (pool, line) {
			_.each(pool, function (msg) {
				if (msg.type === self.WARNING) {
					ret.push(msg);
				}
			});
		});

		return ret;
	},

	mixin: function (report) {
		_.each(report.messages, _.bind(function (pool, line) {
			this.messages[line] = _.union(this.messages[line] || [], pool);
		}, this));
	},

	addMessage: function (obj) {
		var line = obj.line;
		this.messages[line] = _.union(this.messages[line] || [], [obj]);
	},

	addWarning: function (message, loc) {
		var line = _.isArray(loc) ? this.lineFromRange(loc) : loc;

		this.addMessage({
			type: this.WARNING,
			line: line,
			data: message
		});
	},

	addError: function (message, loc) {
		var line = _.isArray(loc) ? this.lineFromRange(loc) : loc;

		this.addMessage({
			type: this.ERROR,
			line: line,
			data: message
		});
	}
};

var getRange = function (tokens, range, additional) {
	var slice = [];
	additional = additional || 0;

	_.each(tokens, function (token) {
		if (token.range[0] < range[0])
			return;

		if (token.range[1] <= range[1])
			return void slice.push(token);

		if (additional > 0) {
			slice.push(token);
			additional = additional - 1;
		}
	});

	return slice;
};

_.each(["Punctuator", "Keyword"], function (name) {
	exports["is" + name] = function (token, value) {
		return token.type === name && token.value === value;
	};
});

exports.Report = Report;
exports.getRange = getRange;
