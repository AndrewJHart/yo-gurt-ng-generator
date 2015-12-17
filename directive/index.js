'use strict';

var _                 = require('lodash'),
    util              = require('../util'),
    GeneratorMixin    = require('../generator-mixin'),
    ScaffoldGenerator = require('../scaffold-base.js');

var DirectiveGenerator = module.exports = ScaffoldGenerator.extend({
    constructor: function () {
        ScaffoldGenerator.apply(this, arguments);

        // Grab the formatted module names
        this.dotModuleName = this._getModuleName();
        this.hypModuleName = this._getModuleName('-');
    },

    /**
     * build delegates to `ScaffoldGenerator.generate`
     *
     * since yeoman adds all methods to a run loop &
     * runs them in order of definition, ergo build will
     * be executed after the contructor.
     *
     */
    build: function () {
        this.generate(
            'directive',
            'spec/directive',
            'directives',
            this.options['skip-add'] || false
        );
    }
});

// mixin generator-mixin props onto this obj prototype
_.extend(DirectiveGenerator.prototype, GeneratorMixin);
