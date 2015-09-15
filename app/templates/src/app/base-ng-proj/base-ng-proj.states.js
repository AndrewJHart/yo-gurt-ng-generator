angular.module('base.ng.proj')

.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('base-ng-proj', {
            url: "/base-ng-proj",
            templateUrl: 'base-ng-proj/base-ng-proj.tpl.html',
            controller: 'base.ng.proj.AppCtrl'
        });
}])

;