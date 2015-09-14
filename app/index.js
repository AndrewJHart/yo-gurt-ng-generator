'use strict';
var yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    yosay = require('yosay'),
    _     = require('underscore.string'),
    angularUtils = require('../util');


module.exports = yeoman.generators.Base.extend({
  constructor: function() {
    yeoman.generators.Base.apply(this, arguments);
    this.argument('appname', { type: String, required: true });

    this.appname = this.appname || path.basename(process.cwd());
    this.appname = _.camelize(_.slugify(_.humanize(this.appname)));

    if (typeof this.env.options.appPath === 'undefined') {
      this.option('appPath', {
        desc: 'Allow to choose where to write the files'
      });

      this.env.options.appPath = this.options.appPath;

      if (!this.env.options.appPath) {
        try {
          this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
        } catch (e) {}
      }
      this.env.options.appPath = this.env.options.appPath || 'app';
      this.options.appPath = this.env.options.appPath;
    }

    this.appPath = this.env.options.appPath;
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the outstanding ' + chalk.red('GeneratorRsAngular') + ' generator!'
    ));

        this.option('app-suffix', {
      desc: 'Allow a custom suffix to be added to the module name',
      type: String
    });
    this.env.options['app-suffix'] = this.options['app-suffix'];
    this.scriptAppName = this.appname + angularUtils.appName(this);


    var prompts = [{
      type: 'rawlist',
      name: 'moduleType',
      message: 'What kind of module is this?',
      choices: [
      {
        value: 'core',
        name: 'core',
        checked: false
      },
      {
        value: 'utility',
        name: 'utility',
        checked: false
      },
      {
        value: 'collection',
        name: 'colleciton',
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
    }];

    this.prompt(prompts, function (props) {
      this.props = props;
      // To access props later use this.props.someOption;

      this.log("You chose " + this.props.moduleType);

      done();
    }.bind(this));
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
      // this.fs.copy(
      //   this.templatePath('editorconfig'),
      //   this.destinationPath('.editorconfig')
      // );
      // this.fs.copy(
      //   this.templatePath('jshintrc'),
      //   this.destinationPath('.jshintrc')
      // );
    }
  },

  install: function() {
    // Change working directory to 'src' for dependency install
    // var npmDir = process.cwd() + '/src';
    // process.chdir(npmDir);

    // this.installDependencies();
    this.spawnCommand("npm", ["install"], {cwd: 'src'});
    this.spawnCommand("bower", ["install"], {cwd: 'src'});
  }
});
