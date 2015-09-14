'use strict';
var ScaffoldGenerator = require('../scaffold.js'),
	yosay = require('yosay'),
	chalk = require('chalk');

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