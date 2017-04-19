# `angular-seed`

Project started using skeleton at https://github.com/angular/angular-seed

## Getting Started

To get you started you can simply clone the `angular-seed` repository and install the dependencies:

### Prerequisites

We also use a number of Node.js tools to initialize and test `angular-seed`. You must have Node.js
and its package manager (npm) installed. You can get them from [here][node].

### Clone `angular-seed`

Clone the `angular-seed` repository using git:

```
git clone --recursive https://github.com/ShobhitMaheshwari/angular-seed.git
cd angular-seed
```

Run the code locally by
```
npm start
```
Now browse to the app at [`localhost:8000/index.html`][local-app-url].




## Directory Layout

```
app/                    --> all of the source files for the application
  angular.min.js        --> old version of angular for Webworker bootstrapping
  angular-route.min.js  --> similarly old version of angular router for Webworker bootstrapping
  app.css               --> default stylesheet
  d3Basic.js            --> directive for chart
  I1.json               --> split I dataset into half so as to be able to commit to git. (This will be used by webworkers)
  I2.json               --> (This will be used by webworkers)
  J.json                --> J dataset (This will be used by webworkers)
  server.js             --> used to generate I1.json, I2.json, J.json
  threadpool.js         --> used for threadpool
  components/           --> all app specific modules
    version/              --> version related components
      version.js                 --> version module declaration and basic "version" value service
      version_test.js            --> "version" value service tests
      version-directive.js       --> custom directive that returns the current app version
      version-directive_test.js  --> version directive tests
      interpolate-filter.js      --> custom interpolation filter
      interpolate-filter_test.js --> interpolate filter tests
  view1/                --> the view1 view template and logic (Part 1 of question)
    view1.html            --> the partial template
    view1.js              --> the controller logic
    view1_test.js         --> tests of the controller
	view1.css
	worker.js             --> processing thread scripts
	worker-app.js         --> processing thread scripts
  view2/                --> the view2 view template and logic (Part 2 of question)
    view2.html            --> the partial template
    view2.js              --> the controller logic
    view2_test.js         --> tests of the controller
	view2.css
	worker.js             --> processing thread scripts
	worker-app.js         --> processing thread scripts

  bower_components/d3-tip        --> [d3-tip][https://github.com/VACLab/d3-tip/tree/e6dda5edf4c7c2d946f786082e9d25c24c2561c0]
  app.js                --> main application module
  service.js            --> all services for application
  test.js               --> test for service.js services
  chart.js              --> tried to make reusable chart but version4 of d3 does not have good support. This would require some time to get up and going
  index.html            --> app layout file (the main html template file of the app)
  index-async.html      --> just like index.html, but loads js files asynchronously
karma.conf.js         --> config file for running unit tests with Karma
e2e-tests/            --> end-to-end tests
  protractor-conf.js    --> Protractor config file
  scenarios.js          --> end-to-end scenarios to be run by Protractor
```


## Testing

### Running Unit Tests

The `angular-seed` app comes preconfigured with unit tests. These are written in [Jasmine][jasmine],
which we run with the [Karma][karma] test runner. We provide a Karma configuration file to run them.

* The configuration is found at `karma.conf.js`.
test file is configured as app/test.js

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

**Note:**
Under the hood, Protractor uses the [Selenium Standalone Server][selenium], which in turn requires
the [Java Development Kit (JDK)][jdk] to be installed on your local machine. Check this by running
`java -version` from the command line.

If JDK is not already installed, you can download it [here][jdk-download].




[angularjs]: https://angularjs.org/
[bower]: http://bower.io/
[git]: https://git-scm.com/
[http-server]: https://github.com/indexzero/http-server
[jasmine]: https://jasmine.github.io/
[jdk]: https://wikipedia.org/wiki/Java_Development_Kit
[jdk-download]: http://www.oracle.com/technetwork/java/javase/downloads
[karma]: https://karma-runner.github.io/
[local-app-url]: http://localhost:8000/index.html
[node]: https://nodejs.org/
[npm]: https://www.npmjs.org/
[protractor]: http://www.protractortest.org/
[selenium]: http://docs.seleniumhq.org/
[travis]: https://travis-ci.org/
[travis-docs]: https://docs.travis-ci.com/user/getting-started
[d3-tip]: https://github.com/VACLab/d3-tip/tree/e6dda5edf4c7c2d946f786082e9d25c24c2561c0
