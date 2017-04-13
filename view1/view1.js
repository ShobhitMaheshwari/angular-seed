'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.service('myApp.view1.DataService', ['DataService', 'plotData', '$q', function(DataService, plotData, $q){

	this.data = null;

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

	this.getDataAsync = function(){
		var thisobject = this;
		return $q(function(resolve, reject) {
			setTimeout(function() {
				if(thisobject.data)
					resolve(JSON.parse(JSON.stringify(thisobject.data)));
				else{
					thisobject.data = thisobject.getData();
					resolve(JSON.parse(JSON.stringify(thisobject.data)));
				}
			}, 0);
		});
	}
}])


.controller('View1Ctrl', ['myApp.view1.DataService', '$scope', function(dataservice, $scope) {
/*
	console.log("initialization");
	//var I = getIntervalI(100000001)
	//var J = getIntervalJ(100001)
	var I = DataService.getIntervalI(1000001)
	var J = DataService.getIntervalJ(1001)
	console.log("end");

	var overlap = plotData.getOverlapIntervals(I, J[0]);

	var bin = plotData.getFrequencyVector(overlap, J[0]);
	console.log(bin);
*/

	$scope.loaded = false;

	var offset = (new Date(2017,4,15)).getTime();

	dataservice.getDataAsync().then(function(data){
		data.forEach(function(d, i){
			//console.log(d.letter);
			d.letter = new Date(d.letter*1000*3600 + offset);
			//if(i%24==0)console.log(d.letter);
		});
		console.log(d3.max(data, function(d) { return d.letter; }));


	var	margin = {top: 20, right: 20, bottom: 60, left: 60};

	var svg = d3.select("svg").append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
		svg1 = d3.select("svg"),
	    width = +svg1.attr("width") - margin.left - margin.right,
    	height = +svg1.attr("height") - margin.top - margin.bottom;

		svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -46)
			.attr("x", 10)
			.attr("dy", ".71em")
			.attr("text-anchor", "end")
			.text("Frequency");
		svg.append("text")
			.attr("y", 460)
			.attr("x", 500)
			.attr("dy", ".71em")
			.attr("text-anchor", "end")
			.text("Time");

	var	x = d3.scaleTime().rangeRound([0, width]),
    	y = d3.scaleLinear().rangeRound([height, 0]);
	x.domain([d3.min(data, function(d) { return d.letter; }), d3.max(data, function(d) { return d.letter; })]);
	y.domain([0, d3.max(data, function(d) { return d.frequency; })]);


	var xAxis = d3.axisBottom()
    	.scale(x)
		.tickFormat(d3.timeFormat("%H:%M"))
		.ticks(d3.timeHour.every(2));

	var yAxis = d3.axisLeft()
    	.scale(y)
    	.ticks(10);
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
  });
	svg.call(tip);

	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "middle")
      .attr("dx", "-3em")
      .attr("dy", ".75em")
      .attr("transform", "rotate(-60)" );

  	svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)

	svg.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return x(d.letter); })
		.attr("y", function(d) { return y(d.frequency); })
		.attr("width", function(d, i){
			if(i != data.length - 1){
				return x(data[i+1].letter) - x(data[i].letter);
			}else
				return width - x(data[i].letter);
		})
		.attr("height", function(d) { return height - y(d.frequency); })
		.on('mouseover', tip.show)
      .on('mouseout', tip.hide);
	$scope.loaded = true;
	});

}]);


