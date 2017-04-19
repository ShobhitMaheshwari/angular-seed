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
		console.log(JSON.stringify(data.map(function(x){return x.frequency})));
	};
	this.get = function(){return this.data;};
})

.controller('View1Ctrl', ['$scope', 'myWorker', 'View1Save', function($scope, myWorker, View1Save) {
	$scope.loaded = false;
	$scope.ticks = d3.timeHour.every(2);
	$scope.counter = 0;
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

	if(View1Save.get()!=null){
		$scope.data = View1Save.get();
		$scope.loaded = true;
	}
	else{
		var pool = new Pool(navigator.hardwareConcurrency || 4);
		pool.init();
		for(var i = 0; i < 10; i++){
			var workerTask = new WorkerTask(myWorker.startWork,function(data){
				$scope.data = $scope.data.map(function(x, idx){
					return {
						"letter": x.letter,
						"frequency": x.frequency + data[idx]
					};
				});
				console.log(performance.now() - start);
				$scope.counter++;
				if($scope.counter == 10){
					$scope.loaded = true;
					View1Save.save($scope.data);
				}
			}, {"counter": i}, 'view1/worker.js');
			pool.addWorkerTask(workerTask);
		}
	}

	$scope.$on("$destroy", function handler() {
		myWorker.stopWork();
	});
}])
;
