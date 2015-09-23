'use strict';
var ScaffoldGenerator = require('../scaffold-base.js');

var FactoryGenerator = module.exports = ScaffoldGenerator.extend({
	constructor: function() {
		ScaffoldGenerator.apply(this, arguments);
	},

	createServiceFiles: function() {
	  this.generate(
	    'service/factory',
	    'spec/service',
	    'services',
	    this.options['skip-add'] || false
	  );
	}
});