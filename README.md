# generator-rs-angular

> [Yeoman](http://yeoman.io) generator


## Getting Started

### What is Mason?

Trick question. It's not a thing. It's this guy:

![](http://i.imgur.com/JHaAlBJ.png)

Basically, yeoman wears a top hat, lives in your computer, and waits for you to tell him what kind of application you wish to create. Yeoman and Mason are good friends and they work together to build out
your application.


### Installation

To get started first install Yeoman:

```bash
npm install -g yo
```

Then get Mason by cloning this repo:

```bash
git clone git@github.com:AndrewJHart/generator-rs-angular.git
```

cd into the directory and install dependencies:

```bash
npm install
```

then we need to link it so we can run it as a global package:

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
