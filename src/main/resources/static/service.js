'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp')
	.service('DataService', function(){
		//random integer between min and max (both inclusive)
		this.getRandomIntInclusive = function (min, max) { //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		//get exponential random variable with mean = 1/lambda and ensure that it's between low and high inclusive
		this.getExponentialRandom = function (lambda, low, high){
			var u = Math.random();
			var e = Math.log(1 - u)/(-lambda);
			if(e >= low && e <= high)return e;
			return this.getExponentialRandom(lambda, low, high);
		}
		//get ti interval as [startsecond, length in seconds]
		this.getTi = function(){
			var date = this.getRandomIntInclusive(0, 89);
			var time = Math.floor(this.getExponentialRandom(1.0/75600, 0, 86400-1));
			var len = Math.floor(this.getExponentialRandom(1.0/900, 10, 7200));
			//if(date == 89)time = 0;//upper limit is 03-31-2017T00.00.00
			return [date*86400+ time, len];
		}
		//get tj interval as [startsecond, length in seconds]
		this.getTj = function (){
			var date = this.getRandomIntInclusive(0, 89);
			var time = this.getRandomIntInclusive(0, 86400-1);
			var len = {0: 30, 1: 60, 2: 90}[this.getRandomIntInclusive(0, 2)]*60;
			//if(date == 89) time = 0;//upper limit is 03-31-2017T00.00.00
			return [date*86400+ time, len];
		}
		//get I interval set
		this.getIntervalI = function(n){
			if(this.I)return this.I;
			var I = []
			for(var i = 0; i < n; i++){
				I.push(this.getTi());
			}
			this.I = I;
			return I;
		}
		//get J interval set
		this.getIntervalJ = function(n){
			if(this.J)return this.J;
			var J = []
			for(var i = 0; i < n; i++){
				J.push(this.getTj());
			}
			this.J = J;
			return J;
		}

		this.I = null;
		this.J = null;
	})
	.service('binarysearch', function(){
		//log(n) complexity, intervals are assumed to be sorted in increasing order according to endtime.
		this.lessthanequalto = function(I, start, end, val){//return largest index a using binary search such that I[a][0] + T[a][1]<= val
			if(end < start)return -1;//no such element found
			if(end == start){
				if(I[end][0] + I[end][1] <= val)return end;
				return -1;
			}
			if(end - start == 1){
				if(I[end][0] + I[end][1] <= val)return end;
				if(I[start][0] + I[start][1] <= val)return start;
				return -1;
			}
			var mid = Math.floor(start + (end-start)/2);
			if(I[mid][0] + I[mid][1] > val)
				return this.lessthanequalto(I, start, mid-1, val);
			if(I[mid][0] + I[mid][1] < val)
				return this.lessthanequalto(I, mid, end, val);
			return mid;
		}
		//log(n) complexity, intervals are assumed to be sorted in increasing order according to starttime.
		this.greaterthanequalto = function(I, start, end, val){//return smallest index a using binary search such that I[a][0] >= val
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
				return this.greaterthanequalto(I, mid+1, end, val);
			if(I[mid][0] > val)
				return this.greaterthanequalto(I, start, mid, val);
			return mid;
		}
	})
	.service('binning', function(){
		//create a vector of size daylength/binsize and fill it with number of times that interval spans that bin (over all daylength).
		//therefore say if vector is [3, 11] the resulting vector is [ 1, 2, 1, 1, 1 ] when daylength is 10 and binsize is 2
		//This means that this vector spans second bin twice over the period of 2 days
		//
		//Some other cases are as follows
		//console.log("binning([3, 9], 10, 2)=", binning([3, 9], 10, 2)); // [ 1, 1, 1, 1, 1 ]
		//console.log("binning([3, 10], 10, 2)=", binning([3, 10], 10, 2)); // [ 1, 1, 1, 1, 1 ]
		//console.log("binning([13, 11], 10, 2)=", binning([13, 11], 10, 2)); // [ 1, 2, 1, 1, 1 ]
		this.binning = function(ti, daylength, binsize){
			//daylength = 86400 seconds, binsize = 3600 seconds (hourly), number of bins = daylength/binsize = 24
			//split ti into hourly bins
			var bin = Array.apply(null, Array(daylength/binsize)).map(function (x, i) { return 0; });
			var start_days = Math.floor(ti[0]/daylength);
			var start = ti[0] - start_days*daylength; // this ensures that start will be between 0 and daylength/binsize-1
			var days = Math.floor(ti[1]/daylength);
			bin = Array.apply(null, bin).map(function (x, i) { return x+days; });
			var end = (start+ti[1] - days*daylength);// this ensures that end will be between 0 and 2*daylength/binsize-1
			if(end == start)return bin;
			for(var i = 0; i < 2*daylength/binsize; i++){
				if(i*binsize <= start  && start < (i+1)*binsize) bin[i%(daylength/binsize)]++;
				else if(i*binsize < end && end <= (i+1)*binsize) bin[i%(daylength/binsize)]++;
				else if(start <= i*binsize && (i+1)*binsize <= end) bin[i%(daylength/binsize)]++;
			}
			return bin;
		}
		this.daily = function(ti){
			var temp = this.binning(ti, 86400, 3600);
			console.assert(temp.length == 24, {"message":"Array size wrong daily", "length":temp.length });
			return temp;
		}
		this.weekly = function(ti){
			var temp = this.binning(ti, 86400*7, 3600);
			console.assert(temp.length == 24*7, {"message":"Array size wrong daily", "length":temp.length });
			return temp;
		}
	})
	.service('plotData', ['binarysearch', 'binning', function(binarysearch, binning){
		//get all overlap interval ti's as a set for a particular j interval
		//I1 is sorted by t1, I2 is sorted by endtime
		this.getOverlapIntervals = function(I1, I2, j){
			//get smallest index a using binary search such that I[a][0] >= j[0]
			var a = binarysearch.greaterthanequalto(I1, 0, I1.length-1, j[0]);
			//and get smallest index b such that I[b][0] > j[0]+j[1]
			var b = binarysearch.greaterthanequalto(I1, 0, I1.length-1, j[0]+j[1]);//since the data is random, we expect the following loop to have very low complexity on average. We also tried to reuse code
			while(b <= I1.length-1 && b>=0 && I1[b][0] == j[0]+j[1]){
				b++;
			}
			//these are elements in range [a, b-1] which conflict with j


			var A = binarysearch.lessthanequalto(I2, 0, I2.length -1, j[0]);	//get largest index A using binary search such that I[a][0] + I[a][1] < j[0]
			var B = binarysearch.lessthanequalto(I2, 0, I2.length -1, j[0] + j[1]);	//and get largest index B such that I[b][0] + I[b][1] <= j[0]+j[1]
			while(A >= 0 && A<=I2.length-1 && I2[A][0] + I2[A][1] == j[0]){
				A--;
			}

			//these are elements in range [A+1, B] which conflict with j
			//Now add all elements in the set
			let set = new Set();
			for(var i = a; i <= b-1; i++)
				set.add(I1[i]);
			for(var i = A+1; i <= B; i++)
				set.add(I2[i]);

			return set;
		}

		//get frequency vector for part 1 of the question
		//Here I'm getting this vector which is sum of frequencies of ti which intersect with j interval
		//After that in controller I'm adding this vector for all possible j intervals
		this.getFrequencyVector = function(intervals, j){
			//Now just bin these interval elements to get their hourly frequency
			var bin = Array.apply(null, Array(24)).map(function (x, i) { return 0; });
			for (let item of intervals){
				var temp = binning.daily(item);
				bin = bin.map(function (num, idx) {
					return num + temp[idx];
				});
			}

			//Now make sure that bin vector is non-zero for the hours only when j interval is in that hour.
			var mask = binning.daily(j);
			for(var i = 0; i < bin.length; i++){
				if(mask[i] == 0)
					bin[i] = 0;
			}
			return bin;
		}

		//get frequency vector for part 2 of the question
		this.getFrequencyVectorWeekly = function(intervals, l, h){
			//Now just bin these interval elements to get their hourly frequency
			var bin = Array.apply(null, Array(24*7)).map(function (x, i) { return 0; });
			for (var i = l; i <h; i++){
				var temp = binning.weekly(intervals[i]);
				bin = bin.map(function (num, idx) {
					return num + temp[idx];
				});
			}
			return bin;
		}

		//get frequency vector for part 2 of the question
		this.getFrequencyVectorDaily = function(intervals){
			//Now just bin these interval elements to get their hourly frequency
			var bin = Array.apply(null, Array(24)).map(function (x, i) { return 0; });
			for (let item of intervals){
				var temp = binning.daily(item);
				bin = bin.map(function (num, idx) {
					return num + temp[idx];
				});
			}
			return bin;
		}

	}])

	//http://stackoverflow.com/a/37156560/7451509
	//http://stackoverflow.com/a/27931746/7451509
	.factory("myWorker", ["$q", "$window", function($q, $window) {
		var worker = undefined;
		return {
			startWork: function(postData, script) {
				var defer = $q.defer();
				if (worker) {
					worker.terminate();
				}
				var worker = new $window.Worker(script);
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
	}])

;
