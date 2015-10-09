/**
 * <% if (true) {} %>Module {{= hypModuleName }} Tests
 */
'use strict';

describe('{{= dotModuleName }}.AppCtrl', function () {
    var scope;

    beforeEach(module('{{= dotModuleName }}'));

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
    }));

    it('should always leave a note', inject(function ($controller) {
        expect(scope.awesomeThings).toBeUndefined();

        $controller('{{= dotModuleName }}.AppCtrl', {
            $scope: scope
        });

        expect(scope.note.length > 0).toBeTruthy();
    }));

    it('should have the same name as the yeoman injected module', inject(function ($controller) {
        var controller = $controller('{{= dotModuleName }}.AppCtrl', {
            $scope: scope
        });

        console.log(controller.constructor.name);

        expect(controller.constructor.name).toEqual('AppCtrl');
    }));
});
