  'use strict';

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
			console.log(iAttrs);
          var svg = d3.select(iElement[0])
              .append("svg")
              .attr("width", "100%");
        svg.attr('height', 3*35);

          // on window resize, re-render d3 canvas
          window.onresize = function() {
            return scope.$apply();
          };
          scope.$watch(function(){
              return angular.element(window)[0].innerWidth;
            }, function(){
              return scope.render(scope.data);
            }
          );

          // watch for data changes and re-render
          scope.$watch('data', function(newVals, oldVals) {
            return scope.render(newVals);
          }, true);

          // define render function
          scope.render = function(data){
            // remove all previous items before render
            //svg.selectAll("*").remove();
console.log(data);
			var bars = svg.selectAll(".bar").data(data, function(d) { return d.score; }) // (data) is an array/iterable thing, second argument is an ID generator function


bars.exit()
    .transition()
      .duration(300)
    .attr("y", function(d, i){return i * 35;})
    .attr("height", 10)
    .style('fill-opacity', 1e-6)
    .remove();

  // data that needs DOM = enter() (a set/selection, not an event!)
  bars.enter().append("rect")
    .attr("class", "bar")
    .attr("y", function(d, i){return i * 35;})
    .attr("height", 10);

var max=98, width=576;

  // the "UPDATE" set:
  bars.transition().duration(300).attr("x", function(d) { return 10; }) // (d) is one item from the data array, x is the scale object from above
    .attr("width", function(d){
		return d.score/(max/width);
	}) // constant, so no callback function(d) here
    .attr("y",  function(d, i){return i * 35;})
    .attr("height", function(d) { return 10; }); // flip the height, because y's domain is bottom up, but SVG renders top down
          };
        }
      };
    });


