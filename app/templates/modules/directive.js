'use strict';

/**
 * @name Module <%= hypModuleName %> <%= _cameledName %>
 */
angular.module('<%= dotModuleName %>')
    .directive('<%= _cameledName %>', function () {
        return {
            template: '<div></div>',
            restrict: 'E',
            link: function postLink (scope, element /*, attrs */) {
                element.text('this is the <%= _cameledName %> directive');
            }
        };
    });
