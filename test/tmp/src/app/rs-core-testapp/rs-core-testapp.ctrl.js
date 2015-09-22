angular.module('rs.core.testapp')

.controller('rs.core.testapp.AppCtrl', ['$rootScope',
                                     '$scope',
                                     function AppCtrl ($rootScope, $scope) {

    console.log(':: init rs.core.testapp.AppCtrl');
    $scope.note = 'this template will be included and accessible from other' +
                  ' projects this module is included with';
}])

;