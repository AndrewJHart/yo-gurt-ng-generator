'use strict';

describe('Controller: <%= classedName %>Ctrl', function () {

    // load the controller's module
    beforeEach(module('<%= scriptAppName %>'));

    // Instantiate controller <%= classedName %>
    var Ctrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        Ctrl = $controller('Ctrl', {
            $scope: scope
            // place here mocked dependencies
        });
    }));

    it('should attach a list of awesomeThings to the scope', function () {
        expect(Ctrl.awesomeThings.length).toBe(3);
    });
});
