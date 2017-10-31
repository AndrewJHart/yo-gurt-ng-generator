/**
 * <% if (true) {} %>{{= hypModuleName }} Controller
 */
angular.module('{{= dotModuleName }}')

.controller('{{= dotModuleName }}.AppCtrl', [
    '$rootScope',
    '$scope',
    function AppCtrl ($rootScope, $scope) {
        "use strict";

        console.log(':: init {{= dotModuleName }}.AppCtrl');
        $scope.note = 'this template will be included and accessible from other' +
            ' projects this module is included with';
    }
])

;
