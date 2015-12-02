'use strict';

/**
 * e2e tests using protractor. Describes the initial front-end state
 * of the angular application at specific points in time at specific
 * states of the application.
 *
 * More info can be found in the docs:
 * https://github.com/angular/protractor/blob/master/docs/toc.md
 *
 * Using locators and performing actions:
 * http://angular.github.io/protractor/#/locators
 *
 * @requires mock-server.js -- run `gulp test:e2e` to start mock req/resp server
 * @author Andrew Hart
 */

describe('The generated angular application', function () {

    it('should automatically redirect to #/ when location hash fragment is empty', function () {
        browser.get('/');

        expect(browser.getLocationAbsUrl()).toMatch("/");
    });
});
