'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
	templateUrl: 'view2/view2.html',
	controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['myWorker', '$scope', function(myWorker, $scope) {
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

	myWorker.startWork(null).then(function(data) {
		data.forEach(function(d, i){
			var now = new Date(i*1000*3600);
			var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			d.letter = now_utc;
		});
		console.log("dfsdf");
		$scope.data = data;
		// complete
	}, function(error) {
		// error
	}, function(response) {
	    // notify (here you receive intermittent responses from worker)
		console.log("Notification worker RESPONSE: " + response);
	});


	$scope.$on("$destroy", function handler() {
		// destruction code here
		myWorker.stopWork();
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
//http://stackoverflow.com/a/27931746/7451509
.factory("myWorker", ["$q", "$window", function($q, $window) {
	var worker = undefined;
	return {
		startWork: function(postData) {
			var defer = $q.defer();
			if (worker) {
				worker.terminate();
			}

			/*
			// function to be your worker (in file without needing worker.js)
			function workerFunction() {
				var self = this;
				self.onmessage = function(event) {
					var timeoutPromise = undefined;
					//if (dataUrl) {
						if (timeoutPromise) {
							setTimeout.cancel(timeoutPromise); // cancelling previous promises
						}

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
			}

			// end worker function
			var dataObj = '(' + workerFunction + ')();'; // here is the trick to convert the above fucntion to string
			var blob = new Blob([dataObj.replace('"use strict";', '')]); // firefox adds user strict to any function which was blocking might block worker execution so knock it off
			var blobURL = (window.URL ? URL : webkitURL).createObjectURL(blob, {
				type: 'application/javascript; charset=utf-8'
			});
			worker = new Worker(blobURL);
			*/

			var worker = new $window.Worker('worker.js');
			worker.onmessage = function(e) {
				console.log('Worker said: ', e.data);
				defer.resolve(e.data);
				//defer.notify(e.data);
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
