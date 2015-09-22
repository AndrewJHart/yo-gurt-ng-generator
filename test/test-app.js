'use strict';

var path = require('path'),
    assert = require('yeoman-assert'),
    helpers = require('yeoman-generator').test,
    os = require('os'),
    util = require('../util'),
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
              console.log('End of run. Cleaning up...');

              // cleanup the tmp directory
            });

            // rimraf(targetDir, function (err) {
            //   if (err) {
            //     throw(err);
            //   }
            // });
            util.deleteFolderRecursive(path.join(__dirname, './tmp/**'));
    });

    describe('Dependencies', function() {
      it('can be required without throwing error', function () {
        this.app = require('../app');

        // assert app is truthy - not undefined
        assert.equal(true, !!this.app, 'required generator should not be undefined');
      });
    });

    describe('File Creation', function() {
      it('generates expected root project files', function () {
        // assert the generated files were created
        assert.file([
          'bower.json',
          'package.json',
          'gulpfile.js',
          'vendor_config.js',
          'karma.conf.js'
        ]);
      });
    });
});

/**
 * Unit tests for sub-generators in its own describe block
 */
describe('sub-generator rs-angular:directive', function() {

});

//  helpers.testDirectory(path.join(__dirname, './tmp'), function() {