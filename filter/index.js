'use strict';
var ScaffoldGenerator = require('../scaffold.js');

var FilterGenerator = module.exports = ScaffoldGenerator.extend({
    constructor: function() {
        ScaffoldGenerator.apply(this, arguments);
    },

	createFilterFiles = function createFilterFiles() {
		this.generateSourceAndTest(
	      'filter',
		  'spec/filter',
	      'filters',
		  this.options['skip-add'] || false
		);
	}
});