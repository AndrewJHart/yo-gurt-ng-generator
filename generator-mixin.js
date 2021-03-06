'use strict';

var path = require('path'),
    glob = require('glob'),
    util = require('./util');

/**
 * Our Generator mixin class / object definition
 *
 * Should be added onto the prototype of any core
 * generator(s) that are or will be used in the project.
 *
 * methods prefixed with an underscore `_` are not
 * necessarily meant to be private but this keeps those
 * methods from being run automatically by the yeoman
 * run loop.
 *
 * note: this is not the base class for use in
 *   sub-generators (scaffolding). That object
 *   & those methods can be found `./scaffold-base.js`
 *
 * @author  Andrew Hart
 * @type {object}
 */
module.exports = {
    // public member vars
    modulePrefix: 'rs',
    moduleSuffix: '.js',
    moduleType:    '',
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
        evaluate: /<\%([\s\S]+?)\%>/g,
        interpolate: /\{\{=([\s\S]+?)\}\}/g
    },

    /**
     * Simple getter returns bool based on type of module we are building
     *
     * @return {Boolean} returns true or false based on user input at prompt
     */
    _isCustom: function () {
        return this.moduleType === 'custom' ? true : false;
    },

    /**
     * Constructs the namespaced app/module final name based on the input
     * by the user in the previous prompts. Can take an optional `separator`
     * for use in outputting the name - defaults to `.` if none is provided.
     *
     * @param  {String} separator type of char or string used as separator for output
     * @return {String}           returns fully namespaced module name per rS spec
     */
    _getModuleName: function (separator) {
        var out,
            separator = separator || '.';  // default to dot notation

        // check for custom module - has no type output
        if (this._isCustom()) {
            out = this.modulePrefix +
                separator +
                this.moduleName;
        } else {
            // cat prefix, moduletype, & name for output
            out = this.modulePrefix +
                separator +
                this.moduleType +
                separator +
                this.moduleName;
        }

        return out;
    },

    /**
     * To be called on the final app / module name for formatting
     * the dashed version of the final name. This is useful for
     * generators that are run after the project has been generated.
     *
     * @param  {String} separator type of char or string used as separator for output
     * @return {String}           returns fully namespaced module name per rS spec
     */
    _formatModuleName: function (separator) {
        var separator = separator || '.';

        if (!this.moduleName || this.moduleName === '') {
            return this.appname.replace(/-/g, separator);
        } else {
            return this.moduleName.replace(/-/g, separator);
        }
    },

    /**
     * Getter that returns the type of module the user
     * selected based on options in the prompts.
     *
     * @return {String} the value of the `moduleType` string
     */
    _getModuleType: function () {
        return this.moduleType;
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
    _templateMany: function (src, dest, ctx, tplOpts) {
        var root = util.isPathAbsolute(src) ? src : path.join(this.sourceRoot(), src),
            files = glob.sync('**', { dot: true, nodir: true, cwd: root }),
            target;

        // if no target specified then default to the
        // source to template files & overwrite originals
        dest = dest || src;

        // use context or default to this
        ctx = ctx || this;

        // get the path relative to the template root, and copy to the relative destination
        for (var i in files) {
            // Wrapping to filter out unwanted prototype properties from being evaluated. Makes jshint happy
            // I'm unsure what all properties exist in the files object so I'm not comfortable removing any
            // at this time
            if (true) {
                this.log('copying file... ' + files[i]);

                target = path.join(dest, files[i]);
                this._copy(path.join(root, files[i]), target, ctx, tplOpts);
            }
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
