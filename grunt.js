module.exports = function (grunt) {
	grunt.initConfig({
		lint: {
			all: [ "src/**/*.js" ]
		},

		test: {
			all: [ "test/unit/**/*.js" ]
		},

		jshint: {
			options: {
				"es5": true,
				"node": true,
				"globalstrict": true,
				"strict": true,
				"white":  true,
				"smarttabs": true
			}
		}
	});

	grunt.registerTask("default", "lint test");

	grunt.registerTask("browserify", "Builds a browserified copy of JSHint", function () {
		var browserify = require("browserify");
		var bundle = browserify({ debug: true });

		bundle.addEntry("./src/jshint.js");
		grunt.file.mkdir("./dist");
		grunt.file.write("./dist/jshint.js", bundle.bundle());
	});
};
