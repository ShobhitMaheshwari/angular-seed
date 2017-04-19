		//random integer between min and max (both inclusive)
		var getRandomIntInclusive = function (min, max) { //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		//get exponential random variable with mean = 1/lambda and ensure that it's between low and high inclusive
		var getExponentialRandom = function (lambda, low, high){
			var u = Math.random();
			var e = Math.log(1 - u)/(-lambda);
			if(e >= low && e <= high)return e;
			return getExponentialRandom(lambda, low, high);
		}
		//get ti interval as [startsecond, length in seconds]
		var getTi = function(){
			var date = getRandomIntInclusive(0, 89);
			var time = Math.floor(getExponentialRandom(1.0/75600, 0, 86400-1));
			var len = Math.floor(getExponentialRandom(1.0/900, 10, 7200));
			//if(date == 89)time = 0;//upper limit is 03-31-2017T00.00.00
			return [date*86400+ time, len];
		}
		//get tj interval as [startsecond, length in seconds]
		var getTj = function (){
			var date = getRandomIntInclusive(0, 89);
			var time = getRandomIntInclusive(0, 86400-1);
			var len = {0: 30, 1: 60, 2: 90}[getRandomIntInclusive(0, 2)]*60;
			//if(date == 89) time = 0;//upper limit is 03-31-2017T00.00.00
			return [date*86400+ time, len];
		}
		//get I interval set
		var getIntervalI = function(n){
			var I = []
			for(var i = 0; i < n; i++){
				I.push(getTi());
			}
			return I;
		}
		//get J interval set
		var getIntervalJ = function(n){
			var J = []
			for(var i = 0; i < n; i++){
				J.push(getTj());
			}
			return J;
		}
		var I = getIntervalI(10000000);
		var J = getIntervalJ(10000);
/*
		var fs = require('fs');
		fs.writeFile("randomdata.json", JSON.stringify({"I": I, "J": J}), function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("The file was saved!");
		});

		var I = null, J = null;
		var fs1 = require('fs');
		fs1.readFile("randomdata.json", {encoding: 'utf-8'}, function(err, data){
			var temp = JSON.parse(data);
			I = temp.I;
			J = temp.J;
			console.log(I.length);
			*/
			var fs = require('fs');
			fs.writeFile("I1.json", JSON.stringify(I.slice(0, I.length/2)), function(err) {
				if(err) {
					return console.log(err);
				}
				console.log("The file was saved!");
			});
			fs.writeFile("I2.json", JSON.stringify(I.slice(I.length/2)), function(err) {
				if(err) {
					return console.log(err);
				}
				console.log("The file was saved!");
			});

			fs.writeFile("J.json", JSON.stringify(J), function(err) {
				if(err) {
					return console.log(err);
				}
				console.log("The file was saved!");
			});
/*
		});
		*/



