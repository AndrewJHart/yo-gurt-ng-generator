'use strict';

var path = require('path'),
    assert = require('yeoman-generator').assert,
    helpers = require('yeoman-generator').test,
    os = require('os');

/**
 * Unit tests for the core app generator
 */
describe('generator rs-angular:app', function() {
    var mockPrompts = {
          moduleName: 'testapp',
          moduleType: 'core',
          confirm: true
        };

    before(function (done) {
      helpers.testDirectory('tmp', function (err) {
        // if error trigger callback passing err to it
        if (err) {
          done(err);
        }

        // run the generator in this path
        helpers.run(path.join(__dirname, '../app'))
            // use temp folder for testing
            .inDir('tmp')
            // supply `appname` argument
            .withArguments(['testapp'])
            // supply prompt answers
            .withPrompts(mockPrompts)
            .on('end', done);

          done();
      });
    });

    // not testing the actual run of generators yet
    it('can be required without throwing error', function () {
      this.app = require('../app');

      // assert app is truthy - not undefined
      assert.equal(true, !!this.app, 'required generator should not be undefined');
    });

    it('generates root project files', function () {
      // assert the generated files were created
      assert.file([
        'bower.json',
        'package.json',
      // 'config.json',
      //  '.editorconfig',
        'gulpfile.js',
        'vendor_config.js',
        'karma.conf.js'
      ]);

      done();
    });
});

/**
 * Unit tests for sub-generators in its own describe block
 */
// describe('sub-generator rs-angular:directive', function() {

// });