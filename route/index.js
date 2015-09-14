'use strict';
var path = require('path'),
    chalk = require('chalk'),
    util = require('util'),
    ScaffoldGenerator = require('../scaffold.js'),
    angularUtils = require('../util.js'),
    bower = require(path.join(process.cwd(), 'src/bower.json'));

/**
 * Subclass of ScaffoldGenerator for creating routes
 */
var DirectiveGenerator = module.exports = ScaffoldGenerator.extend({
  constructor: function() {
    ScaffoldGenerator.apply(this, arguments);

    this.option('uri', {
        desc: 'Allow a custom uri for routing',
        type: String,
        required: false
    });

    var match = require('fs').readFileSync(path.join(
        this.env.options.appPath,'app/container.js'), 'utf-8').match(/\.when/
    );

    if (
      bower.dependencies['angular-route'] ||
      bower.devDependencies['angular-route'] ||
      match !== null
    ) {
      this.foundWhenForRoute = true;
    }

    // hookFor is deprecated for composeWith - todo
    this.hookFor('rs-angular:controller');
    this.hookFor('rs-angular:view');
  },

  rewriteAppJs: function () {
        if (!this.foundWhenForRoute) {
            this.on('end', function () {
              this.log(chalk.yellow(
                '\nangular-route is not installed. Skipping adding the route to ' +
                'src/app/container.js'
              ));
            });

            return;
        }

        this.uri = this.name;  // grab the uri from name & set it on options hash
        if (this.options.uri) {
            this.uri = this.options.uri;
        }

        var config = {
            file: path.join(
              this.env.options.appPath,
              'app/container.js'
            ),
            needle: '.otherwise',
            splicable: [
              "  templateUrl: 'views/" + this.name.toLowerCase() + ".html',",
              "  controller: '" + this.classedName + "Ctrl',",
              "  controllerAs: '" + this.cameledName + "'"
            ]
        };

        config.splicable.unshift(".when('/" + this.uri + "', {");
        config.splicable.push("})");

        angularUtils.rewriteFile(config);
    }
});
