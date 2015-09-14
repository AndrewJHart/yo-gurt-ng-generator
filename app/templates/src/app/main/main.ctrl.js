angular.module('base.ng.proj')

.controller('base.ng.proj.AppCtrl', ['$rootScope',
                                     '$scope',
                                     function AppCtrl ($rootScope, $scope) {
    console.log('init base.ng.proj.AppCtrl');
    $scope.note = 'base.ng.proj AppCtrl module';
    $scope.title = 'base.ng.proj';
}])

;