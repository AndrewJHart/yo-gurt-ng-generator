'use strict';

/**
 * @name Module <%= hypModuleName %> <%= cameledName %>
 */
angular.module('<%= dotModuleName %>')
    .directive('<%= cameledName %>', function () {
        return {
            template: '<div></div>',
            restrict: 'E',
            link: function postLink (scope, element /*, attrs */) {
                element.text('this is the <%= cameledName %> directive');
            }
        };
    });
