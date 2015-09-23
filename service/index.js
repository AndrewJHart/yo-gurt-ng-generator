'use strict';
var ScaffoldGenerator = require('../scaffold-base.js');

var ServiceGenerator = module.exports = ScaffoldGenerator.extend({
	// set the name on the service generator
	generatorName: 'service',

	contructor: function() {
			ScaffoldGenerator.apply(this, arguments);
	},

	createServiceFiles: function() {
	  this.generate(
	    'service/service',
	    'spec/service',
	    'services',
	    this.options['skip-add'] || false
	  );
	}
});