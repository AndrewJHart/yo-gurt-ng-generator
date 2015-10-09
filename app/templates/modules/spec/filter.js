'use strict';

describe('Filter: <%= cameledName %>', function () {

    // load the filter's module
    beforeEach(module('<%= scriptAppName %>'));

    // initialize a new instance of the filter before each test
    // <%= cameledName %>
    var component;

    beforeEach(inject(function ($filter) {
        component = $filter('<%= cameledName %>');
    }));

    it('should return the input prefixed with "<%= cameledName %> filter:"', function () {
        var text = 'angularjs';

        expect(component(text)).toBe('<%= cameledName %> filter: ' + text);
    });

});
