'use strict';
var yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    yosay = require('yosay'),
    _     = require('underscore.string'),
    angularUtils = require('../util');


module.exports = yeoman.generators.Base.extend({
    modulePrefix: 'rs',
    moduleSuffix: '.js',

    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);
        this.argument('appname', { type: String, required: true });

        this.appname = this.appname || path.basename(process.cwd());
        this.appname = _.camelize(_.slugify(_.humanize(this.appname)));
        this.scriptAppName = this.appname + angularUtils.appName(this);

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
          'Welcome to the outstanding ' + chalk.red('rewardStyle Angular Generator') + ' generator!'
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
                    if (/^([a-zA-Z0-9_]*)$/.test(input)) return true;
                    return 'Your application name cannot contain special characters or a blank space, using the default name instead';
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

          this.log("You chose " + props.moduleType);
          this.log("App Name " + this.appname);
          this.log("module Name " + this.moduleName);
          this.log("Final Module Output Name " + this.finalModule);

          done();

        }.bind(this));
    },

    confirm: function () {
        var done = this.async();

        var prompts = [{
          type: 'confirm',
          name: 'confirm',
          message: 'Hows does ' + this.getModuleName() + ' work for a name?',
          default: true
        }];

        this.prompt(prompts, function (props) {
            if (props.confirm) {
                this.log(this.moduleSchema);

                // update the module name prop
                this.dotModuleName = this.getModuleName('.');
                this.hypModuleName = this.getModuleName('-');
            } else {
                this.env.error("Intentionally quitting...");
            }

          done();
        }.bind(this));
    },

    getModuleName: function (separator) {
        var out;

        if (!separator) {
            separator = '.';  // default to dot notation if nothing passed
        }

        // check for custom module - has no type output
        if (this.isCustom()) {
            out = this.modulePrefix
                  +separator
                  +this.modulename
                  +this.moduleSuffix;
        } else {
            // cat prefix, moduletype, & name for output
            out = this.modulePrefix
                  +separator
                  +this.moduleType
                  +separator
                  +this.moduleName
                  +this.moduleSuffix;
        }

        return out;
    },

    isCustom: function() {
        // quick getter returns bool based on type of module
        // true if custom else false

        this.log(this.moduleType === 'custom' ? true : false;)

        return this.moduleType === 'custom' ? true : false;
    },

    writing: {
        app: function () {
            this.fs.copy(
                this.templatePath('src/_package.json'),
                this.destinationPath('src/package.json')
            );
            this.fs.copy(
                this.templatePath('src/_bower.json'),
                this.destinationPath('src/bower.json')
            );
        },

        projectfiles: function () {
          this.fs.copy(
            this.templatePath('src/_package.json'),
            this.destinationPath('src/'+this.dotModuleName+'.js')
          );
          // this.fs.copy(
          //   this.templatePath('jshintrc'),
          //   this.destinationPath('.jshintrc')
          // );
        }
    },

    install: function() {
        // Change working directory to 'src' for dependency install
        this.spawnCommand("npm", ["install"], {cwd: 'src'});
        this.spawnCommand("bower", ["install"], {cwd: 'src'});
    }
});
