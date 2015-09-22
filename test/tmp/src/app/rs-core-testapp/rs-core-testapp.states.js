angular.module('rs.core.testapp')

.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('rs-core-testapp', {
            url: "/rs-core-testapp/",
            templateUrl: 'rs-core-testapp/rs-core-testapp.tpl.html',
            controller: 'rs.core.testapp.AppCtrl'
        });
}])

;