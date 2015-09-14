'use strict';
var util = require('util');
var Scaffold = require('../script-base.js');


var Generator = module.exports = function Generator() {
  Scaffold.apply(this, arguments);
};

util.inherits(Generator, Scaffold);

Generator.prototype.createFilterFiles = function createFilterFiles() {
  this.generateSourceAndTest(
    'filter',
    'spec/filter',
    'filters',
    this.options['skip-add'] || false
  );
};
