'use strict';
var yeoman = require('yeoman-generator'),
    path   = require('path'),
    glob   = require('glob'),
    _      = require('underscore.string'),
    util   = require('./util');

/**
 * Our Generator mixin class / object definition
 *
 * Should be added onto the prototype of any core
 * generator(s) that are or will be used in the project.
 *
 * note: this is not the base class for use in
 *   sub-generators (aka scaffolding). That object
 *   & those methods can be found `./scaffold.js`
 *
 * @type {object}
 */
var GeneratorMixin = module.exports = {
    // public member vars
    modulePrefix: 'rs',
    moduleSuffix: '.js',
    dotModuleName: '',
    hypModuleName: '',

    // Custom eval & interpolation hash used to override the
    // default ejs template settings. Needed because some of
    // the generated files required <% %> or <%= %> in the
    // output for further processing by our gulp build system.
    interpolate: {
        evaluate: /{{([\s\S]+?)}}/g,
        interpolate: /{{=([\s\S]+?)}}/g
    },
    // Secondary interpolation & eval template options required
    // as workaround to a bug that prevents template from rendering
    // with custom settings unless it has at least one <%= %> entry
    // https://github.com/yeoman/generator/issues/517
    interpolateMix: {
        evaluate: /\<\%([\s\S]+?)\%\>/g,
        interpolate: /\{\{=([\s\S]+?)\}\}/g,
    },

    /**
     * Simple getter returns bool based on type of module we are building
     *
     * @return {Boolean} returns true or false based on user input at prompt
     */
    isCustom: function () {
        return this.moduleType === 'custom' ? true : false;
    },

    /**
     * Constructs a namespaced module name based on the inputs provided
     * by the user in the previous prompts. Can take an optional `separator`
     * for use in outputting the name - defaults to `.` if none is provided.
     *
     * @param  {String} separator type of char or string used as separator for output
     * @return {String}           returns fully namespaced module name per rS spec
     */
    getModuleName: function (separator) {
        var out;

        if (!separator) {
            separator = '.';  // default to dot notation if nothing passed
        }

        // check for custom module - has no type output
        if (this.isCustom()) {
            out = this.modulePrefix
                  +separator
                  +this.moduleName;
        } else {
            // cat prefix, moduletype, & name for output
            out = this.modulePrefix
                  +separator
                  +this.moduleType
                  +separator
                  +this.moduleName;
        }

        return out;
    },

    /**
     * Iterates over multiple files, templating & copying them to target dir
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
        var root = util.isPathAbsolute(src) ? src : path.join(this.sourceRoot(), src),
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
        // invokes yeoman internal base._prepCopy to prep
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