// {{= dotModuleName }} States
angular.module('{{= dotModuleName }}')

.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('{{= hypModuleName }}', {
            url: "/{{= hypModuleName }}",
            templateUrl: '{{= hypModuleName }}/{{= hypModuleName }}.tpl.html',
            controller: '{{= dotModuleName }}.AppCtrl'
        });
}])

;