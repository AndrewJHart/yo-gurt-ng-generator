'use strict';

describe('{{= dotModuleName }}.AppCtrl', function(){
  var scope;

  beforeEach(module('{{= dotModuleName }}'));

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should always leave a note', inject(function($controller) {
    expect(scope.awesomeThings).toBeUndefined();

    $controller('{{= dotModuleName }}.AppCtrl', {
      $scope: scope
    });

    expect(scope.note.length > 0).toBeTruthy();
  }));
});<% if (true) {} %>

