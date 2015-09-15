'use strict';

var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var argv = require('yargs').argv;
var connectModRewrite = require('connect-modrewrite');
var containerConfig = require('./config.json');
var bower = require('./bower.json');
var del = require('del');
var fs = require('fs');
var glob = require('glob');
var globLoader = require('node-glob-loader');
var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var nghtml2js = require('gulp-ng-html2js');
var path = require('path');
var pkg = require('./package.json');
var semver = require('semver');
var streamqueue = require('streamqueue');
var url = require('url');
var vendorConfig = require('./vendor_config.js');

var config = {
    banner: '/**\n' +
            ' * Copyright (c) rewardStyle \n' +
            ' */',
    paths: {
        app: {
            assets: ['src/assets/**'],
            html: ['src/index.html'],
            scripts: ['src/**/*.module.js',
                      'src/**/*.js',
                      '!src/**/*.spec.js',
                      '!src/**/container.js',
                      '!src/assets/**/*.js'],
            styles: ['src/**/main.less'],
            templates: ['src/app/**/*.tpl.html']
        },
        build: {
            assets: 'assets',
            dist: 'dist',
            scripts: 'scripts',
            styles: 'styles',
            tmp: '.tmp',
        },
        container: {
            scripts: ['src/**/container.js'],
            styles: ['src/**/container.less']
        },
        placeholder: {
            template: ['src/blank.tpl.html']
        },
        rscomponents: {
            assets: [bower.directory + '/rs-*/**/assets/**'],
            scripts: [bower.directory + '/rs-*/**/*.module.js',
                      bower.directory + '/rs-*/**/.js',
                      // uncomment to enable app specific routing
                      //'!' + bower.directory + '/rs-*/**/*.routes.js',
                      '!' + bower.directory + '/rs-*/**/*.spec.js',
                      '!' + bower.directory + '/rs-*/**/vendor_config.js'],
            styles: [bower.directory + '/rs-*/**/main.less'],
            templates: [bower.directory + '/rs-*/src/app/**/*.tpl.html']
        }
    },
};

gulp.task('clean', function () {
    return del([
        config.paths.build.tmp,
        config.paths.build.dist
    ]);
});

gulp.task('aggregate-vendor-deps', function () {
    var resources = {
        styles: [],
        scripts: [],
        assets: []
    };

    return globLoader.load(bower.directory + '/**/vendor_config.js', function (exports) {

        if (exports.scripts) {
            resources.scripts.push(
                _.map(exports.scripts, function (script) {
                    return bower.directory + '/**/' + script;
                })
            );
        }

        if (exports.styles) {
            resources.styles.push(
                _.map(exports.styles, function (style) {
                    return bower.directory + '/**/' + style;
                })
            );
        }

        if (exports.assets) {
            resources.assets.push(
                _.map(exports.assets, function (asset) {
                    return bower.directory + '/**/' + asset;
                })
            );
        }

    }).then(function() {

        resources.styles = (_.uniq(_.flatten(resources.styles)));
        resources.scripts = (_.uniq(_.flatten(resources.scripts)));

        config.dependencies = resources;

        config.aggregated = {
            styles: _.uniq(_.flatten([
                config.dependencies.styles,
                _.map(vendorConfig.styles, function (style) {
                                            return bower.directory + '/**/' + style;
                }),
                config.paths.rscomponents.styles,
                config.paths.app.styles
            ])),
            scripts: _.uniq(_.flatten([
                config.dependencies.scripts,
                _.map(vendorConfig.scripts, function (script) {
                                            return bower.directory + '/**/' + script;
                }),
                config.paths.rscomponents.scripts,
                config.paths.app.scripts
            ])),
            assets: _.uniq(_.flatten([
                config.dependencies.assets,
                _.map(vendorConfig.assets, function (asset) {
                                            return bower.directory + '/**/' + asset;
                }),
                config.paths.app.assets,
                config.paths.rscomponents.assets
            ]))
        };

    });
});

gulp.task('html2js', ['clean', 'aggregate-vendor-deps'], function () {

  gulp.src(_.flatten([config.paths.app.templates,
                      config.paths.placeholder.template]))
      .pipe(nghtml2js({moduleName: 'templates-app'}))
      .pipe($.concat('templates-app.js'))
      .pipe(gulp.dest(path.join(
        config.paths.build.tmp,
        config.paths.build.scripts
      )));

  gulp.src(_.flatten([config.paths.rscomponents.templates,
                      config.paths.placeholder.template]))
      .pipe(nghtml2js({
        moduleName: 'templates-components',
        rename: function(url) {
          return url.replace(/^.*src\/app\//, '');
        }
      }))
      .pipe($.concat('templates-components.js'))
      .pipe(gulp.dest(path.join(
        config.paths.build.tmp,
        config.paths.build.scripts
      )));

  return;
});

gulp.task('scripts:lint', function () {
  return gulp.src(_.flatten([config.paths.app.scripts]))
             .pipe($.jshint({laxcomma: true,
                             strict: false,
                             sub: true,
                             unused: false}))
             .pipe($.jshint.reporter('jshint-stylish'))
             .pipe($.jshint.reporter('fail'));
});

gulp.task('scripts', ['clean', 'aggregate-vendor-deps', 'scripts:lint'], function () {

  var stream = streamqueue({objectMode: true});

  stream.queue(gulp.src(config.aggregated.scripts));
  stream.queue(gulp.src(config.paths.container.scripts));

  return stream.done().pipe($.concat('app.js'))
               .pipe($.insert.prepend('var _containerCfg = ' +
                                      JSON.stringify(containerConfig) + ';'))
               .pipe(gulp.dest(path.join(
                 config.paths.build.tmp,
                 config.paths.build.scripts
               )))
               .pipe($.connect.reload());
});

gulp.task('scripts:dist', ['scripts', 'html2js'], function () {
  var srcPath = path.join(config.paths.build.tmp, config.paths.build.scripts);
  var output = gulp.src([
                        path.join(srcPath, 'app.js'),
                        path.join(srcPath, 'templates-app.js'),
                        path.join(srcPath, 'templates-components.js')
                    ])
                   .pipe($.concat('app.js'))
                   .pipe($.uglify())
                   .pipe(gulp.dest(path.join(
                            config.paths.build.dist,
                            config.paths.build.scripts
                    )));
  output.on('error', console.error.bind(console));
  return output;
});

gulp.task('styles', ['clean', 'aggregate-vendor-deps'], function () {

    var rsModules = {
        componentsPath: '../../../../../' + bower.directory
    };

    var appModule = {
        componentsPath: '../../../' + bower.directory
    };

    var containerModule = {
        componentsPath: '../../' + bower.directory
    };

    var stream = streamqueue({objectMode: true});

    stream.queue(gulp.src(_.flatten([
        config.dependencies.styles,
        _.map(vendorConfig.styles, function (style) {
                                    return bower.directory + '/**/' + style;
                                    })
        ])));

    stream.queue(gulp.src(config.paths.rscomponents.styles)
                     .pipe($.template(rsModules)));

    stream.queue(gulp.src(config.paths.app.styles)
                     .pipe($.template(appModule)));

    stream.queue(gulp.src(config.paths.container.styles)
                     .pipe($.template(containerModule)));

    return stream.done()
                 .pipe($.less())
                 .pipe($.concat('app.css'))
                 .pipe($.autoprefixer('last 1 version'))
                 .pipe(gulp.dest(path.join(
                    config.paths.build.tmp, config.paths.build.styles
                 )))
                 .pipe($.connect.reload());

});

gulp.task('styles:dist', ['styles'], function () {
  var output = gulp.src(path.join(
                            config.paths.build.tmp,
                            config.paths.build.styles, '*.css'
                        ))
                   .pipe(minifyCss({compatibility: 'ie8'}))
                   .pipe(gulp.dest(path.join(
                                        config.paths.build.dist,
                                        config.paths.build.styles
                   )));
  output.on('error', console.error.bind(console));
  return output;
});

gulp.task('assets:copy', ['clean', 'aggregate-vendor-deps'], function () {
    return gulp.src(config.aggregated.assets)
               .pipe(gulp.dest(path.join(
                    config.paths.build.tmp,
                    config.paths.build.assets
                )));
});

gulp.task('assets:copy-dist', ['clean', 'aggregate-vendor-deps'], function () {
    return gulp.src(config.aggregated.assets)
               .pipe(gulp.dest(path.join(
                    config.paths.build.tmp,
                    config.paths.build.assets
                )));
});