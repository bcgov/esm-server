'use strict';
/*

	Document Templates
	==================
	-------------------------------------------------------------------------

	Template meta-data structure

	-------------------------------------------------------------------------
	This is the way that the template is stored
	{
		documentType  : { type:String, default: '' , index:true},
		versionNumber : { type:Number, default:0, index:true },
		sections      : [{
			name     : { type:String, default:'' },
			optional : { type:Boolean, default:false },
			multiple : { type:Boolean, default:false },
			isheader : { type:Boolean, default:false },
			isfooter : { type:Boolean, default:false },
			template : { type:String, default:'' },
			header   : { type:String, default:'' },
			footer   : { type:String, default:'' },
			meta     : [{
				name     : { type:String, default:'' },
				type     : { type:String, default:'Text', enum:['Text', 'Html'] },
				label    : { type:String, default:'' },
				default  : { type:String, default:'' }
			}]
		}]
	}

	Whereby a section is flat (no repeating portions), or has a header and footer
	with a repeating middle section.

	-------------------------------------------------------------------------

	Template DATA structure

	-------------------------------------------------------------------------
	When data is recorded against a template itwill be stored in a format that
	matches the template structure
	{
		sectionName : {
			name : value,
			name : value,
		},
		sectionName : [{
			name : value,
			name : value,
		}]

	}

	Where a flat section merely has named data elements, while a repeating
	section has those for the header and footer, but has a data array with
	one object full of named data elements for each repeated section

	-------------------------------------------------------------------------

	Generating display template

	-------------------------------------------------------------------------
	The display template should be the simplest to create. The section
	templates need to be strung together in order and the various repeating
	mechanisms need to be created so that they will work with normal angular
	templating.  That is, no real logic, just binding and repeats.

	since sections are meant to be repeated without adding unecessary elements
	which could inadvertently upset the intendedrendering and flow of the
	template we will use the following:

	<div ng-if="0" ng-repeat-start="var in vars"></div>
	<div ng-if="0" ng-repeat-end></div>

	-------------------------------------------------------------------------

	Generating display template

	-------------------------------------------------------------------------


*/
angular.module ('templates')

// -------------------------------------------------------------------------
//
// directive for listing templates
//
// -------------------------------------------------------------------------
.directive ('tmplTemplateRender', function ($compile, templateCompile) {
	return {
		restrict: 'E',
		scope: {
			template: '=',
			document: '=',
			mode:     '@'
		},
		link: function (scope, element, attrs) {
			var template = templateCompile (scope.template, scope.mode);
			element.html (template);
			$compile (element.contents())(scope);
		}
	};
})

// -------------------------------------------------------------------------
//
// directive to edit text field in template
//
// -------------------------------------------------------------------------
.directive('contentInline', ['$sce', function($sce) {
	return {
		restrict: 'A', // only activate on element attribute
		require: '?ngModel', // get a hold of NgModelController,
		scope: {
			// default: '=',
			curVal: '=ngModel'
		},
		replace: true,
		template: '<span class="text-block" contenteditable="true"></span>',
		link: function(scope, element, attrs, ngModel) {
			if (!ngModel) return; // do nothing if no ng-model

			// element.html($sce.getTrustedHtml(scope.curVal || scope.default || ''));
			element.html($sce.getTrustedHtml(scope.curVal || ''));

			// Specify how UI should be updated
			ngModel.$render = function() {
            	element.html($sce.getTrustedHtml(ngModel.$viewValue));
			};

			// Listen for change events to enable binding
			element.on('blur keyup change', function() {
				scope.$evalAsync(read);
			});
			read(); // initialize

			// Write data to the model
			function read() {
				var html = element.html() || ngModel.$modelValue;
				// When we clear the content editable the browser leaves a <br> behind
				// If strip-br attribute is provided then we strip this out
				if ( attrs.stripBr && html === '<br>' ) {
					html = '';
				}
				element.html($sce.getTrustedHtml( html ));
				ngModel.$setViewValue(html);
			}
		}
	};
}])
// -------------------------------------------------------------------------
//
// directive to edit html field in template
//
// -------------------------------------------------------------------------
.directive('contentHtml', ['$sce', function($sce) {
	return {
		restrict: 'A', // only activate on element attribute
		require: '?ngModel', // get a hold of NgModelController
		scope: {
			// default: '=',
			curVal: '=ngModel'
		},
		replace: true,
		templateUrl: 'modules/templates/client/views/template-html-editor.html',
		link: function(scope, element, attrs, ngModel) {
			// if (!ngModel) return; // do nothing if no ng-model

			// if (ngModel.$isEmpty(scope.curVal)) {
			// 	scope.curVal = scope.default;
			// }

			scope.activeItem = false;

			// scope.saveModel = function() {
			// 	console.log('savemodel');
			// 	scope.$evalAsync(read);
			// };
			// // Listen for change events to enable binding
			// element.on('blur keyup change', function() {
			// 	scope.$evalAsync(read);
			// });
			// read(); // initialize

			// // Write data to the model
			// function read() {
			// 	ngModel.$setViewValue(scope.curVal);
			// }
		}
	};
}])


;


