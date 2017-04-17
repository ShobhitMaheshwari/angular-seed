'use strict';

angular.module('myApp.view3', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view3', {
    templateUrl: 'view3/view3.html',
    controller: 'View3Ctrl'
  });
}])

.controller('View3Ctrl', ['plotData', '$scope', function(service, $scope) {

var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%m/%e/%Y %H");

var x = d3.scaleTime().range([0, width/2]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%e/%Y %H")),
    xAxis2 = d3.axisBottom(x2).tickFormat(d3.timeFormat("%m/%e/%Y %H")),
    yAxis = d3.axisLeft(y);

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.price); });

var area2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(d.date); })
    .y0(height2)
    .y1(function(d) { return y2(d.price); });

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var	data=[];

	var now = new Date(0);
	var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

	var now1 = new Date(86400*2*1000);
	var now_utc1 = new Date(now1.getUTCFullYear(), now1.getUTCMonth(), now1.getUTCDate(),  now1.getUTCHours(), now1.getUTCMinutes(), now1.getUTCSeconds());

  x2.domain([now_utc, now_utc1]);
  y2.domain([0, 5]);

		focus.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { return x(d.letter); })
			.attr("y", function(d) { return y(d.frequency); })
			.attr("width", function(d, i){
				if(i != data.length - 1){
					return x(data[i+1].letter) - x(data[i].letter);
				}else
					return width/2 - x(data[i].letter);
			})
			.attr("height", function(d) { return height - y(d.frequency); });

  focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);
  context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x2.range());


function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
	var t =	s.map(x2.invert, x2);
	t[0]=t[0].getTime()/1000 - 8*3600;
	t[1]=t[1].getTime()/1000 - 8*3600;
	console.log(t[0], t[1]);
    focus.select(".area").attr("d", area);
    focus.select(".axis--x").call(xAxis);
    var st = Math.floor(t[0]/86400);
	draw([t[0]-st*86400, t[1] - t[0]], focus, x, y, xAxis, yAxis);
}

function draw(interval, focus, x, y, xAxis, yAxis){
	console.log(interval);
	/*
	var I1 = [[900, 1800], [900, 3200]];
	I1 = [[0, 2400]];
	I1 = I1.map(function(num, idx){
		var x = num[0]%100;
		var y = num[1]%100;
		num[0] = (num[0] - x)/100;
		num[1] = (num[1] - y)/100;
		return [num[0]*3600 + x*60, (num[1]-num[0])*3600 + (y-x)*60];
	});

	console.log(I1);*/
	var I1 = [interval]
	var data3 = service.getFrequencyVectorDaily(I1);
	//var data3 = service.binning(interval, 86400, 3600);


	data3 = data3.map(function(x, i){
		var now = new Date(i*1000*3600);
		var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
		return {"letter":now_utc, "frequency":x}
	});
	x.domain([d3.min(data3, function(x){return x.letter;}), d3.max(data3, function(x){return x.letter;})]);
	y.domain([0, d3.max(data3, function(x){return x.frequency;})]);

	focus.selectAll(".axis--x").call(xAxis);
	focus.selectAll(".axis--y").call(yAxis);

	console.log(data3);
	d3.selectAll(".bar").remove()
		focus.selectAll(".bar")
			.data(data3)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function(d) { return x(d.letter); })
			.attr("y", function(d) { return y(d.frequency); })
			.attr("width", function(d, i){
				if(i != data3.length - 1){
					return x(data3[i+1].letter) - x(data3[i].letter);
				}else
					return width/2 - x(data3[i].letter);
			})
			.attr("height", function(d) { return height - y(d.frequency); });
}
/*
	$scope.loaded = false;

	var offset = (new Date(2017,4,15)).getTime();//to ensure that time start from 00:00 hours on x axis

	dataservice.getDataAsync().then(function(data){
		data.forEach(function(d, i){
			d.letter = new Date(d.letter*1000*3600 + offset);
		});

		//create chart
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
	*/
}]);

