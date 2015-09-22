'use strict';

describe('rs.core.testapp.AppCtrl', function(){
  var scope;

  beforeEach(module('rs.core.testapp'));

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should always leave a note', inject(function($controller) {
    expect(scope.awesomeThings).toBeUndefined();

    $controller('rs.core.testapp.AppCtrl', {
      $scope: scope
    });

    expect(scope.note.length > 0).toBeTruthy();
  }));

  it('should have the same name as the yeoman injected module', inject(function($controller) {
    $controller('rs.core.testapp.AppCtrl', {
      $scope: scope
    });

    console.log($controller.constructor.name);

    expect($controller.constructor.name).toEqual('AppCtrl');
  }));
});

