'use strict';

var _                 = require('lodash'),
    util              = require('../util'),
    ScaffoldGenerator = require('../scaffold-base.js');

/**
 * The Directive scaffolding generator
 *
 * methods prefixed with an underscore `_` are kept
 *  out of the yeoman run time loop.
 *
 * This object gets "inherits" its methods from two
 *  other objects `GeneratorMixin` and `ScaffoldGenerator`
 * by mixing in their methods on its prototype. The
 *  technique used here is to extend one object
 * directly and then to grab the other objects proto
 *  props by employing use of the _.extend() later
 *
 * Base methods can be found `./scaffold-base.js`
 *  and `./generator-mixin.js`
 *
 * @author  Andrew Hart
 * @type {object}
 */
var DirectiveGenerator = module.exports = ScaffoldGenerator.extend({
    constructor: function () {
        ScaffoldGenerator.apply(this, arguments);
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
            this.options['dir'] || '',
            {
                addToIndex: this.options['index-add'] || false,
                testTemplate: 'spec/directive'
            }
        );
    }
});
