var app = angular.module('base.ng.proj.container', [
    'base.ng.proj',
    'ui.router',
    'templates-app',
    'templates-components'
])

.config(['$stateProvider',
        '$locationProvider',
        function ($stateProvider,
                  $locationProvider) {

    $locationProvider.html5Mode(true);

    $stateProvider
        .state('parent', { url: "/", templateUrl: 'root.tpl.html' });
}])

.controller('base.ng.proj.container.AppCtrl', ['$scope',
                                               '$rootScope',
                                               '$state',
                                               function AppCtrl ($scope,
                                                                 $rootScope,
                                                                 $state) {

    console.log(':: initialized container');
    console.log($state.get());
    $scope.title = 'base.ng.proj';

}])

;