'use strict';
var ScaffoldGenerator = require('../scaffold-base.js');

var FilterGenerator = module.exports = ScaffoldGenerator.extend({
    constructor: function() {
        ScaffoldGenerator.apply(this, arguments);
    },

	createFilterFiles = function createFilterFiles() {
		this.generate(
	      'filter',
		  'spec/filter',
	      'filters',
		  this.options['skip-add'] || false
		);
	}
});