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
}])

.controller('View2Ctrl', ['myApp.view2.DataService', '$scope', function(dataservice, $scope) {

	$scope.loaded = false;

	var offset = (new Date(2017,4,15)).getTime();//to ensure that time starts from Monday 00:00

	console.log(offset);
	dataservice.getDataAsync().then(function(data){
		data.forEach(function(d, i){
			d.letter = new Date(d.letter*1000*3600 + offset);
			if(i%24==0)console.log(d.letter);
		});
		console.log(d3.max(data, function(d) { return d.letter; }));

		//create chart
		var	margin = {top: 20, right: 20, bottom: 80, left: 60};

		var svg = d3.select("svg").append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
			svg1 = d3.select("svg"),
		    width = +svg1.attr("width") - margin.left - margin.right,
			height = +svg1.attr("height") - margin.top - margin.bottom;

		var	x = d3.scaleTime().rangeRound([0, width]),
			y = d3.scaleLinear().rangeRound([height, 0]);
		x.domain([d3.min(data, function(d) { return d.letter; }), d3.max(data, function(d) { return d.letter; })]);
		y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

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
			.call(yAxis);

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


//Following part does not work. The sole purpose I tried this was to encapsulate chart functionality for both the views into one
//This was taken from http://bl.ocks.org/biovisualize/5372077 and modified for d3 version 4.
/*
.controller('mainCtrl', function AppCtrl ($scope) {
            $scope.options = {width: 500, height: 300, 'bar': 'aaa'};
            $scope.data = [1, 2, 3, 4];
            $scope.hovered = function(d){
                $scope.barValue = d;
                $scope.$apply();
            };
            $scope.barValue = 'None';
        })
        .directive('barChart', function(){
            var chart = d3.custom.barChart();
            return {
                restrict: 'E',
                replace: true,
                template: '<div class="chart"></div>',
                scope:{
                    height: '=height',
                    data: '=data',
                    hovered: '&hovered'
                },
                link: function(scope, element, attrs) {
                    var chartEl = d3.select(element[0]);
                    chart.on('customHover', function(d, i){
                        scope.hovered({args:d});
                    });

                    scope.$watch('data', function (newVal, oldVal) {
                        chartEl.datum(newVal).call(chart);
                    });

                    scope.$watch('height', function(d, i){
                        chartEl.call(chart.height(scope.height));
                    })
                }
            }
        })
        .directive('chartForm', function(){
            return {
                restrict: 'E',
                replace: true,
                controller: function AppCtrl ($scope) {
                    $scope.update = function(d, i){ $scope.data = randomData(); };
                    function randomData(){
                        return d3.range(~~(Math.random()*50)+1).map(function(d, i){return ~~(Math.random()*1000);});
                    }
                },
                template: '<div class="form">' +
                        'Height: {{options.height}}<br />' +
                        '<input type="range" ng-model="options.height" min="100" max="800"/>' +
                        '<br /><button ng-click="update()">Update Data</button>' +
                        '<br />Hovered bar data: {{barValue}}</div>'
            }
        });
;
*/
