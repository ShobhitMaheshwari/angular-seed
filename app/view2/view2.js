'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.service('myApp.view2.DataService', ['DataService', 'plotData', '$q', function(DataService, plotData, $q){

	this.data = null;

	this.getData = function(){
		console.log("initialization");
		//var I = getIntervalI(100000001)
		//var J = getIntervalJ(100001)
		var I = DataService.getIntervalI(10001)
		console.log("end");
		var bin = plotData.getFrequencyVectorWeekly(I);
		console.log(bin);

		var data = [];
		for(var i = 0; i < bin.length; i++){
			data.push({
				"letter": i,
				"frequency": bin[i]
			});
		}
		console.log(bin.length);
		return data;
	}

	this.getDataAsync = function(){
		var thisobject = this;
		return $q(function(resolve, reject) {
			setTimeout(function() {
				if(thisobject.data)
					resolve(thisobject.data);
				else{
					thisobject.data = thisobject.getData();
					resolve(thisobject.data);
				}
			}, 0);
		});
	}
}])

.controller('View2Ctrl', ['myApp.view2.DataService', '$scope', function(dataservice, $scope) {

	$scope.loaded = false;

	dataservice.getDataAsync().then(function(data){
	var svg = d3.select("svg"),
    	margin = {top: 20, right: 20, bottom: 30, left: 40},
	    width = +svg.attr("width") - margin.left - margin.right,
    	height = +svg.attr("height") - margin.top - margin.bottom;

	var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    	y = d3.scaleLinear().rangeRound([height, 0]);

	var g = svg.append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	x.domain(data.map(function(d) { return d.letter; }));
	y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

	g.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	g.append("g")
		.attr("class", "axis axis--y")
		.call(d3.axisLeft(y).ticks(10, "%"))
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("Frequency");

	g.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.letter); })
		.attr("y", function(d) { return y(d.frequency); })
		.attr("width", x.bandwidth())
		.attr("height", function(d) { return height - y(d.frequency); });

	$scope.loaded = true;
	});

}]);

