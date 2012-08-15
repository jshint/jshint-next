Next iteration of JSHint, a static code analysis tool for JavaScript
====================================================================

This repo contains a completely unstable, work-in-progress version of JSHint.
You can try it out online on [next.jshint.com](http://next.jshint.com/).

For our stable tree visit [jshint/jshint](https://github.com/jshint/jshint/)
repo or [the official website](http://jshint.com/).

Technology
----------

This is a list of libraries and frameworks the JSHint core team
agreed to use:

 * Parser: [Esprima](http://esprima.org/) (we use -dev version).
 * Tasks: [Grunt](https://github.com/cowboy/grunt/).
 * Tests: Nodeunit(https://github.com/caolan/nodeunit) and
		[Coveraje](https://github.com/coveraje/coveraje).

Links
-----

These documents will help you to understand architecture and design decisions
behind JSHint Next:

 * [Design](https://github.com/jshint/jshint-next/wiki/Design)
 * [Deprecated checks and options](https://github.com/jshint/jshint-next/wiki/Deprecated-checks-and-options)

Sending a patch
---------------

If you'd like to send us a patch please make sure the following applies:

	* There is a corresponding issue. If there is no issue yet,
    [create one](http://next.jshint.com/bug/) before sending a patch.
	* Your commit log links to that issue.
	* Your commit log is nicely written (use past commits as examples).
	* Your patch introduces just one commit that can be rebased into the current
    `master`.
	* Your coding style is similar to [ours](https://github.com/jshint/jshint-next/wiki/Coding-style).
	* You wrote appropriate unit tests for your code.
	* All tests and lint checks pass (`npm test` and `npm run-script lint`).
	* Make sure you know that we're super grateful for your patch.

Discussion
----------

Please visit [our mailing list](http://groups.google.com/group/jshint/).
