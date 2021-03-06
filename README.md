# yo-gurt angular generator
## gurt: unified tooling for frontend projects

> `gurt` is a framework for frontend projects, containing modern web development tools such as `AngularJS`, `Gulp`, `Connect`,  `Karma`, and `Protractor`. Helping you to stay productive following the best practices, `gurt` produces a complete, testable component out of the box readily able to be imported into other projects built with `gurt`.

## Philosophy

> `gurt` is designed with the main objective of encouraging code reuse, creating defined separations of concerns, and minimizing the scope of services / projects that need to be initialized to work on a feature. Most `gurt` projects should be capable of being developed and tested in isolation, and should be easily integrated into multiple applications / environments.

### Containers

Containers are top level wrappers for your application, found in `/src/app/`. Nothing within the container context will be redistributed. (i.e. stuff in `/app/` other than `/{namespace}-{generated name}/`) As mentioned above, `gurt` projects are designed to be run locally where possible. Containers are typically used in one of two ways:

  * When the current project is designed to be included elsewhere, the container serves as a testbed for the module. It's a good way to play with the redistributable code and show other developers how to interact with it.
  * When the current project is a top level app, in other words you'll be deploying the compiled `gulp:dist` output, the final payload deployed will include the container. In this case, it's best to use the container for wrapper style stuff -- just relegate top level DOM and stuff like navigation logic to the container in this case.

## Generated Project Directory Layout

```
.
├── /.tmp/                                  # The folder for temporary dev output (build / watch mode).
├── /bower_components/                      # bower managed local + 3rd-party libraries and utilities.
├── /dist/                                  # The folder for compiled output.
├── /e2e/                                   # Contains all files related to End-to-end testing.
│   ├── mock-data.json                      # Mock server response JSON.
│   ├── mock-server.js                      # Connect mock server middleware.
│   ├── protractor.conf.js                  # Protractor configuration file.
│   └── scenarios.js                        # Protractor test scenarios.
├── /node_modules/                          # npm managed 3rd-party libraries and utilities.
├── /src/                                   # The source code of the application.
│   ├── /app/                               # Files in the root of this directory fall within the container context.
│   │   ├── /{generated name}/              # All redistributable code should live here.
│   │   │   │                               #
│   │   │   ├── {generated name}.module.js  # The entry point for your generated module, the only file truly necessary.
│   │   │   │                               # Inject dependencies here. This file is a good place for service / factory
│   │   │   │                               # config blocks if you don't feel like making separate files for them.
│   │   │   │                               #
│   │   │   ├── {generated name}.spec.js    # Unit tests for your module.
│   │   │   │                               #
│   │   │   │                               # -v- delete the following in this dir if you're not using them! -v-
│   │   │   │                               #
│   │   │   ├── main.less                   # Styles for views distributed by this module. Prune if not needed.
│   │   │   ├── {generated name}.ctrl.js    # A default controller generated for convenience. Prune if not needed.
│   │   │   ├── {generated name}.tpl.html   # A default template generated for convenience. Prune if not needed.
│   │   │   │                               #
│   │   │   └── {generated name}.states.js  # If you're distributing views and want to include sensible default routes
│   │   │                                   # for them, define them here. Note that projects can disable these routes
│   │   │                                   # by uncommenting a line in their gulpfile. Prune if not needed.
│   │   │                                   #
│   │   ├── /container.js                   # ng modules existing within the container context. See below for more info.
│   │   ├── /container.less                 # Styles defined here will not be included when this project is imported.
│   │   └── /root.tpl.html                  # Container context: root template. Shown initially by default.
│   │   ├── /index.html                     # Templated when build tasks are run.
│   │   └── /dist.html                      # Templated when build:dist tasks are run.
│   └── /blank.tpl.html                     # Exists so the html2js task doesn't break if no other templates exist.
│── .bowerrc                                # Bower configuration, points bower at our private registry.
│── config.json                             # Constants described here will be templated into containerConfig on build.
│                                           #
│── vendor_config.js                        # Define 3rd party scripts, styles, and assets to be included in the payload
│                                           # using node glob pattern. Files in bower_components are matched against the
│                                           # patterns defined here.
│                                           #
│── karma.conf.js                           # Karma test runner configuration.
│── bower.json                              # The list of rS + 3rd party libraries and utilities distributed by bower.
│── package.json                            # The list of 3rd party libraries and utilities distributed by npm.
└── gulpfile.js                             # Gulp build scripts.
```

## Installing generator-gurt

To get started first install `yeoman` globally:

`npm install -g yo`

Then get `gurt` by cloning this repo:

`git clone git@github.com:AndrewJHart/yo-gurt-ng-generator.git`

`cd` into the `generator-gurt` directory and install dependencies:

`npm install`

Then we need to link it so we can run it as a global package:

`npm link`

## Getting Started

Go to where you keep your projects and make a new directory:

`mkdir rs-<prefix>-<name> && cd $_` (see [module classifications](#module-classifications) for prefix info)

Run `yo gurt` and respond to the prompts:

  * `What kind of module is this?` (see [module classifications](#module-classifications) below)
  * `What would you like to name this module?`
  * Confirm the generated name

Yeoman will then proceed to scaffold your project and automatically run `npm install & bower install`.

Run `gulp watch` to see your newly generated project.

## Gulp Commands

* `gulp clean` --  Nukes the `/.tmp/` and `/dist/` directories' contents.
* `gulp build` -- Compiles the payload used for temporary dev work.
* `gulp serve` -- Serves compiled payload used for temporary dev work.
* `gulp watch` -- Runs `gulp build` and `gulp serve`, rebuilds and reloads server when changes are detected.
* `gulp test` -- Runs `Karma` and `Protractor`. (see End-to-end Testing below before running)
* `gulp test:unit` -- Runs `Karma` unit tests.
* `gulp test:e2e` -- Runs `Protractor` E2E tests. (see End-to-end Testing below before running)
* `gulp serve:mock` -- Runs the mock server. Not needed for E2E test tasks they invoke the mock server automatically. Good for adding mock endpoints via HTTP requests.
* `gulp build:dist` -- Compiles the payload used for deployment.
* `gulp serve:dist` -- Serves the payload used for deployment.
* `gulp bump --sv <patch | minor | major>` -- Bumps version in `package.json` and `bower.json`, makes a `git` commit and tags that commit with the new version.

## Module Classifications

#### Core (`rs-core-*`)

These modules are crucial to an application's functionality and are required to run. If we ever had an `angular` app that used module lazyloading, `core` modules would need to reside in the initial payload.

Examples: authentication, authorization, permissions based directives, token injection, etc.

#### Utility (`rs-util-*`)

Small, reusable rS specific widgets -- datepickers, filters, etc.

#### Collection (`rs-coll-*`)

Collection modules abstract a given API endpoint into ActiveRecord patterned model / collection objects. All collection modules should use [angular-restmod](https://github.com/platanus/angular-restmod) and primarily establish a `factory` provider which returns a `restmod.model` object. This allows us to gracefully adapt and keep applications up to date if an API resource needs to change.

#### App (`rs-app-*`)

App modules are typically top level, they typically aggregate the aforementioned modules along with views and app specific logic.

#### Custom (`rs-*`)

If for some reason your module doesn't fit into any of the above buckets, you can select `custom` and name your module whatever you need to.

### `config.json` / containerConfig

`config.json` is used to declare environment specific constants. Any references to API / other routes should be defined here. Values described in `config.json` will be templated into the `containerConfig` provider on build.


## End-to-end Testing

### Setup

For End-to-end (E2E) testing, we're using `Protractor`.

> Protractor is a Node.js program, and runs end-to-end tests that are also written in JavaScript and run with node. Protractor uses WebDriver to control browsers and simulate user actions.

Before running a task that utilizes `Protractor`, you'll need to update WebDriver's browser dependencies -- from your project's root, run the following:

```
node_modules/protractor/bin/webdriver-manager update
```

### Mock API

The mock server is run during `Protractor` E2E tests.

You may add mock endpoints by making edits to `mock-server.js` and `mock-data.json`, or with the mock server running, register them with an HTTP request:

```
curl -X POST \
    -H "mock-method: GET" \
    -H "mock-response: 200" \
    -H "Content-type: application/json" \
    -H "mock-header-Last-Modified: Mon, 16 Nov 2015 11:45:00 GMT" \
    -d '{"username": "someUser"}' http://localhost:5000/mock/api/user
```

#### Mock API HTTP Commands

```
+----------+-------------------------+-------------------------+---------------------------------------------+
| Req Type |          Route          |          Body           |                 Description                 |
+----------+-------------------------+-------------------------+---------------------------------------------+
| POST     | /mock/{your route here} | {desired JSON response} | Creates a new mock endpoint w/ response     |
| GET      | /reset                  |                         | Wipes all stored mock endpoints / responses |
+----------+-------------------------+-------------------------+---------------------------------------------+
```

**Note:** To interact with the mock API normally, don't include `/mock/` in the route.

## FAQ

### When should I generate a new project / repo?

If your feature is generic enough that it's usable outside of the context of the story / application you're authoring it for, go hog wild and scaffold a new project. Otherwise, it's best to keep the code within it's parent project structure.

### What should I name my Github repo?

For convention's sake, please name Github repos the same as the generated `name` in `package.json`. (`<namespace>-<type>-<name>`)

### Why separate `index.html` and `dist.html` files?

This is done to make local development easier for cases where the production DOM for an application may need to be different than what's used locally.

As an example, perhaps you were working on an app that's designed to be embedded inside a page. For local development, you could replicate that page's DOM statically in `index.html` so that you don't need to fire up `Apache` / `NGINX` / `Django` / etc. to see how your application would look inside of that page. Because the final product would just be the relevant tags to be embedded in the page, you'd strip down `dist.html` to only be what's necessary for production.
