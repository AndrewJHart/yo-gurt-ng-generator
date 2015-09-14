'use strict';
var util = require('util');
var Scaffold = require('../scaffold.js');


var Generator = module.exports = function Generator() {
  Scaffold.apply(this, arguments);
};

util.inherits(Generator, Scaffold);

Generator.prototype.createServiceFiles = function createServiceFiles() {
  this.generateSourceAndTest(
    'service/factory',
    'spec/service',
    'services',
    this.options['skip-add'] || false
  );
};
