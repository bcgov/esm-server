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
					console.log(newValue, scope.percentage);
					var el = $compile('<div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" style="width: ' + newValue + '%;">Est. ' + newValue + '%</div></div>')(scope);
					element.replaceWith(el);
				}
			});
		}
	}
	return directive;
}
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Progress Circle
//
// -----------------------------------------------------------------------------------
directiveProgressCircle.$inject = ['d3Service', '$window'];
/* @ngInject */
function directiveProgressCircle(d3Service, $window) {
    var directive = {
        restrict: 'E',
        replace: true,
		scope: {
			percentage: '=',
			subtext: '@',
			maxWidth: '@',
			instance: '='
		},
		template: '<svg class="d3-progress-circle" id="svg-percentage-{{ inst }}"></svg>',
		link: function (scope, element, attrs) {

			scope.$watch('instance', function(newValue) {
				scope.inst = newValue;
			});

			if (!scope.percentage) scope.percentage = 40;

			d3Service.d3().then(function(d3) {
			
			
				// -----------------------------------------------------------------------------------
				//
				// D3: PIE Code
				//
				// -----------------------------------------------------------------------------------
				
				var scale = d3.scale.linear().domain([0,100]).range([0, 2 * Math.PI]);
				
				var pie = function(fwdth) {
					var frad = parseInt(fwdth/2);
					console.log(fwdth, frad);
					return d3.svg.arc()
						.innerRadius(frad - fwdth)
						.outerRadius(frad)
						.startAngle(function (d) {
							return scale(d[0]);
						})
						.endAngle(function (d) {
							return scale(d[1]);
						});					
				};
				
				var arc = function (elem, id, options, data) {
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
					//
					// select the initial svg element as passed in
					//

					var vis = d3.select(elem[0])
                        .attr("viewBox","0 0 500 500")
                        .attr("perserveAspectRatio","xMinYMid")
						.attr("perc", ''+ scope.percentage)
						.attr("caption", scope.subtext)
						.attr("width", opts.width)
						.attr("height", opts.width);

					//
					// this caches the selection to allow for multiple appends
					//
					var enterSelection = vis.selectAll('path')
						.data(data)
						.enter();
					//
					// append the pie arcs showing reality
					//
					enterSelection
						.append('path')
						.attr('id', function (d, i) {
							return id + i;
						})
						.attr('d', pie(opts.width))
						.attr('transform', centre)
						.style('fill', function (d) {
							return d[2];
						});
					
						vis.append("text")
						.attr("class","mainText")
						.attr("text-anchor", "middle")
						.style("font-size","7em")
						.style("line-height","1em")
						.style("font-weight","bold")
						.style("fill","#ffffff")						
						.attr("x", opts.centre[0])
						.attr("y", opts.centre[1])
						.attr("dy", ".3em")
						.text(scope.percentage + '%');

						if (scope.subtext) {
							vis.append("text")
							.attr("class","subText")
							.attr("text-anchor", "middle")
							.style("font-size","2em")
							.style("line-height","1em")
							.style("font-weight","normal")
							.style("fill","#ffffff")						
							.attr("x", opts.centre[0])
							.attr("y", opts.centre[1] +25)
							.attr("dy", "1.55em")
							.text(scope.subtext);
						}
					}
				// -----------------------------------------------------------------------------------
				//
				// D3: END PIE Code
				//
				// -----------------------------------------------------------------------------------

				var bw; 

				var resize =  function() {
                    bw = angular.element(element)[0].parentNode.clientWidth-30;

                    var chart = angular.element(element)[0];

                    console.log(chart, bw);

                    chart.setAttribute("width", bw);
                    chart.setAttribute("height", bw);
                };

                d3.select(window).on('resize', resize);


				arc (angular.element(element), 'arcs', {},[
					[0, scope.percentage, "#5cb85c"],
					[scope.percentage, 100, "#c0c0c0"]
				]);

				resize();

			});

		}
	}
	return directive;
}