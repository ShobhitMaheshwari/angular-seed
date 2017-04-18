'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
	templateUrl: 'view2/view2.html',
	controller: 'View2Ctrl'
  });
}])

.service('View2Save', function(){
	this.data = null;
	this.save = function(data){
		this.data = data;
	};
	this.get = function(){return this.data;};
})

.controller('View2Ctrl', ['myWorker', '$scope', 'View2Save', function(myWorker, $scope, View2Save) {
	$scope.loaded = false;
	$scope.ticks = d3.timeHour.every(12);
	$scope.data = [];
	for(var i = 0; i < 24*7; i++){
		var now = new Date(i*1000*3600);
		var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
		$scope.data.push({
			"letter": now_utc,
			"frequency": 0
		});
	}

	var start = performance.now();

	var counter = 0;
	if(View2Save.get() != null)
		$scope.data = View2Save.get();
	else{
	for(var i = 0; i < 10; i++){
		myWorker.startWork(null).then(function(data) {
			data.forEach(function(d, idx){
				var now = new Date(idx*1000*3600);
				var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
				d.letter = now_utc;
			});

			$scope.data = $scope.data.map(function(x, idx){
				return {
					"letter": x.letter,
					"frequency": x.frequency + data[idx].frequency
				};
			});
			console.log(performance.now() - start);
			counter++;
			if(counter == 10){
				$scope.loaded = true;
				View2Save.save($scope.data);
			}
		}, function(error) {}, function(response) {	});
	}
	}

	$scope.$on("$destroy", function handler() {
		myWorker.stopWork();
	});

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

			var worker = new $window.Worker('view2/worker.js');
			worker.onmessage = function(e) {
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
}]);

/*Currently this pooling does not serve any purpose, but this might be useful for later
 Usage
var pool = new Pool(navigator.hardwareConcurrency || 4);
    pool.init();

 worker.js

 importScripts('quantize.js' , 'color-thief.js');

self.onmessage = function(event) {
    var wp = event.data;
    var foundColor = createPaletteFromCanvas(wp.data,wp.pixelCount, wp.colors);
    wp.result = foundColor;
    self.postMessage(wp);

    // close this worker
    self.close();
};
*/
//http://www.smartjava.org/content/html5-easily-parallelize-jobs-using-web-workers-and-threadpool
function Pool(size) {
    var _this = this;

    // set some defaults
    this.taskQueue = [];
    this.workerQueue = [];
    this.poolSize = size;

    this.addWorkerTask = function(workerTask) {
        if (_this.workerQueue.length > 0) {
            // get the worker from the front of the queue
            var workerThread = _this.workerQueue.shift();
            workerThread.run(workerTask);
        } else {
            // no free workers,
            _this.taskQueue.push(workerTask);
        }
    }

    this.init = function() {
        // create 'size' number of worker threads
        for (var i = 0 ; i < size ; i++) {
            _this.workerQueue.push(new WorkerThread(_this));
        }
    }

    this.freeWorkerThread = function(workerThread) {
        if (_this.taskQueue.length > 0) {
            // don't put back in queue, but execute next task
            var workerTask = _this.taskQueue.shift();
            workerThread.run(workerTask);
        } else {
            _this.taskQueue.push(workerThread);
        }
    }
}

// runner work tasks in the pool
function WorkerThread(parentPool) {

    var _this = this;

    this.parentPool = parentPool;
    this.workerTask = {};

    this.run = function(workerTask) {
        this.workerTask = workerTask;
        // create a new web worker
        if (this.workerTask.script!= null) {
            var worker = new Worker(workerTask.script);
            worker.addEventListener('message', dummyCallback, false);
            worker.postMessage(workerTask.startMessage);
        }
    }

    // for now assume we only get a single callback from a worker
    // which also indicates the end of this worker.
    function dummyCallback(event) {
        // pass to original callback
        _this.workerTask.callback(event);

        // we should use a seperate thread to add the worker
        _this.parentPool.freeWorkerThread(_this);
    }

}

// task to run
function WorkerTask(script, callback, msg) {

    this.script = script;
    this.callback = callback;
    this.startMessage = msg;
};
