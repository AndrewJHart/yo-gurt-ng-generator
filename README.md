# generator-rs-angular

> [Yeoman](http://yeoman.io) generator


## Getting Started

### What is Yeoman?

Trick question. It's not a thing. It's this guy:

![](http://i.imgur.com/JHaAlBJ.png)

Basically, he wears a top hat, lives in your computer, and waits for you to tell him what kind of application you wish to create.

Not every new computer comes with a Yeoman pre-installed. He lives in the [npm](https://npmjs.org) package repository. You only have to ask for him once, then he packs up and moves into your hard drive. *Make sure you clean up, he likes new and shiny things.*

```bash
npm install -g yo
```

### Yeoman Generators

Yeoman travels light. He didn't pack any generators when he moved in. You can think of a generator like a plug-in. You get to choose what type of application you wish to create, such as a Backbone application or even a Chrome extension.

To install generator-rs-angular clone this repo:

```bash
git clone git@github.com:AndrewJHart/generator-rs-angular.git
```

cd into the directory and install dependencies:

```bash
npm install
```

then run:

```bash
npm link
```

Go up a directory (or somewhere else) and make a new directory:

```bash
mkdir my-test-app && cd $_
```

Finally, initiate the generator and pass your app name e.g. testapp:

```bash
yo rs-angular testapp
```

### Testing

Unit tests for the generator functionality exist in the `tests` directory. I used Mocha as the testing framework. If you modify this or extend please write new tests. To run the tests `cd` into the root directory of this repo and run:

```bash
mocha
```

If you wanna spice things up a bit try running mocha with a different reporter e.g. progress bar

```bash
mocha --reporter progress
```

If you need to run individual tests or specific test files simply pass the name:

```bash
mocha tests/test-app.js
```


## License

MIT
