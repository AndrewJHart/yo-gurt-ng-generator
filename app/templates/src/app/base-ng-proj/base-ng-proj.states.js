/**
 * <% if (true) {} %>{{= hypModuleName }} States
 */
angular.module('{{= dotModuleName }}')

.config(['$stateProvider', function ($stateProvider) {
    "use strict";

    $stateProvider
        .state('{{= hypModuleName }}', {
            url: "/{{= hypModuleName }}/",
            templateUrl: '{{= hypModuleName }}/{{= hypModuleName }}.tpl.html',
            controller: '{{= dotModuleName }}.AppCtrl'
        });
}])

;
