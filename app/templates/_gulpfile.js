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
var opn = require('opn');
var path = require('path');
var pkg = require('./package.json');
var semver = require('semver');
var streamqueue = require('streamqueue');
var url = require('url');
var vendorConfig = require('./vendor_config.js');

var config = {
    banner: '/*\n' +
            ' *                    *** ### ### ***\n' +
            ' *                *##                 ##*\n' +
            ' *            *##                         ##*\n' +
            ' *         *##                   #######     ##*\n' +
            ' *       *##                   /       ###     ##*\n' +
            ' *     *##                    /         ##       ##*\n' +
            ' *    *##      ***  ****      ##        #         ##*\n' +
            ' *   *##        **** ****      ###                 ##*\n' +
            ' *  *##          **   ****    ## ###                ##*\n' +
            ' *  *##          **            ### ###              ##*\n' +
            ' *  *##          **              ### ###            ##*     Copyright (c) rewardStyle\n' +
            ' *  *##          **                ### /##          ##*\n' +
            ' *  *##          **                  #/ /##         ##*\n' +
            ' *   *##         **                   #/ ##        ##*\n' +
            ' *    *##        ***                   # /        ##*\n' +
            ' *     *##        ***        /##        /        ##*\n' +
            ' *       *##                /  ########/       ##*\n' +
            ' *         *#                    #####       ##*\n' +
            ' *            *##                         ##*\n' +
            ' *                *##                 ##*\n' +
            ' *                    *** ### ### ***\n' +
            ' */\n\n',
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
            templates: ['src/app/**/*.tpl.html'],
            testScripts: ['src/**/*.module.js',
                          'src/**/*.js',
                          '!src/**/container.js',
                          '!src/assets/**/*.js'],
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
                      //'!' + bower.directory + '/rs-*/**/*.states.js',
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
            assets: _.uniq(_.flattenDeep([
                config.dependencies.assets,
                _.map(vendorConfig.assets, function (asset) {
                                            return bower.directory + '/**/' + asset;
                }),
                config.paths.app.assets,
                config.paths.rscomponents.assets
            ])),
            styles: _.uniq(_.flattenDeep([
                config.dependencies.styles,
                _.map(vendorConfig.styles, function (style) {
                                            return bower.directory + '/**/' + style;
                }),
                config.paths.rscomponents.styles,
                config.paths.app.styles
            ])),
            scripts: _.uniq(_.flattenDeep([
                config.dependencies.scripts,
                _.map(vendorConfig.scripts, function (script) {
                                            return bower.directory + '/**/' + script;
                }),
                config.paths.rscomponents.scripts,
                config.paths.app.scripts
            ])),
            testScripts: _.uniq(_.flattenDeep([
                config.dependencies.scripts,
                _.map(vendorConfig.scripts, function (script) {
                                            return bower.directory + '/**/' + script;
                }),
                bower.directory + '/angular-mocks/angular-mocks.js',
                config.paths.app.testScripts
            ])),
        };

    });
});

gulp.task('html2js', ['clean', 'aggregate-vendor-deps'], function () {

  gulp.src(_.flatten([config.paths.app.templates,
                      config.paths.placeholder.template]))
      .pipe($.ngHtml2js({moduleName: 'templates-app'}))
      .pipe($.concat('templates-app.js'))
      .pipe(gulp.dest(path.join(
        config.paths.build.tmp,
        config.paths.build.scripts
      )));

  gulp.src(_.flatten([config.paths.rscomponents.templates,
                      config.paths.placeholder.template]))
      .pipe($.ngHtml2js({
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
  stream.queue(gulp.src(config.paths.container.scripts)
                   .pipe($.template({containerConfig: JSON.stringify(containerConfig)})));

  return stream.done()
               .pipe($.concat(pkg.name + '.' + pkg.version + '.js'))
               .pipe($.insert.prepend(config.banner))
               .pipe(gulp.dest(path.join(
                 config.paths.build.tmp,
                 config.paths.build.scripts
               )));
});

gulp.task('scripts:dist', ['scripts', 'html2js'], function () {
  var srcPath = path.join(config.paths.build.tmp, config.paths.build.scripts);
  var output = gulp.src([
                        path.join(srcPath, pkg.name + '.' + pkg.version + '.js'),
                        path.join(srcPath, 'templates-app.js'),
                        path.join(srcPath, 'templates-components.js')
                    ])
                   .pipe($.concat(pkg.name + '.' + pkg.version + '.js'))
                   .pipe($.uglify())
                   .pipe($.insert.prepend(config.banner))
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
                 .pipe($.concat( pkg.name + '.' + pkg.version + '.css'))
                 .pipe($.insert.prepend(config.banner))
                 .pipe($.autoprefixer('last 1 version'))
                 .pipe(gulp.dest(path.join(
                    config.paths.build.tmp, config.paths.build.styles
                 )));

});

gulp.task('styles:dist', ['styles'], function () {
  var output = gulp.src(path.join(
                            config.paths.build.tmp,
                            config.paths.build.styles, '*.css'
                        ))
                   .pipe($.minifyCss({keepSpecialComments: 0,
                                      compatibility: 'ie8'}))
                   .pipe($.insert.prepend(config.banner))
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
                    config.paths.build.dist,
                    config.paths.build.assets
                )));
});

var templateIndex = function (cwd) {
    var jsRoute = "scripts/*.js";
    var cssRoute = "styles/*.css";
    var includeJs = [];
    var includeCss = [];

    var jsPaths = glob.sync(jsRoute, {cwd: cwd, mark: true});
    _.each(jsPaths, function (item) { includeJs.push('/' + item); });

    var cssPaths = glob.sync(cssRoute, {cwd: cwd, mark: true});
    _.each(cssPaths, function (item) { includeCss.push('/' + item); });

    return {
        author: pkg.author,
        date: new Date().getFullYear(),
        scripts: _.flatten(includeJs),
        styles: _.flatten(includeCss),
        version: pkg.version
    };
};

gulp.task('index', ['html2js', 'scripts', 'styles'], function () {
    var output = gulp.src('./src/app/index.html')
                     .pipe($.template(templateIndex(config.paths.build.tmp)))
                     .pipe(gulp.dest(config.paths.build.tmp))
                     .pipe($.connect.reload());

    output.on('error', console.error.bind(console));
    return output;
});

gulp.task('index:dist', ['html2js', 'scripts:dist', 'styles:dist'], function () {
    var output = gulp.src('./src/app/dist.html')
                     .pipe($.rename('index.html'))
                     .pipe($.template(templateIndex(config.paths.build.dist)))
                     .pipe(gulp.dest(config.paths.build.dist));

    output.on('error', console.error.bind(console));
    return output;
});

gulp.task('build', ['assets:copy', 'index']);

gulp.task('build:dist', ['assets:copy-dist', 'index:dist']);

var initConnect = function (cwd) {
    $.connect.server({
        root: cwd,
        port: 9000,
        livereload: true,
        middleware: function (connect, options) {
            return [
                connectModRewrite([
                    '!\\.?(js|css|html|eot|svg|ttf|woff|otf|css|png|jpg|git|ico) / [L]'
                ]),
            ];
        }
    });
};

gulp.task('connect', ['build'], function () {
    initConnect(config.paths.build.tmp);
});

gulp.task('connect:dist', ['build:dist'], function () {
    initConnect(config.paths.build.dist);
});

gulp.task('serve', ['connect'], function () {
    opn('http://localhost:9000');
});

gulp.task('serve:dist', ['connect:dist'], function () {
    opn('http://localhost:9000');
});

gulp.task('watch', ['serve'], function () {
    $.watch(['src/**/*.js', 'src/**/*.less', 'src/**/*.html'],
            {debounceDelay: 2000},
            function () {
                gulp.start('build');
            });
});

gulp.task('test', ['aggregate-vendor-deps'], function () {
  return gulp.src(config.aggregated.testScripts)
             .pipe($.filelog())
             .pipe($.karma({
                configFile: 'karma.conf.js',
                action: 'run'
             }))
             .on('error', function (err) {
                throw err;
             });
});

gulp.task('bump', function () {
    if (!argv.type) {
        console.log('ERROR: No semver type specified. Use `gulp bump --type ' +
                    '<patch | minor | major>');
        return;
    }

    if (_.indexOf(['patch', 'minor', 'major'], argv.type) < 0) {
        console.log('ERROR: Invalid semver type. Use `gulp bump --type ' +
                    '<patch | minor | major>');
        return;
    }

    var importance = argv.type;

    var newVer = semver.inc(pkg.version, importance);

    return gulp.src(['./package.json', './bower.json'])
               .pipe($.bump({version: newVer}))
               .pipe(gulp.dest('./'))
               .pipe($.git.commit('bump package version to ' + newVer))
               .pipe($.git.tag(newVer, 'bump package version to ' + newVer,
                               function (err) {}));
});