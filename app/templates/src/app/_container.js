var app = angular.module('base.ng.proj.container', [
    'ui.router',
    'templates-app',
    'templates-components'
])

.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('index', {
        url: "",
        views: {
            "viewC": { template: "index.viewC" }
        }
    });
}])

.controller('base.ng.proj.container.AppCtrl', ['$scope',
                                               '$rootScope',
                                               function AppCtrl ($scope,
                                                                 $rootScope) {

    $scope.title = 'base.ng.proj';

}])

;