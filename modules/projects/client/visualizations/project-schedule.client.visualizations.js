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

      var oPhaseDetail, oPhaseStart, oPhaseEnd, posPhaseStart, posPhaseEnd, oPhases;

      //
      var resize = function() {
        // get measurements of the paretn
        var box = angular.element(element);
        var grw = box[0].parentNode;
        var bw = grw.offsetWidth || 300;
        var bh = 100;
        if(!Authentication.user) {
          bh = 55; // We won't include phase start/end/% for public.
        }
        var phaseWidth = ((bw - 60) / oPhases.length);

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
          .style("fill", "#ffffff");

        // graph background colour
        svgCont.append("rect")
          .attr("x", 30)
          .attr("y", 2)
          .attr("width",bw-60)
          .attr("height",28)
          .style("fill", "#f4f4f4");

        // draw each phase
        for (var i = 0; i < oPhases.length; i++) {
          oPhaseDetail = oPhases[i];

          oPhaseStart = moment(new Date((oPhaseDetail.dateStarted || oPhaseDetail.dateStartedEst )));
          oPhaseEnd = moment(new Date((oPhaseDetail.dateCompleted || oPhaseDetail.dateCompletedEst )));

          posPhaseStart = (phaseWidth * i) + 30;
          posPhaseEnd = (phaseWidth * (i + 1)) + 30;

          // progress fill.
          if(Authentication.user) {
            svgCont.append("rect")
              .attr("x", posPhaseStart)
              .attr("y", 2)
              .attr("width", (posPhaseEnd - posPhaseStart) * ((oPhaseDetail.progress)/100) )
              .attr("height",28)
              /* eslint-disable no-loop-func */
              .style("fill", function() {
                return (oPhaseDetail.progress === 100) ? "#5cb85c" : "#f0ad4e";
              })
              /* eslint-enable no-loop-func */
              .attr("title", oPhaseDetail.name);
          } else {
            // Just show completed phases fill for now.
            svgCont.append("rect")
              .attr("x", posPhaseStart)
              .attr("y", 2)
              .attr("width", (posPhaseEnd - posPhaseStart) )
              .attr("height",28)
              /* eslint-disable no-loop-func */
              .style("fill", function() {
                return (oPhaseDetail.progress === 100) ? "#5cb85c" : "#ffffff";
              })
              /* eslint-enable no-loop-func */
              .attr("title", oPhaseDetail.name);
          }

          // transparent white to blend overlapping text.
          svgCont.append("rect")
            .attr("x", posPhaseStart)
            .attr("y", 31)
            .attr("width", posPhaseEnd - posPhaseStart)
            .attr("height", 69)
            .style("fill", "rgba(255,255,255,0.65)");

          // phase start post.
          svgCont.append("line")
            .attr("x1", posPhaseStart)
            .attr("y1", 2)
            .attr("x2", posPhaseStart)
            .attr("y2", 100)
            .style('stroke-width', '0.5px')
            .style('stroke', '#111111');

          // top of the bar.
          svgCont.append("line")
            .attr("x1", posPhaseStart)
            .attr("y1", 2)
            .attr("x2", posPhaseEnd)
            .attr("y2", 2)
            .style('stroke-width', '0.5px')
            .style('stroke', '#111111');

          // end marker for the phase
          svgCont.append("line")
            .attr("x1", posPhaseEnd)
            .attr("y1", 2)
            .attr("x2", posPhaseEnd)
            .attr("y2", 100)
            .style('stroke-width', '0.5px')
            .style('stroke', '#111111');


          // Draw Phase Bar Title
          svgCont.append("text")
            .attr("x", posPhaseStart)
            .attr("y", 40)
            .attr("dx", "5px")		// Offset Horizontal position
            .attr("dy", "7px")		// Offset vertical position
            .style("font-size", "10px")
            .text(oPhaseDetail.name); 		// Phase Name / Description

          if(Authentication.user) {
            // We will include phase start/end for non-public.
            svgCont.append("text")
              .attr("x", posPhaseStart)
              .attr("y", 40)
              .attr("dx", "5px")
              .attr("dy", "22px")
              .style("font-size", "9px")
              .text(oPhaseStart.format("YYYY MMM DD"))
              .attr('title', 'End Date');

            // Draw start date
            svgCont.append("text")
              .attr("x", posPhaseStart)
              .attr("y", 40)
              .attr("dx", "5px")
              .attr("dy", "37px")
              .style("font-size", "9px")
              .text(oPhaseEnd.format("YYYY MMM DD"))
              .attr('title', 'End Date');
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
              .attr('title', 'Percent Completion');

            // Draw the bottom line
            svgCont.append("line")
              .attr("x1", posPhaseStart)
              .attr("y1", bh-1)
              .attr("x2", posPhaseEnd)
              .attr("y2", bh-1)
              .style('stroke-width', '0.5px')
              .style('stroke', '#111111');
          } else {
            // Draw the bottom line
            svgCont.append("line")
              .attr("x1", posPhaseStart)
              .attr("y1", bh-1)
              .attr("x2", posPhaseEnd)
              .attr("y2", bh-1)
              .style('stroke-width', '0.5px')
              .style('stroke', '#111111');
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
          .attr("class", "svg-line");
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
