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
console.log("d");
// Load Angular: must be on same domain as this script
console.log(self.importScripts);
self.importScripts('angular.js');

// Put angular on global scope
self.angular = window.angular;

// Standard angular module definitions
self.importScripts('app.js');
self.importScripts('service.js');
self.importScripts('worker-app.js');
self.importScripts('view1/view1.js');
self.importScripts('view2/view2.js');

self.importScripts('angular-route.js');
self.importScripts('d3Basic.js');
self.importScripts('components/version/version.js');
self.importScripts('components/version/version-directive.js');
self.importScripts('components/version/interpolate-filter.js');
// No root element seems to work fine
self.angular.bootstrap(null, ['worker-app']);

