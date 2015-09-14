'use strict';
var util = require('util');
var Scaffold = require('../scaffold.js');


var Generator = module.exports = function Generator() {
  Scaffold.apply(this, arguments);
};

util.inherits(Generator, Scaffold);

Generator.prototype.createDirectiveFiles = function createDirectiveFiles() {
  this.generateSourceAndTest(
    'directive',
    'spec/directive',
    'directives',
    this.options['skip-add'] || false
  );
};
