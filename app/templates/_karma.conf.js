'use strict';

module.exports = function (config) {

    var configuration = {
        autoWatch: false,
        browsers: ['PhantomJS'],

        frameworks: ['jasmine'],

        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-coverage'
        ],

        preprocessors: {
            'src/**/*.js': 'coverage'
        },

        reporters: ['dots', 'coverage'],

        coverageReporter: {
            type: 'text'
        }
    };

    config.set(configuration);
};
