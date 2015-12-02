'use strict';
/**
 * Mock request/response data for client applications
 *
 * Originally written for use with protractor in returning
 * mock responses due to problems with ng-mock-e2e & intercepting
 * requests.
 *
 * This also has some additional functionality for building
 * dynamic / temporary reponses by configuring the mock server
 * by POST'ing data that you want to mock.. e.g. To mock out
 * some fresh or temporary user data when the app makes requests
 * to /api/user do something like so:
 *
 * curl -X POST \
    -H "mock-method: GET" \
    -H "mock-response: 200" \
    -H "Content-type: application/json" \
    -H "mock-header-Last-Modified: Mon, 16 Nov 2015 11:45:00 GMT" \
    -d '{"username": "someUser"}' http://localhost:5000/mock/api/user
 *
 * Then any GET requests to /api/user would look like:
 *
 * curl http://localhost:5000/api/user
 *
 * HTTP/1.1 200
 * Content-Type: application/json
 * last-modified: Mon, 16 Nov 2015 11:45:00 GMT"
 * Connection: keep-alive

 * {"username": "someUser"}
 *
 * Note that static or fixed routes will always take precedence over `mocked`
 * routes so its best to keep them unique.. e.g. if you try to mock /api/v1/ltks
 * with new data it will appear to succeed but you will always get the static
 * response since these routes must be checked first.
 *
 * @return {Function} middleware
 * @author Andrew Hart
 */

// require json data for mock reponse (this is blocking/syncronous)
var jsonData = require('./mock-data.json');

module.exports = function mockResponse () {

    // Object for storing different types of
    // responses, based on the req.method type
    // and the url / route
    var mocks = {
        GET: {},
        PUT: {},
        POST: {},
        DELETE: {}
    };

    /**
    * Checks the current request headers for the type of
    * request.method we are mocking and returns a new object
    * for storing the request data on. if it finds an existing
    * object - from mocks obj - then it returns the nested object
    * with whatever data is set depending on the given key.
    *
    * @param  {Object} req the current request object
    * @return {Object} returns the nested object matching req.method type
    */
    function getMockRequestObj (req) {
        // inspect headers for `mock-method` or default to GET
        var method = req.headers['mock-method'] || 'GET';

        // if no match default to empty object for this req.method
        if (!mocks[method]) {
            mocks[method] = {};
        }

        return mocks[method];
    }

    // defining then returning function later to make linter happy
    function mockMiddleware (req, res, next) {
        // check if request is looking for data from api
        if (req.method === 'POST' && req.url.indexOf('/mock') === 0) {
            // Checks if POST to setup a /mock api endpoint on the fly
            var path = req.url.substring('/mock'.len),
                body = '';

            // build the body from the POST request to /mock/some/endpoint/
            req.on('data', function (data) {
                body += data;
            });

            // set the headers & return a response
            req.on('end', function () {
                var headers = {
                    'Content-Type': req.headers['content-type']
                };

                for (var key in req.headers) {
                    if (req.headers.hasOwnProperty(key)) {
                        if (key.indexOf('mock-header-') === 0) {
                            headers[key.substring('mock-header-'.length)] = req.headers[key];
                        }
                    }
                }

                var mocks = getMockRequestObj(req);

                // store our response in the object w/ method map
                mocks[path] = {
                    body: body,
                    responseCode: req.headers['mock-response'] || 200,
                    headers: headers
                };

                console.log('logging format of mocks', mocks, mocks[path]);

                res.writeHead(200);
                res.end();
            });
        } else if (req.url.indexOf('/reset') === 0) {
            // if hits reset endpoint then clear out mocks object
            getMockRequestObj(req)[req.url.substring('/reset'.length)] = null;

            // write response
            res.writeHead(200);
            res.end();
        } else if (req.url.indexOf('/api/v1/ltks') === 0) {  // handles many or single ltk api requests
            // log it
            console.log('Mocking response for ' + req.url);

            // set correct header & response type
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);

            // write json response out
            res.end(JSON.stringify(jsonData));
        } else {
            var mockedResponse = mocks[req.method][req.url];

            // if an object w/ a url mapped to this request method exists return it
            if (mockedResponse) {
                res.writeHead(mockedResponse.responseCode, mockedResponse.headers);
                res.write(mockedResponse.body);
                res.end();
            } else {
                // else call next middleware
                next();
            }
        }
    }

    return mockMiddleware;
};
