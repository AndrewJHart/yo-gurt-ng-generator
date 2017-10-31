'use strict';

describe('Service: <%= cameledName %>', function () {

    // load the service's module
    beforeEach(module('<%= scriptAppName %>'));

    // instantiate service <%= cameledName %>
    var service;

    beforeEach(inject(function (_service_) {
        service = _service_;
    }));

    it('should do something', function () {
        expect(!!service).toBe(true);
    });

});
