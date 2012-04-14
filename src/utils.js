"use strict";

var _ = require("underscore");

exports.getRange = function (tokens, range) {
	return _.filter(tokens, function (token) {
		return token.range[0] >= range[0] && token.range[1] <= range[1];
	});
};
