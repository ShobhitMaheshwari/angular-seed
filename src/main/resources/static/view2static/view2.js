'use strict';

angular.module('myApp.view2static', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2static', {
	templateUrl: 'view2static/view2.html',
	controller: 'View2StaticCtrl'
  });
}])

.service('View2SaveStatic', function(){
	this.get = function(){return [106057,118457,113558,108029,102371,98034,93484,89042,85217,81088,76667,73476,70017,67027,63692,60634,57847,55255,52804,50264,48219,45837,43717,41684,106357,118155,112903,107558,102680,97840,93206,88867,84388,81493,77296,73704,70031,66994,63282,60766,57943,55187,52685,50231,47836,45597,43382,41704,107098,118799,113422,108471,103051,98051,93360,88706,84515,80939,77265,73699,70395,67622,63774,61113,58043,55615,53099,50228,47670,45692,43115,41083,106502,118230,112965,107561,102980,98080,92922,89026,84900,80878,77103,73835,70042,66540,64109,61444,58378,55161,52349,50213,47779,45790,43827,41629,106518,117793,112695,107598,102758,98476,93707,89263,84844,81559,77182,74244,70186,67016,63802,60949,58115,55351,52681,50073,47618,45714,43787,41674,106638,118076,113414,108100,102407,98008,93643,89829,85198,81076,77507,73265,70335,67508,64389,61208,57944,55566,53077,50136,47733,45546,43673,41757,99295,109261,104826,99130,95002,91027,86384,82382,78333,74560,71140,67788,64718,61492,59076,56267,53365,51369,49396,46278,44226,42252,40146,38602];};
})

.controller('View2StaticCtrl', ['$scope', 'View2SaveStatic', function($scope, View2Save) {
	$scope.loaded = false;
	$scope.ticks = d3.timeHour.every(12);
	$scope.data = [];
	for(var i = 0; i < 24*7; i++){
		var now = new Date(i*1000*3600);
		var now_utc = new Date(now.getUTCFullYear()+47, now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
		$scope.data.push({
			"letter": now_utc,
			"frequency": 0
		});
	}

	$scope.counter = 0;
	var temp = View2Save.get();
	$scope.data = $scope.data.map(function(x, idx){
		return {
			"letter": x.letter,
			"frequency": x.frequency + temp[idx]
		};
	});
	$scope.loaded = true;
}])