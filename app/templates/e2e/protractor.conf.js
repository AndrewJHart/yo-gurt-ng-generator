/**
 * The protractor config object & defaults.
 * Specify additional browsers, capabilities,
 * or locations of other scripts to be tested.
 *
 * @type {Object}
 * @author Andrew Hart
 */
exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        'scenarios.js',
        'e2e/*.js'
    ],

    // if testing locally & would like to see protractor
    // in action, change browserName to 'chrome'
    capabilities: {
        browserName: 'phantomjs'
    },

    baseUrl: 'http://127.0.0.1:9000/',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};
