'use strict';
var yeoman = require('yeoman-generator'),
    chalk  = require('chalk'),
    yosay  = require('yosay'),
    path   = require('path'),
    _      = require('lodash'),
    _str   = require('underscore.string'),
    mkdirp = require('mkdirp-promise'),
    util   = require('../util'),
    GeneratorMixin = require('../generator-mixin');

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
var rsGenerator = module.exports = yeoman.generators.Base.extend({
    baseDir: process.cwd(),

    constructor: function() {
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

        // if we make use of component layout then the sub-generator
        // may require an output directory for the files that are generated.
        // as override or option
        this.option('dir', {
            defaults: this.baseDir,
            type: String,
            desc: 'Sets an output directory for generated project files'
        });

        // set the base working dir
        this.baseDir = this.options['dir'] || process.cwd();

        this.log(this.baseDir);

        if (typeof this.env.options.appPath === 'undefined') {
          this.option('appPath', {
              desc: 'Allow to choose where to write the files'
          });

          this.env.options.appPath = this.options.appPath;

          if (!this.env.options.appPath) {
              try {
                  this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
              } catch (e) { /* noop */ }
          }

          this.env.options.appPath = this.env.options.appPath || 'app';
          this.options.appPath = this.env.options.appPath;
        }

        this.appPath = this.env.options.appPath;
    },

    ask: function () {
        var done = this.async();

        // Have Yeoman greet the user.
        this.log(yosay(
          'Welcome to the outstanding ' + chalk.red('rewardStyle Angular') + ' generator!'
        ));

        var prompts = [
            {
              type: 'list',
              name: 'moduleType',
              message: 'What kind of module is this?',
              choices: [
              {
                value: 'core',
                name: 'core',
                checked: false
              },
              {
                value: 'util',
                name: 'utility',
                checked: false
              },
              {
                value: 'coll',
                name: 'collection',
                checked: false
              },
              {
                value: 'app',
                name: 'app',
                checked: false
              },
              {
                value: 'custom',
                name: 'custom',
                checked: false
              }]
            },
            {
                type: 'input',
                name: 'moduleName',
                validate: function (input) {
                    if (/^([a-zA-Z0-9_-]*)$/.test(input)) return true;
                    return 'Your module name cannot contain special characters or a blank space, using the default name instead';
                },
                message: 'What would you like to name this module?',
                default: this.appname
            }
        ];

        this.prompt(prompts, function (props) {
          this.props = props;  // store props for later

          this.moduleType = props.moduleType;
          this.moduleName = props.moduleName;
          this.finalModule = this._getModuleName();

          done();

        }.bind(this));
    },

    confirm: function () {
        var done = this.async();

        // prompt options
        var prompts = [{
          type: 'confirm',
          name: 'confirm',
          message: 'Hows does ' + this._getModuleName() + ' work for a name?',
          default: true
        }];

        // present user with a prompt & store response
        this.prompt(prompts, function (props) {
            if (props.confirm) {
                // update the module name prop
                this.dotModuleName = this._getModuleName('.');
                this.hypModuleName = this._getModuleName('-');
            } else {
                this.env.error("Aborted by user. Intentionally quitting...");
            }

          done();
        }.bind(this));
    },

    writing: {
        root: function () {
            // template root project files first
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
              this.templatePath('_bowerrc'),     // src path
              this.destinationPath('.bowerrc'),  // target path
              this                               // template context
            );

            this.template(
              this.templatePath('_bower.json'),    // src path
              this.destinationPath('bower.json'),  // target path
              this                                 // template context
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
            mkdirp(this.destinationPath('src/app/')+this.hypModuleName)
                .catch(function(err) {
                    // gracefully error out, log it & quit
                    this.env.error(err);
                });

            // generate & template files for src dir
            // that require evaluation & interpolation
            this.template(
                this.templatePath('src/app/container.less'),
                this.destinationPath('src/app/container.less'),
                this,
                this.interpolate
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
                    'src/app/'
                    +this.hypModuleName
                    +'/'
                    +this.hypModuleName
                    +'.ctrl'
                    +this.moduleSuffix),
                this,
                this.interpolateMix
            );

            this.template(
                this.templatePath('src/app/base-ng-proj/base-ng-proj.module.js'),
                this.destinationPath(
                    'src/app/'
                    +this.hypModuleName
                    +'/'
                    +this.hypModuleName
                    +'.module'
                    +this.moduleSuffix),
                this,
                this.interpolateMix
            );

            this.template(
                this.templatePath('src/app/base-ng-proj/base-ng-proj.states.js'),
                this.destinationPath(
                    'src/app/'
                    +this.hypModuleName
                    +'/'
                    +this.hypModuleName
                    +'.states'
                    +this.moduleSuffix),
                this,
                this.interpolateMix
            );

            this.template(
                this.templatePath('src/app/base-ng-proj/base-ng-proj.spec.js'),
                this.destinationPath(
                    'src/app/'
                    +this.hypModuleName
                    +'/'
                    +this.hypModuleName
                    +'.spec'
                    +this.moduleSuffix),
                this,
                this.interpolateMix
            );

            // revert to default ejs interpolation for this specific template
            this.template(
                this.templatePath('src/app/base-ng-proj/base-ng-proj.tpl.html'),
                this.destinationPath(
                    'src/app/'
                    +this.hypModuleName
                    +'/'
                    +this.hypModuleName
                    +'.tpl.html'),
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
                    'src/app/'
                    +this.hypModuleName
                    +'/'
                    +'main.less')
            );

            this.fs.copy(
                this.templatePath('src/_blank.tpl.html'),
                this.destinationPath('src/blank.tpl.html')
            );
            // end of copy operations
        }
    },

    /**
     * Automatically run bower install & npm install to install all
     * dependencies after the generator has completed file ops.
     */
    install: function() {
        this.installDependencies();
    }
});

// mixin generator-mixin props onto this obj prototype
_.extend(rsGenerator.prototype, GeneratorMixin);
