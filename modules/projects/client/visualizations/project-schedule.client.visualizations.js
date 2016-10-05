'use strict';







angular.module('project')
	.directive('tmplScheduleTimeline', directiveScheduleTimeline);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Project Schedule
//
// -----------------------------------------------------------------------------------
directiveScheduleTimeline.$inject = ['d3', '$window', '_', 'moment', 'Authentication'];
/* @ngInject */
function directiveScheduleTimeline(d3, $window, _, moment, Authentication) {
	var directive = {
		restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
		replace: true,
		scope : {
			phases: '='
		},
		template: '<div class="svg-div-timeline"></div>',
		link: function (scope, element, attrs) {

			var oPhaseDetail, oPhaseStart, oPhaseEnd, posPhaseStart, posPhaseEnd, posToday, oPhases;

			var colourScale = d3.scale.ordinal()
				.domain(scope.phases)
				.range(['#0096E5','#0098DB','#009BD1','#009EC7','#00A1BD','#00A4B3','#00A7A9','#00AA9F','#00AD95','#00B08B','#00B381','#00B677','#00B96D','#00BC63','#00BF59']);

			// get just the start dates.
			var startDates = _.map(scope.phases, function(item) {
				return moment( new Date( (item.dateStarted || item.dateStartedEst) ));
			});

			// get just the end dates.
			var endDates = _.map(scope.phases, function(item) {
				return moment( new Date( (item.dateCompleted || item.dateCompletedEst) ));
			});

			// find the max and min dates for the outermost boudaries
			var startDate = moment(_.min(startDates));
			var endDate = moment(_.max(endDates));

			//
			var resize =  function() {
				// get measurements of the paretn
				var box = angular.element(element);
				var grw = box[0].parentNode;
				var bw = grw.offsetWidth || 300;
				var bh = 100;
				if(!Authentication.user) {
					bh = 55;  // We won't include phase start/end/% for public.
				}
				var phaseWidth = ((bw - 60) / oPhases.length);

				// map the date scale to the page scale.
				var dateScale = d3.scale.linear()
					.domain([startDate.format('x'),endDate.format('x')])
					.range([30,bw-30]);

				// if there is already one of these, delete it.  Used for the refresh.
				if (d3.select(element[0]).select("svg")) {
					d3.select(element[0]).select("svg").remove();
				}

				// get today's position
				posToday = Math.floor( dateScale( moment().format('x') ));

				// create the new chart object.
				var svgCont = d3.select(element[0]).append("svg").attr("viewBox", "0 0 "+bw+" "+bh);

				// background
				svgCont.append("rect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width",bw)
					.attr("height",bh)
					.style("fill", "#ffffff")
				;

				// graph background colour
				svgCont.append("rect")
					.attr("x", 30)
					.attr("y", 2)
					.attr("width",bw-60)
					.attr("height",28)
					.style("fill", "#f4f4f4")
				;


				// // not logged in, show progress up to the today marker.
				// if(!Authentication.user) {
				// 	svgCont.append("rect")
				// 		.attr("x", 30)
				// 		.attr("y", 2)
				// 		.attr("width", (posToday - 30))
				// 		.attr("height",28)
				// 		.style("fill", function() { return "#5cb85c"; })
				// 	;
				// }


				// draw each phase
				for (var i = 0; i < oPhases.length; i++) {
					oPhaseDetail = oPhases[i];

					// if (!oPhaseDetail.dateStarted && !oPhaseDetail.dateStartedEst) {
					// 	continue;
					// }

					oPhaseStart = moment(new Date((oPhaseDetail.dateStarted || oPhaseDetail.dateStartedEst )));
					oPhaseEnd = moment(new Date((oPhaseDetail.dateCompleted || oPhaseDetail.dateCompletedEst )));

					posPhaseStart = (phaseWidth * i) + 30; //dateScale( oPhaseStart.format('x') );
					posPhaseEnd = (phaseWidth * (i + 1)) + 30; //dateScale( oPhaseEnd.format('x') );

					// progress fill.
					if(Authentication.user) {
						svgCont.append("rect")
							.attr("x", posPhaseStart)
							.attr("y", 2)
							.attr("width", (posPhaseEnd - posPhaseStart) * ((oPhaseDetail.progress)/100) ) 
							.attr("height",28)
							.style("fill", function() { 
								return (oPhaseDetail.progress === 100) ? "#5cb85c" : "#f0ad4e";
							})
							.attr("title", oPhaseDetail.name)
						;
					} else {
						// Just show completed phases fill for now.
						svgCont.append("rect")
							.attr("x", posPhaseStart)
							.attr("y", 2)
							.attr("width", (posPhaseEnd - posPhaseStart) )
							.attr("height",28)
							.style("fill", function() {
								return (oPhaseDetail.progress === 100) ? "#5cb85c" : "#ffffff";
							})
							.attr("title", oPhaseDetail.name)
						;
					}

					// transparent white to blend overlapping text.
					svgCont.append("rect")
						.attr("x", posPhaseStart)
						.attr("y", 31)
						.attr("width", posPhaseEnd - posPhaseStart)
						.attr("height", 69)
						.style("fill", "rgba(255,255,255,0.65)")
					;

					// phase start post.
					svgCont.append("line")
						.attr("x1", posPhaseStart)
						.attr("y1", 2)
						.attr("x2", posPhaseStart)
						.attr("y2", 100)
						.style('stroke-width', '0.5px')
						.style('stroke', '#111111')
					;

					// top of the bar.
					svgCont.append("line")
						.attr("x1", posPhaseStart)
						.attr("y1", 2)
						.attr("x2", posPhaseEnd)
						.attr("y2", 2)
						.style('stroke-width', '0.5px')
						.style('stroke', '#111111')
					;

					// end marker for the phase

					svgCont.append("line")
						.attr("x1", posPhaseEnd)
						.attr("y1", 2)
						.attr("x2", posPhaseEnd)
						.attr("y2", 100)
						.style('stroke-width', '0.5px')
						.style('stroke', '#111111')
					;


					// Draw Phase Bar Title
					svgCont.append("text")
						.attr("x", posPhaseStart)
						.attr("y", 40)
						.attr("dx", "5px")		// Offset Horizontal position
						.attr("dy", "7px")		// Offset vertical position
						.style("font-size", "10px")
						.text(oPhaseDetail.name) 		// Phase Name / Description
					;

					if(Authentication.user) {
						// We will include phase start/end for non-public.
						svgCont.append("text")
							.attr("x", posPhaseStart)
							.attr("y", 40)
							.attr("dx", "5px")
							.attr("dy", "22px")
							.style("font-size", "9px")
							.text(oPhaseStart.format("YYYY MMM DD"))
							.attr('title', 'End Date')
						;

						// Draw start date
						svgCont.append("text")
							.attr("x", posPhaseStart)
							.attr("y", 40)
							.attr("dx", "5px")
							.attr("dy", "37px")
							.style("font-size", "9px")
							.text(oPhaseEnd.format("YYYY MMM DD"))
							.attr('title', 'End Date')
						;
					}

					if(Authentication.user) {
						// Draw start date
						svgCont.append("text")
							.attr("x", posPhaseStart)
							.attr("y", 40)
							.attr("dx", "5px")
							.attr("dy", "52px")
							.style("font-size", "9px")
							.text(oPhaseDetail.progress + '%')
							.attr('title', 'Percent Completion')
						;
						// Draw the bottom line
						svgCont.append("line")
							.attr("x1", posPhaseStart)
							.attr("y1", bh-1)
							.attr("x2", posPhaseEnd)
							.attr("y2", bh-1)
							.style('stroke-width', '0.5px')
							.style('stroke', '#111111')
						;
					} else {
						// Draw start date
						// svgCont.append("text")
						// 	.attr("x", posPhaseStart)
						// 	.attr("y", 40)
						// 	.attr("dx", "5px")
						// 	.attr("dy", "22px")
						// 	.style("font-size", "9px")
						// 	.text(oPhaseDetail.progress + '%')
						// 	.attr('title', 'Percent Completion')
						// ;
						// Draw the bottom line
						svgCont.append("line")
							.attr("x1", posPhaseStart)
							.attr("y1", bh-1)
							.attr("x2", posPhaseEnd)
							.attr("y2", bh-1)
							.style('stroke-width', '0.5px')
							.style('stroke', '#111111')
						;
					}
				}

				// origin line
				svgCont.append("line")
					.attr("x1", 30)
					.attr("y1", 30)
					.attr("x2", bw-30)
					.attr("y2", 30)
					.style('stroke-width', '0.5px')
					.style('stroke', '#000000')
					.attr("class", "svg-line")
				;


				

				// if (posToday) {

				// 	// Draw todays date marker
				// 	// Center Line of Todays date marker
				// 	svgCont.append("line")
				// 		.attr("x1", posToday)
				// 		.attr("y1", 0)
				// 		.attr("x2", posToday)
				// 		.attr("y2", 32)
				// 		.style('stroke-width', '3px')
				// 		.style('stroke', '#337ab7')
				// 	;

				// 	// Left edge line of Todays date marker
				// 	svgCont.append("line")
				// 		.attr("x1", posToday - 3)
				// 		.attr("y1", 0)
				// 		.attr("x2", posToday - 3)
				// 		.attr("y2", 32)
				// 		.style('stroke-width', '1px')
				// 		.style('stroke', '#dddddd')
				// 		.attr('title', 'Today')
				// 	;

				// 	// Right edge line of Todays date marker
				// 	svgCont.append("line")
				// 		.attr("x1", posToday + 3)
				// 		.attr("y1", 0)
				// 		.attr("x2", posToday + 3)
				// 		.attr("y2", 32)
				// 		.style('stroke-width', '1px')
				// 		.style('stroke', '#dddddd')
				// 	;
				// }

			};

			// bind the resize to the window
			d3.select(window).on(('resize.' + attrs.id), resize);

			scope.$watch('phases', function(newValue) {
				if (newValue) {
					oPhases = newValue;
					resize();
				}
			});

		} // close link
	};
	return directive;
}
