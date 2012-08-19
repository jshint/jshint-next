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

	grunt.registerTask("cover", "Shows the test coverage report", function () {
		var coveraje, done, runHelper, countdown;
		var fileCount = 0;
		var tests = {};
		var useServer = !!grunt.option("server");

		try {
			coveraje = require("coveraje");
		} catch (ex) {
			grunt.log.error('coveraje not installed. '.red +
				'Use "' + 'npm install coveraje'.bold + '"');
			return false;
		}

		done = this.async();
		runHelper = coveraje.runHelper;

		grunt.file.expandFiles(grunt.config("test.all")).forEach(function (f) {
			fileCount++;
			tests[f] = function (context, instance) {
				return runHelper("nodeunit", { reporterName: "minimal" })
					.run(f)
					.onComplete(function () {
						if (!useServer)
							countdown.one();
					})
				;
			};
		});

		if (!useServer) {
			countdown = runHelper.createCountdown(
				runHelper
					.createEmitter(function () {})
					.onComplete(function () {
						setTimeout(done, 200);
					})
					.onError(function () {
						done(false, "timeout");
					}),
				fileCount,
				5000
			);
		}

		var c = coveraje.cover(
			"var jshint = require(require('path').join('" + __dirname.replace(/\\/g, "\\\\") + "', 'src', 'jshint.js'));",
			tests,
			{
				useServer: useServer,
				globals: "node",
				resolveRequires: ["*"]
			}
		);
	});
};
