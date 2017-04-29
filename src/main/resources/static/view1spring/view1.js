'use strict';
angular.module('myApp.view1spring', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1spring', {
    templateUrl: 'view1spring/view1.html',
    controller: 'View1SpringCtrl'
  });
}])
.service('View1SaveSpring', function($http, $q){
	this.data = null;
	this.get = function(){
		var defer = $q.defer();
		if(!this.data){
			var that = this;
			$http({method: "GET", url: "app/view1"}).then(function(data){
				that.data = data.data;
				defer.resolve(data.data);
			});
		}
		else{
			var that = this;
			setTimeout(function(){defer.resolve(that.data)}, 0);
		}
		return defer.promise;
	};
})
.controller('View1SpringCtrl', ['$scope', 'myWorker', 'View1SaveSpring', function($scope, myWorker, View1Save) {
	$scope.loaded = false;
	$scope.ticks = d3.timeHour.every(2);
	$scope.counter = 0;
	$scope.data = [];
	for(var i = 0; i < 24; i++){
		var now = new Date(i*1000*3600);
		var now_utc = new Date(now.getUTCFullYear()+47, now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
		$scope.data.push({
			"letter": now_utc,
			"frequency": 0
		});
	}
	var start = performance.now();
	View1Save.get().then(function(data){
		$scope.data = $scope.data.map(function(x, idx){
			return {
				"letter": x.letter,
				"frequency": x.frequency + data[idx]
			};
		});
		console.log(performance.now() - start);
		$scope.loaded = true;
	});
}])
;
