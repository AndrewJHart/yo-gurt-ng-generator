'use strict';
var yeoman = require('yeoman-generator'),
    path   = require('path'),
    glob   = require('glob'),
    _      = require('underscore.string'),
    utils  = require('../util');

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

    /**
     * Iteratives over multiple files, templating & copying them to target dir
     *
     * Takes `src` and `dest` directories, iterates over each found file, and
     * delegates to internal `_copy` method.
     *
     * @param {String} src  Source directory to copy from.
     * @param {String} dest Directory to copy the source files into.
     * @param {object} ctx  Template context data { key: value } for rendering variables
     * @param {object} tplOpts Template options settings to pass to _.template() method
     */
    templateMany: function (src, dest, ctx, tplOpts) {
        var root = isPathAbsolute(src) ? src : path.join(this.sourceRoot(), src),
            files = glob.sync('**', { dot: true, nodir: true, cwd: root });

        // if no target specified then default to the
        // source to template files & overwrite originals
        dest = dest || src;

        // use context or default to this
        ctx = ctx || this;

        // get the path relative to the template root, and copy to the relative destination
        for (var i in files) {
            this.log('copying file... ' + files[i]);

            var target = path.join(dest, files[i]);
            this._copy(path.join(root, files[i]), target, ctx, tplOpts);
        }

        return this;
    },

    /**
     * Renders the provided `src` template at the given `dest`.
     * The destination path is a template itself and supports variable
     * interpolation. `ctx` is an optional hash to pass to the template, if undefined,
     * executes the template with the context of the generator object instead.
     *
     * @param {String} src  Source file to render & copy.
     * @param {String} dest Target file to output results.
     * @param {object} ctx  Template context data { key: value } for rendering variables
     * @param {object} tplOpts Template options settings to pass to _.template() method
     */
    _copy: function (src, dest, ctx, tplOpts) {
        var file = this._prepCopy(src, dest);

        // if not template context is provided default to this
        ctx = ctx || this;

        // template the given file via engine() or log the error
        try {
            file.body = this.engine(file.body, ctx, tplOpts);
        } catch (err) {
            // lodash/underscore template conflict
            this.log(err);
        }

        // copy the newly created file to destination
        this.fs.copy(file.source, file.destination, {
            process: function () {
              return file.body;
            }
        });

        return this;
    }
};