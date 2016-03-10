'use strict';

angular.module ('templates')

// -------------------------------------------------------------------------
//
// directive for listing templates
//
// -------------------------------------------------------------------------
.directive ('tmplTemplateRender', function () {
	return {
		restrict: 'E',
		scope: {
			template: '=',
			data: '='
		},
		templateUrl: 'modules/templates/client/views/template-list.html',
		controller: function ($scope, _) {

			// var sectionControls

			// _.each ($scope.template.section, function (section) {
			// 	var sectionTemplate = '';
			// 	if (!section.multiple) {
			// 		sectionTemplate = section.template;
			// 	}
			// 	else {
			// 		if (section.isheader) {
			// 			sectionTemplate += section.header;
			// 		}
			// 		_.each ()
			// 	}
			// })
		},
	};
})


;
