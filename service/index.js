'use strict';
var util = require('util');
var Scaffold = require('../script-base.js');


var Generator = module.exports = function Generator() {
  Scaffold.apply(this, arguments);
};

util.inherits(Generator, Scaffold);

Generator.prototype.createServiceFiles = function createServiceFiles() {
  this.generateSourceAndTest(
    'service/service',
    'spec/service',
    'services',
    this.options['skip-add'] || false
  );
};
