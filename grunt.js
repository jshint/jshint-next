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
};
