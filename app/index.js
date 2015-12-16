'use strict';
var yeoman = require('yeoman-generator'),
    chalk  = require('chalk'),
    yosay  = require('yosay'),
    path   = require('path'),
    _      = require('lodash'),
    _str   = require('underscore.string'),
    mkdirp = require('mkdirp-promise'),
    util   = require('../util'),
    GeneratorMixin = require('../generator-mixin'),

    /**
     * The rewardStyle angular app & module generator
     *
     * Extends the yeoman `Base` object & mixes in our
     * custom `generator-mixin` methods on the prototype.
     * (mixin occurs at EOF)
     *
     * When run it will ask some basic questions & based
     * on the user input do things such as:
     *   create a safe, namespaced app / module name in
     * form of `rs.{{module type}}.{{module/app name}}`
     *   create the project, root project files, and the
     * corresponding folders to match the project layout.
     *   automatically inject the generated app / module
     * name into the angular js files as modules
     *   generate the remaining html & css files -
     * injecting the app / module name into them.
     *   copy any files with static content to target
     */
   rsGenerator = module.exports = yeoman.generators.Base.extend({
    // instance props
    appname: '',
    baseDir: process.cwd(),
    scriptAppName: '',

    constructor: function () {
        // trigger the base class constructor
        yeoman.generators.Base.apply(this, arguments);

        // configure optional command line arg `appname`
        this.argument('appname', {
            type: String,
            required: false
        });

        // store the appname on instance & manipulate the string
        this.appname = this.appname || path.basename(process.cwd());
        this.appname = _str.camelize(_str.slugify(_str.humanize(this.appname)));
        this.scriptAppName = this.appname + util.appName(this);

        // option to override output path for project
        this.option('dir', {
            defaults: this.baseDir,
            type: String,
            desc: 'Sets an output directory for generated project files'
        });

        // set the base working dir
        this.baseDir = this.options['dir'] || process.cwd();

        // option to skip installing bower & npm dependencies
        // currently all unit tests set this option
        this.option('skip-install', {
            defaults: false,
            type: Boolean,
            desc: 'Skips installation of generated projects bower & node dependencies'
        });

        // update the destination / target for output
        this.destinationRoot(this.baseDir);
    },

    ask: function () {
        var done = this.async();

        // Have Yeoman greet the user.
        this.log(yosay(
          'Welcome to the outstanding ' + chalk.red('rewardStyle Angular') + ' generator!'
        ));

        var prompts = [{
                type: 'list',
                name: 'moduleType',
                message: 'What kind of module is this?',
                choices: [{
                    value: 'core',
                    name: 'core',
                    checked: false
                }, {
                    value: 'util',
                    name: 'utility',
                    checked: false
                }, {
                    value: 'coll',
                    name: 'collection',
                    checked: false
                }, {
                    value: 'app',
                    name: 'app',
                    checked: false
                }, {
                    value: 'custom',
                    name: 'custom',
                    checked: false
                }]
            }, {
                type: 'input',
                name: 'moduleName',
                validate: function (input) {
                    if (/^([a-zA-Z0-9_-]*)$/.test(input)) {
                        return true;
                    }

                    return 'Your module name cannot contain special characters or a blank space, using the default name instead';
                },

                message: 'What would you like to name this module?',

                // jscs: disable disallowQuotedKeysInObjects
                'default': this.appname
                // jscs: enable disallowQuotedKeysInObjects
            }];

        this.prompt(prompts, function (props) {
            // store props for later
            this.props = props;

            // store input values from prompts
            this.moduleType = props.moduleType;
            this.moduleName = props.moduleName;

            // get dot-notated version of module name
            this.finalModule = this._getModuleName();

            done();

        }.bind(this));
    },

    confirm: function () {
        var done = this.async(),

            // prompt options
            prompts = [{
                type: 'input',
                name: 'confirm',
                validate: function (input) {
                    if (input.substring(0, 3) !== 'rs-') {
                        return 'Your module name must be prefixed with "rs-"';
                    }

                    if (/^([a-zA-Z0-9_-]*)$/.test(input)) {
                        return true;
                    }

                    return 'Your module name cannot contain special characters or a blank space, using the default name instead';
                },
                message: 'Final module name:',
                // jscs: disable disallowQuotedKeysInObjects
                'default': this._getModuleName('-')
                // jscs: enable disallowQuotedKeysInObjects
            }];

        // present user with a prompt & store response
        this.prompt(prompts, function (props) {
            this.moduleName = props.confirm;

            this.dotModuleName = props.confirm.split('-').join('.');
            this.hypModuleName = props.confirm;

            done();
        }.bind(this));
    },

    writing: {
        root: function () {
            // template root project files first
            mkdirp(this.destinationPath('assets'))
                /**
                 * Promises implement a `catch` callback. Since this conflicts with javascript
                 * reserved words, we need to disable that rule temporarily
                 */
                /* jshint -W024 */
                .catch(function (err) {
                    /* jshint +W024 */
                    // gracefully error out, log it & quit
                    this.env.error(err);
                });

            this.fs.copy(
                this.templatePath('_config.json'),
                this.destinationPath('config.json')
            );

            this.fs.copy(
                this.templatePath('_gulpfile.js'),
                this.destinationPath('gulpfile.js')
            );

            this.fs.copy(
                this.templatePath('_gitignore'),
                this.destinationPath('.gitignore')
            );

            this.fs.copy(
                this.templatePath('_vendor_config.js'),
                this.destinationPath('vendor_config.js')
            );

            this.template(
              this.templatePath('_bowerrc'),
              this.destinationPath('.bowerrc'),
              this
            );

            this.template(
              this.templatePath('_bower.json'),
              this.destinationPath('bower.json'),
              this
            );

            this.template(
                this.templatePath('_package.json'),
                this.destinationPath('package.json'),
                this
            );

            this.template(
                this.templatePath('_karma.conf.js'),
                this.destinationPath('karma.conf.js'),
                this
            );

            this.template(
                this.templatePath('_jshintrc'),
                this.destinationPath('.jshintrc'),
                this
            );

            this.template(
                this.templatePath('_jscsrc'),
                this.destinationPath('.jscsrc'),
                this
            );

            this.template(
                this.templatePath('_csslintrc'),
                this.destinationPath('.csslintrc'),
                this
            );
            // end templating of root files
        },

        app: function () {
            // copy & eval index.html first
            this.template(
                this.templatePath('src/app/index.html'),
                this.destinationPath('src/app/index.html'),
                this,
                this.interpolate
            );

            // make the new dir to replace base-ng-proj files
            mkdirp(this.destinationPath('src/app/') + this.hypModuleName)
                /**
                 * Promises implement a `catch` callback. Since this conflicts with javascript
                 * reserved words, we need to disable that rule temporarily
                 */
                /* jshint -W024 */
                .catch(function (err) {
                    /* jshint +W024 */
                    // gracefully error out, log it & quit
                    this.env.error(err);
                });

            // generate & template files for src dir
            // that require evaluation & interpolation
            this.fs.copy(
                this.templatePath('src/app/container.less'),
                this.destinationPath('src/app/container.less')
            );

            this.template(
                this.templatePath('src/app/container_app.less'),
                this.destinationPath('src/app/container_app.less'),
                this
            );

            this.fs.copy(
                this.templatePath('src/app/container_vendor.less'),
                this.destinationPath('src/app/container_vendor.less')
            );

            this.template(
                this.templatePath('src/app/container.js'),
                this.destinationPath('src/app/container.js'),
                this,
                this.interpolate
            );

            this.template(
                this.templatePath('src/app/dist.html'),
                this.destinationPath('src/app/dist.html'),
                this,
                this.interpolate
            );

            // template files from `base-ng-proj` to nested module
            this.template(
                this.templatePath('src/app/base-ng-proj/base-ng-proj.ctrl.js'),
                this.destinationPath(
                    'src/app/' +
                    this.hypModuleName +
                    '/' +
                    this.hypModuleName +
                    '.ctrl' +
                    this.moduleSuffix),
                this,
                this.interpolateMix
            );

            this.template(
                this.templatePath('src/app/base-ng-proj/base-ng-proj.module.js'),
                this.destinationPath(
                    'src/app/' +
                    this.hypModuleName +
                    '/' +
                    this.hypModuleName +
                    '.module' +
                    this.moduleSuffix),
                this,
                this.interpolateMix
            );

            this.template(
                this.templatePath('src/app/base-ng-proj/base-ng-proj.states.js'),
                this.destinationPath(
                    'src/app/' +
                    this.hypModuleName +
                    '/' +
                    this.hypModuleName +
                    '.states' +
                    this.moduleSuffix),
                this,
                this.interpolateMix
            );

            this.template(
                this.templatePath('src/app/base-ng-proj/base-ng-proj.spec.js'),
                this.destinationPath(
                    'src/app/' +
                    this.hypModuleName +
                    '/' +
                    this.hypModuleName +
                    '.spec' +
                    this.moduleSuffix),
                this,
                this.interpolateMix
            );

            // revert to default ejs interpolation for this specific template
            this.template(
                this.templatePath('src/app/base-ng-proj/base-ng-proj.tpl.html'),
                this.destinationPath(
                    'src/app/' +
                    this.hypModuleName +
                    '/' +
                    this.hypModuleName +
                    '.tpl.html'),
                this
            );

            this.template(
                this.templatePath('src/app/root.tpl.html'),
                this.destinationPath('src/app/root.tpl.html'),
                this
            );
            // end of template method invocations

            // begin standard copy ops for files that dont need interpolation
            this.fs.copy(
                this.templatePath('src/app/base-ng-proj/main.less'),
                this.destinationPath(
                    'src/app/' +
                    this.hypModuleName +
                    '/' +
                    'main.less')
            );

            this.fs.copy(
                this.templatePath('src/app/base-ng-proj/main_app.less'),
                this.destinationPath(
                    'src/app/' +
                    this.hypModuleName +
                    '/' +
                    'main_app.less')
            );

            this.fs.copy(
                this.templatePath('src/app/base-ng-proj/main_vendor.less'),
                this.destinationPath(
                    'src/app/' +
                    this.hypModuleName +
                    '/' +
                    'main_vendor.less')
            );

            this.fs.copy(
                this.templatePath('src/_blank.tpl.html'),
                this.destinationPath('src/blank.tpl.html')
            );
            // end of copy operations
        },

        tests: function () {
            this.template(
                this.templatePath('tests/helpers/_beforeAll.js'),
                this.destinationPath('tests/helpers/beforeAll.js'),
                this,
                this.interpolate
            );

            this.fs.copy(
                this.templatePath('tests/helpers/_afterAll.js'),
                this.destinationPath('tests/helpers/afterAll.js')
            );

            this.fs.copy(
                this.templatePath('tests/e2e/_mock-data.json'),
                this.destinationPath('tests/e2e/mock-data.json')
            );

            this.fs.copy(
                this.templatePath('tests/e2e/_mock-server.js'),
                this.destinationPath('tests/e2e/mock-server.js')
            );

            this.fs.copy(
                this.templatePath('tests/e2e/_protractor.conf.js'),
                this.destinationPath('tests/e2e/protractor.conf.js')
            );

            this.fs.copy(
                this.templatePath('tests/e2e/_scenarios.js'),
                this.destinationPath('tests/e2e/scenarios.js')
            );
        }
    },

    /**
     * Automatically run bower install & npm install to install all
     * dependencies after the generator has completed file ops.
     */
    install: function () {
        // install the dependencies unless user skips
        // and when complete install webdriver-manager
        this.installDependencies({
            skipInstall: this.options['skip-install'],
            callback: function () {
              this.spawnCommand('node_modules/protractor/bin/webdriver-manager', ['update']);
            }.bind(this) // bind to parent for ctx
        });
    }
});

// mixin generator-mixin props onto this obj prototype
_.extend(rsGenerator.prototype, GeneratorMixin);
