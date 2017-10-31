'use strict';

describe('Service: <%= cameledName %>', function () {

    // instantiate provider <%= cameledName %>
    var provider,
        init = function () {
            inject(function (_provider_) {
                provider = _provider_;
            });
        };

    // load the provider's module
    beforeEach(module('<%= scriptAppName %>'));

    it('should do something', function () {
        init();

        expect(!!provider).toBe(true);
    });

    it('should be configurable', function () {
        module(function ($provider) {
            $provider.setSalutation('Lorem ipsum');
        });

        init();

        expect(provider.greet()).toEqual('Lorem ipsum');
    });

});
