var workerApp = angular.module('worker-app', ['myApp']);

workerApp.run(["worker-app.DataService", "$window", function(dataService, $window) {
	$window.onmessage = function(e) {

		dataService.getData(e.data).then(function(data){
			$window.postMessage(data);
			$window.close();
		});
	};
}])

.service('worker-app.DataService', ['DataService', 'plotData', '$q', function(DataService, plotData, $q){

	 this.getData2 = function(e, I, J){

		var bin = Array.apply(null, Array(24)).map(function (x, i) { return 0; });
		//sort I on basis of ti
		var I1 = I.slice();
		I1.sort(function(a,b){
			if(a[0] < b[0])return -1;
			if(a[0] > b[0])return 1;
			return 0;
		});

		var I2 = I.slice();
		I2.sort(function(a,b){	//sort I on basis of endtimes
			if(a[0] +a[1] < b[0] + b[1])return -1;
			if(a[0] + a[1] > b[0] + b[1])return 1;
			return 0;
		});

		//total set is 10000 for J, so 1000 at a time
		for(var i = e.counter*1000; i < e.counter*1000+1000; i++){
			var overlap = plotData.getOverlapIntervals(I1, I2, J[i]);
			var temp = plotData.getFrequencyVector(overlap, J[i]);
			bin = bin.map(function (num, idx) {
				return num + temp[idx];
			});
		}
		return bin;
	}

	this.getData = function(e){
		var defer = $q.defer();
		var that = this;
		this.readFile("../I1.json").then(function(I1){
			that.readFile("../I2.json").then(function(I2){
				that.readFile("../J.json").then(function(J){
					defer.resolve(that.getData2(e, I1.concat(I2), J));
				});
			});
		});
		return defer.promise;
	}

	this.readFile = function(name){
		var defer = $q.defer();
		//here you may retrive the data from server
		var that = this;
		(function pollerFunc() {
			timeoutPromise = setTimeout(function() {
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange = function() {
					if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
						var response = JSON.parse(xmlhttp.responseText);
						defer.resolve(response);
					}
				};
				xmlhttp.open('GET', name, true);
				xmlhttp.send();
			}, 0);
		})();
		return defer.promise;
	};
}])
;
