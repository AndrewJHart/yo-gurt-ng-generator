var app = angular.module('rs.core.testapp.container', [
    'rs.core.testapp',
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
        .state('parent', {
            url: "/",
            templateUrl: 'root.tpl.html' });
}])

.factory('lodash', ['$window', function ($window) {
  return $window._;
}])

.factory('containerConfig', function () {
  /* jshint ignore:start */
  return <%= containerConfig %>;
  /* jshint ignore:end */
})

.controller('rs.core.testapp.container.AppCtrl', ['$scope',
                                               '$rootScope',
                                               '$state',
                                               'lodash',
                                               function AppCtrl ($scope,
                                                                 $rootScope,
                                                                 $state,
                                                                 _) {

    console.log(':: init rs.core.testapp.container.AppCtrl');
    $scope.title = 'rs.core.testapp';

}])



;