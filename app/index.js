'use strict';
var yeoman = require('yeoman-generator'),
    chalk  = require('chalk'),
    yosay  = require('yosay'),
    path   = require('path'),
    glob   = require('glob'),
    _      = require('underscore.string'),
    mkdirp = require('mkdirp-promise'),
    utils  = require('../util');

module.exports = yeoman.generators.Base.extend({
    modulePrefix: 'rs',
    moduleSuffix: '.js',
    dotModuleName: '',
    hypModuleName: '',
    interpolation: {
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

    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);

        this.argument('appname', { type: String, required: true });

        this.appname = this.appname || path.basename(process.cwd());
        this.appname = _.camelize(_.slugify(_.humanize(this.appname)));
        this.scriptAppName = this.appname + utils.appName(this);

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
          this.finalModule = this.getModuleName()

          done();

        }.bind(this));
    },

    confirm: function () {
        var done = this.async();

        // prompt options
        var prompts = [{
          type: 'confirm',
          name: 'confirm',
          message: 'Hows does ' + this.getModuleName() + ' work for a name?',
          default: true
        }];

        // present user with a prompt & store response
        this.prompt(prompts, function (props) {
            if (props.confirm) {
                // update the module name prop
                this.dotModuleName = this.getModuleName('.');
                this.hypModuleName = this.getModuleName('-');
            } else {
                this.env.error("Aborted by user. Intentionally quitting...");
            }

          done();
        }.bind(this));
    },

    /**
     * Simple getter returns bool based on type of module we are building
     *
     * @return {Boolean} returns true or false based on previous user input
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
                this.interpolation
            );

            // make the new dir to place base-ng-proj files
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
                this.interpolation
            );

            this.template(
                this.templatePath('src/app/container.js'),
                this.destinationPath('src/app/container.js'),
                this,
                this.interpolation
            );

            this.template(
                this.templatePath('src/app/dist.html'),
                this.destinationPath('src/app/dist.html'),
                this,
                this.interpolation
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
     * dependencies after the generator has completed.
     */
    install: function() {
        this.installDependencies();
    }
});
