'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['DataService', 'plotData', function(DataService, plotData) {

	console.log("initialization");
	//var I = getIntervalI(100000001)
	//var J = getIntervalJ(100001)
	var I = DataService.getIntervalI(1000001)
	var J = DataService.getIntervalJ(1001)
	console.log("end");

	var overlap = plotData.getOverlapIntervals(I, J[0]);

	var bin = plotData.getFrequencyVector(overlap, J[0]);
	console.log(bin);
}]);


