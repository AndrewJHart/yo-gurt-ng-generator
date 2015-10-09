'use strict';

var path = require('path'),
    yeoman = require('yeoman-generator');

module.exports = yeoman.generators.NamedBase.extend({
    _sourceViewPath: '../app/templates/modules/',
    _targetViewPath: 'app/views',

    constructor: function () {
        yeoman.generators.NamedBase.apply(this, arguments);

        this.sourceRoot(path.join(__dirname, this._sourceViewPath));

        if (typeof this.env.options.appPath === 'undefined') {
            this.env.options.appPath = this.options.appPath;

            if (!this.env.options.appPath) {
                try {
                    this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
                } catch (e) { /* noop */ }
            }

            this.env.options.appPath = this.env.options.appPath || 'app';
            this.options.appPath = this.env.options.appPath;
        }
    },

    createViewFiles: function () {
        this.template(
            'views/view.html',
            path.join(
                this.env.options.appPath,
                this._targetViewPath,
                this.name.toLowerCase() + '.html'
            )
        );
    }
});
