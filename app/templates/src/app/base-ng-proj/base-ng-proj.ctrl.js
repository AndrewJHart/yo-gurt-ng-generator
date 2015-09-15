angular.module('base.ng.proj')

.controller('base.ng.proj.AppCtrl', ['$rootScope',
                                     '$scope',
                                     function AppCtrl ($rootScope, $scope) {

    $scope.note = 'this template will be included and accessible from other' +
                  ' projects this module is included with';
}])

;