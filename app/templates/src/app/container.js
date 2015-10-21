'use strict';

var app;

app = angular.module('{{= dotModuleName }}.container', [
    '{{= dotModuleName }}',
    'ui.router',
    'templates-app',
    'templates-components'
])

.config([
    '$stateProvider',
    '$locationProvider',
    function ($stateProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $stateProvider.state('parent', {
            url: "/",
            templateUrl: 'root.tpl.html'
        });
    }
])

.factory('lodash', ['$window', function ($window) {
    return $window._;
}])

.factory('containerConfig', function () {
    return JSON.parse('<%= containerConfig %>');
})

.controller('{{= dotModuleName }}.container.AppCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    'lodash',
    function AppCtrl ($scope /*, $rootScope, $state, _*/) {
        console.log(':: init {{= dotModuleName }}.container.AppCtrl');
        $scope.title = '{{= dotModuleName }}';
    }
])

;
