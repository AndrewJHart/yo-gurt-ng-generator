'use strict';

var path = require('path'),
    yeoman = require('yeoman-generator'),
    angularUtils = require('./util.js'),
    chalk = require('chalk'),
    _ = require('underscore.string');
    // str = require('underscore.string');

/**
 * Scaffold Generator base class extends
 * yeoman NamedBase for generating files with
 * a named option passed in. Used by each
 * sub-generator for scaffolding out the modules
 * & tests.
 *
 * @author  Andrew Hart
 * @type {object}
 */
module.exports = yeoman.generators.NamedBase.extend({
    // @TODO: move these into config file or yo-rc.json
    _sourceFilePath: 'app/templates/modules/',
    _targetFilePath: 'app/',
    _scriptSuffix: '.js',
    _specSuffix: '.spec',
    _dashedName: '',

    constructor: function () {
        // trigger super constructor
        yeoman.generators.NamedBase.apply(this, arguments);

        // if we make use of component layout then the sub-generator
        // may require an output directory for the files that are generated.
        // as override or option
        this.option('dir', { type: String, required: false });

        // add option to disable test template
        this.option('include-tests', { type: String, required: false, defaults: true });

        // prep scaffolding generator props
        this._configure();
    },

    _configure: function () {
        var bower = {};

        // load bower.json & look for name and path
        try {
            bower = require(path.join(process.cwd(), 'bower.json'));
        } catch (e) {
            this.log(e);
            process.exit(1);
        }

        // Store the apps name on instance, else try to get an app name
        if (bower.name) {
            this.appname = bower.name;
        } else {
            this.appname = path.basename(process.cwd());
        }

        // store varying versions of this sub-generator's
        // filename for use in templates, etc..
        this._cameledName = _.camelize(this.name);
        this._classedName = _.classify(this.name);
        this._dashedName = _.dasherize(this.name);

        // get the formatted module names &
        // set them on this instance
        this.dotModuleName = this._getModuleName();
        this.hypModuleName = this._getModuleName('-');

        // set the destination path
        if (typeof this.env.options.appPath === 'undefined') {
            // look for path in options, & bower or default to name 'app'
            this.options.appPath = this.env.options.appPath = this.options['dir'] || 'src/app/'+this.appname+'/';
        }

        // set the default source path in generator (used by yeoman)
        this.sourceRoot(path.join(__dirname, this._sourceFilePath));
    },

    /**
     * Takes `src` and `dest` params - copying and templating
     * the source file with the context of the current generator.
     *
     * appTemplate delegates to `generators.Base.template()`
     * calling it with the current context.
     *
     * @param  {String} src  path to source file for processing
     * @param  {String} dest path to target for output
     */
    appTemplate: function (src, dest) {
        yeoman.generators.Base.prototype.template.apply(this, [
            src + this._scriptSuffix,
            path.join(
                this.env.options.appPath,
                dest.toLowerCase()
            ) + this._scriptSuffix
        ]);
    },

    /**
     * Takes `src` and `dest` params - generates a basic
     * test prototype when scaffolding occurs.
     *
     * @param  {String} src  path to source file for processing
     * @param  {String} dest path to target for output
     */
    testTemplate: function (src, dest) {
        // test files based on karma
        yeoman.generators.Base.prototype.template.apply(this, [
            src + this._scriptSuffix,
            path.join(
                this.env.options.appPath,
                dest.toLowerCase() + this._specSuffix
            ) + this._scriptSuffix
        ]);
    },

    /**
     * Takes `src` and `dest` params - copying and templating
     * html files.
     *
     * appTemplate delegates to `generators.Base.template()`
     * calling it with the current context.
     *
     * @param  {String} src  path to source file for processing
     * @param  {String} dest path to target for output
     */
    htmlTemplate: function (src, dest) {
        yeoman.generators.NamedBase.prototype.template.apply(this, [
            src,
            path.join(
                this.env.options.appPath,
                dest.toLowerCase()
            )
        ]);
    },

    /**
     * Takes the `script` name & injects the specified script
     * into the index.html document as a new dependency
     *
     * @param {String} script  name of the script to be added
     */
    addScriptToIndex: function (script) {
        try {
            var appPath = this.env.options.appPath,
                fullPath = path.join(appPath, 'index.html');

            angularUtils.rewriteFile({
                file: fullPath,
                needle: '<!-- endbuild -->',
                splicable: [
                    '<script src="src/' + this._targetFilePath + script.toLowerCase().replace(/\\/g, '/') + '.js"></script>'
                ]
            });
        } catch (e) {
            // log error message to interface. Consider actually stopping operations
            // gracefully by using generator.env.error() which logs & gracefully exits
            this.log.error(chalk.yellow(
                '\nUnable to find ' + fullPath + '. Reference to ' + script + '.js ' + 'not added.\n'
            ));
        }
    },

    /**
     * Accepts the `appTemplate` & `testTemplate` files and delegates
     * to internal methods to copy & template these files into the
     * `target` directory
     *
     * @param  {String} appTemplate     Source script file to render & copy
     * @param  {String} testTemplate    (Optional) Source test file to render & copy
     * @param  {String} targetDirectory Destination for file output
     * @param  {Boolean} skipAdd        If true skips adding the script to index.html
     */
    generate: function (appTemplate, targetDir, opts) {
        // Services use classified names
        if (this.generatorName && this.generatorName.toLowerCase() === 'service') {
            this._cameledName = this._classedName;
        }

        // place template in proper dir using target script path + target dir
        this.appTemplate(appTemplate, path.join(targetDir, this.name));

        if (this.options['include-tests'] && opts.testTemplate) {
            this.testTemplate(opts.testTemplate, path.join(targetDir, this.name));
        }

        if (!opts.skipAdd) {
            this.addScriptToIndex(path.join(targetDir, this.name));
        }
    }
});
