module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		lint: {
			all: [ "src/**/*.js" ]
		},

		jshint: {
			options: { "strict": true }
		}
	});

	grunt.registerTask("default", "lint");
};
