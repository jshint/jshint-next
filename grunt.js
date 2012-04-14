module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		lint: {
			all: [ "src/**/*.js" ]
		},

		jshint: {
			options: {
				"strict": true,
				"white":  true
			}
		}
	});

	grunt.registerTask("default", "lint");
};
