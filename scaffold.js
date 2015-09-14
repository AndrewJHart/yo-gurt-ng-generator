'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var angularUtils = require('./util.js');
var chalk = require('chalk');
var _ = require('underscore.string');

/**
 * Scaffold Generator base class extends yeoman NamedBase for generating
 * files with a named option passed in. Used by each sub-generator for
 * creating the modules & tests.
 */
var ScaffoldGenerator = module.exports = yeoman.generators.NamedBase.extend({

  sourceFilesPath: 'app/template/modules',
  innerScriptPath: 'app/modules/',
  scriptSuffix: '.js',

  constructor: function() {
    var bowerJson = {};

    // trigger super constructor
    yeoman.generators.NamedBase.apply(this, arguments);

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

    this.sourceRoot(path.join(__dirname, this.sourceFilesPath));
  },

  appTemplate: function(src, dest) {
    yeoman.generators.Base.prototype.template.apply(this, [
      src + this.scriptSuffix,
      path.join(this.env.options.appPath, dest.toLowerCase()) + this.scriptSuffix
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
      var appPath = this.env.options.appPath;
      var fullPath = path.join(appPath, 'index.html');
      angularUtils.rewriteFile({
        file: fullPath,
        needle: '<!-- endbuild -->',
        splicable: [
          '<script src="src/' + this.innerScriptPath + script.toLowerCase().replace(/\\/g, '/') + '.js"></script>'
        ]
      });
    } catch (e) {
      this.log.error(chalk.yellow(
        '\nUnable to find ' + fullPath + '. Reference to ' + script + '.js ' + 'not added.\n'
      ));
    }
  },

  generateSourceAndTest: function(appTemplate, testTemplate, targetDirectory, skipAdd) {
    // Services use classified names
    // if (this.generatorName.toLowerCase() === 'service') {
    //   this.cameledName = this.classedName;
    // }

    // place template in proper dir using inner script path + target dir
    this.appTemplate(appTemplate, path.join(this.innerScriptPath, targetDirectory, this.name));
    this.testTemplate(testTemplate, path.join(targetDirectory, this.name));

    if (!skipAdd) {
      this.addScriptToIndex(path.join(targetDirectory, this.name));
    }
  }
});