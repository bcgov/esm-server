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
		sectionName : {
			name : value,
			name : value,
			_data : [{
				name : value,
				name : value,
			}]
		}
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
			document: '='
		},
		link: function (scope, element, attrs) {
			var template = templateCompile (scope.template, 'view');
			element.html (template);
			$compile (element.contents())(scope);
		}
	};
})


;
