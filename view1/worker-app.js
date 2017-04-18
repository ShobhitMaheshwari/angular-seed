var workerApp = angular.module('worker-app', ['myApp']);

workerApp.run(["worker-app.DataService", "$window", function(dataService, $window) {
	$window.onmessage = function(e) {

		dataService.getDataAsync().then(function(data){
			$window.postMessage(data);
		});
	};
}])

.service('worker-app.DataService', ['DataService', 'plotData', '$q', function(DataService, plotData, $q){

	this.data = null;//ensure that changing view tabs does not repeat computation

	this.getData = function(){
		console.log("initialization");
		//var I = getIntervalI(100000001)
		//var J = getIntervalJ(100001)
		var I = DataService.getIntervalI(10001);
		var J = DataService.getIntervalJ(1001);
		console.log("end");

		var bin = Array.apply(null, Array(24)).map(function (x, i) { return 0; });

		for(var i = 0; i < J.length; i++){
			var overlap = plotData.getOverlapIntervals(I, J[i]);
			var temp = plotData.getFrequencyVector(overlap, J[i]);
			bin = bin.map(function (num, idx) {
				return num + temp[idx];
			});
		}

		var data = [];
		for(var i = 0; i < bin.length; i++){
			data.push({
				"letter": i,
				"frequency": bin[i]
			});
		}
		return data;
	}

	this.getDataAsync = function(){//get data synchrnously
		var thisobject = this;
		return $q(function(resolve, reject) {
			setTimeout(function() {
				if(thisobject.data)
					resolve(JSON.parse(JSON.stringify(thisobject.data)));//ensure that data is copied because this will be modified in controller
				else{
					thisobject.data = thisobject.getData();
					resolve(JSON.parse(JSON.stringify(thisobject.data)));
				}
			}, 0);
		});
	}
}])

;
