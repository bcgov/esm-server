'use strict';







angular.module('project')
	.directive('tmplScheduleTimeline', directiveScheduleTimeline);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Project Schedule
//
// -----------------------------------------------------------------------------------
directiveScheduleTimeline.$inject = ['d3', '$window', '_', 'moment'];
/* @ngInject */
function directiveScheduleTimeline(d3, $window, _, moment) {
	var directive = {
		restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
		replace: true,
		scope : {
			phases: '='
		},
		template: '<div class="svg-div-timeline block-content"></div>',
		link: function (scope, element, attrs) {

			var oPhaseDetail, oPhaseStart, oPhaseEnd, posPhaseStart, posPhaseEnd, posToday, barHeight, oPhases;

			// get just the start dates.
			var startDates = _.map(oPhases, function(item) {
				return moment( new Date(item.dateStart) );
			});

			// get just the end dates.
			var endDates = _.map(oPhases, function(item) {
				return moment( new Date(item.dateEnd) );
			});

			// find the max and min dates for the outermost boudaries
			var startDate = moment(_.min(startDates));
			var endDate = moment(_.max(endDates));

			//
			var resize =  function() {
				// get measurements of the paretn
				var box = angular.element(element);
				var grw = box[0].parentNode;
				var bw = grw.offsetWidth;
				var bh = 100;

				// map the date scale to the page scale.
				var dateScale = d3.scale.linear()
					.domain([startDate.format('x'),endDate.format('x')])
					.range([30,bw-30]);

				// if there is already one of these, delete it.  Used for the refresh.
				if (d3.select(element[0]).select("svg")) {
					d3.select(element[0]).select("svg").remove();
				}

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

				
				// draw each phase
				for (var i = 0; i < oPhases.length; i++) {
					oPhaseDetail = oPhases[i];

					if (!oPhaseDetail.dateStart) {
						continue;
					}

					oPhaseStart = moment(new Date(oPhaseDetail.dateStart));
					oPhaseEnd = moment(new Date(oPhaseDetail.dateEnd));

					posPhaseStart = dateScale( oPhaseStart.format('x') );
					posPhaseEnd = dateScale( oPhaseEnd.format('x') );
		
					barHeight = 30-(28*((oPhaseDetail.progress)/100));

					svgCont.append("rect") 
						.attr("x", posPhaseStart)
						.attr("y", barHeight)
						.attr("width", posPhaseEnd - posPhaseStart)
						.attr("height", (28*((oPhaseDetail.progress)/100)))
						.style("fill", function() { return (oPhaseDetail.progress === 100) ? "#5cb85c" : "#f0ad4e"; })
						.attr("title", oPhaseDetail.name)
					;

					svgCont.append("line") 
						.attr("x1", posPhaseStart) 
						.attr("y1", 2) 
						.attr("x2", posPhaseStart) 
						.attr("y2", 100) 
						.style('stroke-width', '0.5px')
						.style('stroke', '#111111')
					;

					svgCont.append("line") 
						.attr("x1", posPhaseStart) 
						.attr("y1", barHeight) 
						.attr("x2", posPhaseEnd) 
						.attr("y2", barHeight) 
						.style('stroke-width', '0.5px')
						.style('stroke', '#111111')
					;

					svgCont.append("line") 
						.attr("x1", posPhaseEnd) 
						.attr("y1", barHeight) 
						.attr("x2", posPhaseEnd) 
						.attr("y2", 100) 
						.style('stroke-width', '0.5px')
						.style('stroke', '#111111')
					;


					// Draw Phase Bar Title
					svgCont.append("text")
						.attr("class","svg-phase-text")
						.attr("x", posPhaseStart)
						.attr("y", 40)
						.attr("dx", "5px")		// Offset Horizontal position
						.attr("dy", "7px")		// Offset vertical position
						.attr("lengthAdjust", "spacingAndGlyphs")	// Scale text (not just spacing)
						.text(oPhaseDetail.name) 		// Phase Name / Description
					;

					// Draw start date
					svgCont.append("text")
						.attr("class","small")
						.attr("x", posPhaseStart)
						.attr("y", 40)
						.attr("dx", "5px")
						.attr("dy", "22px")
						.attr("lengthAdjust", "spacingAndGlyphs")
						.text(oPhaseStart.format("YYYY MMM DD"))
						.attr('title', 'End Date')
					;

					// Draw start date
					svgCont.append("text")
						.attr("class","small")
						.attr("x", posPhaseStart)
						.attr("y", 40)
						.attr("dx", "5px")
						.attr("dy", "37px")
						.attr("lengthAdjust", "spacingAndGlyphs")
						.text(oPhaseEnd.format("YYYY MMM DD"))
						.attr('title', 'End Date')
					;

					// Draw start date
					svgCont.append("text")
						.attr("class","small")
						.attr("x", posPhaseStart)
						.attr("y", 40)
						.attr("dx", "5px")
						.attr("dy", "52px")
						.attr("lengthAdjust", "spacingAndGlyphs")
						.text(oPhaseDetail.progress + '%')
						.attr('title', 'Percent Completion')
					;										

				}


				// get today's position
				posToday = Math.floor(dateScale( moment().format('x') ));
				// Draw todays date marker
				// Center Line of Todays date marker
				svgCont.append("line") 
					.attr("x1", posToday) 
					.attr("y1", 0) 
					.attr("x2", posToday) 
					.attr("y2", 32) 
					.style('stroke-width', '3px')
					.style('stroke', '#337ab7')
				;

				// Left edge line of Todays date marker
				svgCont.append("line") 
					.attr("x1", posToday - 3) 
					.attr("y1", 0) 
					.attr("x2", posToday - 3) 
					.attr("y2", 32) 
					.style('stroke-width', '1px')
					.style('stroke', '#dddddd')	
					.attr('title', 'Today')
				;

				// Right edge line of Todays date marker
				svgCont.append("line") 
					.attr("x1", posToday + 3) 
					.attr("y1", 0) 
					.attr("x2", posToday + 3) 
					.attr("y2", 32) 
					.style('stroke-width', '1px')
					.style('stroke', '#dddddd')
				;

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
