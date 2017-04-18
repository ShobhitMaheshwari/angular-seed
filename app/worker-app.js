var workerApp = angular.module('worker-app', ['myApp']);
workerApp.run(function(DataService, $window) {
		console.log('gg');
		$window.onmessage = function(e) {
			console.log(DataService);
			$window.postMessage({"msg":"empty"});
		};
});
