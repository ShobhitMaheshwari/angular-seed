// Angular needs a global window object
self.window = self;

// Skeleton properties to get Angular to load and bootstrap.
self.history = {};
self.document = {
  readyState: 'complete',
  querySelector: function() {},
  createElement: function() {
    return {
      pathname: '',
      setAttribute: function() {}
    }
  }
};
// Load Angular: must be on same domain as this script
self.importScripts('../angular.min.js');

// Put angular on global scope
self.angular = window.angular;

// Standard angular module definitions
self.importScripts('../app.js');
self.importScripts('../service.js');
self.importScripts('../view1/worker-app.js');
self.importScripts('../view1/view1.js');
self.importScripts('../view2/view2.js');
self.importScripts('../view1static/view1.js');
self.importScripts('../view2static/view2.js');

self.importScripts('../angular-route.min.js');
self.importScripts('../d3Basic.js');
self.importScripts('../components/version/version.js');
self.importScripts('../components/version/version-directive.js');
self.importScripts('../components/version/interpolate-filter.js');
// No root element seems to work fine
self.angular.bootstrap(null, ['worker-app']);

