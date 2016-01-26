'use strict';

var path           = require('path'),
    yeoman         = require('yeoman-generator'),
    angularUtils   = require('./util.js'),
    chalk          = require('chalk'),
    fs             = require('fs'),
    _str           = require('underscore.string'),
    _              = require('lodash'),
    streams        = require('memory-streams'),
    ejs            = require('ejs'),
    GeneratorMixin = require('./generator-mixin');

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
var ScaffoldGenerator = module.exports = yeoman.generators.NamedBase.extend({
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
        // invoke base constructor
        yeoman.generators.NamedBase.apply(this, arguments);

        // flow for options when scaffolding should work something like this:
        //  yo gurt:directive :directive-name --options
        // By default this will template in memory for performance & then
        //  amend the projects existing /src/app/**/*.module.js script with 
        // the newly scaffolded directive.
        //
        // If the user wishes to amend a different file than *.module.js with
        //  the newly scaffolded directive then they can pass the option
        // `amend-file` & provide the path to the script to add the directive to.
        //
        // If the user wants to NOT amend an existing file but instead create
        //  a new file for the directive then simply pass the option for 
        // `filename` & pass in a name for the new file. 
        //  *NOTE* the newly created file will be created within the inner 
        // directory e.g. /src/app/**/my_directive.js

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

        // alternative option to specify path to an existing file for which to amend
        // with the newly scaffolded script(s) instead of *.module.js -- this 
        // defaults to false & script will be added to /src/app/**/*.module.js
        this.option('amend-file', { type: String, required: false, defaults: false });

        // performance option using only in-memory ops for files
        this.option('perf', { type: String, required: false, defaults: true });

        // must pass a filename if not injecting generated script into existing module
        if (!this.options['filename'] && !this.options['amend-file']) {
            // @todo: remove this comment - if-then used to check !this.options['module-add']
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
        this.dotModuleName = this._formatModuleName();
        this.hypModuleName = this._formatModuleName('-');

        // set the destination path
        if (typeof this.env.options.appPath === 'undefined') {
            // look for path in options, & bower or default to name 'app'
            this.options.appPath = this.env.options.appPath = this._baseAppPath;
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
     * Takes a source template (e.g. directive.js) script, reads
     * it into memory as string, renders the template with current
     * context, & writes it to an in-memory instance of a node
     * writable stream - finally returning it as a string. 
     *
     * @param  {String} src  path to source template
     * @return {String}      string of compiled template
     */
    memTemplate: function (src) {
        // create writable in-memory stream
        var templateStream = new streams.WritableStream(),
            // use mem-fs to read src contents into string
            srcFile = this.fs.read(
                path.join(
                    this.sourceRoot(),
                    src
                ) + this._scriptSuffix
            );

        // compile & render template and write back to memory stream
        templateStream.write(
            ejs.render(
                srcFile, 
                this,
                {
                    cache: true,
                    filename: 'tmp/compiled.js',
                    context: this
                }
            )
        );

        return templateStream.toString();
    },

    /**
     * Accepts the `appTemplate` & `testTemplate` files and delegates
     * to internal methods to copy & template these files into the
     * `target` directory
     *
     * @param  {String} srcTemplate     Source script file to render & copy
     * @param  {String} testTemplate    (Optional) Source test file to render & copy
     * @param  {String} targetDirectory Destination for file output
     * @param  {Boolean} skipAdd        If true skips adding the script to index.html
     */
    generate: function (srcTemplate, targetDir, opts) {
        // build the destination file path + filename
        var destFile = path.join(targetDir, this.name);

        // Services use classified names
        if (this.generatorName && this.generatorName.toLowerCase() === 'service') {
            this._cameledName = this._classedName;
        }

        // perform template ops in memory and hold reference to data
        // instead of writing data out to a temporary file on disk
        if (this.options['perf']) {
            // invoke inject
            this.inject(srcTemplate);
        } else {
            // place template in proper dir using target script path + target dir
            this.appTemplate(srcTemplate, destFile);
        }

        // create test script unless user opts out
        if (opts.testTemplate && this.options['include-tests']) {
            this.testTemplate(opts.testTemplate, destFile);
        }

        // inject script reference into index.html if forced
        if (opts.addToIndex) {
            this.addScriptToIndex(destFile);
        }

        // if filename was not passed then inject script into {app}.module.js
        if (!this.options['filename'] || !this.options['amend-file']) {
            if (!this.options['perf']) {
                // close over to preserve multiple contexts
                (function (ctx) {
                    ctx._writeFiles(function () {
                        // file has been flushed from memory
                        // to disk - now have access to inject
                        // its contents into dest script
                        ctx.injectScript(
                            destFile
                        );
                    });
                })(this);
            }
        }
    },

    /**
     * Takes the `script` name & injects the specified scripts
     *  contents into the {appname}.module.js script as a new
     * dependency
     *
     * @param {String} src  name of the script to be added
     */
    inject: function (src, dest) {
        // build in memory templated output string
        var template = this.memTemplate(src);

        console.log(this.destinationRoot());
        console.log(
            path.join(
                this.options.appPath,
                this.appname + '/' + this.appname
            )
        );

        // load dest script we need to append to
        var destFile = path.join(
            this.options.appPath,
            this.appname + '/' + this.appname + '.module.js'
        );

        // inject the templated string into another script
        angularUtils.rewriteFile({
            file: destFile,
            needle: ';',
            splicable: [
                template
            ]
        });

        this.log(chalk.yellow(
            '\nAdded generated script\'s contents as dependency into ' + this.appname + '.module.js'
        ));
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
                // load dest script we need to append to
                destFile = path.join(
                    this.options.appPath,
                    this.appname + '/' + this.appname + '.module.js'
                );

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
