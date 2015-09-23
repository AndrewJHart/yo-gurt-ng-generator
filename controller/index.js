'use strict';
var ScaffoldGenerator = require('../scaffold-base.js');

var CtrlGenerator = module.exports = ScaffoldGenerator.extend({

  _targetFilePath: 'app/controllers',

  constructor: function() {
    ScaffoldGenerator.apply(this, arguments);

    console.log('Source Path inherited from base class is: ' + this._sourceFilePath);

    // if the controller name is suffixed with ctrl, remove the suffix
    // if the controller name is just "ctrl," don't append/remove "ctrl"
    if (this.name && this.name.toLowerCase() !== 'ctrl' && this.name.substr(-4).toLowerCase() === 'ctrl') {
      this.name = this.name.slice(0, -4);
    }
  },

  createControllerFiles: function() {
    this.generate(
      'controller',
      'spec/controller',
      this._targetFilePath,
      this.options['skip-add'] || false
    );
  }
});