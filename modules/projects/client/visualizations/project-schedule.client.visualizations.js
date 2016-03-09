'use strict';







	

	






angular.module('projects')
	.directive('tmplScheduleChart', directiveScheduleChart);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE: Public Project Schedule
//
// -----------------------------------------------------------------------------------
directiveScheduleChart.$inject = ['d3', '$window'];
/* @ngInject */
function directiveScheduleChart(d3, $window) {
	var directive = {
		restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
		replace: true,
		template: '<div class="svg-div-root"></div>',
		link: function (scope, element, attrs) {

			var bTodayMarker = true;
			var _DEBUG = false;
			var _NumberOfMonths = 5;
			var _NumberOfPreceedingMonths = 1;
			var _MonthLen = 31;   // # days per month
			var _DayScale = 1;    // Width of each day in pixels
			var _BarHeight = 7;

			var color = d3.scale.category20c();

			var msOneDay=1000*60*60*24;	 // Value of 1 day in milliseconds
			var dDateToday = new Date(); // Fetch todays -1 month date for comparison
			dDateToday.setDate(dDateToday.getDate() - (_NumberOfPreceedingMonths * _MonthLen))	
			var _DrawPhase = false;

			var minVal = 0;

			var rngMaxDate = new Date;
			rngMaxDate.setDate(rngMaxDate.getDate() + ((_NumberOfMonths - _NumberOfPreceedingMonths) * _MonthLen));
			var maxVal = (rngMaxDate - dDateToday)/msOneDay

			var sDateStart = new Date;
			var sDateEnd = new Date;

			if (_DEBUG){
				console.log("Project Name: "+oProjectData.name);
				console.log("      minVal: "+minVal);
				console.log("      maxVal: "+maxVal);
				console.log("       Today: "+dDateToday);
			};

			var svgCont = d3.select(element[0]).append("svg")
				.attr("preserveAspectRatio", "xMinYMin meet")
				.attr("viewBox", "0 0 "+((Math.abs(minVal)+Math.abs(maxVal))*_DayScale)+" "+_BarHeight);
			
			svgCont.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width",((Math.abs(minVal)+Math.abs(maxVal))*_DayScale))
				.attr("height",_BarHeight)
				.attr("class","svg-background")
			;

			if(bTodayMarker){
				// Draw todays date marker
				// Center Line of Todays date marker
				svgCont.append("line") 
					.attr("x1", _MonthLen * _DayScale) 
					.attr("y1", 0) 
					.attr("x2", _MonthLen * _DayScale) 
					.attr("y2", _BarHeight) 
					.attr("class", "projectToday-line")
				;
			}


			var oPhases = [
				{
					"dateStart": "Sun, 013 Mar 2015 19:22:10 -0700",
					"dateEnd": "Mon, 07 Mar 2016 19:22:10 -0700",
					"name": "Initiation"
				},
				{
					"dateStart": "Fri, 14 Aug 2015 19:22:10 -0700",
					"dateEnd": "Sat, 12 Dec 2015 19:22:10 -0700",
					"name": "Planning"
				},
				{
					"dateStart": "Sat, 16 Apr 2016 19:22:10 -0700",
					"dateEnd": "Tue, 17 May 2016 19:22:10 -0700",
					"name": "Closing"
				}
			];
			var oPhaseDetail;
			var sPhaseName;
			
		
			for (var i = 0; i < oPhases.length; i++) {
				_DrawPhase = false;
				oPhaseDetail = oPhases[i]
				sPhaseName = oPhaseDetail.name;
				sDateStart = new Date(oPhaseDetail.dateStart);
				sDateEnd = new Date(oPhaseDetail.dateEnd);
				
				var sDiff = (sDateStart-dDateToday)/msOneDay;
				var eDiff = (sDateEnd-dDateToday)/msOneDay;
				
				if (_DEBUG){
					console.log("Phase "+i+": "+sPhaseName);
					console.log("  Start ("+sDiff+") : "+sDateStart);
					console.log("    End ("+eDiff+"): "+sDateEnd);
				}
				
				// Is the date within the bounds of the display?
				if ((sDiff >= minVal && sDiff <= maxVal) && (eDiff >= minVal && eDiff <= maxVal)){
					// Entire phase fits within the display bar, draw it all
					var x1 = sDiff *_DayScale; // phase start
					var x2 = (eDiff - sDiff) * _DayScale; // phase end
					_DrawPhase = true;
					if (_DEBUG){
						console.log("	Draw Phase (all) "+x1+" "+x2 );
					}			
				} else if (sDiff >= minVal && sDiff <= maxVal){
					// Only the start of the phase fits within the display bar
					var x1 = sDiff * _DayScale; // phase start 
					var x2 = (maxVal-sDiff) * _DayScale; // phase end
					_DrawPhase = true;
					if (_DEBUG){
						console.log("	Draw Phase (start): "+x1+" "+x2 );
					}
				} else if (eDiff >= minVal && eDiff <= maxVal){
					x1=minVal;
					x2=eDiff * _DayScale;
					_DrawPhase = true;
					if (_DEBUG){
						console.log("	Draw Phase (end):  "+eDiff+" >= "+minVal+" && "+eDiff+" <= "+maxVal+")");
					}
				} else {
					if (_DEBUG){
						console.log("	Do NOT Draw Phase");
					}			
				}
				if(_DrawPhase){
					svgCont.append("rect")
						.attr("x", x1)
						.attr("y", 0)
						.attr("width", x2)
						.attr("height",_BarHeight)
						.attr("fill", function() { return color(i+1); })
						.attr("stroke", function() { return color(i); })
						.attr("stroke-width", "0.5px")
					;
					// Draw Phase Title
					svgCont.append("text")
						.style("font-size", function() {return (_BarHeight/3); })
						.attr("x", x1)
						.attr("y", function() {return (_BarHeight/2); })
						.attr("dx", "2px") 	// Offset Horizontal position
						.attr("lengthAdjust", "spacingAndGlyphs") 	// Scale text (not just spacing)
						.style("text-anchor", "left")
						.text(sPhaseName) 	// Phase Name / Description
						.attr("fill", '#000000')
					;
					
				}
			};

			


		} // close link
	};
	return directive;
}
