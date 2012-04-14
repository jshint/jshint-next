var fs = require("fs");

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

exports.Fixtures = Fixtures;


