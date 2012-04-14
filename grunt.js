module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		lint: {
			all: [ "src/**/*.js" ]
		},

		test: {
			all: [ "test/unit/**/*.js" ]
		},

		jshint: {
			options: {
				"strict": true,
				"white":  true
			}
		}
	});

	grunt.registerTask("default", "lint test");
};
