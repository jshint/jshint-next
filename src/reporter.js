"use strict";

var _ = require("underscore");

var ERROR   = 1;
var WARNING = 2;

function Report() {
	this.messages = {};
}

Report.prototype = {
	get errors() {
		var ret = {};

		_.each(this.messages, function (pool, line) {
			var newPool = _.filter(pool, function (msg) {
				return msg.type === ERROR;
			});

			if (newPool.length)
				ret[line] = newPool;
		});

		return ret;
	},

	get warnings() {
		var ret = {};

		_.each(this.messages, function (pool, line) {
			var newPool = _.filter(pool, function (msg) {
				return msg.type === WARNING;
			});

			if (newPool.length)
				ret[line] = newPool;
		});

		return ret;
	},

	mixin: function (report) {
		_.each(report.messages, _.bind(function (pool, line) {
			this.messages[line] = _.union(this.messages[line] || [], pool);
		}, this));
	},

	addMessage: function (obj) {
		if (!_.has(this.messages, obj.line))
			this.messages[obj.line] = [];

		this.messages[obj.line].push(obj);
	},

	addWarning: function (line, message) {
		this.addMessage({
			type: WARNING,
			line: line,
			data: message
		});
	},

	addError: function (line, message) {
		this.addMessage({
			type: ERROR,
			line: line,
			data: message
		});
	}
};

exports.ERROR = ERROR;
exports.WARNING = WARNING;
exports.Report = Report;
