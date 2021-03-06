'use strict';

describe('Directive: <%= _cameledName %>', function () {

    // load the directive's module
    beforeEach(module('<%= dotModuleName %>'));

    var element,
        scope;

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
    }));

    it('should make hidden element visible', inject(function ($compile) {
        element = angular.element('<<%= _dashedName %>></<%= _dashedName %>>');
        element = $compile(element)(scope);
        expect(element.text()).toBe('this is the <%= _cameledName %> directive');
    }));
});
