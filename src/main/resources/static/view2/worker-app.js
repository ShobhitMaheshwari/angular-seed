var workerApp = angular.module('worker-app', ['myApp']);

workerApp.run(["worker-app.DataService", "$window", function(dataService, $window) {
	$window.onmessage = function(e) {
		dataService.getData(e.data).then(function(data){
			$window.postMessage(data);
			$window.close();
		});
	};
}])
.service('worker-app.DataService', ['DataService', 'plotData', '$http', '$q', function(DataService, plotData, $http, $q){

	this.getData = function(e){
		var defer = $q.defer();
		var that = this;
		this.readFile("../I1.json").then(function(I1){
			that.readFile("../I2.json").then(function(I2){
				defer.resolve(plotData.getFrequencyVectorWeekly(I1.concat(I2), e.counter*1000000, 1000000+e.counter*1000000));
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
