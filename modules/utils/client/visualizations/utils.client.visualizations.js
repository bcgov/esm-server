'use strict';

angular.module('utils')
    .directive('tmplProgressBar', directiveProgressBar)
    .directive('tmplProgressCircle', directiveProgressCircle);

// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Progress Bar
//
// -----------------------------------------------------------------------------------
directiveProgressBar.$inject = ['$compile'];
/* @ngInject */
function directiveProgressBar($compile) {
    var directive = {
        restrict: 'E',
		scope: {
			percentage: '='
		},
		link: function(scope, element, attrs) {
			scope.$watch('percentage', function(newValue) {
				if (newValue !== undefined) {
					var el = $compile('<div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" style="width: ' + newValue + '%;">Est. ' + newValue + '%</div></div>')(scope);
					element.replaceWith(el);
				}
			});
		}
	};
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Progress Circle
//
// -----------------------------------------------------------------------------------
directiveProgressCircle.$inject = ['d3', '$window', '_'];
/* @ngInject */
function directiveProgressCircle(d3, $window, _) {
    var directive = {
        restrict: 'E',
        replace: true,
		scope: {
			percentage: '=',
			subtext: '@',
			maxWidth: '@'
		},
		template: '<svg class="d3-progress-circle"></svg>',
		link: function (scope, element, attrs) {

			scope.$watch('percentage', function(newValue) {
				if(newValue !== undefined) {
					drawProgressPie (angular.element(element), 'arcs', {}, [
							[newValue, "#5cb85c"],
							[(100 - newValue), "#c0c0c0"]
						]
					);
					resize();
				}
			});


			// -----------------------------------------------------------------------------------
			//
			// D3: PIE Code
			//
			// -----------------------------------------------------------------------------------

			var drawProgressPie = function (elem, id, options, data) {
				//
				// ensure no surprises
				//
				var opts = _.extend ({
					radius: 245,
					width: 500,
					centre: [250,250],
					colour: '#AA8888',
					start: 0,
					end: 50,
				}, options);
				//
				// set the scale to be used for all measurements
				//

				//
				// make the centre string for translation
				//
				var centre = 'translate('+opts.centre.join()+')';


				var vis = d3.select(elem[0])
				.attr("viewBox","0 0 500 500")
				.attr("perserveAspectRatio","xMinYMid")
				.data([data])
				.attr("width", opts.width)
				.attr("height", opts.height)
				.append("svg:g")
				.attr("transform", "translate(" + opts.centre.join() + ")");

				// negative value to reverse the direction of drawing
				var pie = d3.layout.pie().value(function(d){return (-1 * d[0]);});

				// declare an arc generator function
				var arc = d3.svg.arc().outerRadius(opts.radius);

				// select paths, use arc generator to draw
				var arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
				arcs.append("svg:path")
				.attr("fill", function(d, i){
				   return d.data[1];
				})
				.attr("d", function (d) {
				   // log the result of the arc generator to show how cool it is :)
				   return arc(d);
				});

				
				vis.append("svg:text")
					.attr("class","mainText")
					.attr("text-anchor", "middle")
					.style("font-size","7em")
					.style("line-height","1em")
					.style("font-weight","bold")
					.style("fill","#ffffff")
					.attr("dy", "0.1em")
					.text(scope.percentage + '%');

				if (scope.subtext) {
					vis.append("svg:text")
						.attr("class","subText")
						.attr("text-anchor", "middle")
						.style("font-size","2em")
						.style("line-height","1em")
						.style("font-weight","normal")
						.style("fill","#ffffff")
						.attr("dy", "2em")
						.text(scope.subtext);
				}
			};
			// -----------------------------------------------------------------------------------
			//
			// D3: END PIE Code
			//
			// -----------------------------------------------------------------------------------

			var bw; 

			var resize =  function() {
                    bw = angular.element(element)[0].parentNode.clientWidth-30;

                    var chart = angular.element(element)[0];

                    chart.setAttribute("width", bw);
                    chart.setAttribute("height", bw);
                };

	          d3.select(window).on('resize', resize);



		}
	};
	return directive;
}
