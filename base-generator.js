'use strict';
var yeoman = require('yeoman-generator'),
    path   = require('path'),
    glob   = require('glob'),
    _      = require('underscore.string');

/**
 * The base Generator class / object definition
 * Should be inherited by any and all generators
 * that are used in the project.
 *
 * @type {object}
 */
var BaseGenerator = module.exports = {

    interpolateStd: {
        evaluate: /{{([\s\S]+?)}}/g,
        interpolate: /{{=([\s\S]+?)}}/g
    },
    interpolateMix: {
        evaluate: /\<\%([\s\S]+?)\%\>/g,
        interpolate: /\{\{=([\s\S]+?)\}\}/g,
    },

    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);

        return this;
    },

    templateMany: function(params) {
        return;
    },

    templateOne: function(params) {
        return;
    }
};