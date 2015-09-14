'use strict';
var ScaffoldGenerator = require('../scaffold.js');

var CtrlGenerator = module.exports = ScaffoldGenerator.extend({
  constructor: function() {
    ScaffoldGenerator.apply(this, arguments);

    // if the controller name is suffixed with ctrl, remove the suffix
    // if the controller name is just "ctrl," don't append/remove "ctrl"
    if (this.name && this.name.toLowerCase() !== 'ctrl' && this.name.substr(-4).toLowerCase() === 'ctrl') {
      this.name = this.name.slice(0, -4);
    }
  },

  createControllerFiles: function() {
    this.generateSourceAndTest(
      'controller',
      'spec/controller',
      'controllers',
      this.options['skip-add'] || false
    );
  }
});