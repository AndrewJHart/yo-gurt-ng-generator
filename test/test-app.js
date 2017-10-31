'use strict';

var path    = require('path'),
    yeoman  = require('yeoman-generator'),
    assert  = require('yeoman-assert'),
    helpers = require('yeoman-generator').test,
    util    = require('../util'),
    _       = require('lodash');

/**
* Unit tests for the core app generator
*/

describe('rs-angular:app', function () {
    var targetDir   = path.join(__dirname, './tmp'),
        mockPrompts = {
            moduleName: 'testapp',
            moduleType: 'core',
            confirm: true
        };

    before('Run the core generator with supplied args and options', function () {
        // run the generator
        helpers.run(path.join(__dirname, '../app'))
            // use temp folder for testing
            .inDir(targetDir)
            // supply `appname` argument
            .withArguments(['testapp'])
            // supply test directory for output
            .withOptions({'--skip-install': true})
            // supply prompt answers
            .withPrompts(mockPrompts)
            .on('ready', function (generator) {
                // assign the current generator to local obj
                this.app = generator;
            }.bind(this))
            .on('end', function () {
                // left here for future
            });
    });

    after('Delete all files created by the generator in the tmp directory', function () {
        // after all the tests have run clean up the tmp dir
        util.deleteFolderRecursive(targetDir);
    });

    describe('Dependencies', function () {

        it('can be required without error', function () {
            var app = require('../app');

            // assert app is truthy - not undefined
            assert.equal(true, !!app, 'required generator should not be undefined');
        });

        it('mixin object can be required without error', function () {
            var mixin = require('../generator-mixin');

            assert(mixin, 'required mixin object should not be undefined');
        });

        it('can extend the yeoman generator object with mixin props', function () {
            var inst = null,
            mixin = require('../generator-mixin'),
            TestGenerator = yeoman.generators.Base.extend({
                constructor: function () {
                    // assert that the mixin object's method is available
                    assert.implement(this, ['_templateMany']);
                }
            });

            // add mixin generator props onto testGenerator prototype
            _.extend(TestGenerator.prototype, mixin);

            // instantiate
            inst = new TestGenerator();
        });
    });

    describe('File creation', function () {

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
                'src/app/container_app.less',
                'src/app/container_vendor.less',
                'src/app/dist.html',
                'src/app/index.html',
                'src/app/root.tpl.html',
                'src/app/rs-core-testapp/main.less',
                'src/app/rs-core-testapp/main_app.less',
                'src/app/rs-core-testapp/main_vendor.less',
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
        it('should inject bower.json and package.json with data computed from the prompts', function () {
            assert.JSONFileContent('bower.json', {name: "rs-core-testapp"});
            assert.JSONFileContent('package.json', {name: "rs-core-testapp"});
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

        it('should inject root.tpl.html and container_app.less with matching classnames', function () {
            assert.fileContent([
                ['src/app/root.tpl.html', '<div class="rs-core-testapp-container-root">'],
                ['src/app/container_app.less', '.rs-core-testapp-container-root {']
            ]);
        });

        it('should inject the correct angular module name into required files', function () {
            assert.fileContent([
                ['src/app/rs-core-testapp/rs-core-testapp.ctrl.js', 'angular.module(\'rs.core.testapp\')'],
                ['src/app/rs-core-testapp/rs-core-testapp.module.js', 'angular.module(\'rs.core.testapp\''],
                ['src/app/rs-core-testapp/rs-core-testapp.states.js', 'angular.module(\'rs.core.testapp\')']
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
    });

    describe('Generator methods', function () {

        // check that the computed prompts match input
        it('should compute a hypenated module name that matches the input from the prompt', function () {
            var name = this.app._getModuleName('-');

            assert.textEqual(name, 'rs-core-testapp');
        });

        it('should compute a dot notated module name that matches the input from the prompt', function () {
            var name = this.app._getModuleName('.');

            assert.textEqual(name, 'rs.core.testapp');
        });

        it('should NOT be a custom module', function () {
            var isCustom = this.app._isCustom();

            assert.equal(isCustom, false);
        });

        it('should have a module type of core', function () {
            var type = this.app._getModuleType();

            assert.equal(type, 'core');
        });
    });
});

/**
* Unit tests for sub-generators in its own describe block
*/
describe('sub-generator rs-angular:directive', function () {
    // pending tests
    it('should create the expected files');

    it('should inject the directive into the project');
});

//  helpers.testDirectory(path.join(__dirname, './tmp'), function() {
