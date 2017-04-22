'use strict';
//http://www.ng-newsletter.com/posts/d3-on-angular.html
angular.module('myApp')
	.directive('d3Bars', function() {
		return {
			restrict: 'EA',
			scope: {
				data: "=",
				label: "@",
				onClick: "&"
			},
			link: function(scope, iElement, iAttrs) {

				var	margin = {top: iAttrs.marginTop, right: iAttrs.marginRight, bottom: iAttrs.marginBottom, left: iAttrs.marginLeft};
				var svg = d3.select(iElement[0])
					.append("svg")
					.attr("width", iAttrs.width)
					.attr('height', iAttrs.height);

				svg = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				var width = iAttrs.width - margin.left - margin.right;
				var height = iAttrs.height - margin.top - margin.bottom;


				var	x = d3.scaleTime().rangeRound([0, width]),
					y = d3.scaleLinear().rangeRound([height, 0]);

				svg.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", -80)
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
					.ticks(scope.ticks);

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

				var diff = Math.floor(scope.data[scope.data.length-1].letter - scope.data[scope.data.length-2].letter);
				var maxDate = new Date(scope.data[scope.data.length-1].letter.getTime() + diff);
				x.domain([d3.min(scope.data, function(d) { return d.letter; }), maxDate]);
				y.domain([0, d3.max(scope.data, function(d) { return d.frequency; })]);


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

				var bars2 = svg.selectAll(".bar").data(scope.data, function(d) { return d.frequency; });

				bars2.enter().append("rect")
					.attr("class", "bar")
					.attr("x", function(d) { return x(d.letter); })
					.attr("y", function(d) { return y(d.frequency); })
					.attr("width", function(d, i){
						if(i != scope.data.length - 1){
							return x(scope.data[i+1].letter) - x(scope.data[i].letter);
						}else
							return x(maxDate) - x(scope.data[i].letter);
					})
					.attr("height", function(d) { return height - y(d.frequency); });

				// on window resize, re-render d3 canvas
				window.onresize = function() {
					return scope.$apply();
				};
				scope.$watch(function(){
					return angular.element(window)[0].innerWidth;
				}, function(){
					return scope.render(scope.data);
				});

				// watch for data changes and re-render
				scope.$watch('data', function(newVals, oldVals) {
					return scope.render(newVals);
				}, true);

				// define render function
				scope.render = function(data){
					if(!data)return;
					//console.log(data);
					x.domain([d3.min(data, function(d) { return d.letter; }), maxDate]);
					y.domain([0, d3.max(data, function(d) { return d.frequency; })]);
					svg.select('.x.axis').transition().duration(2000).call(xAxis);
					svg.select(".y.axis").transition().duration(2000).call(yAxis);

					// remove all previous items before render
					//svg.selectAll("*").remove();
					var bars = svg.selectAll(".bar").data(data);

					bars.exit()
						.transition()
						.duration(1000)
						.attr("y", 0)
						.style('fill-opacity', 1e-6)
						.remove();

					// data that needs DOM = enter() (a set/selection, not an event!)
					// the "UPDATE" set:
					bars
						.transition().duration(2000)
						.attr("x", function(d) { return x(d.letter); })
						.attr("y", function(d) { return y(d.frequency); })
						.attr("width", function(d, i){
							if(i != data.length - 1){
								return x(data[i+1].letter) - x(data[i].letter);
							}else
								return x(maxDate) - x(data[i].letter);
						})
						.attr("height", function(d) { return height - y(d.frequency); })
					bars.on('mouseover', tip.show)
						.on('mouseout', tip.hide);
				};
			}
		};
	});
