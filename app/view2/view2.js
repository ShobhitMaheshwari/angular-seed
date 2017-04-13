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

	var offset = (new Date(2017,4,15)).getTime();

	console.log(offset);
	dataservice.getDataAsync().then(function(data){
		data.forEach(function(d, i){
			d.letter = new Date(d.letter*1000*3600 + offset);
			if(i%24==0)console.log(d.letter);
		});
		console.log(d3.max(data, function(d) { return d.letter; }));


	var	margin = {top: 20, right: 20, bottom: 60, left: 40};

	var svg = d3.select("svg").append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
		svg1 = d3.select("svg"),
	    width = +svg1.attr("width") - margin.left - margin.right,
    	height = +svg1.attr("height") - margin.top - margin.bottom;

	var	x = d3.scaleTime().rangeRound([0, width]),
    	y = d3.scaleLinear().rangeRound([height, 0]);
	x.domain([d3.min(data, function(d) { return d.letter; }), d3.max(data, function(d) { return d.letter; })]);
	y.domain([0, d3.max(data, function(d) { return d.frequency; })]);


	var xAxis = d3.axisBottom()
    	.scale(x)
		.tickFormat(d3.timeFormat("%H:%M %a"))
		.ticks(d3.timeHour.every(12));

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
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value ($)");

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

