'use strict';
var ScaffoldGenerator = require('../scaffold.js');

var DirectiveGenerator = module.exports = ScaffoldGenerator.extend({
	constructor: function() {
		ScaffoldGenerator.apply(this, arguments);
	},

	createDirectiveFiles: function() {
	  this.generateSourceAndTest(
	    'directive',
	    'spec/directive',
	    'directives',
	    this.options['skip-add'] || false
	  );
	}
});