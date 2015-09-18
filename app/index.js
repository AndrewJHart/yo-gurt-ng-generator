'use strict';
var yeoman = require('yeoman-generator'),
    chalk  = require('chalk'),
    yosay  = require('yosay'),
    path   = require('path'),
    glob   = require('glob'),
    _      = require('underscore.string'),
    mkdirp = require('mkdirp-promise'),
    angularUtils = require('../util');


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
    // due to bug in yeoman generator.template() method. Using
    // different settings works fine until the templates are
    // nested in directory structure - then the bug prevents
    //
    interpolateMix: {
        evaluate: /\<\%([\s\S]+?)\%\>/g,
        interpolate: /\{\{=([\s\S]+?)\}\}/g,
    },

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
        // this.ngVer = '1.4.0';  // currently used for ng-mocks version in bower
        // this.version = '0.1.0';
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

        var prompts = [{
          type: 'confirm',
          name: 'confirm',
          message: 'Hows does ' + this.getModuleName() + ' work for a name?',
          default: true
        }];

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

    isCustom: function () {
        // quick getter returns bool based on type of module
        return this.moduleType === 'custom' ? true : false;
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
                  +this.moduleName;
        } else {
            // cat prefix, moduletype, & name for output
            out = this.modulePrefix
                  +separator
                  +this.moduleType
                  +separator
                  +this.moduleName;
                  //+this.moduleSuffix;
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

        tempDirCopy: function () {
            // test that directory method is templating files
            this.templateMany(
                this.templatePath('src/app/base-ng-proj/*'),
                this.destinationPath('src/*')
            );
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

    install: function() {
        this.installDependencies();
    },

    // Shared directory method
    _templateDirectory: function (source, destination, process, bulk) {
        // Only add sourceRoot if the path is not absolute
        var root = this.templatePath(source);
        var files = glob.sync('**', { dot: true, nodir: true, cwd: root });

        destination = destination || source;

        if (typeof destination === 'function') {
            process = destination;
            destination = source;
        }

        var cp = this.copy;

        if (bulk) {
            cp = this.bulkCopy;
        }

        // get the path relative to the template root, and copy to the relative destination
        for (var i in files) {
            var dest = path.join(destination, files[i]);
            cp.call(this, path.join(root, files[i]), dest, process);
        }

        return this;
    },

    /**
     * Copies recursively the files from source directory to root directory.
     *
     * @param {String} source      Source directory to copy from. Relative to this.sourceRoot()
     * @param {String} destination Directory to copy the source files into. Relative to this.destinationRoot().
     * @param {Function} process Receive in order: the body, the source path, the destination
     *                           path and a list of options containing the encoding. It should
     *                           return the new body.
     */
    templateMany: function (source, destination, process) {
        this.log('templateMany Called');
        return this._templateDirectory(source, destination, process);
    }
});
