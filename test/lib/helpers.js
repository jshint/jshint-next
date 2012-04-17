var _ = require("underscore");
var assert = require("assert");
var fs = require("fs");
var linter = require("../../src/jshint.js");

function Fixtures(dirname, filename) {
	this.dirname = dirname;
	this.filename = filename;
}

// Returns contents of a fixture.
//
// Fixture's parent directory depends on the suite's file name. For example,
// fixtures for test/unit/parser.js should be in test/fixtures/parser/<file>.js

Fixtures.prototype.get = function (name) {
	var dir, stream;

	dir = this.filename.split("/");
	dir = dir[dir.length - 1].replace(".js", "");
	stream = fs.readFileSync(this.dirname + "/../fixtures/" + dir + "/" + name);

	return stream.toString();
};

function createRunner(dirname, filename) {
	var fixtures = new Fixtures(dirname, filename);

	function runner(test) {
		var expected = [];

		var helper = {
			addError: function (line, code) {
				expected.push({
					line: line,
					code: code
				});

				return helper;
			},

			test: function (source, options, globals) {
				var retval = linter.lint({ code: source });
				var errors = retval.report.errors;

				if (errors.length === 0 && expected.length === 0)
					return;

				var unexpected = _.reject(errors, function (err, line) {
					return _.any(expected, function (exp) {
						return exp.line === err.line && exp.code === err.data.code;
					});
				});

				var unthrown = _.reject(expected, function (exp) {
					return _.any(errors, function (err) {
						return err.line === exp.line && err.data.code === exp.code;
					});
				});

				if (unexpected.length === 0 && unthrown.length === 0)
					return void test.ok(true);

				var message = "";

				if (unexpected.length > 0) {
					message += "\n\tUnexpected errors";
					message += "\n" + _.map(unexpected, function (err) {
						return "\t    L" + err.line + ": " + err.data.code;
					}).join("\n");
				}

				if (unthrown.length > 0) {
					message += "\n\tErrors defined, but not thrown by JSHint";
					message += "\n" + _.map(unthrown, function (err) {
						return "\t    L" + err.line + ": " + err.code;
					}).join("\n");
				}

				test.ok(false, message);
			},

			testFile: function (name, options, globals) {
				helper.test(fixtures.get(name), options, globals);
			}
		};

		return helper;
	}

	return runner;
}

exports.Fixtures = Fixtures;
exports.createRunner = createRunner;
