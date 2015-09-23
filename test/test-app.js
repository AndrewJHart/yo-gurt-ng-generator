'use strict';

var path = require('path'),
    yeoman = require('yeoman-generator'),
    assert = require('yeoman-assert'),
    helpers = require('yeoman-generator').test,
    os = require('os'),
    util = require('../util'),
    _    = require('lodash'),
    rimraf = require('rimraf');

/**
 * Unit tests for the core app generator
 */
describe('rs-angular:app', function() {
    var targetDir   = path.join(__dirname, './tmp'),
        mockPrompts = {
          moduleName: 'testapp',
          moduleType: 'core',
          confirm: true
        };

    before(function () {
        // run the generator in this path
        helpers.run(path.join(__dirname, '../app'))
            // use temp folder for testing
            .inDir(
              targetDir
            )
            // supply `appname` argument
            .withArguments(
              ['testapp']
            )
            // supply test directory for output
            .withOptions({
              '--skip-install': true
            })
            // supply prompt answers
            .withPrompts(
              mockPrompts
            )
            .on('end', function() {

            });
    });

    describe('Dependencies', function() {

      it('can be required without error', function () {
        this.app = require('../app');

        // assert app is truthy - not undefined
        assert.equal(true, !!this.app, 'required generator should not be undefined');
      });

      it('mixin object can be required without error', function () {
        this.mixinGenerator = require('../generator-mixin');

        assert(this.mixinGenerator, 'required mixin object should not be undefined');
      });

      it('can extend the yeoman generator object with mixin props', function () {
        var testGenerator = yeoman.generators.Base.extend({
              constructor: function () {
                // assert that the mixin object's method is available
                assert(
                  _.isFunction(this.templateMany),
                  'templateMany() does not exist on the testGenerator object.. prototype props were not added'
                );
              }
            });

        // add mixin generator props onto testGenerator prototype
        _.extend(testGenerator.prototype, this.mixinGenerator);
      });
    });

    describe('File creation', function() {

      // assert the root project files were created
      it('generates expected root project files', function () {
        assert.file([
          'bower.json',
          'package.json',
          'config.json',
          'gulpfile.js',
          'vendor_config.js',
          'karma.conf.js',
          '.bowerrc',
          '.gitignore'
        ]);
      });

      // assert the app project files were created
      it('generates expected app project files', function () {
        assert.file([
          'src/blank.tpl.html',
          'src/app/container.js',
          'src/app/container.less',
          'src/app/dist.html',
          'src/app/index.html',
          'src/app/root.tpl.html',
          'src/app/rs-core-testapp/main.less',
          'src/app/rs-core-testapp/rs-core-testapp.ctrl.js',
          'src/app/rs-core-testapp/rs-core-testapp.module.js',
          'src/app/rs-core-testapp/rs-core-testapp.spec.js',
          'src/app/rs-core-testapp/rs-core-testapp.states.js',
          'src/app/rs-core-testapp/rs-core-testapp.tpl.html'
        ]);
      });
    });

    describe('File contents and customization', function () {

        // assert the files have correct contents injected into them
        it('should update bower.json and package.json with data computed from the prompts', function () {
          assert.fileContent([
            ['bower.json', '"name": "rs-core-testapp"'],
            ['package.json', '"name": "rs-core-testapp"']
          ]);
        });

        it('should inject index.html with proper `ng-app` and `ng-controller` names', function () {
          assert.fileContent([
            ['src/app/index.html', 'ng-app="rs.core.testapp.container"'],
            ['src/app/index.html', 'ng-controller="rs.core.testapp.container.AppCtrl"']
          ]);
        });

        it('should inject dist.html with proper `ng-app` and `ng-controller` names', function () {
          assert.fileContent([
            ['src/app/dist.html', 'ng-app="rs.core.testapp.container"'],
            ['src/app/dist.html', 'ng-controller="rs.core.testapp.container.AppCtrl"']
          ]);
        });

        it('should inject root.tpl.html and container.less with matching classnames', function () {
          assert.fileContent([
            ['src/app/root.tpl.html', '<div class="rs-core-testapp-container-root">'],
            ['src/app/container.less', '.rs-core-testapp-container-root {']
          ]);
        });

        it('should inject the correct angular module name into required files', function () {
          assert.fileContent([
            ['src/app/rs-core-testapp/rs-core-testapp.ctrl.js', 'angular.module(\'rs.core.testapp\')'],
            ['src/app/rs-core-testapp/rs-core-testapp.module.js', 'angular.module(\'rs.core.testapp\''],
            ['src/app/rs-core-testapp/rs-core-testapp.states.js', 'angular.module(\'rs.core.testapp\')'],
          ]);
        });

        it('should inject rs-core-testapp.ctrl.js with the correspoding AppCtrl controller', function () {
          assert.fileContent(
            'src/app/rs-core-testapp/rs-core-testapp.ctrl.js', '.controller(\'rs.core.testapp.AppCtrl\''
          );
        });

        it('should inject the generated test module rs-core-testapp.spec.js with the AppCtrl controller', function () {
          assert.fileContent(
            'src/app/rs-core-testapp/rs-core-testapp.spec.js', 'describe(\'rs.core.testapp.AppCtrl\''
          );
        });

        it('should inject rs-core-testapp.tpl.html with the correct classname', function () {
          assert.fileContent(
            'src/app/rs-core-testapp/rs-core-testapp.tpl.html', '<div class="rs-core-testapp">'
          );
        });

        // cleanup the tmp directory
        setTimeout(function () {
          util.deleteFolderRecursive(targetDir);
        }, 0);
    });
});

/**
 * Unit tests for sub-generators in its own describe block
 */
describe('sub-generator rs-angular:directive', function() {

});

//  helpers.testDirectory(path.join(__dirname, './tmp'), function() {