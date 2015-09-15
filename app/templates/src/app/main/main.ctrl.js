angular.module('<%= dotModuleName %>')

.controller('<%= dotModuleName %>.AppCtrl', ['$rootScope',
                                     '$scope',
                                     function AppCtrl ($rootScope, $scope) {
    console.log('init <%= dotModuleName %>.AppCtrl');
    $scope.note = '<%= dotModuleName %> AppCtrl module';
    $scope.title = '<%= dotModuleName %>';
}])

;