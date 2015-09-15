angular.module('<%= dotModuleName %>')

.controller('<%= dotModuleName %>.AppCtrl', ['$rootScope',
                                     '$scope',
                                     function AppCtrl ($rootScope, $scope) {
    console.log('init <%= dotModuleName %>.AppCtrl');
    $scope.note = '<%= hypModuleName %> AppCtrl module';
    $scope.title = '<%= hypModuleName %>';
}])

;