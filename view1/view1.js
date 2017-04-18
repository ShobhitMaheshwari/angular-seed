'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])
.service('View1Save', function(){
	this.data = null;
	this.save = function(data){
		this.data = data;
	};
	this.get = function(){return this.data;};
})

.controller('View1Ctrl', ['$scope', 'view1.myWorker', 'View1Save', function($scope, myWorker, View1Save) {
	$scope.loaded = false;
	$scope.ticks = d3.timeHour.every(2);

	$scope.data = [];
	for(var i = 0; i < 24; i++){
		var now = new Date(i*1000*3600);
		var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
		$scope.data.push({
			"letter": now_utc,
			"frequency": 0
		});
	}

	var start = performance.now();

	if(View1Save.get()!=null)
		$scope.data = View1Save.get();
	else{
		myWorker.startWork(null).then(function(data) {
			data.forEach(function(d, i){
				var now = new Date(i*1000*3600);
				var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
				d.letter = now_utc;
			});

			$scope.data = $scope.data.map(function(x, i){
				return {
					"letter": x.letter,
					"frequency": x.frequency + data[i].frequency
				};
			});
			console.log(performance.now() - start);
			View1Save.save($scope.data);
			$scope.loaded = true;
		}, function(error) {}, function(response) {	});
	}

	$scope.$on("$destroy", function handler() {
		myWorker.stopWork();
	});

}])


//http://stackoverflow.com/a/37156560/7451509
//http://stackoverflow.com/a/27931746/7451509
.factory("view1.myWorker", ["$q", "$window", function($q, $window) {
	var worker = undefined;
	return {
		startWork: function(postData) {
			var defer = $q.defer();
			if (worker) {
				worker.terminate();
			}
			var worker = new $window.Worker('view1/worker.js');
			worker.onmessage = function(e) {
				defer.resolve(e.data);
			};
			worker.postMessage(postData); // Send data to our worker.
			return defer.promise;
		},
		stopWork: function() {
			if (worker) {
				worker.terminate();
			}
		}
	}
}]);

