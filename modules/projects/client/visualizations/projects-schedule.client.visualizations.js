'use strict';

angular.module('projects')
	.directive('tmplScheduleChart', directiveScheduleChart);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Project Schedule
//
// -----------------------------------------------------------------------------------
directiveScheduleChart.$inject = ['d3', '$window', '_', 'moment'];
/* @ngInject */
function directiveScheduleChart(d3, $window, _, moment) {
	var directive = {
		restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
		replace: true,
		scope: {
			project: '=',
			phases: '='
		},
		template: '<div class="svg-div-root"></div>',
		link: function (scope, element, attrs) {

			var oPhaseDetail, oPhaseStart, oPhaseEnd, posPhaseStart, posPhaseEnd, startOK, endOK, allPhases;
			var _DrawPhase, _DrawStart, _DrawEnd, _DrawComplete, posWinStart, posWinEnd;

			var colourScale = d3.scale.ordinal()
				.domain(scope.phases)
				.range(['#0096E5','#0098DB','#009BD1','#009EC7','#00A1BD','#00A4B3','#00A7A9','#00AA9F','#00AD95','#00B08B','#00B381','#00B677','#00B96D','#00BC63','#00BF59']); //d3.scale.category20c().domain(scope.phases);

			var oPhases = [];
			var bTodayMarker = true;
			var _NumberOfMonths = 5;
			var _NumberOfPreceedingMonths = 1;

			var dateWinStart = moment().subtract(_NumberOfPreceedingMonths, 'M').format('x'); // Fetch todays -1 month date for comparison

			var dateWinEnd = moment().add((_NumberOfMonths-_NumberOfPreceedingMonths), 'M').format('x'); // Fetch the last date.

			var resize =  function() {
				if (!oPhases) return;
				var box = angular.element(element);
				var grw = box[0].parentNode;
				var bw = grw.offsetWidth;
				var bh = grw.offsetHeight;


				// map the date scale to the page scale.
				// do it when the refresh happens.
				var dateScale = d3.scale.linear()
					.domain([dateWinStart, dateWinEnd])
					.range([0,bw]);

				posWinStart = dateScale(dateWinStart);
				posWinEnd = dateScale(dateWinEnd);

				// if there is already one of these, delete it.  Used for the refresh.
				if ( d3.select(element[0]).select("svg") ) {
					d3.select(element[0]).select("svg").remove();
				}

				var svgCont = d3.select(element[0]).append("svg")
					.attr("viewBox", "0 0 " + bw + " " + bh);

				svgCont.append("rect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width",bw)
					.attr("height",bh)
					.style("fill","#f4f4f4")
				;

				for (var i = 0; i < oPhases.length; i++) {
					_DrawPhase = false;
					_DrawStart = false;
					_DrawEnd = false;
					_DrawComplete = false;

					oPhaseDetail = oPhases[i];

					if (!oPhaseDetail.dateStarted && !oPhaseDetail.dateStartedEst) {
						continue;
					}

					// get the current phase actual dates, use for comparisson
					oPhaseStart = moment(new Date((oPhaseDetail.dateStarted || oPhaseDetail.dateStartedEst) ));
					oPhaseEnd = moment(new Date((oPhaseDetail.dateCompleted || oPhaseDetail.dateCompletedEst) ));

					// get the unix date for mapping to the dateScale.
					posPhaseStart = dateScale( oPhaseStart.format('x') );
					posPhaseEnd = dateScale( oPhaseEnd.format('x') );


					_DrawStart = ((posPhaseStart >= posWinStart) && (posPhaseStart <= posWinEnd));
					_DrawEnd = ((posPhaseEnd >= posWinStart) && (posPhaseEnd <= posWinEnd));
					_DrawComplete = ((posPhaseStart <= posWinStart) && (posPhaseEnd >= posWinEnd));

					if (_DrawStart && _DrawEnd) {
						_DrawPhase = true;
					}

					if (!_DrawStart && _DrawEnd) {
						posPhaseStart = posWinStart;
						_DrawPhase = true;
					}

					if (_DrawStart && !_DrawEnd) {
						posPhaseEnd = posWinEnd;
						_DrawPhase = true;
					}

					if (_DrawComplete) {
						posPhaseStart = posWinStart;
						posPhaseEnd = posWinEnd;
						_DrawPhase = true;
					}

					if(_DrawPhase){

						svgCont.append("rect")
							.attr("x", Math.floor(posPhaseStart))
							.attr("y", 0)
							.attr("width", Math.floor(posPhaseEnd - posPhaseStart))
							.attr("height",bh)
							.attr("fill", function() { return colourScale( oPhaseDetail.name ); })
						;
						// Draw Phase Title
						svgCont.append("text")
							.style("font-size", "12px")
							.attr("x", Math.floor(posPhaseStart))
							.attr("y", 14)
							.attr("dx", "2px") 	// Offset Horizontal position
							.style("text-anchor", "left")
							.text(oPhaseDetail.name) 	// Phase Name / Description
							.attr("fill", '#000000')
						;

					}
				}

				if(bTodayMarker){
					// Draw todays date marker
					// Center Line of Todays date marker
					svgCont.append("rect")
						.attr("x", (Math.floor(bw/_NumberOfMonths) * _NumberOfPreceedingMonths)-1 )
						.attr("y", 0)
						.attr("width", 3)
						.attr("height", bh)
						.attr("fill", "rgba(255,255,255,0.7)")
						.style("stroke-width", "0.5px")
						.style("stroke", "#000000")
					;
				}



			};

			// bind the resize to the window
			d3.select(window).on(('resize.' + attrs.id), resize);

			scope.$watch('project', function(newValue) {
				if (newValue && newValue.phases) {
					oPhases = newValue.phases;
					resize();
				}
			});


		} // close link
	};
	return directive;
}
