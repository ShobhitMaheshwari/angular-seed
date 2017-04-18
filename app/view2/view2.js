'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
	templateUrl: 'view2/view2.html',
	controller: 'View2Ctrl'
  });
}])

.service('myApp.view2.DataService', ['DataService', 'plotData', '$q', function(DataService, plotData, $q){

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

.controller('View2Ctrl', ['myApp.view2.DataService', 'myWorker', '$scope', function(dataservice, myWorker, $scope) {

	$scope.loaded = false;

	$scope.data = [];
	for(var i = 0; i < 24*7; i++){
			var now = new Date(i*1000*3600);
			var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			$scope.data.push({
				"letter": now_utc,
				"frequency": 0
			});
	}
var inputToWorker = {
    dataUrl: "http://jsonplaceholder.typicode.com/posts/1", // url to poll
    pollingInterval: 5 // interval
};

myWorker.startWork().then(function(response) {
	console.log(response);
    // complete
}, function(error) {
    // error
}, function(response) {
    // notify (here you receive intermittent responses from worker)
    console.log("Notification worker RESPONSE: " + response);
});

/*
	dataservice.getDataAsync().then(function(data){
		$scope.data = data;
		console.log($scope.data[0]);
		data.forEach(function(d, i){
			var now = new Date(i*1000*3600);
			var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			d.letter = now_utc;
		});


		function newData(){
		dataservice.reset();
		dataservice.getDataAsync().then(function(data){
			$scope.data = data;
			console.log($scope.data[0]);
			data.forEach(function(d, i){
				var now = new Date(i*1000*3600);
				var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
				d.letter = now_utc;
			});
		});
		}
		setTimeout(newData, 5000);

		$scope.loaded = true;
	});
*/
}])
//http://stackoverflow.com/a/37156560/7451509
.factory("myWorker", ["myApp.view2.DataService", "$q", "$window", function(DataService, $q, $window) {
	var worker = undefined;
	return {
		startWork: function(postData) {
			var defer = $q.defer();
			if (worker) {
				worker.terminate();
			}
						console.log(DataService);

			// function to be your worker
			function workerFunction() {
				var self = this;
				console.log(self);

/*
				self.onmessage = function(event) {
					var timeoutPromise = undefined;
					//if (dataUrl) {
						if (timeoutPromise) {
							setTimeout.cancel(timeoutPromise); // cancelling previous promises
						}

						console.log(DataService);
						//console.log('Notifications - Data URL: ' + dataUrl);
						//get Notification count
						var delay = 0; // poller 0sec delay
						(function pollerFunc() {
							timeoutPromise = setTimeout(function() {
							DataService.getDataAsync().then(function(data){
								self.postMessage(data);
							});

								var xmlhttp = new XMLHttpRequest();
								xmlhttp.onreadystatechange = function() {
									if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
										var response = JSON.parse(xmlhttp.responseText);
										self.postMessage(response.id);
										pollerFunc();
									}
								};
								xmlhttp.open('GET', dataUrl, true);
								xmlhttp.send();

							}, delay);
						})();
					//}
				}
*/
			}

			// end worker function

			var dataObj = '(' + workerFunction + ')();'; // here is the trick to convert the above fucntion to string
			var blob = new Blob([dataObj.replace('"use strict";', '')]); // firefox adds user strict to any function which was blocking might block worker execution so knock it off

			var blobURL = (window.URL ? URL : webkitURL).createObjectURL(blob, {
				type: 'application/javascript; charset=utf-8'
			});

			//worker = new Worker(blobURL);
			var worker = new $window.Worker('worker.js');
			worker.onmessage = function(e) {
				console.log('Worker said: ', e.data);
				defer.notify(e.data);
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
