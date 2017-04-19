var workerApp = angular.module('worker-app', ['myApp']);

workerApp.run(["worker-app.DataService", "$window", function(dataService, $window) {
	$window.onmessage = function(e) {
		dataService.getData(e.data).then(function(data){
			$window.postMessage(data);
		});
	};
}])
.service('worker-app.DataService', ['DataService', 'plotData', '$http', '$q', function(DataService, plotData, $http, $q){

	this.getData = function(e){
		var defer = $q.defer();
		//here you may retrive the data from server
		(function pollerFunc() {
			timeoutPromise = setTimeout(function() {
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange = function() {
					if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
						var response = JSON.parse(xmlhttp.responseText);
						defer.resolve(plotData.getFrequencyVectorWeekly(response.I, e.counter*1000000, 1000000+e.counter*1000000));
					}
				};
				xmlhttp.open('GET', '../randomdata.json', true);
				xmlhttp.send();
			}, 0);
		})();
		return defer.promise;
	}
}])

;
