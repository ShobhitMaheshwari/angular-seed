//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: './src/main/resources/static',

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-mocks/angular-mocks.js',
	  'app.js',
	  'service.js',
      'components/**/*.js',
      'view1/view1.js',
		'view2/view2.js',
		'view1static/view1.js',
		'view2static/view2.js',
		'view1spring/view1.js',
		'view2spring/view2.js',
	  'test.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    browsers: ['Chrome'],

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-junit-reporter'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
