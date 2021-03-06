beforeAll(function () {
    "use strict";

    /**
     * Testing setup happens here.
     *
     * Usually you will put anything that needs to be shared between tests,
     * such as registering helpers with angular, or mock servers. These might
     * require cleanup after all testing has completed byusing the `afterAll`
     * helper.
     */

    angular.module('{{= dotModuleName }}')
        .factory('containerConfig', function () {
            return JSON.parse('<%= containerConfig %>');
        });
});
