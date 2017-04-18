var workerApp = angular.module('worker-app', ['myApp']);

workerApp.run(["worker-app.DataService", "$window", function(dataService, $window) {
	$window.onmessage = function(e) {

		dataService.getDataAsync().then(function(data){
			$window.postMessage(data);
		});
	};
}])
.service('worker-app.DataService', ['DataService', 'plotData', '$q', function(DataService, plotData, $q){

	this.data = null;//to make sure that chenging tabs does not request a new data

	this.getData = function(){
		console.log("initialization");
		//var I = getIntervalI(100000001)
		//var J = getIntervalJ(100001)
		var I = DataService.getIntervalI(1000000);
		console.log("end");
		var bin = plotData.getFrequencyVectorWeekly(I);

		var data = [];
		for(var i = 0; i < bin.length; i++){
			data.push({
				"letter": i,
				"frequency": bin[i]
			});
		}
		return data;
	}

	this.getDataAsync = function(){//to ensure that data is obtained asynchronously
		var thisobject = this;
		return $q(function(resolve, reject) {
			setTimeout(function() {
				if(thisobject.data)
					resolve(JSON.parse(JSON.stringify(thisobject.data)));//copy this data because we would be modifying it in controller
				else{
					thisobject.data = thisobject.getData();
					resolve(JSON.parse(JSON.stringify(thisobject.data)));
				}
			}, 0);
		});
	}

	this.reset = function(){
		DataService.reset();
		this.data = null;
	};
}])

;
