'use strict';

angular.module('myApp.view1static', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1static', {
    templateUrl: 'view1static/view1.html',
    controller: 'View1StaticCtrl'
  });
}])
.service('View1SaveStatic', function(){
	this.get = function(){return [3858010,4227914,4210473,4099603,3967490,3851217,3568095,3173810,3131641,3441620,2920379,2614696,2664895,2690305,2548968,2277871,2193465,2130424,2043059,1813391,1731827,1738582,1641585,1554582];};
})

.controller('View1StaticCtrl', ['$scope', 'myWorker', 'View1SaveStatic', function($scope, myWorker, View1Save) {
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

	var temp = View1Save.get();
	$scope.data = $scope.data.map(function(x, idx){
		return {
			"letter": x.letter,
			"frequency": x.frequency + temp[idx]
		};
	});
	$scope.loaded = true;
}])
;
