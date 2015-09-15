var app = angular.module('<%= dotModuleName %>.container', [
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

.controller('<%= dotModuleName %>.container.AppCtrl', ['$scope',
                                               '$rootScope',
                                               function AppCtrl ($scope,
                                                                 $rootScope) {

    $scope.title = '<%= dotModuleName %>';

}])

;