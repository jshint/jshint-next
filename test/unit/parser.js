// Esprima integration tests.
//
// These shouldn't test actual JSHint behaviour. Instead they should ensure
// that underlying Esprima parser works as expected.

var linter  = require("../../src/jshint.js");
var helpers = require("../lib/helpers.js");

var fixtures = new helpers.Fixtures(__dirname, __filename);

exports.testTree = function (test) {
	test.expect(11);

	var tree = linter.lint({ code: fixtures.get("simple_file.js") }).tree;

	test.equal(tree.type, "Program");
	test.equal(tree.body[0].type, "VariableDeclaration");
	test.equal(tree.body[0].declarations[0].type, "VariableDeclarator");
	test.equal(tree.body[0].declarations[0].id.name, "number");
	test.equal(tree.body[1].type, "FunctionDeclaration");
	test.equal(tree.body[1].id.name, "add");
	test.equal(tree.body[2].type, "ExpressionStatement");
	test.equal(tree.body[2].expression.callee.name, "add");
	test.equal(tree.comments[0].type, "Block");
	test.equal(tree.comments[0].value, " [linter] ");
	test.deepEqual(tree.comments[0].range, [ 0, 13 ]);

	test.done();
};

exports.testTokens = function (test) {
	test.expect(1);

	var code = fixtures.get("simple_file.js");
	var tokens = JSON.parse(fixtures.get("tokens.json"));

	test.deepEqual(linter.lint({ code: code }).tree.tokens, tokens);
	test.done();
};
