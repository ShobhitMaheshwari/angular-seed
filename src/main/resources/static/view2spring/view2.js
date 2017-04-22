'use strict';

angular.module('myApp.view2spring', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2spring', {
	templateUrl: 'view2spring/view2.html',
	controller: 'View2SpringCtrl'
  });
}])

.service('View2SaveSpring', function($http, $q){

	this.data = null;

	this.get = function(){
		var defer = $q.defer();
		var that = this;
		if(!this.data)
			$http({method: "GET", url: "app/view2"}).then(function(data){
				that.data = data.data;
				defer.resolve(data.data);
			});
		else{
			var that = this;
			setTimeout(function(){defer.resolve(that.data)}, 0);
		}

		return defer.promise;
	};

})

.controller('View2SpringCtrl', ['$scope', 'View2SaveSpring', function($scope, View2Save) {
	$scope.loaded = false;
	$scope.ticks = d3.timeHour.every(12);
	$scope.data = [];
	for(var i = 0; i < 24*7; i++){
		var now = new Date(i*1000*3600);
		var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
		$scope.data.push({
			"letter": now_utc,
			"frequency": 0
		});
	}

	var start = performance.now();
	View2Save.get().then(function(data){
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
