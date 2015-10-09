'use strict';

var ScaffoldGenerator = require('../scaffold-base.js');

module.exports = ScaffoldGenerator.extend({
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
            'spec/directive',
            'directives',
            this.options['skip-add'] || false
        );
    }
});
