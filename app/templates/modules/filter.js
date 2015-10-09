'use strict';

/**
 * @ngdoc filter
 * @name <%= scriptAppName %>.filter:<%= cameledName %>
 * @function
 * @description
 * # <%= cameledName %>
 * Filter in the <%= scriptAppName %>.
 */
angular.module('<%= scriptAppName %>')
    .filter('<%= cameledName %>', function () {
        var _yield = function (input) {
            return '<%= cameledName %> filter: ' + input;
        };

        return _yield;
    });
