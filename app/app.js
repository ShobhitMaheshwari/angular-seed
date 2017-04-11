'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
  'myApp.users'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);


angular.module('api.users', [])
	.factory('Users', function() {
		var Users = {};

		// Users.method = function() {};

		return Users;
	});

function getIntervalI(n){
	var I = []
	for(var i = 0; i < n; i++){
		I.push(getTi());
	}
	return I;
}
function getIntervalJ(n){
	var J = []
	for(var i = 0; i < n; i++){
		J.push(getTj());
	}
	return J;
}

function getTj(){
	var date = getRandomIntInclusive(0, 89);
	var time = getRandomIntInclusive(0, 86400-1);
	var len = {0: 30, 1: 60, 2: 90}[getRandomIntInclusive(0, 2)]*60;
	if(date === 89) time = 0;//upper limit is 03-31-2017T00.00.00
	console.assert(time >= 0 && time <= 86400-1, {"message":"a is not greater than b","time":time,"len":len});
	return [date*86400+ time, len];
}

function getTi(){
	var date = getRandomIntInclusive(0, 89);
	var time = Math.floor(getExponentialRandom(1.0/75600, 0, 86400-1));
	var len = Math.floor(getExponentialRandom(1.0/890, 10, 7200));
	if(date === 89) time = 0;//upper limit is 03-31-2017T00.00.00

	console.assert(time >= 0 && time <= 86400-1 && len>=10 && len <=7200, {"message":"a is not greater than b","time":time,"len":len});
	return [date*86400+ time, len];
}

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getExponentialRandom(lambda, low, high){
	var u = Math.random();
	var e = Math.log(1 - u)/(-lambda);
	if(e >= low && e <= high)return e;
	return getExponentialRandom(lambda, low, high);
}
//return smallest index a using binary search such that I[a][0] >= val
function search(I, start, end, val){
	if(end < start)return -1;//no such element found
	if(end == start){
		if(I[end][0] >= val)return end;
		return -1;
	}
	if(end - start == 1){
		if(I[start][0] >= val)return start;
		if(I[end][0] >= val)return end;
		return -1;
	}
	var mid = Math.floor(start + (end-start)/2);
	if(I[mid][0] < val)
		return search(I, mid+1, end, j);
	if(I[mid][0] > val)
		return search(I, start, mid, j);
	return mid;
}

//bin([3, 11], 10, 2) =
//bin([3, 9], 10, 2) =
//bin([3, 10], 10, 2) =
function binning(ti, daylength, binsize){
	//split ti into hourly bins
	bin = Array.apply(null, Array(daylength/binsize)).map(function (x, i) { return 0; });
	start = ti[0]
	days = Math.floor(ti[1]/daylength);
	bin = Array.apply(null, bin).map(function (x, i) { return x+days; });
	end = (ti[0]+ti[1] - days*daylength)%daylength;//4, 2,

	if(end == start)return bin;

	for(var i = 0; i < 2*daylength/binsize; i++){
		if(start <= i*binsize && i*binsize < end) bin[i%daylength]++;
	}
	return bin;
}

function plot(){
	console.log("initialization");
	I = getIntervalI(100000001)
	J = getIntervalJ(100001)
	console.log("end");
	j = J[0]
	//sort I on basis of ti
	I.sort(function(a,b){
		if(a[0] < b[0])return -1;
		if(a[0] > b[0])return 1;
		return 0;
	});
	//get smallest index a using binary search such that I[a][0] >= j[0]
	a = search(I, 0, I.length-1, j[0]);
	//and get smallest index b such that I[b][0] > j[0]+j[1]
	b = search(I, 0, I.length-1, j[0]+j[1]);//since the data is random, we expect the following loop to have very low complexity on average. We also tried to reuse code
	while(b <= I.length-1 && I[b][0] == j[0]+j[1]){
		b++;
	}
	//these are elements in range [a, b-1] which conflict with j
	//Now just bin these elements to get their hourly frequency
	bin = Array.apply(null, Array(24)).map(function (x, i) { return 0; });
	for(var i = a; i <= b-1; i++){
		temp = binning(I[i], 86400, 3600);
		bin = bin.map(function (num, idx) {
			return num + temp[idx];
		});
	}
	console.log(bin);
}
