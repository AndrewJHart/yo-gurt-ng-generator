'use strict';

var path           = require('path'),
    yeoman         = require('yeoman-generator'),
    angularUtils   = require('./util.js'),
    chalk          = require('chalk'),
    fs             = require('fs'),
    _str           = require('underscore.string'),
    _              = require('lodash'),
    GeneratorMixin = require('./generator-mixin'),

/**
 * Scaffold Generator base class extends
 *  yeoman NamedBase for generating files with
 * a named option passed in. Used by each
 *  sub-generator for scaffolding out the modules
 * & tests.
 *
 * @author  Andrew Hart
 * @type {object}
 */
ScaffoldGenerator = module.exports = yeoman.generators.NamedBase.extend({
    // instance props
    _sourceFilePath: 'app/templates/modules/',
    _targetFilePath: 'app/',
    _baseAppPath: 'src/app/',
    _scriptSuffix: '.js',
    _specSuffix: '.spec',
    _cameledName: '',
    _classedName: '',
    _dashedName: '',

    constructor: function () {
        // trigger super constructor
        yeoman.generators.NamedBase.apply(this, arguments);

        // provide configurable directory for scaffolded scripts
        this.option('dir', { type: String, required: false });

        // add option to disable test template
        this.option('include-tests', { type: String, required: false, defaults: true });

        // option to add dependency to index.html
        // note dependencies are auto-added to output script so
        // this should only be needed for special cases
        this.option('index-add', { type: String, required: false, deafults: false });

        // add option for custom file name
        //  note: if you add a filename the generated script
        //  will not be injected into *.module.js
        this.option('filename', { type: String, required: false, defaults: false });

        // todo: mix this in with option for filename to add generated
        // todo: code to existing *.module.js script
        this.option('module-add', { type: String, required: false, defaults: true });

        // must pass a filename if not injecting generated script into existing module
        if (!this.options['filename'] && !this.options['module-add']) {
            this.env.error(chalk.red(
                'If not injecting generated script into *.module.js then you must pass a filename for output'
            ));
        }

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
        this._cameledName = _str.camelize(this.name);
        this._classedName = _str.classify(this.name);
        this._dashedName = _str.dasherize(this.name);

        // get the formatted module names &
        // set them on this instance
        this.dotModuleName = this._getModuleName();
        this.hypModuleName = this._getModuleName('-');

        console.log(this.dotModuleName, ScaffoldGenerator.prototype);

        // set the destination path
        if (typeof this.env.options.appPath === 'undefined') {
            // look for path in options, & bower or default to name 'app'
            this.options.appPath = this.env.options.appPath = this._baseAppPath;
        }

        // set the default source path in generator (used by yeoman)
        this.sourceRoot(path.join(__dirname, this._sourceFilePath));
    },

    /**
     * Overridden to augment functionality of GeneratorMixin::_getModuleName()
     *
     * Constructs a namespaced module name based on the inputs provided
     * by the user in the previous prompts. Can take an optional `separator`
     * for use in outputting the name - defaults to `.` if none is provided.
     *
     * @param  {String} separator type of char or string used as separator for output
     * @return {String}           returns fully namespaced module name per rS spec
     */
    _getModuleName: function (separator) {
        // default to dot notation if nothing passed
        if (!separator) {
            separator = '.';
        }

        // appname prop is only persistent state for the generated
        // app / module name at time of scaffold generator execution
        if (!this.moduleName || this.moduleName === '') {
            return this.appname.replace(/-/g, separator);
        } else {
            return this.moduleName.replace(/-/g, separator);
        }
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
        this.template(
            src + this._scriptSuffix,
            path.join(
                this.options.appPath,
                path.join(
                    this.appname,
                    dest.toLowerCase()
                ) + this._scriptSuffix
            )
        );
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
        this.template(
            src + this._scriptSuffix,
            path.join(
                this.options.appPath,
                path.join(
                    this.appname,
                    dest.toLowerCase() + this._specSuffix
                ) + this._scriptSuffix
            )
        );
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

        // create test script unless user opts out
        if (opts.testTemplate && this.options['include-tests']) {
            this.testTemplate(opts.testTemplate, path.join(targetDir, this.name));
        }

        // inject script reference into index.html if forced
        if (opts.addToIndex) {
            this.addScriptToIndex(path.join(targetDir, this.name));
        }
        // if filename was not passed then inject script into {app}.module.js
        if (!this.options['filename'] || this.options['module-add']) {
            // close over to preserve multiple contexts
            // in case we need both `this`s inside of cb
            (function (ctx) {
                ctx._writeFiles(function () {
                    // file has been flushed from memory
                    // to disk - now have access to inject
                    // its contents into dest script
                    ctx.injectScript(
                        path.join(
                            targetDir,
                            ctx.name
                        )
                    );
                });
            })(this);
        }
    },

    /**
     * Takes the `script` name & injects the specified scripts
     *  contents into the {appname}.module.js script as a new
     * dependency
     *
     * @param {String} script  name of the script to be added
     */
    injectScript: function (script) {
        try {
            // load source file
            var srcFile = process.cwd() + '/' +
                path.join(
                    this.options.appPath,
                    path.join(
                        this.appname,
                        script.toLowerCase()
                    ) + this._scriptSuffix
                ),
                // load source data
                srcData = '',
                // load dest script we need to append to
                destFile = path.join(
                    this.options.appPath,
                    this.appname + '/' + this.appname + '.module.js'
                );

            // todo: deprecate fs.readFile and use in-memory file handle
            // todo: to object to grab its data and pass to rewriteFile
            // todo: - obviates the need to create and write a throw away
            // todo: file to disk


            // read source file's contents and append to dest file
            fs.readFile(srcFile, 'utf8', function (err, data) {
                if (err) {
                    this.env.error(err);
                }

                // append contents to dest file
                angularUtils.rewriteFile({
                    file: destFile,
                    needle: ';',
                    splicable: [
                        data
                    ]
                });

                this.log(chalk.yellow(
                    '\nAdded generated script\'s contents as dependency into ' + this.appname + '.module.js'
                ));

                // cleanup the previously generated file that
                // was used for getting contents to copy
                fs.unlinkSync(srcFile);
            }.bind(this));

        } catch (e) {
            // log error message to interface but don't exit
            this.log.error(chalk.yellow(
                e +
               '\nUnable to find ' + destFile + '. Reference to ' + script + '.js ' + 'not added.\n'
            ));
        }
    },

    /**
     * Takes the `script` name & injects the specified script
     * into the index.html document as a new dependency
     *
     * @param {String} script  name of the script to be added
     */
    addScriptToIndex: function (script) {
        try {
            var fullPath = path.join(this.options.appPath, 'index.html');

            this.log(chalk.yellow(
                '\nAdding generated script as dependency in index.html'
            ));

            angularUtils.rewriteFile({
                file: fullPath,
                needle: '<base href="/" />',  // '<!-- endbuild -->',
                splicable: [
                    '<script type="text/javascript" src="/scripts/' + script.toLowerCase().replace(/\\/g, '/') + '.js"></script>'
                ]
            });
        } catch (e) {
            // log error message to interface but don't exit
            // to exit use generator.env.error() which logs & exits
            this.log.error(chalk.yellow(
                '\nUnable to find ' + fullPath + '. Reference to ' + script + '.js ' + 'not added.\n'
            ));
        }
    },
});

// mixin generator-mixin props onto this obj prototype
_.extend(ScaffoldGenerator.prototype, GeneratorMixin);

