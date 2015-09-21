'use strict';
var path = require('path');
    yeoman = require('yeoman-generator'),
    angularUtils = require('./util.js'),
    chalk = require('chalk'),
    _ = require('underscore.string');

/**
 * Scaffold Generator base class extends yeoman NamedBase for generating
 * files with a named option passed in. Used by each sub-generator for
 * creating the modules & tests.
 */
var ScaffoldGenerator = module.exports = yeoman.generators.NamedBase.extend({
  // @TODO: move these into config file or yo-rc.json
  _sourceFilePath: 'app/templates/modules/',
  _targetFilePath: 'app/',
  _scriptSuffix: '.js',

  constructor: function() {
    var bowerJson = {};

    // trigger super constructor
    yeoman.generators.NamedBase.apply(this, arguments);

    this.argument('directory', { type: String, required: false });

    // @TODO: insert logic for checking `directory` argument is valid

    try {
      bowerJson = require(path.join(process.cwd(), 'bower.json'));
    } catch (e) {}

    if (bowerJson.name) {
      this.appname = bowerJson.name;
    } else {
      this.appname = path.basename(process.cwd());
    }

    // strip spaces etc.. from app name
    this.appname = _.slugify(_.humanize(this.appname));

    this.scriptAppName = bowerJson.moduleName || _.camelize(this.appname) + angularUtils.appName(this);

    // generate camel & class ver of name
    this.cameledName = _.camelize(this.name);
    this.classedName = _.classify(this.name);

    if (typeof this.env.options.appPath === 'undefined') {
      // look for path in options, & bower or default to name 'app'
      this.env.options.appPath = this.options.appPath || bowerJson.appPath || 'src';

      // copy the app path to options hash
      this.options.appPath = this.env.options.appPath;
    }

    this.env.options.testPath = this.env.options.testPath || bowerJson.testPath || 'test/spec';

    this.sourceRoot(path.join(__dirname, this._sourceFilePath));
  },

  appTemplate: function(src, dest) {
    yeoman.generators.Base.prototype.template.apply(this, [
      src + this._scriptSuffix,
      path.join(this.env.options.appPath, dest.toLowerCase()) + this._scriptSuffix
    ]);
  },

  testTemplate: function(src, dest) {
    // no-op -- TODO implementation
  },

  htmlTemplate: function(src, dest) {
    yeoman.generators.NamedBase.prototype.template.apply(this, [
      src,
      path.join(this.env.options.appPath, dest.toLowerCase())
    ]);
  },

  addScriptToIndex: function(script) {
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

  generateSourceAndTest: function(appTemplate, testTemplate, targetDirectory, skipAdd) {
    // Services use classified names
    if (this.generatorName && this.generatorName.toLowerCase() === 'service') {
      this.cameledName = this.classedName;
      console.log(this.generatorName);
    }

    // place template in proper dir using target script path + target dir
    this.appTemplate(appTemplate, path.join(targetDirectory, this.name));
    this.testTemplate(testTemplate, path.join(targetDirectory, this.name));

    if (!skipAdd) {
      this.addScriptToIndex(path.join(targetDirectory, this.name));
    }
  }
});