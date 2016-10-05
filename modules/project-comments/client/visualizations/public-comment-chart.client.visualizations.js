'use strict';

angular.module('comment')
	.directive('tmplPublicCommentChart', directivePublicCommentChart);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Project Main
//
// -----------------------------------------------------------------------------------
directivePublicCommentChart.$inject = ['d3', '$window'];
/* @ngInject */
function directivePublicCommentChart(d3, $window) {
	var directive = {
		restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
		replace: true,
		scope: {
			data: '=',
			refresh: '='
		},
		template: '<div></div>',
		link: function (scope, element, attrs) {
			/* =======================================================================================
			 *
			 *  Activities
			 *
			 * ==================================================================================== */
			// alias our global d3
			function getSize(d) {
				var bbox = this.getBBox(),
					cbbox = this.parentNode.getBBox(),
					scale = Math.min(cbbox.width/bbox.width, cbbox.height/bbox.height);
					d.scale = scale;
			}

			var box = angular.element(element);
			var grw = box[0].parentNode;
			var bw = grw.offsetWidth-30;

			var diameter = 500,
				format = d3.format(",d"),
				color = d3.scale.category20c();

			var bubble = d3.layout.pack()
				.sort(null)
				.size([diameter, diameter])
				.padding(1.5);

			var svg = d3.select('#' + attrs.id).append("svg")
				.attr('id', 'svg' + attrs.id)
				.attr("viewBox","0 0 500 500")
				.attr("perserveAspectRatio","xMinYMid")
				.attr("width", diameter)
				.attr("height", diameter)
				.attr("class", "bubble");

			scope.$watch('refresh', function(root) {
				// console.log ('refresh changed to ', root);
			  if (root && scope.data.children.length > 0) {
			  	// console.log ('starting the visualization render');
				var node = svg.selectAll(".node")
					.data(bubble.nodes(classes(scope.data))
					.filter(function(d) { return !d.children; }))
					.enter().append("g")
					.attr("class", "node")
					.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

				node.append("title")
					.text(function(d) { return d.name + ':' + format(d.value); });

				node.append("circle")
					.attr("r", function(d) { return d.r; })
					.style("fill", function(d) { return '#337ab7'; });

				node.append("text")
					.attr("dy", ".3em")
					.text(function(d) { return d.name; })
					.style("text-anchor", "middle")
					.style('fill', '#ffffff')
					.each(getSize)
					.style("font-size", function(d) {
						var len = d.name.length;
						var size = (d.r-10)/3;
						size *= 10 / len;
						size += 1;
						return Math.round(size)+'px';
					});
					// .style("font-size", function(d) { return (d.scale/2) + "em"; });
			  }
			});

			// Returns a flattened hierarchy containing all leaf nodes under the root.
			function classes(root) {
				var childClasses = [];

			  function recurse(name, node) {
				if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
				else childClasses.push({packageName: name, name: node.name, value: node.size});
			  }

			  recurse(null, root);
			  return {children: childClasses};
			}


			var resize =  function() {
				bw = box[0].clientWidth;

				var chart = box[0].children[0];

				chart.setAttribute("width", bw);
				chart.setAttribute("height", bw);
			};

			resize();

			d3.select(window).on(('resize.' + attrs.id), resize);





		} // close link
	};
	return directive;
}
